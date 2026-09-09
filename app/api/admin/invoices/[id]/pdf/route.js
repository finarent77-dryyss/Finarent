import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/invoicing/pdf';
import { archiverEtEnvoyerEnFond } from '@/lib/documents/deliver';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { position: 'asc' } },
      application: { select: { reference: true } },
    },
  });

  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

  const pdfBuffer = generateInvoicePDF(invoice);

  // Archivage systématique + envoi au client. Une facture encore en brouillon
  // est conservée mais jamais expédiée : elle n'a pas d'existence comptable
  // tant qu'elle n'est pas émise.
  archiverEtEnvoyerEnFond({
    buffer: Buffer.from(pdfBuffer),
    fileName: `${invoice.invoiceNumber}.pdf`,
    kind: 'FACTURE',
    to: invoice.status === 'DRAFT' ? null : invoice.clientEmail,
    reference: invoice.application?.reference || null,
    numeroDocument: invoice.invoiceNumber,
    montant: `${invoice.totalTTC.toLocaleString('fr-FR')} € TTC`,
    invoiceId: invoice.id,
    applicationId: invoice.applicationId,
    userId: invoice.userId,
  });

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      'Cache-Control': 'no-cache',
    },
  });
}
