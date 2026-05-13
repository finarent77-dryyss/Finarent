/**
 * Génération PDF des documents commerciaux Finassur.
 * Stack : jsPDF + jspdf-autotable (Node-native, OK serverless Vercel).
 *
 * Inspiré de slformations/src/lib/pdf/invoices.ts — simplifié pour Finassur.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPANY_INFO } from './company.js';

const PRIMARY = [10, 25, 47];    // #0A192F
const ACCENT = [16, 185, 129];   // #10B981
const MUTED = [107, 114, 128];   // gray-500
const BORDER = [229, 231, 235];  // gray-200

function eur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
}

function frDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── HEADER ─────────────────────────────────────────────────
function drawHeader(doc, { title, number, date }) {
  // Bande haute primary
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 28, 'F');

  // Nom marque
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(COMPANY_INFO.name.toUpperCase(), 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 230);
  doc.text(`Courtier en financement & assurance — ${COMPANY_INFO.website}`, 15, 22);

  // Type + numéro à droite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(title.toUpperCase(), 195, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`N° ${number}`, 195, 20, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(180, 200, 230);
  doc.text(`Émis le ${date}`, 195, 25, { align: 'right' });
}

// ─── COMPANY + CLIENT BLOCKS ────────────────────────────────
function drawIdentityBlocks(doc, { client, extra }) {
  const top = 38;

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
      textColor: [255, 255, 255],
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
  doc.rect(x - 2, y - 5, 82, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL TTC', x, y + 1);
  doc.text(eur(totalTTC), 195, y + 1, { align: 'right' });

  if (paidAmount > 0) {
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(`✓ Déjà réglé : ${eur(paidAmount)}`, x, y);
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
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(
    `${c.name} ${c.legalForm} au capital de ${c.capital} — SIRET ${c.siret} — RCS ${c.rcs} — ORIAS ${c.orias} — TVA ${c.tva}`,
    105, y, { align: 'center' }
  );
  if (customNote) {
    doc.text(customNote, 105, y + 4, { align: 'center' });
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

  const tableEndY = drawItemsTable(doc, invoice.lines || [], 90);
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

  const tableEndY = drawItemsTable(doc, items, 90);
  drawTotals(doc, {
    totalHT: quote.subtotalHT,
    totalTVA: quote.taxAmount,
    totalTTC: quote.totalTTC,
    paidAmount: 0,
  }, tableEndY);

  // Mention acceptation
  const accY = Math.max(tableEndY + 50, 230);
  doc.setDrawColor(...BORDER);
  doc.rect(15, accY, 180, 28);
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
  doc.text('MONTANT DE L\'AVOIR', 15, 100);
  doc.setFontSize(26);
  doc.setTextColor(...ACCENT);
  doc.text(eur(creditNote.amount), 15, 115);

  drawFooter(doc, 'Cet avoir peut être déduit sur une prochaine facture ou faire l\'objet d\'un remboursement.');
  return Buffer.from(doc.output('arraybuffer'));
}
