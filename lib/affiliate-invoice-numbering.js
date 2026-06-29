import { prisma } from '@/lib/prisma';

/**
 * Numérotation séquentielle AF-YYYY-NNNN pour auto-factures affiliation.
 */
export async function nextAffiliateInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `AF-${year}-`;

  const last = await prisma.affiliateInvoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
    select: { invoiceNumber: true },
  });

  let seq = 1;
  if (last?.invoiceNumber) {
    const tail = parseInt(last.invoiceNumber.slice(prefix.length), 10);
    if (Number.isFinite(tail)) seq = tail + 1;
  }

  return `${prefix}${String(seq).padStart(4, '0')}`;
}
