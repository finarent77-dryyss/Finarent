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
// Plafonds par défaut du lot : la boucle ci-dessous enchaîne des appels HTTP
// séquentiels vers Ringover, elle doit rendre la main quoi qu'il arrive.
const LIMITE_DEFAUT = 500;
const LIMITE_MAX = 1000;
const DUREE_MAX_MS = 60_000;

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

  // `limit` peut venir d'un corps de requête : on le borne ici aussi, pour que
  // le `take` reste un entier valide quel que soit l'appelant.
  const limite = Math.min(Math.max(1, Math.trunc(Number(opts.limit)) || LIMITE_DEFAUT), LIMITE_MAX);
  const dureeMax = Math.max(1000, Math.trunc(Number(opts.dureeMaxMs)) || DUREE_MAX_MS);

  const prospects = await prisma.prospect.findMany({
    where,
    select: { id: true },
    orderBy: { updatedAt: 'desc' },
    take: limite,
  });

  const result = { synced: 0, failed: 0, errors: [] };
  const echeance = Date.now() + dureeMax;

  for (let i = 0; i < prospects.length; i++) {
    // Délai d'expiration global : mieux vaut un compte rendu partiel qu'une
    // requête HTTP qui ne se termine jamais.
    if (Date.now() >= echeance) {
      result.errors.push(
        `Délai de ${Math.round(dureeMax / 1000)} s dépassé : ${prospects.length - i} contact(s) non traités.`,
      );
      break;
    }

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
