import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateQuotePDF } from '@/lib/invoicing/pdf';
import { archiverEtEnvoyerDocument } from '@/lib/documents/deliver';

/**
 * Prévisualisation et envoi d'un devis, séparés — même raison que pour les
 * factures : un GET, câblé dans l'IHM comme un lien « PDF », expédiait le devis
 * au client en tâche de fond, sans que l'échec éventuel remonte à l'écran.
 */

async function chargerDevis(id) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      items: { orderBy: { position: 'asc' } },
      application: { select: { reference: true } },
    },
  });
}

/** GET — prévisualisation seule. Aucun effet de bord. */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const quote = await chargerDevis(id);
  if (!quote) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });

  const pdfBuffer = generateQuotePDF(quote);

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${quote.quoteNumber}.pdf"`,
      'Cache-Control': 'no-cache',
    },
  });
}

/** POST — archive le devis et l'envoie au contact, en rendant compte de l'issue. */
export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const quote = await chargerDevis(id);
  if (!quote) return NextResponse.json({ error: 'Devis introuvable' }, { status: 404 });

  if (quote.status === 'DRAFT') {
    return NextResponse.json({
      error: 'Un devis en brouillon n\'engage pas Finarent : passez-le en SENT avant de l\'envoyer.',
    }, { status: 400 });
  }
  if (!quote.contactEmail) {
    return NextResponse.json({ error: 'Aucune adresse email renseignée sur ce devis.' }, { status: 400 });
  }

  const pdfBuffer = generateQuotePDF(quote);

  const { document, envoye, raison } = await archiverEtEnvoyerDocument({
    buffer: Buffer.from(pdfBuffer),
    fileName: `${quote.quoteNumber}.pdf`,
    kind: 'DEVIS',
    to: quote.contactEmail,
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

  if (envoye) {
    await prisma.quote.update({ where: { id }, data: { sentAt: new Date() } });
    return NextResponse.json({ envoye: true, documentId: document.id });
  }

  if (document?.emailSentAt) {
    return NextResponse.json({ envoye: false, dejaTransmis: true, raison, documentId: document.id });
  }

  return NextResponse.json({
    envoye: false,
    error: `Envoi impossible : ${raison || 'cause inconnue'}`,
    documentId: document?.id ?? null,
  }, { status: 502 });
}
