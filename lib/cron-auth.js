import crypto from 'crypto';

/** Comparaison à temps constant de deux chaînes (évite les timing attacks). */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Autorisation des routes CRON — fail-closed.
 * Le middleware bypasse `/api/cron`, ces routes doivent donc se protéger
 * elles-mêmes. Si `CRON_SECRET` n'est pas configuré, l'accès est REFUSÉ
 * (et non ouvert), pour ne jamais exposer purge/relances/alertes en anonyme.
 */
export function isCronAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization') || '';
  return safeEqual(auth, `Bearer ${secret}`);
}
