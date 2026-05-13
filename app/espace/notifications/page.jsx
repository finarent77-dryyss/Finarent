import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import { prisma } from '@/lib/prisma';
import NotificationsClient from './NotificationsClient';

export const metadata = { title: 'Notifications | Finarent' };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session?.user) redirect('/espace');
  const dbUser = await syncUser(session.user);

  // Get status changes for user's applications
  const applications = await prisma.application.findMany({
    where: { userId: dbUser.id },
    select: { id: true },
  });
  const appIds = applications.map((a) => a.id);

  const notifications = await prisma.statusHistory.findMany({
    where: { applicationId: { in: appIds } },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      application: {
        select: { id: true, companyName: true, equipmentType: true },
      },
    },
  });

  // Get unread messages count
  const unreadMessages = await prisma.message.count({
    where: {
      applicationId: { in: appIds },
      senderId: { not: dbUser.id },
      readAt: null,
      isAdminOnly: false,
    },
  });

  return (
    <NotificationsClient
      notifications={JSON.parse(JSON.stringify(notifications))}
      unreadMessages={unreadMessages}
    />
  );
}
