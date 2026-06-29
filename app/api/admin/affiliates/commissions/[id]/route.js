import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/admin/affiliates/commissions/[id]
 * Met à jour le statut d'une commission (PENDING → PAID, ou CANCELLED).
 */
export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  const status = body?.status;

  if (!['PENDING', 'VALIDATED', 'PAID', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const data = { status };
  if (status === 'VALIDATED') data.validatedAt = new Date();
  if (status === 'PAID') data.paidAt = new Date();
  if (body.notes !== undefined) data.notes = body.notes ? String(body.notes).slice(0, 500) : null;

  const commission = await prisma.affiliateCommission.update({
    where: { id },
    data,
  });

  return NextResponse.json(commission);
}
