import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSignatureProcedure } from '@/lib/yousign';
import { BRAND_COLORS, BRAND_FONT, COMPANY_INFO, brandPastilleUrl, escapeHtml } from '@/lib/branding';

function eur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
}

function frDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const PRODUCT_LABELS = {
  PRET_PRO: 'Prêt professionnel',
  CREDIT_BAIL: 'Crédit-bail',
  LOA: 'Location avec option d\'achat',
  LLD: 'Location longue durée',
  LEASING_OPS: 'Leasing opérationnel',
  RC_PRO: 'Responsabilité civile professionnelle',
};

function buildContractHtml({ offer, application, user, origin }) {
  const c = COMPANY_INFO;
  const pastille = brandPastilleUrl(origin);
  const product = PRODUCT_LABELS[application.productType] || application.productType || '—';
  const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Contrat ${escapeHtml(offer.id)} — Finarent</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { font-family: ${BRAND_FONT}; color: ${BRAND_COLORS.grisTexte}; margin: 0; padding: 48px 60px; max-width: 820px; margin-left: auto; margin-right: auto; line-height: 1.6; background: #ffffff; }
  .doc-header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 22px; margin-bottom: 32px; border-bottom: 2px solid ${BRAND_COLORS.marine}; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand img { width: 48px; height: 48px; border-radius: 12px; background: ${BRAND_COLORS.grisDoux}; padding: 6px; }
  .brand .name { font-size: 24px; font-weight: 800; color: ${BRAND_COLORS.marine}; letter-spacing: -0.01em; }
  .brand .tag { font-size: 11px; font-weight: 600; color: ${BRAND_COLORS.acier}; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px; }
  .doc-meta { text-align: right; font-size: 12px; color: ${BRAND_COLORS.acier}; }
  .doc-meta strong { display: block; color: ${BRAND_COLORS.marine}; font-size: 14px; margin-bottom: 4px; }
  h1 { font-size: 26px; font-weight: 800; color: ${BRAND_COLORS.marine}; text-align: center; margin: 24px 0 8px; letter-spacing: -0.01em; }
  h1 + .subtitle { text-align: center; font-size: 13px; font-weight: 600; color: ${BRAND_COLORS.acier}; text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 32px; }
  h2 { font-size: 14px; font-weight: 800; color: ${BRAND_COLORS.marine}; text-transform: uppercase; letter-spacing: 0.12em; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid ${BRAND_COLORS.menthe}; }
  p { font-size: 14px; margin: 0 0 12px; }
  strong { color: ${BRAND_COLORS.marine}; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin: 18px 0 28px; }
  .party { background: ${BRAND_COLORS.grisDoux}; border: 1px solid #E4E8EC; border-radius: 12px; padding: 18px 20px; }
  .party-role { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${BRAND_COLORS.acier}; margin-bottom: 6px; }
  .party-name { font-size: 15px; font-weight: 800; color: ${BRAND_COLORS.marine}; margin-bottom: 8px; }
  .party-line { font-size: 12px; color: ${BRAND_COLORS.grisTexte}; line-height: 1.5; }
  .offer { background: ${BRAND_COLORS.marine}; color: #ffffff; border-radius: 14px; padding: 22px 26px; margin: 14px 0 28px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
  .offer-cell .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.6); margin-bottom: 4px; }
  .offer-cell .value { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
  .offer-cell .value.accent { color: ${BRAND_COLORS.menthe}; }
  ol.terms { padding-left: 18px; }
  ol.terms li { font-size: 13px; margin-bottom: 10px; padding-left: 6px; }
  .signature-block { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
  .signature-cell { border: 1px dashed ${BRAND_COLORS.acier}; border-radius: 12px; padding: 18px; min-height: 110px; }
  .signature-cell .role { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${BRAND_COLORS.acier}; margin-bottom: 8px; }
  .signature-cell .name { font-size: 13px; font-weight: 700; color: ${BRAND_COLORS.marine}; }
  .signature-cell .mention { font-size: 11px; color: ${BRAND_COLORS.acier}; margin-top: 6px; font-style: italic; }
  .legal-footer { margin-top: 40px; padding-top: 18px; border-top: 1px solid #E4E8EC; font-size: 10px; color: ${BRAND_COLORS.acier}; text-align: center; line-height: 1.6; }
  .legal-footer strong { color: ${BRAND_COLORS.marine}; }
</style>
</head>
<body>
  <div class="doc-header">
    <div class="brand">
      <img src="${pastille}" alt="Finarent">
      <div>
        <div class="name">${escapeHtml(c.name)}</div>
        <div class="tag">Contrat de mise en relation</div>
      </div>
    </div>
    <div class="doc-meta">
      <strong>Référence ${escapeHtml(offer.id)}</strong>
      Émis le ${escapeHtml(frDate(new Date()))}
    </div>
  </div>

  <h1>Contrat de financement professionnel</h1>
  <div class="subtitle">${escapeHtml(product)}</div>

  <h2>Parties</h2>
  <div class="parties">
    <div class="party">
      <div class="party-role">Le courtier</div>
      <div class="party-name">${escapeHtml(c.name)} ${escapeHtml(c.legalForm)}</div>
      <div class="party-line">${escapeHtml(c.address)}<br>${escapeHtml(c.postal)} ${escapeHtml(c.city)}</div>
      <div class="party-line">SIRET ${escapeHtml(c.siret)}<br>ORIAS ${escapeHtml(c.orias)}</div>
      <div class="party-line">${escapeHtml(c.phone)} · ${escapeHtml(c.email)}</div>
    </div>
    <div class="party">
      <div class="party-role">Le client</div>
      <div class="party-name">${escapeHtml(fullName || '—')}</div>
      <div class="party-line">${escapeHtml(application.companyName || user.company || '—')}</div>
      ${application.siren ? `<div class="party-line">SIREN ${escapeHtml(application.siren)}</div>` : ''}
      <div class="party-line">${escapeHtml(user.email || '')}${user.phone ? ' · ' + escapeHtml(user.phone) : ''}</div>
    </div>
  </div>

  <h2>Conditions de l'offre</h2>
  <div class="offer">
    <div class="offer-cell">
      <div class="label">Montant financé</div>
      <div class="value accent">${escapeHtml(eur(offer.amount))}</div>
    </div>
    <div class="offer-cell">
      <div class="label">Durée</div>
      <div class="value">${offer.duration ? escapeHtml(offer.duration + ' mois') : '—'}</div>
    </div>
    <div class="offer-cell">
      <div class="label">Mensualité</div>
      <div class="value">${offer.monthlyPayment ? escapeHtml(eur(offer.monthlyPayment)) : '—'}</div>
    </div>
  </div>

  <h2>Objet</h2>
  <p>Le présent contrat fixe les conditions de l'opération de <strong>${escapeHtml(product)}</strong> consentie par l'établissement partenaire et négociée par ${escapeHtml(c.name)}, courtier indépendant immatriculé à l'ORIAS sous le numéro ${escapeHtml(c.orias)}.</p>

  <h2>Engagements</h2>
  <ol class="terms">
    <li>Le client reconnaît avoir reçu et lu la fiche d'information précontractuelle ainsi que les conditions générales du partenaire financier.</li>
    <li>${escapeHtml(c.name)} agit en qualité de mandataire non exclusif du client pour la recherche d'une offre adaptée.</li>
    <li>Aucun frais n'est dû par le client à ${escapeHtml(c.name)} : la rémunération du courtier provient exclusivement de l'établissement partenaire en cas de mise en place du financement.</li>
    <li>Le client dispose d'un droit de rétractation de 14 jours à compter de la signature, conformément à l'article L.222-7 du Code de la consommation lorsque celui-ci est applicable.</li>
    <li>Le traitement des données personnelles est régi par la politique de confidentialité de ${escapeHtml(c.name)} disponible sur ${escapeHtml(c.website)}.</li>
  </ol>

  <h2>Acceptation</h2>
  <p>La signature électronique du présent document, via le service YouSign, vaut acceptation pleine et entière des termes ci-dessus et autorisation pour ${escapeHtml(c.name)} à transmettre le dossier au partenaire désigné.</p>

  <div class="signature-block">
    <div class="signature-cell">
      <div class="role">Pour ${escapeHtml(c.name)}</div>
      <div class="name">Service Courtage</div>
      <div class="mention">Signature et cachet</div>
    </div>
    <div class="signature-cell">
      <div class="role">Pour le client</div>
      <div class="name">${escapeHtml(fullName || '—')}</div>
      <div class="mention">Précédée de la mention "Lu et approuvé — Bon pour accord"</div>
    </div>
  </div>

  <div class="legal-footer">
    <p><strong>${escapeHtml(c.name)} ${escapeHtml(c.legalForm)}</strong> au capital de ${escapeHtml(c.capital)} · ${escapeHtml(c.address)}, ${escapeHtml(c.postal)} ${escapeHtml(c.city)}</p>
    <p>SIRET ${escapeHtml(c.siret)} · RCS ${escapeHtml(c.rcs)} · ORIAS ${escapeHtml(c.orias)} · TVA ${escapeHtml(c.tva)}</p>
    <p>Courtier indépendant en financement &amp; assurance soumis au contrôle de l'ACPR.</p>
  </div>
</body>
</html>`;
}

export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { application: { include: { user: true } } },
  });

  if (!offer) return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });
  if (offer.application.userId !== auth.dbUser.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const origin = new URL(request.url).origin;
  const contractHtml = buildContractHtml({
    offer,
    application: offer.application,
    user: offer.application.user,
    origin,
  });
  const buffer = Buffer.from(contractHtml);

  try {
    const result = await createSignatureProcedure({
      documentBuffer: buffer,
      filename: `contrat-finarent-${offer.id}.html`,
      signer: {
        firstName: offer.application.user.name?.split(' ')[0],
        lastName: offer.application.user.name?.split(' ').slice(1).join(' '),
        email: offer.application.user.email,
        phone: offer.application.user.phone,
      },
      offerId: offer.id,
    });

    await prisma.offer.update({
      where: { id },
      data: { signatureUrl: result.signUrl, sentAt: new Date() },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('YouSign error:', err);
    return NextResponse.json({ error: 'Erreur lors de la création de la signature' }, { status: 500 });
  }
}
