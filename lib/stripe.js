import Stripe from 'stripe';

let _client = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Client Stripe lazy — évite un crash au build si STRIPE_SECRET_KEY est absent. */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error('STRIPE_SECRET_KEY non configurée');
  if (!_client) {
    _client = new Stripe(key, { apiVersion: '2024-06-20' });
  }
  return _client;
}
