import { prisma } from '@/lib/prisma';
import { brevoApi } from './client.js';
import { brevoMarketingEnabled, marketingListId } from './config.js';
import { splitProspectName, prospectStatusLabel } from '@/lib/prospect-utils.js';

async function resolveMarketingListId(callCenterId) {
  if (callCenterId) {
    const center = await prisma.callCenter.findUnique({
      where: { id: callCenterId },
      select: { brevoMarketingListId: true },
    });
    if (center?.brevoMarketingListId) return center.brevoMarketingListId;
  }
  return marketingListId();
}

function isCallCenterProspect(p) {
  return Boolean(p.callCenterId) || (p.source || '').toLowerCase().includes('call');
}

/**
 * Synchronise un prospect centre d'appels vers Brevo (contacts + liste marketing).
 */
export async function syncProspectToBrevoMarketing(prospectId) {
  if (!brevoMarketingEnabled()) return;

  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      status: true,
      callCenterId: true,
      brevoContactId: true,
      source: true,
    },
  });

  if (!prospect || !isCallCenterProspect(prospect)) return;

  const listId = await resolveMarketingListId(prospect.callCenterId);
  if (!listId) return;

  const email = (prospect.email || '').trim().toLowerCase();
  if (!email.includes('@')) return;

  const { firstName, lastName } = splitProspectName(prospect.name);

  let centerName = null;
  if (prospect.callCenterId) {
    const c = await prisma.callCenter.findUnique({
      where: { id: prospect.callCenterId },
      select: { name: true },
    });
    centerName = c?.name ?? null;
  }

  try {
    await brevoApi('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email,
        updateEnabled: true,
        attributes: {
          PRENOM: firstName,
          NOM: lastName,
          SMS: prospect.phone || undefined,
          ENTREPRISE: prospect.company || undefined,
          STAGE: prospect.status,
          STAGE_LABEL: prospectStatusLabel(prospect.status),
          PROSPECT_ID: prospect.id,
          CENTRE: centerName || undefined,
          SOURCE: 'FINARENT_CALL_CENTER',
        },
        listIds: [listId],
      }),
    });

    if (!prospect.brevoContactId) {
      await prisma.prospect.update({
        where: { id: prospect.id },
        data: { brevoContactId: email },
      });
    }
  } catch (e) {
    console.error('[brevo] sync prospect failed:', prospectId, e);
  }
}

export function scheduleProspectBrevoSync(prospectId) {
  void syncProspectToBrevoMarketing(prospectId).catch((e) =>
    console.error('[brevo] schedule sync error:', e),
  );
}
