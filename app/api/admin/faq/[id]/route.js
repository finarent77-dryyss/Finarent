import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const faq = await prisma.fAQ.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(faq);
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await prisma.fAQ.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
