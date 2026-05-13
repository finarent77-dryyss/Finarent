import { NextResponse } from 'next/server';
import { requirePartner, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PRODUCT_LABELS = {
  PRET_PRO: 'Prêt pro',
  CREDIT_BAIL: 'Crédit-bail',
  LOA: 'LOA',
  LLD: 'LLD',
  LEASING_OPS: 'Leasing op.',
  RC_PRO: 'RC Pro',
};

export async function GET() {
  const auth = await requirePartner();
  if (isAuthError(auth)) return auth;

  const { dbUser } = auth;
  const where = dbUser.role === 'ADMIN' ? {} : { partnerId: dbUser.partnerId };
  const commissionWhere = dbUser.partnerId ? { partnerId: dbUser.partnerId } : null;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    total,
    transmitted,
    approved,
    completed,
    reviewing,
    pendingActions,
    commissions,
    totalAmountAgg,
    monthlyApplications,
    commAgg,
    commPaid,
    commPending,
    sectorGroups,
    productGroups,
    transitionsApproved,
    recentCommissions,
  ] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: 'TRANSMITTED' } }),
    prisma.application.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.application.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.application.count({ where: { ...where, status: 'REVIEWING' } }),
    prisma.application.count({ where: { ...where, status: { in: ['TRANSMITTED', 'REVIEWING'] } } }),
    commissionWhere
      ? prisma.commission.aggregate({ where: commissionWhere, _sum: { amount: true } })
      : Promise.resolve({ _sum: { amount: null } }),
    prisma.application.aggregate({
      where: { ...where, status: { in: ['APPROVED', 'COMPLETED'] } },
      _sum: { amount: true },
    }),
    prisma.application.findMany({
      where: { ...where, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    commissionWhere
      ? prisma.commission.aggregate({ where: commissionWhere, _avg: { rate: true }, _count: true })
      : Promise.resolve({ _avg: { rate: null }, _count: 0 }),
    commissionWhere
      ? prisma.commission.aggregate({ where: { ...commissionWhere, status: 'PAID' }, _sum: { amount: true } })
      : Promise.resolve({ _sum: { amount: null } }),
    commissionWhere
      ? prisma.commission.aggregate({ where: { ...commissionWhere, status: 'PENDING' }, _sum: { amount: true } })
      : Promise.resolve({ _sum: { amount: null } }),
    prisma.application.groupBy({
      by: ['sector'],
      where: { ...where, sector: { not: null } },
      _count: { sector: true },
      orderBy: { _count: { sector: 'desc' } },
      take: 5,
    }),
    prisma.application.groupBy({
      by: ['productType'],
      where,
      _count: { productType: true },
      orderBy: { _count: { productType: 'desc' } },
    }),
    prisma.statusHistory.findMany({
      where: {
        fromStatus: 'TRANSMITTED',
        toStatus: 'APPROVED',
        application: where.partnerId ? { partnerId: where.partnerId } : undefined,
      },
      select: { createdAt: true, applicationId: true },
    }).catch(() => []),
    commissionWhere
      ? prisma.commission.findMany({
          where: { ...commissionWhere, createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true, amount: true, status: true },
        })
      : Promise.resolve([]),
  ]);

  // Monthly data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const count = monthlyApplications.filter((a) => {
      const ad = new Date(a.createdAt);
      return ad.getMonth() === month && ad.getFullYear() === year;
    }).length;
    monthlyData.push({ month, year, count });
  }

  const commissionStats = {
    totalPaid: commPaid._sum.amount || 0,
    totalPending: commPending._sum.amount || 0,
    avgRate: commAgg._avg.rate || 0,
  };

  const conversionRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Average processing time (TRANSMITTED -> APPROVED)
  let avgProcessingTime = 5;
  if (transitionsApproved.length > 0) {
    const appIds = transitionsApproved.map((t) => t.applicationId);
    const transmittedEntries = await prisma.statusHistory.findMany({
      where: { applicationId: { in: appIds }, toStatus: 'TRANSMITTED' },
      select: { createdAt: true, applicationId: true },
      orderBy: { createdAt: 'desc' },
    });
    const transmittedMap = {};
    transmittedEntries.forEach((t) => {
      if (!transmittedMap[t.applicationId]) transmittedMap[t.applicationId] = t.createdAt;
    });
    let totalDays = 0;
    let validCount = 0;
    transitionsApproved.forEach((t) => {
      const transmittedDate = transmittedMap[t.applicationId];
      if (transmittedDate) {
        const diff = (new Date(t.createdAt) - new Date(transmittedDate)) / (1000 * 60 * 60 * 24);
        if (diff >= 0) { totalDays += diff; validCount++; }
      }
    });
    avgProcessingTime = validCount > 0 ? Math.round(totalDays / validCount) : 5;
  }

  const topSectors = sectorGroups.map((s) => ({ sector: s.sector, count: s._count.sector }));
  const topProducts = productGroups.map((p) => ({
    productType: p.productType,
    label: PRODUCT_LABELS[p.productType] || p.productType,
    count: p._count.productType,
  }));

  const funnel = [
    { label: 'Transmis', count: transmitted + reviewing + approved + completed },
    { label: 'En analyse', count: reviewing + approved + completed },
    { label: 'Validés', count: approved + completed },
    { label: 'Finalisés', count: completed },
  ];

  // Commission timeline
  const commissionTimeline = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthComms = recentCommissions.filter((c) => {
      const cd = new Date(c.createdAt);
      return cd.getMonth() === m && cd.getFullYear() === y;
    });
    commissionTimeline.push({
      month: m,
      year: y,
      paid: monthComms.filter((c) => c.status === 'PAID').reduce((s, c) => s + c.amount, 0),
      pending: monthComms.filter((c) => c.status === 'PENDING').reduce((s, c) => s + c.amount, 0),
    });
  }

  return NextResponse.json({
    total,
    transmitted,
    approved,
    completed,
    reviewing,
    pendingActions,
    totalCommissions: commissions._sum.amount || 0,
    totalAmount: totalAmountAgg._sum.amount || 0,
    monthlyData,
    commissionStats,
    commissionTimeline,
    conversionRate,
    avgProcessingTime,
    topSectors,
    topProducts,
    funnel,
  });
}
