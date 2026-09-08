/**
 * Contrat de mise en relation Finarent — génération PDF.
 *
 * Remplace l'ancien `buildContractHtml`, qui produisait du HTML : tous les
 * prestataires de signature n'acceptent que du PDF, et une signature simple
 * a besoin d'un document figé dont on peut calculer l'empreinte. Un HTML
 * dépendant de polices et d'images distantes ne se fige pas.
 *
 * Stack : jsPDF, comme lib/invoicing/pdf.js. Charte dans lib/branding.js.
 */

import { jsPDF } from 'jspdf';
import { COMPANY_INFO } from '../invoicing/company.js';
import { BRAND_RGB } from '../branding.js';

const MARINE = BRAND_RGB.marine;
const ACIER = BRAND_RGB.acier;
const MENTHE = BRAND_RGB.menthe;
const TEXTE = BRAND_RGB.grisTexte;
const BORDURE = BRAND_RGB.border;

const PRODUCT_LABELS = {
  PRET_PRO: 'Prêt professionnel',
  CREDIT_BAIL: 'Crédit-bail mobilier',
  LOA: "Location avec option d'achat",
  LLD: 'Location longue durée',
  LEASING: 'Leasing opérationnel',
  RC_PRO: 'Responsabilité civile professionnelle',
};

const eur = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    .format(Number(n) || 0);

const frDate = (d) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(d instanceof Date ? d : new Date(d));

/** Texte de consentement présenté au signataire — conservé tel quel comme preuve. */
export const MENTION_CONSENTEMENT =
  "J'ai lu et j'accepte les termes du présent contrat. Je reconnais que ma signature " +
  'manuscrite apposée ci-dessus, associée à mon identification par connexion, à la date ' +
  'et à l\'adresse IP enregistrées, vaut consentement au sens de l\'article 1367 du Code civil.';

/**
 * @param {object}  p
 * @param {object}  p.offer        Offre (montant, durée, taux, mensualité, coût total)
 * @param {object}  p.application  Dossier (produit, société, SIREN)
 * @param {object}  p.user         Signataire
 * @param {object} [p.signature]   { dataUrl, signedAt, ip, userAgent } si déjà signé
 * @returns {Buffer} PDF
 */
