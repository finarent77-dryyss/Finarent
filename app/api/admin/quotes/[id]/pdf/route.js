import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateQuotePDF } from '@/lib/invoicing/pdf';
import { archiverEtEnvoyerEnFond } from '@/lib/documents/deliver';

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: { orderBy: { position: 'asc' } },
      application: { select: { reference: true } },
    },
  });
  if (!quote) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });

  const pdfBuffer = generateQuotePDF(quote);

  // Un devis encore en brouillon est archivé mais pas envoyé : il n'engage
  // Finarent qu'une fois passé en SENT.
  archiverEtEnvoyerEnFond({
    buffer: Buffer.from(pdfBuffer),
    fileName: `${quote.quoteNumber}.pdf`,
    kind: 'DEVIS',
    to: quote.status === 'DRAFT' ? null : quote.contactEmail,
    reference: quote.application?.reference || null,
    numeroDocument: quote.quoteNumber,
    montant: `${quote.totalTTC.toLocaleString('fr-FR')} € TTC`,
    messageComplementaire:
      'Vous trouverez votre devis en pièce jointe. Il reste valable jusqu\'au '
      + new Date(quote.validUntil).toLocaleDateString('fr-FR')
      + '. Vous pouvez l\'accepter directement depuis votre espace.',
    quoteId: quote.id,
    applicationId: quote.applicationId,
    userId: quote.userId,
  });

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${quote.quoteNumber}.pdf"`,
    },
  });
}
