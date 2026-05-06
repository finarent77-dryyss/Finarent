import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { syncUser } from '@/lib/users';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ unread: 0, items: [] });

  const dbUser = await syncUser(session.user);

  const apps = await prisma.application.findMany({
    where: { userId: dbUser.id },
    select: { id: true },
  });
  const appIds = apps.map((a) => a.id);

  const lastReadIso = request.headers.get('x-last-read') || null;
  const lastRead = lastReadIso ? new Date(lastReadIso) : null;

  const [statusEvents, unreadMessageCount] = await Promise.all([
    prisma.statusHistory.findMany({
      where: {
        applicationId: { in: appIds },
        ...(lastRead ? { createdAt: { gt: lastRead } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        application: { select: { id: true, companyName: true, equipmentType: true } },
      },
    }),
    prisma.message.count({
      where: {
        applicationId: { in: appIds },
        senderId: { not: dbUser.id },
        readAt: null,
        isAdminOnly: false,
      },
    }),
  ]);

  const items = statusEvents.map((e) => ({
    id: e.id,
    type: 'status',
    applicationId: e.applicationId,
    label: e.application.companyName || e.application.equipmentType || 'Dossier',
    fromStatus: e.fromStatus,
    toStatus: e.toStatus,
    comment: e.comment,
    createdAt: e.createdAt,
  }));

  return NextResponse.json({
    unread: items.length + unreadMessageCount,
    statusEvents: items.length,
    unreadMessages: unreadMessageCount,
    items,
  });
}
