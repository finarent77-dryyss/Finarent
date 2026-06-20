import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

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

  const price = await stripe.prices.create({
    currency: 'eur',
    unit_amount: Math.round(remaining * 100),
    product_data: {
      name: `Facture ${invoice.invoiceNumber}`,
      metadata: { client: invoice.clientName || '' },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finarent.fr';

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

  await prisma.invoice.update({
    where: { id },
    data: {
      stripePaymentLinkId: paymentLink.id,
      stripePaymentLinkUrl: paymentLink.url,
    },
  });

  return NextResponse.json({ url: paymentLink.url, id: paymentLink.id });
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || !invoice.stripePaymentLinkId) {
    return NextResponse.json({ error: 'Aucun lien Stripe trouvé' }, { status: 404 });
  }

  await stripe.paymentLinks.update(invoice.stripePaymentLinkId, { active: false });

  await prisma.invoice.update({
    where: { id },
    data: { stripePaymentLinkId: null, stripePaymentLinkUrl: null },
  });

  return NextResponse.json({ success: true });
}
