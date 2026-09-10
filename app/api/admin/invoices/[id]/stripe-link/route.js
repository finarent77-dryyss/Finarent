import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { reponseErreurPrisma } from '@/lib/reponses-api';
import { desactiverLienPaiement } from '../../liens-paiement';

/**
 * POST — crée (ou regénère) le lien de paiement Stripe d'une facture.
 *
 * ADM2-06 : la regénération créait un lien supplémentaire sans désactiver le
 * précédent. Les deux restaient payables, et l'ancien portait l'ancien reste à
 * payer : un client pouvait solder 1 000 € une facture dont il ne devait plus
 * que 400 €. Le lien courant est donc désactivé avant toute création — et si
 * cette désactivation échoue, on refuse d'en créer un second plutôt que de
 * laisser deux liens vivants.
 */
export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY manquante)' }, { status: 503 });
  }
  const stripe = getStripe();

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });

  const remaining = invoice.totalTTC - invoice.paidAmount;
  if (remaining <= 0.01) {
    return NextResponse.json({ error: 'Cette facture est déjà soldée' }, { status: 400 });
  }
  if (invoice.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Impossible de créer un lien pour une facture annulée' }, { status: 400 });
  }
  if (invoice.status === 'DRAFT') {
    return NextResponse.json({
      error: 'Facture encore en brouillon : émettez-la avant de créer un lien de paiement.',
    }, { status: 400 });
  }

  // Ordre volontaire : on éteint l'ancien lien AVANT d'en créer un nouveau.
  // L'inverse laisserait, en cas d'échec de la désactivation, deux liens actifs
  // pour la même facture.
  const extinction = await desactiverLienPaiement(invoice);
  if (!extinction.desactive) {
    return NextResponse.json({
      error: `Lien précédent toujours actif : ${extinction.raison}. `
        + 'Aucun nouveau lien n\'a été créé — deux liens payables pour une même facture exposeraient à un double encaissement.',
    }, { status: 502 });
  }

  const price = await stripe.prices.create({
    currency: 'eur',
    unit_amount: Math.round(remaining * 100),
    product_data: {
      name: `Facture ${invoice.invoiceNumber}`,
      metadata: { client: invoice.clientName || '' },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finarent.com';

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
    after_completion: {
      type: 'redirect',
      redirect: { url: `${appUrl}/paiement-confirme?ref=${invoice.invoiceNumber}` },
    },
    ...(invoice.clientEmail && {
      customer_creation: 'always',
    }),
  });

  try {
    await prisma.invoice.update({
      where: { id },
      data: {
        stripePaymentLinkId: paymentLink.id,
        stripePaymentLinkUrl: paymentLink.url,
      },
    });
  } catch (err) {
    // Facture supprimée pendant l'aller-retour Stripe : le lien existe chez
    // Stripe mais n'est rattaché à rien. Un 404 le dit ; un 500 laissait croire
    // à un incident serveur sans indiquer que le lien créé est orphelin.
    return reponseErreurPrisma(err, {
      contexte: 'POST /api/admin/invoices/[id]/stripe-link',
      introuvable: `Facture introuvable : le lien de paiement ${paymentLink.id} vient d'être créé chez Stripe et doit y être désactivé manuellement.`,
    });
  }

  return NextResponse.json({ url: paymentLink.url, id: paymentLink.id, montant: remaining });
}

/** DELETE — révoque le lien de paiement courant. */
export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY manquante)' }, { status: 503 });
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  if (!invoice.stripePaymentLinkId) {
    return NextResponse.json({ error: 'Aucun lien Stripe trouvé' }, { status: 404 });
  }

  const extinction = await desactiverLienPaiement(invoice);
  if (!extinction.desactive) {
    // Le lien reste payable : le dire, plutôt que de vider les colonnes et de
    // faire croire à l'écran que la révocation a eu lieu.
    return NextResponse.json({
      error: `Le lien n'a pas pu être désactivé chez Stripe : ${extinction.raison}. Il reste payable.`,
    }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
