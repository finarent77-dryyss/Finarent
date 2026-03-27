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

  // Monthly data: last 6 months of application counts
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentApps = await prisma.application.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const monthlyMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap[key] = { month: key, count: 0 };
  }
  recentApps.forEach((app) => {
    const d = new Date(app.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyMap[key]) monthlyMap[key].count++;
  });
  const monthlyData = Object.values(monthlyMap);

  // Top 5 sectors
  const sectorGroups = await prisma.application.groupBy({
    by: ['sector'],
    _count: { sector: true },
    where: { sector: { not: null } },
    orderBy: { _count: { sector: 'desc' } },
    take: 5,
  });
  const topSectors = sectorGroups.map((s) => ({ sector: s.sector, count: s._count.sector }));

  // Average amount of approved applications
  const avgResult = await prisma.application.aggregate({
    where: { status: { in: ['APPROVED', 'COMPLETED'] }, amount: { not: null } },
    _avg: { amount: true },
  });
  const averageAmount = avgResult._avg.amount || 0;

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
    monthlyData,
    topSectors,
    averageAmount,
  });
}
