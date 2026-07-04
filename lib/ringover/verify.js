import { safeEqual } from '@/lib/cron-auth';

/**
 * Ringover envoie la clé webhook dans le header Authorization (valeur brute, sans Bearer).
 * Fail-closed : si la clé n'est pas configurée, le webhook est REFUSÉ
 * (sinon n'importe qui pourrait forger des événements d'appel/SMS).
 * @see https://developer.ringover.com/
 */
export function verifyRingoverWebhook(request) {
  const expected = process.env.RINGOVER_WEBHOOK_KEY?.trim();
  if (!expected) {
    console.error('[ringover] RINGOVER_WEBHOOK_KEY absent — webhook refusé');
    return false;
  }
  const auth = request.headers.get('authorization')?.trim() || '';
  return safeEqual(auth, expected);
}
