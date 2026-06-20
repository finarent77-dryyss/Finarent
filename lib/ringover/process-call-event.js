import { prisma } from '@/lib/prisma';
import {
  findAgentByRingoverEmail,
  findAgentCallCenterId,
  findProspectForCall,
} from './find-prospect';

function externalId(data, event) {
  const channel = data.channel_id ?? data.id ?? data.call_id;
  return `ringover:${channel}:${event}`;
}

function mapCallOutcome(event, data) {
  if (event === 'missed') return 'MISSED';
  if (event === 'voicemail') return 'VOICEMAIL';
  if (data.duration_in_seconds && data.duration_in_seconds > 0) return 'ANSWERED';
  return 'MISSED';
}

function mapProspectOutcome(outcome) {
  if (outcome === 'MISSED') return 'NO_ANSWER';
  if (outcome === 'VOICEMAIL') return 'CALLBACK';
  return 'INTERESTED';
}

function occurredAt(data, timestamp) {
  if (data.hangup_time) return new Date(data.hangup_time * 1000);
  if (data.start_time) return new Date(data.start_time * 1000);
  if (timestamp) return new Date(timestamp * 1000);
  return new Date();
}

const STATUS_FR = {
  ANSWERED: 'Décroché',
  MISSED: 'Manqué',
  VOICEMAIL: 'Messagerie',
};

function buildSummary(event, data, outcome) {
  const dir = (data.direction || '').toLowerCase();
  const way = dir === 'outbound' || dir === 'out' ? 'Sortant' : 'Entrant';
  const dur = data.duration_in_seconds ? `${data.duration_in_seconds}s` : '—';
  const from = data.from_number || '?';
  const to = data.to_number || '?';
  const statusFr = STATUS_FR[outcome] ?? outcome;
  return `Ringover · ${way} · ${statusFr} · ${dur} · ${from} → ${to}${event === 'missed' && data.reason ? ` (${data.reason})` : ''}`;
}

/** Enregistre hangup / missed / voicemail comme CallCenterInteraction + MAJ prospect. */
export async function processRingoverCallEvent(event, data, timestamp) {
  const allowed = ['hangup', 'missed', 'voicemail'];
  if (!allowed.includes(event)) {
    return { ok: true, action: 'ignored' };
  }

  const extId = externalId(data, event);
  const existing = await prisma.callCenterInteraction.findFirst({
    where: { provider: 'RINGOVER', externalId: extId },
    select: { id: true },
  });
  if (existing) return { ok: true, action: 'duplicate', interactionId: existing.id };

  const [prospect, agent] = await Promise.all([
    findProspectForCall(data),
    findAgentByRingoverEmail(data.user?.email),
  ]);

  const callCenterId = prospect?.callCenterId
    ?? (agent ? await findAgentCallCenterId(agent.id) : null);

  const outcome = mapCallOutcome(event, data);
  const prospectOutcome = mapProspectOutcome(outcome);
  const when = occurredAt(data, timestamp);
  const direction = (data.direction || '').toLowerCase() === 'outbound'
    || (data.direction || '').toLowerCase() === 'out'
    ? 'OUTBOUND'
    : 'INBOUND';

  const summary = buildSummary(event, data, outcome);

  const interaction = await prisma.$transaction(async (tx) => {
    const created = await tx.callCenterInteraction.create({
      data: {
        callCenterId,
        agentId: agent?.id || null,
        prospectId: prospect?.id || null,
        channel: 'CALL',
        direction,
        outcome,
        durationSec: data.duration_in_seconds ?? null,
        provider: 'RINGOVER',
        externalId: extId,
        summary,
        metadata: {
          callId: data.call_id,
          channelId: data.channel_id,
          ringoverEvent: event,
          fromNumber: data.from_number,
          toNumber: data.to_number,
          record: data.record || null,
        },
        occurredAt: when,
      },
    });

    if (prospect) {
      await tx.prospect.update({
        where: { id: prospect.id },
        data: {
          callAttempts: { increment: 1 },
          lastCallAt: when,
          lastCallOutcome: prospectOutcome,
          ...(prospect.status === 'NEW' ? { status: 'CONTACTED' } : {}),
        },
      });
    }

    return created;
  });

  return { ok: true, action: 'created', interactionId: interaction.id };
}
