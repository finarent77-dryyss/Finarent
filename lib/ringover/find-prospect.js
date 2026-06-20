import { prisma } from '@/lib/prisma';
import { phoneSuffix, prospectPhoneFromCall } from './phone';

/** Prospects rattachés à un centre d'appel ou avec téléphone en file de prospection. */
export const callCenterProspectFilter = {
  OR: [
    { callCenterId: { not: null } },
    { assignedAgentId: { not: null } },
    { source: { contains: 'call', mode: 'insensitive' } },
    { phone: { not: null } },
  ],
};

export async function findProspectByPhone(phone) {
  const suffix = phoneSuffix(phone);
  if (!suffix || suffix.length < 8) return null;

  const candidates = await prisma.prospect.findMany({
    where: {
      AND: [callCenterProspectFilter, { phone: { not: null } }],
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      status: true,
      callCenterId: true,
      assignedAgentId: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  });

  return (
    candidates.find((p) => phoneSuffix(p.phone) === suffix)
    ?? candidates.find(
      (p) => phoneSuffix(p.phone).endsWith(suffix) || suffix.endsWith(phoneSuffix(p.phone)),
    )
    ?? null
  );
}

export async function findProspectForCall(data) {
  return findProspectByPhone(prospectPhoneFromCall(data));
}

export async function findAgentByRingoverEmail(email) {
  if (!email) return null;
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, name: true, email: true },
  });
}

export async function findAgentCallCenterId(userId) {
  if (!userId) return null;
  const membership = await prisma.callCenterMember.findFirst({
    where: { userId, isActive: true },
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    select: { callCenterId: true },
  });
  return membership?.callCenterId || null;
}
