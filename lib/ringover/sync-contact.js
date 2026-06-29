import { prisma } from '@/lib/prisma';
import { ringoverApiConfigured } from './api-client.js';
import { callCenterProspectFilter } from './find-prospect.js';
import {
  buildRingoverContactPayload,
  createRingoverContact,
  findRingoverContactIdByPhone,
  updateRingoverContact,
} from './contacts-api.js';
import { splitProspectName } from '@/lib/prospect-utils.js';

const BATCH_SIZE = 40;
const BATCH_DELAY_MS = 300;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function syncProspectToRingover(prospectId) {
  if (!ringoverApiConfigured()) return false;

  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      status: true,
      ringoverContactId: true,
      callCenterId: true,
      assignedAgentId: true,
      source: true,
    },
  });
  if (!prospect) return false;

  const inScope = Boolean(prospect.callCenterId)
    || Boolean(prospect.assignedAgentId)
    || (prospect.source || '').toLowerCase().includes('call');
  if (!inScope) return false;

  const { firstName, lastName } = splitProspectName(prospect.name);
  const payload = buildRingoverContactPayload({
    ...prospect,
    firstName,
    lastName,
  });
  if (payload.numbers.length === 0 && !firstName.trim()) return false;

  try {
    let contactId = prospect.ringoverContactId ? Number(prospect.ringoverContactId) : null;
    if (contactId && Number.isNaN(contactId)) contactId = null;

    if (!contactId && prospect.phone) {
      contactId = await findRingoverContactIdByPhone(prospect.phone);
    }

    if (contactId) {
      await updateRingoverContact(contactId, payload);
    } else {
      const created = await createRingoverContact(payload);
      if (!created) return false;
      contactId = created;
    }

    await prisma.prospect.update({
      where: { id: prospectId },
      data: {
        ringoverContactId: String(contactId),
        ringoverSyncedAt: new Date(),
      },
    });
    return true;
  } catch (e) {
    console.error('[ringover] sync prospect failed:', prospectId, e);
    return false;
  }
}

export function scheduleRingoverProspectSync(prospectId) {
  void syncProspectToRingover(prospectId).catch((e) =>
    console.error('[ringover] schedule sync:', e),
  );
}

export async function syncAllCallCenterProspectsToRingover(opts = {}) {
  if (!ringoverApiConfigured()) {
    return { synced: 0, failed: 0, errors: ['RINGOVER_API_KEY non configurée.'] };
  }

  const where = {
    AND: [
      callCenterProspectFilter,
      ...(opts.callCenterId ? [{ callCenterId: opts.callCenterId }] : []),
    ],
  };

  const prospects = await prisma.prospect.findMany({
    where,
    select: { id: true },
    orderBy: { updatedAt: 'desc' },
    take: opts.limit ?? 500,
  });

  const result = { synced: 0, failed: 0, errors: [] };

  for (let i = 0; i < prospects.length; i++) {
    const ok = await syncProspectToRingover(prospects[i].id);
    if (ok) result.synced += 1;
    else result.failed += 1;

    if (i < prospects.length - 1 && (i + 1) % BATCH_SIZE === 0) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return result;
}

export async function getRingoverSyncStats(callCenterId) {
  const base = {
    AND: [
      callCenterProspectFilter,
      ...(callCenterId ? [{ callCenterId }] : []),
    ],
  };

  const [total, synced, withPhone, neverContacted] = await Promise.all([
    prisma.prospect.count({ where: base }),
    prisma.prospect.count({ where: { AND: [...base.AND, { ringoverContactId: { not: null } }] } }),
    prisma.prospect.count({ where: { AND: [...base.AND, { phone: { not: null } }] } }),
    prisma.prospect.count({
      where: { AND: [...base.AND, { status: 'NEW' }, { callAttempts: 0 }] },
    }),
  ]);

  return {
    apiConfigured: ringoverApiConfigured(),
    webhookConfigured: Boolean(process.env.RINGOVER_WEBHOOK_KEY?.trim()),
    total,
    synced,
    withPhone,
    neverContacted,
    pendingSync: total - synced,
  };
}
