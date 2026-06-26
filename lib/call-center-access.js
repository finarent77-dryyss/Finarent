import { redirect } from 'next/navigation';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from './prisma';
import { syncUser } from './users';

/** Charge l'utilisateur DB + son membership centre d'appel actif (s'il existe). */
export async function loadCallCenterUser() {
  const session = await getSession();
  if (!session?.user) return null;

  const dbUser = await syncUser(session.user);
  if (!dbUser) return null;

  const membership = await prisma.callCenterMember.findFirst({
    where: { userId: dbUser.id, isActive: true, callCenter: { isActive: true } },
    include: {
      callCenter: {
        select: {
          id: true,
          name: true,
          code: true,
          ringoverPhoneNumbers: true,
          brevoMarketingListId: true,
        },
      },
    },
  });

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    membership,
    callCenterId: membership?.callCenterId ?? null,
    memberRole: membership?.role ?? null,
    isAdmin: dbUser.role === 'ADMIN',
    isManager: dbUser.role === 'ADMIN' || membership?.role === 'MANAGER',
    isAgent: membership?.role === 'AGENT',
  };
}

export function hasCallCenterAccess(user) {
  if (!user) return false;
  return user.isAdmin || Boolean(user.membership);
}

export function isCallCenterManager(user) {
  if (!user) return false;
  return user.isAdmin || user.memberRole === 'MANAGER';
}

/** Filtre Prisma prospects : admin voit tout, manager son centre, agent ses dossiers. */
export function callCenterProspectWhere(user) {
  if (user.isAdmin && !user.callCenterId) {
    return { callCenterId: { not: null } };
  }

  if (isCallCenterManager(user) && user.callCenterId) {
    return { callCenterId: user.callCenterId };
  }

  return {
    AND: [
      { callCenterId: user.callCenterId },
      { assignedAgentId: user.id },
    ],
  };
}

export function canManageProspect(user, prospect) {
  if (user.isAdmin && !user.callCenterId) return true;
  if (isCallCenterManager(user)) {
    if (!user.callCenterId) return true;
    return prospect.callCenterId === user.callCenterId;
  }
  return prospect.assignedAgentId === user.id;
}

export async function requireCallCenterAccess() {
  const user = await loadCallCenterUser();
  if (!user || !hasCallCenterAccess(user)) {
    redirect('/espace');
  }
  return user;
}

export async function requireCallCenterManager() {
  const user = await requireCallCenterAccess();
  if (!isCallCenterManager(user)) {
    redirect('/call-center');
  }
  return user;
}
