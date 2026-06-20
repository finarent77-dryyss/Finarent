import { prisma } from '@/lib/prisma';
import { callCenterProspectFilter } from './find-prospect';
import { findProspectByPhone, findProspectForCall } from './find-prospect';
import { toRingoverNumber } from './phone';

function appBaseUrl() {
  return process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://finarent.fr';
}

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstname: 'Prospect', lastname: '' };
  if (parts.length === 1) return { firstname: parts[0], lastname: '' };
  return { firstname: parts[0], lastname: parts.slice(1).join(' ') };
}

function mapProspect(p) {
  const num = toRingoverNumber(p.phone);
  const { firstname, lastname } = splitName(p.name);
  return {
    uuid: p.id,
    firstname,
    lastname,
    company: p.company || 'Finarent',
    url: `${appBaseUrl()}/admin/prospects?highlight=${p.id}`,
    numbers: num ? [{ number: num, type: 'mobile' }] : [],
  };
}

/** Recherche smartdialer Ringover (query texte). */
export async function searchRingoverContacts(query) {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const digits = q.replace(/\D/g, '');

  const prospects = await prisma.prospect.findMany({
    where: {
      AND: [
        callCenterProspectFilter,
        {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
            ...(digits.length >= 4 ? [{ phone: { contains: digits } }] : []),
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      email: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 15,
  });

  return prospects.map(mapProspect);
}

/** Fiche contact affichée pendant un appel (événement contact). */
export async function lookupRingoverContact(data) {
  const prospect = await findProspectForCall(data);
  if (!prospect) return null;
  return mapProspect(prospect);
}

export function isContactSearchEvent(event, resource, ressource, data) {
  if (event !== 'contact') return false;
  if (resource === 'search' || ressource === 'search') return true;
  return Boolean(data?.query_search);
}
