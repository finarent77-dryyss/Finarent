#!/usr/bin/env node
/**
 * Simule un webhook Ringover hangup (dev / test).
 *
 * Usage:
 *   RINGOVER_WEBHOOK_KEY=your-key node scripts/test-ringover-webhook.js
 *   RINGOVER_WEBHOOK_KEY=your-key node scripts/test-ringover-webhook.js --phone=0612345678 --email=admin@finarent.fr
 */

const base = process.env.WEBHOOK_BASE || 'http://localhost:3000';
const key = process.env.RINGOVER_WEBHOOK_KEY || '';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  }),
);

const phone = args.phone || '0612345678';
const email = args.email || 'admin@finarent.fr';

const payload = {
  event: 'hangup',
  resource: 'call',
  timestamp: Date.now() / 1000,
  data: {
    id: `test-${Date.now()}`,
    call_id: String(Date.now()),
    channel_id: String(Date.now()),
    direction: 'outbound',
    from_number: '33184800000',
    to_number: phone.replace(/^0/, '33'),
    duration_in_seconds: 42,
    start_time: Date.now() / 1000 - 45,
    hangup_time: Date.now() / 1000,
    user: {
      email,
      firstname: 'Test',
      lastname: 'Agent',
    },
  },
  attempt: 1,
};

async function main() {
  const res = await fetch(`${base}/api/webhooks/ringover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { Authorization: key } : {}),
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
}

main().catch(console.error);
