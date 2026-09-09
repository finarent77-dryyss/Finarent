import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * Réception des événements Stripe.
 *
 * Stripe livre « au moins une fois » : le même `checkout.session.completed` peut
 * arriver deux fois (timeout, 5xx, ou « Resend » depuis le tableau de bord).
 * L'ancienne version créait alors un second `InvoicePayment` et doublait
 * `paidAmount` — lu hors transaction puis réécrit à l'intérieur, ce qui ouvrait
 * en plus une fenêtre de perte entre deux événements concurrents.
 *
 * Deux gestes rendent l'écriture idempotente :
 *   1. `StripeWebhookEvent.id` porte l'identifiant d'événement, écrit dans la
 *      MÊME transaction que le paiement : un rejeu bute sur la clé primaire et
 *      n'écrit rien ;
 *   2. le montant réglé est cumulé par `increment` atomique, jamais recalculé à
 *      partir d'une lecture antérieure.
 */

/** Écart d'arrondi toléré sur un solde en euros. */
const EPSILON = 0.01;

/** Signale un événement à acquitter sans le traiter (facture inconnue, etc.). */
class EvenementIgnore extends Error {}

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

  if (event.type !== 'checkout.session.completed') {
    return Response.json({ received: true });
  }

  const session = event.data.object;
  const invoiceId = session.metadata?.invoiceId;
  if (!invoiceId) return Response.json({ received: true });

  const amount = Math.round((session.amount_total ?? 0)) / 100;
  if (amount <= 0) return Response.json({ received: true });

  try {
    await prisma.$transaction(async (tx) => {
      // Verrou de déduplication. En tête de transaction pour que le rejeu
      // s'arrête avant toute écriture comptable.
      await tx.stripeWebhookEvent.create({
        data: { id: event.id, type: event.type, invoiceId, amount },
      });

      const facture = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!facture) throw new EvenementIgnore('facture inconnue');

      await tx.invoicePayment.create({
        data: {
          invoiceId,
          amount,
          paymentMethod: 'stripe',
          // Référence volontairement en clair : `protect()` lève si
          // ENCRYPTION_KEY manque, ce qui ferait rejouer Stripe indéfiniment sur
          // un 500. `reveal()` sait relire une valeur non préfixée « v1: ».
          reference: session.payment_intent ?? session.id,
          paidAt: new Date(),
          notes: `Stripe Payment Link — session ${session.id}`,
        },
      });

      // Cumul atomique : la ligne est verrouillée par l'update, deux événements
      // distincts traités en parallèle s'additionnent au lieu de s'écraser.
      const apres = await tx.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: { increment: amount } },
        select: { paidAmount: true, totalTTC: true, status: true },
      });

      const statut = apres.paidAmount >= apres.totalTTC - EPSILON ? 'PAID' : 'PARTIAL';
      if (statut === apres.status) return;

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: statut,
          ...(statut === 'PAID' && { paidAt: new Date(), paymentMethod: 'stripe' }),
        },
      });
    });
  } catch (erreur) {
    if (erreur?.code === 'P2002') {
      // Rejeu : l'événement avait déjà été comptabilisé. On acquitte pour que
      // Stripe cesse de le renvoyer.
      console.warn(`[stripe] événement ${event.id} déjà traité, rejeu ignoré`);
      return Response.json({ received: true, duplicate: true });
    }
    if (erreur instanceof EvenementIgnore) {
      console.warn(`[stripe] événement ${event.id} ignoré : ${erreur.message}`);
      return Response.json({ received: true });
    }
    // Toute autre panne remonte en 500 : Stripe rejouera, et la déduplication
    // garantit que le rejeu ne comptera pas double.
    throw erreur;
  }

  return Response.json({ received: true });
}
