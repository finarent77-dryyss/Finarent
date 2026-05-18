/**
 * Génération PDF des documents commerciaux Finarent.
 * Stack : jsPDF + jspdf-autotable (Node-native, OK serverless Vercel).
 *
 * Charte officielle Finarent (couleurs / typographie) centralisée dans
 * lib/branding.js. Le logo est lu depuis public/finarent-logo.jpg au
 * runtime ; en cas d'échec d'I/O on retombe sur un en-tête typographique.
 */

import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPANY_INFO } from './company.js';
import { BRAND_RGB } from '../branding.js';

// Couleurs jsPDF (issues de la charte officielle FINARENT Partenaires.pdf §1)
const PRIMARY = BRAND_RGB.marine;       // #10253C — header, totaux, titres
const SECONDARY = BRAND_RGB.acier;      // #1C3654 — sous-titres
const ACCENT = BRAND_RGB.menthe;        // #58B794 — montants positifs, ✓
const MUTED = BRAND_RGB.muted;          // labels, mentions
const BORDER = BRAND_RGB.border;        // filets
const WHITE = [255, 255, 255];

// ─── LOGO ───────────────────────────────────────────────────
// Chargé une seule fois en mémoire ; jsPDF.addImage accepte du base64 JPG/PNG.
let cachedLogo = null;
function loadLogo() {
  if (cachedLogo !== null) return cachedLogo;
  try {
    const filePath = path.join(process.cwd(), 'public', 'finarent-logo.jpg');
    const buf = fs.readFileSync(filePath);
    cachedLogo = { data: `data:image/jpeg;base64,${buf.toString('base64')}`, fmt: 'JPEG' };
  } catch {
    cachedLogo = false;
  }
  return cachedLogo;
}

function eur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
}

function frDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── HEADER ─────────────────────────────────────────────────
function drawHeader(doc, { title, number, date }) {
  // Bande Marine
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 30, 'F');

  // Logo (image) si disponible, sinon fallback typographique
  const logo = loadLogo();
  if (logo && logo.data) {
    try {
      // Pastille blanche derrière le logo pour garantir le contraste
      doc.setFillColor(...WHITE);
      doc.roundedRect(13, 8, 46, 14, 2, 2, 'F');
      doc.addImage(logo.data, logo.fmt, 14, 9, 44, 12, undefined, 'FAST');
    } catch {
      drawTextLogo(doc);
    }
  } else {
    drawTextLogo(doc);
  }

  // Tagline (charte officielle)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 215, 230);
  doc.text(`Financement & Assurance Pro — ${COMPANY_INFO.website}`, 14, 26);

  // Type + numéro + date (à droite)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...WHITE);
  doc.text(title.toUpperCase(), 196, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`N° ${number}`, 196, 20, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(200, 215, 230);
  doc.text(`Émis le ${date}`, 196, 26, { align: 'right' });
}

function drawTextLogo(doc) {
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(COMPANY_INFO.name.toUpperCase(), 14, 18);
}

// ─── COMPANY + CLIENT BLOCKS ────────────────────────────────
function drawIdentityBlocks(doc, { client, extra }) {
  const top = 40;

  // Company (gauche)
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 15, top);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY);
  const c = COMPANY_INFO;
  doc.text(`${c.name} ${c.legalForm}`, 15, top + 5);
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.text(c.address, 15, top + 10);
  doc.text(`${c.postal} ${c.city} — ${c.country}`, 15, top + 14);
  doc.text(`SIRET : ${c.siret}`, 15, top + 18);
  doc.text(`TVA : ${c.tva}`, 15, top + 22);
  doc.text(`ORIAS : ${c.orias}`, 15, top + 26);

  // Client (droite)
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À', 115, top);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text(client.name || '—', 115, top + 6);

  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  let y = top + 11;
  if (client.address)  { doc.text(client.address, 115, y); y += 4; }
  if (client.postal || client.city) { doc.text(`${client.postal || ''} ${client.city || ''}`.trim(), 115, y); y += 4; }
  if (client.siret)    { doc.text(`SIRET : ${client.siret}`, 115, y); y += 4; }
  if (client.email)    { doc.text(client.email, 115, y); y += 4; }

  // Extra (dueDate, paymentTerms, etc.)
  if (extra) {
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS', 15, top + 36);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let yy = top + 41;
    for (const [k, v] of Object.entries(extra)) {
      if (!v) continue;
      doc.setTextColor(...MUTED);
      doc.text(`${k} :`, 15, yy);
      doc.setTextColor(...PRIMARY);
      doc.text(`${v}`, 50, yy);
      yy += 5;
    }
  }
}

