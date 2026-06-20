import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin-activity-log';

/**
 * GET /api/admin/call-centers/[id]
 * Détail centre + membres + stats + derniers events.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const center = await prisma.callCenter.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      },
      _count: { select: { applications: true, interactions: true, commissions: true } },
    },
  });
  if (!center) {
    return NextResponse.json({ error: 'Centre introuvable' }, { status: 404 });
  }

  const [recentApplications, recentInteractions, commissions] = await Promise.all([
    prisma.application.findMany({
      where: { callCenterId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true, companyName: true, productType: true, amount: true,
        status: true, createdAt: true,
      },
    }),
    prisma.callCenterInteraction.findMany({
      where: { callCenterId: id },
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      take: 30,
      include: {
        agent: { select: { id: true, name: true, email: true } },
        prospect: { select: { id: true, name: true, email: true } },
        application: { select: { id: true, companyName: true } },
      },
    }),
    prisma.callCenterCommission.findMany({
      where: { callCenterId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        application: { select: { companyName: true, productType: true, amount: true } },
      },
    }),
  ]);

  const totalPending = commissions
    .filter((c) => c.status === 'PENDING')
    .reduce((s, c) => s + c.amount, 0);
  const totalPaid = commissions
    .filter((c) => c.status === 'PAID')
    .reduce((s, c) => s + c.amount, 0);

  return NextResponse.json({
    ...center,
    stats: {
      members: center.members.length,
      applications: center._count.applications,
      interactions: center._count.interactions,
      totalPending,
      totalPaid,
    },
    recentApplications,
    recentInteractions,
    commissions,
  });
}

/**
 * PATCH /api/admin/call-centers/[id]
 * Met à jour les paramètres du centre.
 */
export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.name !== undefined) data.name = String(body.name).trim().slice(0, 150);
  if (body.type !== undefined) data.type = body.type === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';
  if (body.address !== undefined) data.address = body.address ? String(body.address).slice(0, 200) : null;
  if (body.phone !== undefined) data.phone = body.phone ? String(body.phone).slice(0, 30) : null;
  if (body.email !== undefined) data.email = body.email ? String(body.email).trim().toLowerCase().slice(0, 200) : null;
  if (body.iban !== undefined) data.iban = body.iban ? String(body.iban).replace(/\s+/g, '').slice(0, 40) : null;
  if (body.commissionType !== undefined) {
    data.commissionType = body.commissionType === 'FIXED' ? 'FIXED' : 'PERCENT';
  }
  if (body.commissionValue !== undefined) {
    data.commissionValue = Math.max(0, Number(body.commissionValue) || 0);
  }
  if (body.isActive !== undefined) data.isActive = !!body.isActive;
  if (body.notes !== undefined) data.notes = body.notes ? String(body.notes).slice(0, 1000) : null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  }

  const center = await prisma.callCenter.update({ where: { id }, data });
  return NextResponse.json(center);
}

/**
 * DELETE /api/admin/call-centers/[id]
 * Désactive le centre (préserve l'historique commissions/interactions).
 */
export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const center = await prisma.callCenter.update({ where: { id }, data: { isActive: false } });
  await logAdminActivity({
    actorId: auth.dbUser?.id,
    module: 'call_center',
    action: 'CENTER_DEACTIVATED',
    entityType: 'CallCenter',
    entityId: id,
    summary: `Centre « ${center.name} » désactivé`,
    request,
  });
  return NextResponse.json({ success: true, message: 'Centre désactivé (historique conservé)' });
}
