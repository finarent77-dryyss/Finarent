/**
 * Ringover envoie la clé webhook dans le header Authorization (valeur brute, sans Bearer).
 * @see https://developer.ringover.com/
 */
export function verifyRingoverWebhook(request) {
  const expected = process.env.RINGOVER_WEBHOOK_KEY?.trim();
  if (!expected) {
    console.warn('[ringover] RINGOVER_WEBHOOK_KEY absent — webhook non vérifié');
    return true;
  }
  const auth = request.headers.get('authorization')?.trim();
  return auth === expected;
}
