import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { generateSepaXml, nextBusinessDay } from '@/lib/sepa-xml.js';
import { COMPANY_INFO, coordonneesBancairesValides, MESSAGE_RIB_MANQUANT } from '@/lib/invoicing/company.js';
import { logAffiliateAction, computeAffiliatePayoutTTC, affiliateDisplayName } from '@/lib/affiliate-fiscal.js';
import { decryptString } from '@/lib/crypto.js';
import { archiverDocument } from '@/lib/documents/archive.js';

export async function GET(request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const url = new URL(request.url);
  const idsParam = url.searchParams.get('affiliateIds');
  const ids = idsParam ? idsParam.split(',').map((s) => s.trim()).filter(Boolean) : null;
  const execDate = url.searchParams.get('execDate') || nextBusinessDay();

  const affiliates = await prisma.affiliate.findMany({
    where: {
      ...(ids ? { id: { in: ids } } : {}),
      onboardingCompletedAt: { not: null },
      mandateSignedAt: { not: null },
      iban: { not: null },
      isActive: true,
    },
    include: {
      commissions: {
        where: { status: 'VALIDATED' },
        select: { id: true, amount: true },
      },
    },
  });

  // On conserve le lien affilié → commissions couvertes : sans lui, impossible
  // de savoir a posteriori ce qu'un lot a réellement payé, ni de détecter un
  // second export portant sur les mêmes commissions.
  const retenus = affiliates
    .map((a) => {
      const totalValidated = a.commissions.reduce((s, c) => s + c.amount, 0);
      if (totalValidated < (a.payoutMinAmount || 20)) return null;
      if (totalValidated <= 0) return null;
      const { amountTTC } = computeAffiliatePayoutTTC(totalValidated, a.tvaApplicable);
      return {
        commissionIds: a.commissions.map((c) => c.id),
        creditor: {
          name: affiliateDisplayName(a),
          // Fichier de virement SEPA : IBAN/BIC déchiffrés (usage strictement serveur)
          iban: decryptString(a.iban),
          bic: a.bic ? decryptString(a.bic) : null,
          amount: amountTTC,
          reference: `Commission Finarent ${a.code} ${new Date().toISOString().slice(0, 7)}`,
          endToEndId: `${a.id.slice(0, 12)}-${Date.now()}`,
        },
      };
    })
    .filter(Boolean);

  const creditors = retenus.map((r) => r.creditor);
  const commissionIds = retenus.flatMap((r) => r.commissionIds);

  if (!creditors.length) {
    return NextResponse.json(
      { error: 'Aucun affilié éligible (onboarding, seuil, commissions VALIDATED)' },
      { status: 400 },
    );
  }

  // Un lot de virement bâti sur un IBAN débiteur factice est rejeté en bloc
  // par la banque. Mieux vaut refuser ici, avec un motif lisible.
  if (!coordonneesBancairesValides()) {
    return NextResponse.json({ error: MESSAGE_RIB_MANQUANT }, { status: 409 });
  }

  // Garde anti-rejeu.
  //
  // L'export ne marquait rien : les commissions restaient VALIDATED après
  // génération du fichier. Deux exports successifs produisaient donc deux
  // ordres de virement identiques vers les mêmes IBAN — et le bouton
  // « Verser » pouvait payer une troisième fois. On refuse tout lot qui
  // reprend une commission déjà exportée, sauf demande explicite.
  const rejeuAssume = url.searchParams.get('confirmerRejeu') === '1';
  if (!rejeuAssume) {
    const exportsPrecedents = await prisma.affiliateAuditLog.findMany({
      where: { entityType: 'PAYOUT', action: 'EXPORT_GENERATED' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { after: true, createdAt: true },
    });
    const dejaExportees = new Set(
      exportsPrecedents.flatMap((l) => (Array.isArray(l.after?.commissionIds) ? l.after.commissionIds : [])),
    );
    const collisions = commissionIds.filter((id) => dejaExportees.has(id));
    if (collisions.length) {
      return NextResponse.json(
        {
          error: `${collisions.length} commission(s) figurent déjà dans un ordre de virement précédent. `
            + 'Vérifiez qu\'elles n\'ont pas déjà été payées avant de rejouer l\'export.',
          commissionsDejaExportees: collisions,
          rejouerAvec: '?confirmerRejeu=1',
        },
        { status: 409 },
      );
    }
  }

  const xml = generateSepaXml({
    debtorName: COMPANY_INFO.name,
    debtorIban: COMPANY_INFO.iban,
    debtorBic: COMPANY_INFO.bic,
    requestedExecutionDate: execDate,
    creditors,
  });

  const dbUser = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    select: { id: true },
  });

  const lot = `SEPA-BATCH-${Date.now()}`;
  const filename = `SEPA_FINARENT_${execDate.replace(/-/g, '')}.xml`;

  // Le fichier remis à la banque n'était conservé nulle part : en cas de
  // litige sur un versement, impossible de produire ce qui avait été transmis.
  let documentId = null;
  try {
    const { document } = await archiverDocument({
      prisma,
      buffer: Buffer.from(xml, 'utf8'),
      fileName: filename,
      mimeType: 'application/xml',
      kind: 'AUTRE',
      reference: lot,
    });
    documentId = document.id;
  } catch (e) {
    console.error('[sepa] archivage du lot impossible :', e.message);
  }

  await logAffiliateAction({
    actorId: dbUser?.id,
    entityType: 'PAYOUT',
    entityId: lot,
    action: 'EXPORT_GENERATED',
    reason: `${creditors.length} virements`,
    after: {
      affiliateCount: creditors.length,
      execDate,
      // Indispensable à la garde anti-rejeu ci-dessus.
      commissionIds,
      documentId,
      rejeuAssume,
    },
  });
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
