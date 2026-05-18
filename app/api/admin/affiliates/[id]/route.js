import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/affiliates/[id]
 * Détail d'un affilié + stats détaillées + derniers clics/prospects/dossiers.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    include: {
      _count: { select: { clicks: true, prospects: true, applications: true } },
    },
  });
  if (!affiliate) {
    return NextResponse.json({ error: 'Affilié introuvable' }, { status: 404 });
  }

  // Derniers événements (limité pour ne pas saturer)
  const [recentClicks, recentProspects, recentApplications, commissions] = await Promise.all([
    prisma.affiliateClick.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, landingPath: true, referer: true, createdAt: true },
    }),
    prisma.prospect.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, name: true, email: true, company: true, status: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        companyName: true,
        productType: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.affiliateCommission.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        application: { select: { companyName: true, productType: true, amount: true } },
      },
    }),
  ]);

  // Agrégats commissions
  const totalPending = commissions
    .filter((c) => c.status === 'PENDING')
    .reduce((s, c) => s + c.amount, 0);
  const totalPaid = commissions
    .filter((c) => c.status === 'PAID')
    .reduce((s, c) => s + c.amount, 0);

  return NextResponse.json({
    ...affiliate,
    stats: {
      clicks: affiliate._count.clicks,
      prospects: affiliate._count.prospects,
      applications: affiliate._count.applications,
      totalPending,
      totalPaid,
    },
    recentClicks,
    recentProspects,
    recentApplications,
    commissions,
  });
}

/**
 * PATCH /api/admin/affiliates/[id]
 * Met à jour les paramètres d'un affilié.
 */
export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.name !== undefined) data.name = String(body.name).trim().slice(0, 150);
  if (body.email !== undefined) data.email = String(body.email).trim().toLowerCase().slice(0, 200);
  if (body.phone !== undefined) data.phone = body.phone ? String(body.phone).trim().slice(0, 30) : null;
  if (body.commissionType !== undefined) {
    data.commissionType = body.commissionType === 'PERCENT' ? 'PERCENT' : 'FIXED';
  }
  if (body.commissionValue !== undefined) {
    data.commissionValue = Math.max(0, Number(body.commissionValue) || 0);
  }
  if (body.isActive !== undefined) data.isActive = !!body.isActive;
  if (body.publicStatsEnabled !== undefined) data.publicStatsEnabled = !!body.publicStatsEnabled;
  if (body.notes !== undefined) data.notes = body.notes ? String(body.notes).slice(0, 1000) : null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  }

  try {
    const affiliate = await prisma.affiliate.update({ where: { id }, data });
    return NextResponse.json(affiliate);
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email ou code déjà utilisé' }, { status: 409 });
    }
    console.error('PATCH /api/admin/affiliates/[id] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/affiliates/[id]
 * Désactive l'affilié plutôt que de le supprimer (préserve l'historique des conversions).
 */
export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await prisma.affiliate.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true, message: 'Affilié désactivé (données conservées)' });
}
