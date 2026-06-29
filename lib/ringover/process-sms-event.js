import { prisma } from '@/lib/prisma';
import { findAgentByRingoverEmail, findProspectByPhone } from './find-prospect.js';

function smsExternalId(event, data) {
  const id = data.message_id ?? data.id ?? Date.now();
  return `ringover:sms:${id}:${event}`;
}

function smsDirection(event, data) {
  const dir = (data.direction || event || '').toLowerCase();
  if (dir.includes('out') || dir.includes('sent') || event.includes('sent')) return 'OUTBOUND';
  return 'INBOUND';
}

function prospectPhoneFromSms(data, direction) {
  return direction === 'OUTBOUND' ? data.to_number || null : data.from_number || null;
}

export async function processRingoverSmsEvent(event, data, timestamp) {
  const extId = smsExternalId(event, data);
  const existing = await prisma.callCenterInteraction.findFirst({
    where: { provider: 'RINGOVER', externalId: extId },
    select: { id: true },
  });
  if (existing) return { ok: true, action: 'duplicate' };

  const direction = smsDirection(event, data);
  const phone = prospectPhoneFromSms(data, direction);
  const [prospect, agent] = await Promise.all([
    findProspectByPhone(phone),
    findAgentByRingoverEmail(data.user?.email),
  ]);

  const content = (data.content || data.body || data.text || '').trim();
  const when = timestamp ? new Date(timestamp * 1000) : new Date();
  const from = data.from_number || '?';
  const to = data.to_number || '?';
  const way = direction === 'OUTBOUND' ? 'Sortant' : 'Entrant';

  const callCenterId = prospect?.callCenterId
    ?? (agent?.id ? await import('./find-prospect.js').then((m) => m.findAgentCallCenterId(agent.id)) : null);

  await prisma.callCenterInteraction.create({
    data: {
      prospectId: prospect?.id,
      agentId: agent?.id,
      callCenterId: callCenterId || undefined,
      externalId: extId,
      provider: 'RINGOVER',
      channel: 'SMS',
      direction,
      status: direction === 'OUTBOUND' ? 'SENT' : 'DELIVERED',
      subject: content.slice(0, 120) || null,
      summary: `Ringover SMS · ${way} · ${from} → ${to}${content ? ` · ${content.slice(0, 80)}` : ''}`,
      metadata: {
        ringoverEvent: event,
        fromNumber: data.from_number,
        toNumber: data.to_number,
        content,
      },
      occurredAt: when,
    },
  });

  if (prospect) {
    await prisma.prospect.update({
      where: { id: prospect.id },
      data: { lastCallAt: when },
    });
  }

  return { ok: true, action: 'created' };
}
