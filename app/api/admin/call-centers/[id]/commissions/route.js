import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminActivity } from '@/lib/admin-activity-log';

const ACTION_TO_STATUS = {
  pay: 'PAID',
  cancel: 'CANCELLED',
  reset: 'PENDING',
};

const ACTION_TO_LOG = {
  pay: 'COMMISSION_PAID',
  cancel: 'COMMISSION_CANCELLED',
  reset: 'COMMISSION_RESET',
};

/**
 * PATCH /api/admin/call-centers/[id]/commissions
 * Met à jour le statut de versement d'une ou plusieurs commissions du centre.
 *
 * Body : { commissionIds: string[], action: 'pay' | 'cancel' | 'reset' }
 *   - pay   → status PAID + paidAt = maintenant
 *   - cancel→ status CANCELLED
 *   - reset → status PENDING + paidAt = null
 */
export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const ids = Array.isArray(body.commissionIds) ? body.commissionIds.filter(Boolean) : [];
  const status = ACTION_TO_STATUS[body.action];

  if (!status) {
    return NextResponse.json({ error: 'Action invalide (pay | cancel | reset)' }, { status: 400 });
  }
  if (ids.length === 0) {
    return NextResponse.json({ error: 'Aucune commission sélectionnée' }, { status: 400 });
  }

  const data = { status };
  if (status === 'PAID') data.paidAt = new Date();
  if (status === 'PENDING') data.paidAt = null;

  // On borne aux commissions appartenant bien à ce centre (sécurité)
  const result = await prisma.callCenterCommission.updateMany({
    where: { id: { in: ids }, callCenterId: id },
    data,
  });

  if (result.count > 0) {
    const center = await prisma.callCenter.findUnique({ where: { id }, select: { name: true } });
    await logAdminActivity({
      actorId: auth.dbUser?.id,
      module: 'finance',
      action: ACTION_TO_LOG[body.action],
      entityType: 'CallCenterCommission',
      entityId: id,
      summary: `${result.count} commission(s) → ${status} · centre ${center?.name || id}`,
      details: { commissionIds: ids, status, count: result.count },
      request,
    });
  }

  return NextResponse.json({ ok: true, updated: result.count, status });
}
