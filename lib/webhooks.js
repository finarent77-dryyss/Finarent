import { prisma } from './prisma';

/**
 * Trigger webhooks for a partner when an application event occurs
 * @param {string} partnerId
 * @param {string} event - e.g. 'APPLICATION_TRANSMITTED'
 * @param {object} payload - data to send
 */
export async function triggerPartnerWebhook(partnerId, event, payload) {
  if (!partnerId) return;

  try {
    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner?.notes) return;

    const notes = JSON.parse(partner.notes);
    const webhook = notes?.webhook;

    if (!webhook?.url || !webhook.events?.includes(event)) return;

    // Fire and forget - don't block the main flow
    fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finassur-Event': event,
        'X-Finassur-Signature': 'v1', // Placeholder for HMAC signature
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      }),
    }).catch(err => console.error(`Webhook failed for partner ${partnerId}:`, err));
  } catch (err) {
    console.error('Webhook trigger error:', err);
  }
}
