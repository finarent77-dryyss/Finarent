import { NextResponse } from 'next/server';
import { requireInsurer, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const FR_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export async function GET() {
  const auth = await requireInsurer();
  if (isAuthError(auth)) return auth;

  const where = { productType: 'RC_PRO' };
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    total,
    pending,
    reviewing,
    quoteSent,
    approved,
    rejected,
    completed,
    totalAmountAgg,
    recentApps,
    sectorGroups,
    completedApps,
  ] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: 'PENDING' } }),
    prisma.application.count({ where: { ...where, status: 'REVIEWING' } }),
    prisma.application.count({ where: { ...where, status: 'QUOTE_SENT' } }),
    prisma.application.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.application.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.application.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.application.aggregate({
      where: { ...where, status: { in: ['APPROVED', 'COMPLETED'] } },
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
    }),
    prisma.application.findMany({
      where: { ...where, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, amount: true, status: true },
    }),
    prisma.application.groupBy({
      by: ['sector'],
      where: { ...where, sector: { not: null } },
      _count: { sector: true },
      orderBy: { _count: { sector: 'desc' } },
      take: 6,
    }),
    prisma.application.findMany({
      where: { ...where, status: { in: ['COMPLETED', 'APPROVED'] } },
      select: { createdAt: true, updatedAt: true },
    }),
  ]);

  const totalAmount = totalAmountAgg._sum.amount || 0;
  const avgPremium = Math.round(totalAmountAgg._avg.amount || 0);

  // Tendance mensuelle (6 derniers mois)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const apps = recentApps.filter((a) => {
      const ad = new Date(a.createdAt);
      return ad.getMonth() === month && ad.getFullYear() === year;
    });
    monthlyData.push({
      label: `${FR_MONTHS[month]} ${String(year).slice(2)}`,
      count: apps.length,
      premium: apps.reduce((s, a) => s + (a.amount || 0), 0),
    });
  }

  const topSectors = sectorGroups.map((s) => ({ sector: s.sector, count: s._count.sector }));
  const conversionRate = total > 0 ? Math.round(((approved + completed) / total) * 100) : 0;

  const avgProcessingHours = completedApps.length > 0
    ? Math.round(
        completedApps.reduce((sum, a) => sum + (new Date(a.updatedAt) - new Date(a.createdAt)), 0)
        / completedApps.length / 3_600_000,
      )
    : 0;

  const funnel = [
    { label: 'Demandes reçues', count: total },
    { label: 'En analyse', count: reviewing + quoteSent + approved + completed },
    { label: 'Devis envoyé', count: quoteSent + approved + completed },
    { label: 'Souscrites', count: approved + completed },
  ];

  return NextResponse.json({
    total,
    pending: pending + reviewing,
    approved: approved + completed,
    rejected,
    quoteSent,
    completed,
    totalAmount,
    avgPremium,
    conversionRate,
    avgProcessingHours,
    monthlyData,
    topSectors,
    funnel,
  });
}
