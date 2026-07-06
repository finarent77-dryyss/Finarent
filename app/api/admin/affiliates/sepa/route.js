import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { generateSepaXml, nextBusinessDay } from '@/lib/sepa-xml.js';
import { COMPANY_INFO } from '@/lib/invoicing/company.js';
import { logAffiliateAction, computeAffiliatePayoutTTC, affiliateDisplayName } from '@/lib/affiliate-fiscal.js';
import { decryptString } from '@/lib/crypto.js';

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

  const creditors = affiliates
    .map((a) => {
      const totalValidated = a.commissions.reduce((s, c) => s + c.amount, 0);
      if (totalValidated < (a.payoutMinAmount || 20)) return null;
      if (totalValidated <= 0) return null;
      const { amountTTC } = computeAffiliatePayoutTTC(totalValidated, a.tvaApplicable);
      return {
        name: affiliateDisplayName(a),
        // Fichier de virement SEPA : IBAN/BIC déchiffrés (usage strictement serveur)
        iban: decryptString(a.iban),
        bic: a.bic ? decryptString(a.bic) : null,
        amount: amountTTC,
        reference: `Commission Finarent ${a.code} ${new Date().toISOString().slice(0, 7)}`,
        endToEndId: `${a.id.slice(0, 12)}-${Date.now()}`,
      };
    })
    .filter(Boolean);

  if (!creditors.length) {
    return NextResponse.json(
      { error: 'Aucun affilié éligible (onboarding, seuil, commissions VALIDATED)' },
      { status: 400 },
    );
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

  await logAffiliateAction({
    actorId: dbUser?.id,
    entityType: 'PAYOUT',
    entityId: `SEPA-BATCH-${Date.now()}`,
    action: 'EXPORT_GENERATED',
    reason: `${creditors.length} virements`,
    after: { affiliateCount: creditors.length, execDate },
  });

  const filename = `SEPA_FINARENT_${execDate.replace(/-/g, '')}.xml`;
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
