import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  // Fenêtres temporelles communes
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3_600_000);
  const fourHoursAgo = new Date(now.getTime() - 4 * 3_600_000);
  const oneDayAhead = new Date(now.getTime() + 24 * 3_600_000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3_600_000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3_600_000);

  // ─── TOUTES les requêtes indépendantes en parallèle ───
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
    totalAmountAgg,
    recentApps,
    sectorGroups,
    avgResult,
    completedApps,
    signedHistories,
    pendingSignatureHistories,
    stagnantCount,
    operatorActions,
    urgentPending,
    urgentDocs,
    expiringSoonOffers,
    staleOffers,
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
    prisma.application.aggregate({
      where: { status: { in: ['APPROVED', 'COMPLETED'] } },
      _sum: { amount: true },
    }),
    prisma.application.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.application.groupBy({
      by: ['sector'],
      _count: { sector: true },
      where: { sector: { not: null } },
      orderBy: { _count: { sector: 'desc' } },
      take: 5,
    }),
    prisma.application.aggregate({
      where: { status: { in: ['APPROVED', 'COMPLETED'] }, amount: { not: null } },
      _avg: { amount: true },
    }),
    prisma.application.findMany({
      where: { status: { in: ['COMPLETED', 'APPROVED'] } },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.statusHistory.findMany({
      where: { toStatus: 'SIGNED' },
      select: { applicationId: true, createdAt: true },
    }),
    prisma.statusHistory.findMany({
      where: { toStatus: 'PENDING_SIGNATURE' },
      select: { applicationId: true, createdAt: true },
    }),
    prisma.application.count({
      where: {
        status: { in: ['PENDING', 'DOCUMENTS_NEEDED'] },
        updatedAt: { lt: thirtyDaysAgo },
      },
    }),
    prisma.statusHistory.groupBy({
      by: ['changedById'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
    prisma.application.count({
      where: { status: 'PENDING', createdAt: { lt: fourHoursAgo } },
    }),
    prisma.application.count({
      where: { status: 'DOCUMENTS_NEEDED', updatedAt: { lt: sevenDaysAgo } },
    }),
    prisma.offer.count({
      where: { status: { in: ['SENT', 'VIEWED'] }, expiresAt: { lt: oneDayAhead, gt: now } },
    }),
    prisma.offer.count({
      where: { status: 'SENT', sentAt: { lt: twoDaysAgo } },
    }),
  ]);

  // Monthly data: last 6 months
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

  const topSectors = sectorGroups.map((s) => ({ sector: s.sector, count: s._count.sector }));
  const averageAmount = avgResult._avg.amount || 0;

  // ─── Conversion funnel ─────────────────────────────
  const FUNNEL_ORDER = ['PENDING', 'REVIEWING', 'QUOTE_SENT', 'PENDING_SIGNATURE', 'SIGNED', 'COMPLETED'];
  const FUNNEL_LABELS = {
    PENDING: 'Dossiers reçus',
    REVIEWING: 'En étude',
    QUOTE_SENT: 'Offres émises',
    PENDING_SIGNATURE: 'Signature en cours',
    SIGNED: 'Signés',
    COMPLETED: 'Fonds débloqués',
  };
  const allStatusCounts = statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count.status }), {});
  const cumulativeOrder = ['PENDING', 'REVIEWING', 'DOCUMENTS_NEEDED', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'PENDING_SIGNATURE', 'SIGNED', 'TRANSMITTED', 'APPROVED', 'COMPLETED'];
  const funnel = FUNNEL_ORDER.map((step) => {
    const startIdx = cumulativeOrder.indexOf(step);
    const cumulative = cumulativeOrder
      .slice(startIdx)
      .reduce((sum, s) => sum + (allStatusCounts[s] || 0), 0);
    return { status: step, label: FUNNEL_LABELS[step], count: cumulative };
  });

  // ─── Délais moyens ─────────────────────────────────
  const avgProcessingHours = completedApps.length > 0
    ? Math.round(
        completedApps.reduce((sum, a) => sum + (new Date(a.updatedAt) - new Date(a.createdAt)), 0)
        / completedApps.length / 3_600_000,
      )
    : 0;

  const pendingSigByApp = pendingSignatureHistories.reduce((acc, h) => {
    if (!acc[h.applicationId] || h.createdAt < acc[h.applicationId]) acc[h.applicationId] = h.createdAt;
    return acc;
  }, {});
  const signatureDurations = signedHistories
    .map((s) => pendingSigByApp[s.applicationId] && (new Date(s.createdAt) - new Date(pendingSigByApp[s.applicationId])))
    .filter((d) => d && d > 0);
  const avgSignatureHours = signatureDurations.length > 0
    ? Math.round(signatureDurations.reduce((s, d) => s + d, 0) / signatureDurations.length / 3_600_000)
    : 0;

  const abandonmentRate = totalApplications > 0
    ? Math.round(((rejectedApplications + stagnantCount) / totalApplications) * 100)
    : 0;

  // ─── Performance par opérateur (top 5) ─────────────
  // Dépend de operatorActions, donc reste séquentiel ici.
  const operatorIds = operatorActions.map((o) => o.changedById).filter(Boolean);
  const operators = operatorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: operatorIds }, role: { in: ['ADMIN', 'PARTNER', 'INSURER'] } },
        select: { id: true, name: true, email: true, role: true },
      })
    : [];
  const operatorMap = operators.reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
  const topOperators = operatorActions
    .map((o) => ({
      id: o.changedById,
      name: operatorMap[o.changedById]?.name || operatorMap[o.changedById]?.email?.split('@')[0] || 'Inconnu',
      email: operatorMap[o.changedById]?.email,
      role: operatorMap[o.changedById]?.role,
      actions: o._count.id,
    }))
    .filter((o) => operatorMap[o.id]);

  const todayActions = {
    urgentPending,
    urgentDocs,
    expiringSoonOffers,
    staleOffers,
    total: urgentPending + urgentDocs + expiringSoonOffers + staleOffers,
  };

  return NextResponse.json({
    todayActions,
    totalApplications,
    pendingApplications,
    activeApplications,
    completedApplications,
    rejectedApplications,
    totalUsers,
    totalPartners,
    totalAmount: totalAmountAgg._sum.amount || 0,
    recentApplications,
    statusCounts: allStatusCounts,
    monthlyData,
    topSectors,
    averageAmount,
    funnel,
    avgProcessingHours,
    avgSignatureHours,
    abandonmentRate,
    stagnantCount,
    topOperators,
  });
}
