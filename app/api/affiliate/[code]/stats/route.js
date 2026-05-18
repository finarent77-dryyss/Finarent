import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/affiliate/[code]/stats
 * Stats publiques d'un affilié — pas d'auth requise mais filtrées selon `publicStatsEnabled`.
 * Ne retourne JAMAIS d'infos perso sur les leads/dossiers (juste les compteurs agrégés).
 */
export async function GET(request, { params }) {
  const { code } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      code: true,
      name: true,
      isActive: true,
      publicStatsEnabled: true,
      commissionType: true,
      commissionValue: true,
      createdAt: true,
      _count: {
        select: { clicks: true, prospects: true, applications: true },
      },
    },
  });

  if (!affiliate || !affiliate.isActive || !affiliate.publicStatsEnabled) {
    return NextResponse.json({ error: 'Stats non disponibles' }, { status: 404 });
  }

  // Compte commissions PENDING et PAID agrégées (montants pas exposés)
  const commissionAgg = await prisma.affiliateCommission.groupBy({
    by: ['status'],
    where: { affiliateId: affiliate.id },
    _count: true,
    _sum: { amount: true },
  });

  const pending = commissionAgg.find((c) => c.status === 'PENDING');
  const paid = commissionAgg.find((c) => c.status === 'PAID');

  return NextResponse.json({
    code: affiliate.code,
    name: affiliate.name,
    memberSince: affiliate.createdAt,
    commission: {
      type: affiliate.commissionType,
      value: affiliate.commissionValue,
    },
    stats: {
      clicks: affiliate._count.clicks,
      leads: affiliate._count.prospects,
      applications: affiliate._count.applications,
      commissionsPending: pending?._count || 0,
      commissionsPaid: paid?._count || 0,
      totalEarnings: (pending?._sum.amount || 0) + (paid?._sum.amount || 0),
      paidAmount: paid?._sum.amount || 0,
    },
  });
}
