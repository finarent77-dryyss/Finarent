import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/invoicing/pdf';
import { archiverEtEnvoyerDocument } from '@/lib/documents/deliver';
import { coordonneesBancairesValides, MESSAGE_RIB_MANQUANT } from '@/lib/invoicing/company.js';

/**
 * Prévisualisation et envoi d'une facture, séparés.
 *
 * Le GET déclenchait l'archivage ET l'expédition au client dès que la facture
 * n'était plus en brouillon — alors que l'IHM le câble comme un simple lien
 * « Voir PDF ». Ouvrir une facture pour la relire l'envoyait donc au client, et
 * l'envoi se faisait en tâche de fond avec un `.catch(console.error)` : la
 * réponse restait 200 quoi qu'il arrive, l'admin n'apprenait jamais que rien
 * n'était parti. Une méthode sûre ne doit pas produire d'effet de bord :
 * le GET ne fait plus que rendre le document, le POST l'envoie et rend compte.
 */

async function chargerFacture(id) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { position: 'asc' } },
      application: { select: { reference: true } },
    },
  });
}

/** GET — prévisualisation seule. Aucun effet de bord. */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const invoice = await chargerFacture(id);
  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

  const pdfBuffer = generateInvoicePDF(invoice);

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * POST — archive la facture et l'envoie au client, de façon synchrone.
 * Répond `{ envoye, raison }` et un 502 explicite si l'expédition échoue,
 * pour que l'échec soit visible à l'écran et non seulement dans `EmailLog`.
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const invoice = await chargerFacture(id);
  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

  if (invoice.status === 'DRAFT') {
    return NextResponse.json({
      error: 'Une facture en brouillon n\'a pas d\'existence comptable : émettez-la avant de l\'envoyer.',
    }, { status: 400 });
  }
  // Une facture porte le RIB de Finarent en pied de page : l'envoyer avec le
  // gabarit revient à réclamer un paiement sur un compte inexistant.
  if (!coordonneesBancairesValides()) {
    return NextResponse.json({ error: MESSAGE_RIB_MANQUANT }, { status: 409 });
  }
  if (!invoice.clientEmail) {
    return NextResponse.json({ error: 'Aucune adresse email renseignée sur cette facture.' }, { status: 400 });
  }

  const pdfBuffer = generateInvoicePDF(invoice);

  const { document, envoye, raison } = await archiverEtEnvoyerDocument({
    buffer: Buffer.from(pdfBuffer),
    fileName: `${invoice.invoiceNumber}.pdf`,
    kind: 'FACTURE',
    to: invoice.clientEmail,
    reference: invoice.application?.reference || null,
    numeroDocument: invoice.invoiceNumber,
    montant: `${invoice.totalTTC.toLocaleString('fr-FR')} € TTC`,
    invoiceId: invoice.id,
    applicationId: invoice.applicationId,
    userId: invoice.userId,
  });

  if (envoye) {
    await prisma.invoice.update({
      where: { id },
      data: { sentAt: new Date(), sentTo: invoice.clientEmail },
    });
    return NextResponse.json({ envoye: true, documentId: document.id });
  }

  // Contenu identique déjà transmis : l'archivage est idempotent par empreinte
  // SHA-256, ce n'est pas un échec mais un envoi devenu inutile.
  if (document?.emailSentAt) {
    return NextResponse.json({ envoye: false, dejaTransmis: true, raison, documentId: document.id });
  }

  return NextResponse.json({
    envoye: false,
    error: `Envoi impossible : ${raison || 'cause inconnue'}`,
    documentId: document?.id ?? null,
  }, { status: 502 });
}
