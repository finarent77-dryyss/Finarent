-- Deduplication des evenements Stripe (defaut INT-01).
--
-- Stripe livre « au moins une fois » et rejoue sur timeout ou sur 5xx. Sans
-- trace du passage, un rejeu de checkout.session.completed creait un second
-- InvoicePayment et doublait Invoice.paidAmount.
--
-- La cle primaire porte l'identifiant d'evenement Stripe : la contrainte
-- d'unicite sert de verrou de deduplication, ecrite dans la meme transaction
-- que le paiement.
CREATE TABLE IF NOT EXISTS "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "invoiceId" TEXT,
    "amount" DOUBLE PRECISION,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_receivedAt_idx" ON "StripeWebhookEvent"("receivedAt");

CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_invoiceId_idx" ON "StripeWebhookEvent"("invoiceId");
