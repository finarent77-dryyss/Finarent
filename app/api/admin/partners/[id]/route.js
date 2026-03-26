import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = ['name', 'type', 'contactEmail', 'isActive', 'notes'];
  const data = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const partner = await prisma.partner.update({
    where: { id },
    data,
  });

  return NextResponse.json(partner);
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  await prisma.partner.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