// ─── ITEMS TABLE ────────────────────────────────────────────
function drawItemsTable(doc, items, startY) {
  const rows = items.map((it) => [
    it.description,
    String(it.quantity),
    eur(it.unitPrice ?? it.unitPriceHT),
    `${it.vatRate ?? 20} %`,
    eur((it.unitPrice ?? it.unitPriceHT) * (it.quantity || 1)),
  ]);

  autoTable(doc, {
    startY,
    head: [['Description', 'Qté', 'PU HT', 'TVA', 'Total HT']],
    body: rows,
    theme: 'plain',
    headStyles: {
      fillColor: PRIMARY,
      textColor: WHITE,
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: BORDER,
      lineWidth: 0.1,
      textColor: PRIMARY,
    },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'right', cellWidth: 27, fontStyle: 'bold' },
    },
    margin: { left: 15, right: 15 },
  });
  return doc.lastAutoTable.finalY;
}

// ─── TOTALS BLOCK ───────────────────────────────────────────
function drawTotals(doc, { totalHT, totalTVA, totalTTC, paidAmount }, startY) {
  const x = 115;
  let y = startY + 8;

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(x, y - 4, 195, y - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.setTextColor(...MUTED);
  doc.text('Sous-total HT', x, y);
  doc.setTextColor(...PRIMARY);
  doc.text(eur(totalHT), 195, y, { align: 'right' });

  y += 5;
  doc.setTextColor(...MUTED);
  doc.text('TVA', x, y);
  doc.setTextColor(...PRIMARY);
  doc.text(eur(totalTVA), 195, y, { align: 'right' });

  y += 7;
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(x - 2, y - 5, 82, 9, 1.5, 1.5, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL TTC', x, y + 1);
  doc.text(eur(totalTTC), 195, y + 1, { align: 'right' });

  if (paidAmount > 0) {
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(`Déjà réglé : ${eur(paidAmount)}`, x, y);
    if (paidAmount < totalTTC) {
      y += 4;
      doc.setTextColor(...PRIMARY);
      doc.setFont('helvetica', 'bold');
      doc.text(`Reste à payer : ${eur(totalTTC - paidAmount)}`, x, y);
    }
  }
  return y;
}

// ─── FOOTER LEGAL ───────────────────────────────────────────
function drawFooter(doc, customNote) {
  const c = COMPANY_INFO;
  const y = 285;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(15, y - 4, 195, y - 4);

  // Bande de couleur (filet menthe) pour cohérence avec la charte
  doc.setFillColor(...ACCENT);
  doc.rect(15, y - 5, 8, 0.6, 'F');

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(
    `${c.name} ${c.legalForm} au capital de ${c.capital} — SIRET ${c.siret} — RCS ${c.rcs} — ORIAS ${c.orias} — TVA ${c.tva}`,
    105, y, { align: 'center' }
  );
  doc.text(`${c.address}, ${c.postal} ${c.city} · ${c.phone} · ${c.email}`, 105, y + 4, { align: 'center' });
  if (customNote) {
    doc.text(customNote, 105, y + 8, { align: 'center' });
  }
}

// ─── INVOICE ────────────────────────────────────────────────
export function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  drawHeader(doc, {
    title: 'Facture',
    number: invoice.invoiceNumber,
    date: frDate(invoice.issueDate),
  });

  drawIdentityBlocks(doc, {
    client: {
      name: invoice.clientName,
      address: invoice.clientAddress,
      postal: invoice.clientPostal,
      city: invoice.clientCity,
      siret: invoice.clientSiret,
      email: invoice.clientEmail,
    },
    extra: {
      'Date émission': frDate(invoice.issueDate),
      'Échéance':     invoice.dueDate ? frDate(invoice.dueDate) : '—',
      'Conditions':   invoice.paymentTerms || 'Paiement à 30 jours',
    },
  });

  const tableEndY = drawItemsTable(doc, invoice.lines || [], 92);
  drawTotals(doc, {
    totalHT: invoice.totalHT,
    totalTVA: invoice.totalTVA,
    totalTTC: invoice.totalTTC,
    paidAmount: invoice.paidAmount,
  }, tableEndY);

  // Bloc règlement
  let footerY = Math.max(tableEndY + 50, 220);
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('MODE DE RÈGLEMENT', 15, footerY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text(`Virement bancaire : ${COMPANY_INFO.bankName}`, 15, footerY + 5);
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(`IBAN : ${COMPANY_INFO.iban}`, 15, footerY + 9);
  doc.text(`BIC : ${COMPANY_INFO.bic}`, 15, footerY + 13);
  doc.text(`Référence à indiquer : ${invoice.invoiceNumber}`, 15, footerY + 17);

  if (invoice.notes) {
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES', 15, footerY + 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...PRIMARY);
    const lines = doc.splitTextToSize(invoice.notes, 180);
    doc.text(lines, 15, footerY + 30);
  }

  drawFooter(doc, 'Pas d\'escompte pour règlement anticipé. Pénalités de retard : 3 fois le taux légal. Indemnité forfaitaire de recouvrement : 40 €.');

  return Buffer.from(doc.output('arraybuffer'));
}

// ─── QUOTE ──────────────────────────────────────────────────
export function generateQuotePDF(quote) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  drawHeader(doc, {
    title: 'Devis',
    number: quote.quoteNumber,
    date: frDate(quote.createdAt),
  });

  drawIdentityBlocks(doc, {
    client: {
      name: quote.companyName || quote.contactName,
      address: quote.companyAddress,
      siret: quote.companySiret,
      email: quote.contactEmail,
    },
    extra: {
      'Date émission': frDate(quote.createdAt),
      'Valide jusqu\'au': frDate(quote.validUntil),
      'Conditions':   quote.paymentTerms || 'À réception',
    },
  });

  const items = (quote.items || []).map((it) => ({
    description: it.description,
    quantity: it.quantity,
    unitPrice: it.unitPriceHT,
    vatRate: quote.taxRate,
  }));

  const tableEndY = drawItemsTable(doc, items, 92);
  drawTotals(doc, {
    totalHT: quote.subtotalHT,
    totalTVA: quote.taxAmount,
    totalTTC: quote.totalTTC,
    paidAmount: 0,
  }, tableEndY);

  // Mention acceptation
  const accY = Math.max(tableEndY + 50, 230);
  doc.setDrawColor(...BORDER);
  doc.roundedRect(15, accY, 180, 28, 2, 2, 'S');
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCEPTATION DU DEVIS', 18, accY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PRIMARY);
  doc.text('Pour accepter ce devis, retourner un exemplaire signé avec la mention "Bon pour accord" et la date.', 18, accY + 11);
  doc.text('Date :', 18, accY + 20);
  doc.text('Signature précédée de la mention "Bon pour accord" :', 100, accY + 20);

  drawFooter(doc);
  return Buffer.from(doc.output('arraybuffer'));
}

// ─── CREDIT NOTE ────────────────────────────────────────────
export function generateCreditNotePDF(creditNote, sourceInvoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  drawHeader(doc, {
    title: 'Avoir',
    number: creditNote.creditNoteNumber,
    date: frDate(creditNote.issuedAt || creditNote.createdAt),
  });

  drawIdentityBlocks(doc, {
    client: {
      name: sourceInvoice?.clientName || 'Client',
      address: sourceInvoice?.clientAddress,
      postal: sourceInvoice?.clientPostal,
      city: sourceInvoice?.clientCity,
      siret: sourceInvoice?.clientSiret,
    },
    extra: {
      'Facture liée': sourceInvoice?.invoiceNumber || '—',
      'Motif':        creditNote.reason,
    },
  });

  // Montant en gros
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTANT DE L\'AVOIR', 15, 102);
  doc.setFontSize(26);
  doc.setTextColor(...ACCENT);
  doc.text(eur(creditNote.amount), 15, 117);

  drawFooter(doc, 'Cet avoir peut être déduit sur une prochaine facture ou faire l\'objet d\'un remboursement.');
  return Buffer.from(doc.output('arraybuffer'));
}
