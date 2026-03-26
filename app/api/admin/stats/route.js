import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const [
    totalApplications,
    pendingApplications,
    activeApplications,
    completedApplications,
    rejectedApplications,
    totalUsers,
    totalPartners,
    recentApplications,
    statusCounts,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: { in: ['PENDING', 'DOCUMENTS_NEEDED'] } } }),
    prisma.application.count({ where: { status: { in: ['REVIEWING', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'PENDING_SIGNATURE', 'SIGNED', 'TRANSMITTED'] } } }),
    prisma.application.count({ where: { status: { in: ['APPROVED', 'COMPLETED'] } } }),
    prisma.application.count({ where: { status: 'REJECTED' } }),
    prisma.user.count(),
    prisma.partner.count(),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, companyName: true, status: true, amount: true, createdAt: true, equipmentType: true },
    }),
    prisma.application.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
  ]);

  const totalAmount = await prisma.application.aggregate({
    where: { status: { in: ['APPROVED', 'COMPLETED'] } },
    _sum: { amount: true },
  });

  return NextResponse.json({
    totalApplications,
    pendingApplications,
    activeApplications,
    completedApplications,
    rejectedApplications,
    totalUsers,
    totalPartners,
    totalAmount: totalAmount._sum.amount || 0,
    recentApplications,
    statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count.status }), {}),
  });
}
