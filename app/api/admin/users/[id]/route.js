import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = ['role', 'partnerId'];
  const data = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (data.role && !['CLIENT', 'ADMIN', 'PARTNER', 'INSURER'].includes(data.role)) {
    return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { partner: { select: { id: true, name: true } } },
  });

  return NextResponse.json(user);
}
