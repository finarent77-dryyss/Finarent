import { ringoverApi } from './api-client.js';
import { toRingoverNumber, phoneSuffix } from './phone.js';
import { prospectStatusLabel } from '@/lib/prospect-utils.js';

function appBaseUrl() {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://finarent.fr';
}

export function buildRingoverContactPayload(input) {
  const num = toRingoverNumber(input.phone);
  const stageLabel = prospectStatusLabel(input.status);
  const companyBase = input.company?.trim() || 'Finarent';
  return {
    firstname: (input.firstName || 'Prospect').slice(0, 80),
    lastname: (input.lastName || '').slice(0, 80),
    company: `${companyBase} · ${stageLabel}`.slice(0, 160),
    is_shared: true,
    social_profile_url: `${appBaseUrl()}/call-center/prospects/${input.id}`,
    social_service_id: input.id,
    numbers: num ? [{ number: num, type: 'mobile' }] : [],
  };
}

export async function searchRingoverContactsApi(query) {
  return ringoverApi('/contacts', {
    method: 'POST',
    body: JSON.stringify({
      search: query,
      limit_count: 20,
      limit_offset: 0,
    }),
  });
}

export async function createRingoverContact(payload) {
  const created = await ringoverApi('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const id = created.contact_list?.[0]?.contact_id;
  return id ?? null;
}

export async function updateRingoverContact(contactId, payload) {
  await ringoverApi(`/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function findRingoverContactIdByPhone(phone) {
  const suffix = phoneSuffix(phone);
  if (!suffix || suffix.length < 8) return null;

  const res = await searchRingoverContactsApi(suffix);
  for (const c of res.contact_list ?? []) {
    const match = (c.numbers ?? []).some((n) => phoneSuffix(String(n.number)) === suffix);
    if (match && c.contact_id) return c.contact_id;
  }
  return null;
}
