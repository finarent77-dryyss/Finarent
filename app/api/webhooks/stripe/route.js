import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
    return Response.json({ error: 'Stripe non configuré' }, { status: 503 });
  }

  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return Response.json({ error: 'Signature invalide' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoiceId;

    if (!invoiceId) return Response.json({ received: true });

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return Response.json({ received: true });

    const amount = (session.amount_total ?? 0) / 100;
    if (amount <= 0) return Response.json({ received: true });

    await prisma.$transaction(async (tx) => {
      await tx.invoicePayment.create({
        data: {
          invoiceId,
          amount,
          paymentMethod: 'stripe',
          reference: session.payment_intent ?? session.id,
          paidAt: new Date(),
          notes: `Stripe Payment Link — session ${session.id}`,
        },
      });

      const newPaid = Number(invoice.paidAmount) + amount;
      const status = newPaid >= invoice.totalTTC - 0.01 ? 'PAID' : 'PARTIAL';

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaid,
          status,
          ...(status === 'PAID' && { paidAt: new Date(), paymentMethod: 'stripe' }),
        },
      });
    });
  }

  return Response.json({ received: true });
}