export function generateContractPDF({ offer, application, user, signature = null }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const c = COMPANY_INFO;
  const produit = PRODUCT_LABELS[application?.productType] || application?.productType || '—';
  const nom = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—';
  const M = 18;
  const L = 210 - M * 2;
  let y = 20;

  // ── En-tête ────────────────────────────────────────────────
  doc.setFillColor(...MARINE);
  doc.rect(0, 0, 210, 3, 'F');

  doc.setTextColor(...MARINE);
  doc.setFont('helvetica', 'bold').setFontSize(20);
  doc.text(c.name, M, y);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...ACIER);
  doc.text('CONTRAT DE MISE EN RELATION', M, y + 5);

  doc.setFontSize(9).setTextColor(...ACIER);
  doc.text(`Référence ${offer.id}`, 210 - M, y, { align: 'right' });
  doc.text(`Émis le ${frDate(new Date())}`, 210 - M, y + 5, { align: 'right' });

  y += 12;
  doc.setDrawColor(...MARINE).setLineWidth(0.6).line(M, y, 210 - M, y);
  y += 12;

  // ── Titre ──────────────────────────────────────────────────
  doc.setTextColor(...MARINE).setFont('helvetica', 'bold').setFontSize(16);
  doc.text('Contrat de financement professionnel', 105, y, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...ACIER);
  doc.text(produit.toUpperCase(), 105, y + 6, { align: 'center' });
  y += 16;

  // ── Parties ────────────────────────────────────────────────
  const titreSection = (t) => {
    doc.setTextColor(...MARINE).setFont('helvetica', 'bold').setFontSize(10);
    doc.text(t.toUpperCase(), M, y);
    doc.setDrawColor(...MENTHE).setLineWidth(0.4).line(M, y + 1.5, M + 30, y + 1.5);
    y += 8;
  };

  titreSection('Parties');

  const colW = (L - 8) / 2;
  const boxY = y;
  const partie = (x, role, lignes) => {
    doc.setFillColor(245, 247, 247).setDrawColor(...BORDURE).setLineWidth(0.2);
    doc.roundedRect(x, boxY, colW, 30, 2, 2, 'FD');
    doc.setTextColor(...ACIER).setFont('helvetica', 'bold').setFontSize(7);
    doc.text(role.toUpperCase(), x + 4, boxY + 6);
    doc.setTextColor(...MARINE).setFontSize(10);
    doc.text(String(lignes[0]).slice(0, 34), x + 4, boxY + 12);
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...TEXTE);
    lignes.slice(1).forEach((l, i) => doc.text(String(l).slice(0, 46), x + 4, boxY + 17 + i * 4));
  };

  partie(M, 'Le courtier', [
    c.name,
    `${c.legalForm} au capital de ${c.capital}`,
    `${c.address}, ${c.postal} ${c.city}`,
    `RCS ${c.rcs} · ORIAS ${c.orias}`,
  ]);
  partie(M + colW + 8, 'Le client', [
    application?.companyName || nom,
    nom,
    application?.siren ? `SIREN ${application.siren}` : '',
    user?.email || '',
  ]);
  y = boxY + 38;

  // ── Conditions financières ─────────────────────────────────
  titreSection('Conditions financières');

  doc.setFillColor(...MARINE);
  doc.roundedRect(M, y, L, 24, 2, 2, 'F');
  const cellules = [
    ['Montant financé', eur(offer.amount)],
    ['Durée', `${offer.durationMonths} mois`],
    ['Mensualité', eur(offer.monthlyPayment)],
  ];
  cellules.forEach(([label, valeur], i) => {
    const x = M + 6 + i * (L / 3);
    doc.setTextColor(255, 255, 255).setFont('helvetica', 'normal').setFontSize(7);
    doc.text(label.toUpperCase(), x, y + 9);
    doc.setFont('helvetica', 'bold').setFontSize(13);
    if (i === 2) doc.setTextColor(...MENTHE);
    doc.text(valeur, x, y + 17);
  });
  y += 30;

  doc.setTextColor(...TEXTE).setFont('helvetica', 'normal').setFontSize(9);
  doc.text(`Taux : ${offer.rate} %   ·   Coût total : ${eur(offer.totalCost)}`, M, y);
  y += 12;

  // ── Engagements ────────────────────────────────────────────
  titreSection('Engagements des parties');

  const clauses = [
    "Finarent agit en qualité d'intermédiaire et présente au Client les offres de ses partenaires financiers. Finarent n'est pas l'organisme prêteur.",
    "Les conditions ci-dessus sont indicatives et demeurent soumises à l'accord définitif du partenaire financier retenu.",
    "Le Client s'engage à fournir des informations exactes et les pièces justificatives nécessaires à l'instruction du dossier.",
    "L'étude du dossier et la mise en relation sont gratuites pour le Client. Finarent est rémunérée par ses partenaires.",
    "Le Client dispose d'un droit de rétractation dans les conditions prévues aux conditions générales, consultables sur finarent.com.",
    'Les données personnelles sont traitées conformément à la politique de confidentialité et au RGPD.',
  ];
  doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(...TEXTE);
  clauses.forEach((t, i) => {
    const lignes = doc.splitTextToSize(`${i + 1}.  ${t}`, L);
    doc.text(lignes, M, y);
    y += lignes.length * 4 + 2;
  });
  y += 6;

  // ── Signatures ─────────────────────────────────────────────
  if (y > 215) { doc.addPage(); y = 24; }
  titreSection('Signatures');

  const sigY = y;
  const sigW = (L - 8) / 2;

  doc.setDrawColor(...BORDURE).setLineWidth(0.2);
  doc.roundedRect(M, sigY, sigW, 40, 2, 2, 'S');
  doc.setTextColor(...ACIER).setFont('helvetica', 'bold').setFontSize(7);
  doc.text('LE COURTIER', M + 4, sigY + 6);
  doc.setTextColor(...MARINE).setFontSize(9);
  doc.text(c.president || c.name, M + 4, sigY + 12);

  const xC = M + sigW + 8;
  doc.setDrawColor(...BORDURE);
  doc.roundedRect(xC, sigY, sigW, 40, 2, 2, 'S');
  doc.setTextColor(...ACIER).setFont('helvetica', 'bold').setFontSize(7);
  doc.text('LE CLIENT', xC + 4, sigY + 6);
  doc.setTextColor(...MARINE).setFontSize(9);
  doc.text(nom, xC + 4, sigY + 12);

  if (signature?.dataUrl) {
    try {
      doc.addImage(signature.dataUrl, 'PNG', xC + 4, sigY + 14, sigW - 8, 20);
    } catch { /* image illisible : le bloc de preuve ci-dessous fait foi */ }
  } else {
    doc.setFont('helvetica', 'italic').setFontSize(7).setTextColor(...ACIER);
    doc.text('Signature électronique en attente', xC + 4, sigY + 24);
  }
  y = sigY + 46;

  // ── Bloc de preuve (uniquement une fois signé) ─────────────
  if (signature?.signedAt) {
    doc.setFillColor(237, 247, 243).setDrawColor(...MENTHE).setLineWidth(0.2);
    const preuve = [
      `Signé le ${frDate(signature.signedAt)} à ${new Date(signature.signedAt).toLocaleTimeString('fr-FR')}`,
      `Signataire : ${nom}${user?.email ? ` (${user.email})` : ''}`,
      `Adresse IP : ${signature.ip || 'non enregistrée'}`,
      signature.userAgent ? `Navigateur : ${String(signature.userAgent).slice(0, 80)}` : null,
      signature.documentHash ? `Empreinte SHA-256 du document : ${signature.documentHash}` : null,
    ].filter(Boolean);

    const h = 10 + preuve.length * 4;
    doc.roundedRect(M, y, L, h, 2, 2, 'FD');
    doc.setTextColor(...MARINE).setFont('helvetica', 'bold').setFontSize(7);
    doc.text('ÉLÉMENTS DE PREUVE DE LA SIGNATURE', M + 4, y + 6);
    doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(...TEXTE);
    preuve.forEach((l, i) => doc.text(l, M + 4, y + 11 + i * 4));
    y += h + 6;
  }

  // ── Pied de page légal ─────────────────────────────────────
  const pied = 285;
  doc.setDrawColor(...BORDURE).setLineWidth(0.2).line(M, pied - 6, 210 - M, pied - 6);
  doc.setFont('helvetica', 'normal').setFontSize(6.5).setTextColor(...ACIER);
  doc.text(
    `${c.name} · ${c.legalForm} au capital de ${c.capital} · SIREN ${c.siren} · RCS ${c.rcs} · ORIAS ${c.orias} · TVA ${c.tva}`,
    105, pied - 2, { align: 'center' },
  );
  doc.text(
    `${c.address}, ${c.postal} ${c.city} · ${c.phone} · ${c.email} · ${c.website}`,
    105, pied + 2, { align: 'center' },
  );

  return Buffer.from(doc.output('arraybuffer'));
}
