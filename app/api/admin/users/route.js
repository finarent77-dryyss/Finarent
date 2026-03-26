import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { applications: true } },
      partner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(users);
}
