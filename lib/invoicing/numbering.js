import { prisma } from '@/lib/prisma';

/**
 * Numérotation séquentielle des documents commerciaux.
 * Format : <PREFIX>-<YYYY>-<NNNN> (zéro-padded sur 4 chiffres).
 * Inspiré du pattern slformations (FAC-YYYY-NNN) — élargi à 4 chiffres
 * et générique pour réutiliser sur factures, devis, avoirs.
 */

async function nextNumber(model, field, prefix) {
  const year = new Date().getFullYear();
  const fullPrefix = `${prefix}-${year}-`;

  const last = await prisma[model].findFirst({
    where: { [field]: { startsWith: fullPrefix } },
    orderBy: { [field]: 'desc' },
    select: { [field]: true },
  });

  let max = 0;
  if (last?.[field]) {
    const m = last[field].match(/-(\d+)$/);
    if (m) {
      const v = parseInt(m[1], 10);
      if (!Number.isNaN(v)) max = v;
    }
  }
  return `${fullPrefix}${String(max + 1).padStart(4, '0')}`;
}

export async function nextInvoiceNumber() {
  return nextNumber('invoice', 'invoiceNumber', 'FAC');
}

export async function nextQuoteNumber() {
  return nextNumber('quote', 'quoteNumber', 'DEV');
}

export async function nextCreditNoteNumber() {
  return nextNumber('creditNote', 'creditNoteNumber', 'AVO');
}
