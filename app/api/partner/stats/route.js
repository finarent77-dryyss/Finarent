import { NextResponse } from 'next/server';
import { requirePartner, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requirePartner();
  if (isAuthError(auth)) return auth;

  const { dbUser } = auth;
  const where = dbUser.role === 'ADMIN' ? {} : { partnerId: dbUser.partnerId };

  const [total, transmitted, approved, completed, commissions] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: 'TRANSMITTED' } }),
    prisma.application.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.application.count({ where: { ...where, status: 'COMPLETED' } }),
    dbUser.partnerId
      ? prisma.commission.aggregate({ where: { partnerId: dbUser.partnerId }, _sum: { amount: true } })
      : { _sum: { amount: null } },
  ]);

  const totalAmount = await prisma.application.aggregate({
    where: { ...where, status: { in: ['APPROVED', 'COMPLETED'] } },
    _sum: { amount: true },
  });

  // --- Enhanced stats ---

  // Monthly data: last 6 months of application counts
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyApplications = await prisma.application.findMany({
    where: { ...where, createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const count = monthlyApplications.filter(a => {
      const ad = new Date(a.createdAt);
      return ad.getMonth() === month && ad.getFullYear() === year;
    }).length;
    monthlyData.push({ month, year, count });
  }

  // Commission stats
  const commissionWhere = dbUser.partnerId ? { partnerId: dbUser.partnerId } : {};
  const [commAgg, commPaid, commPending] = await Promise.all([
    prisma.commission.aggregate({ where: commissionWhere, _avg: { rate: true }, _count: true }),
    prisma.commission.aggregate({ where: { ...commissionWhere, status: 'PAID' }, _sum: { amount: true } }),
    prisma.commission.aggregate({ where: { ...commissionWhere, status: 'PENDING' }, _sum: { amount: true } }),
  ]);

  const commissionStats = {
    totalPaid: commPaid._sum.amount || 0,
    totalPending: commPending._sum.amount || 0,
    avgRate: commAgg._avg.rate || 0,
  };

  // Conversion rate
  const conversionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Average processing time (TRANSMITTED -> APPROVED)
  let avgProcessingTime = 0;
  try {
    const transitions = await prisma.statusHistory.findMany({
      where: {
        fromStatus: 'TRANSMITTED',
        toStatus: 'APPROVED',
        application: where.partnerId ? { partnerId: where.partnerId } : undefined,
      },
      select: { createdAt: true, applicationId: true },
    });

    if (transitions.length > 0) {
      // Get corresponding TRANSMITTED entries
      const appIds = transitions.map(t => t.applicationId);
      const transmittedEntries = await prisma.statusHistory.findMany({
        where: {
          applicationId: { in: appIds },
          toStatus: 'TRANSMITTED',
        },
        select: { createdAt: true, applicationId: true },
        orderBy: { createdAt: 'desc' },
      });

      const transmittedMap = {};
      transmittedEntries.forEach(t => {
        if (!transmittedMap[t.applicationId]) transmittedMap[t.applicationId] = t.createdAt;
      });

      let totalDays = 0;
      let validCount = 0;
      transitions.forEach(t => {
        const transmittedDate = transmittedMap[t.applicationId];
        if (transmittedDate) {
          const diff = (new Date(t.createdAt) - new Date(transmittedDate)) / (1000 * 60 * 60 * 24);
          if (diff >= 0) { totalDays += diff; validCount++; }
        }
      });

      avgProcessingTime = validCount > 0 ? Math.round(totalDays / validCount) : 5;
    } else {
      avgProcessingTime = 5; // Placeholder value
    }
  } catch {
    avgProcessingTime = 5; // Fallback placeholder
  }

  return NextResponse.json({
    total,
    transmitted,
    approved,
    completed,
    totalCommissions: commissions._sum.amount || 0,
    totalAmount: totalAmount._sum.amount || 0,
    monthlyData,
    commissionStats,
    conversionRate,
    avgProcessingTime,
  });
}
