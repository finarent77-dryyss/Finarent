/**
 * Auto-facture PDF commission affiliation (mandat art. 289 CGI).
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPANY_INFO } from '@/lib/invoicing/company.js';
import { BRAND_RGB } from '@/lib/branding.js';
import { MANDATE_VERSION, MANDATE_CONTEST_PERIOD_DAYS } from '@/lib/affiliate-mandate.js';

const PRIMARY = BRAND_RGB.marine;
const ACCENT = BRAND_RGB.menthe;
const MUTED = BRAND_RGB.muted;

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('fr-FR');
  } catch {
    return String(d);
  }
}

function fmtMoney(n) {
  return `${Number(n || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function generateAffiliateInvoicePdf(data) {
  const doc = new jsPDF();

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 4, 'F');
  doc.setFillColor(...ACCENT);
  doc.rect(0, 4, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...PRIMARY);
  doc.text('AUTO-FACTURE', 14, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(`N° ${data.invoiceNumber} · Émise le ${fmtDate(data.invoiceDate)}`, 14, 27);
  doc.text(`Période : ${fmtDate(data.periodStart)} → ${fmtDate(data.periodEnd)}`, 14, 33);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('Émise par le Mandataire (auto-facturation)', 14, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${COMPANY_INFO.name} ${COMPANY_INFO.legalForm}`, 14, 51);
  doc.text(`${COMPANY_INFO.address}, ${COMPANY_INFO.postal} ${COMPANY_INFO.city}`, 14, 56);
  doc.text(`SIRET ${COMPANY_INFO.siret} · ${COMPANY_INFO.email}`, 14, 61);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY);
  doc.text('Au nom et pour le compte du Mandant', 110, 45);
  doc.setFont('helvetica', 'normal');
  const aff = data.affiliate;
  doc.text(aff.legalName || aff.name || '—', 110, 51);
  if (aff.fiscalAddress) {
    doc.text(`${aff.fiscalAddress}, ${aff.fiscalPostalCode || ''} ${aff.fiscalCity || ''}`, 110, 56);
  }
  if (aff.siret) doc.text(`SIRET ${aff.siret}`, 110, 61);
  doc.text(aff.email, 110, 66);

  const rows = data.commissions.map((c) => [
    c.date,
    c.applicationRef,
    c.description,
    fmtMoney(c.amount),
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['Date', 'Dossier', 'Prestation', 'Montant HT']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total HT : ${fmtMoney(data.amountHT)}`, 140, finalY);
  doc.text(`TVA (${data.vatRate} %) : ${fmtMoney(data.vatAmount)}`, 140, finalY + 6);
  doc.setFontSize(11);
  doc.text(`Total TTC : ${fmtMoney(data.amountTTC)}`, 140, finalY + 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  const footY = finalY + 28;
  doc.text(`Mandat ${MANDATE_VERSION} signé le ${fmtDate(data.mandateSignedAt)}`, 14, footY);
  doc.text(`Délai de contestation : ${MANDATE_CONTEST_PERIOD_DAYS} jours`, 14, footY + 5);
  if (data.paidAt) {
    doc.text(`Virement effectué le ${fmtDate(data.paidAt)}${data.paymentReference ? ` · Réf. ${data.paymentReference}` : ''}`, 14, footY + 10);
  }
  if (aff.tvaApplicable) {
    doc.text('TVA applicable au taux en vigueur.', 14, footY + 15);
  } else {
    doc.text('TVA non applicable — art. 293 B du CGI (le cas échéant).', 14, footY + 15);
  }

  return doc.output('arraybuffer');
}
