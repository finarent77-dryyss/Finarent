import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const simulator = searchParams.get('simulator');
  const search = searchParams.get('q');

  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (simulator) {
    where.events = { some: { simulatorSlug: simulator } };
  }

  const prospects = await prisma.prospect.findMany({
    where,
    orderBy: { lastSeenAt: 'desc' },
    take: 200,
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, simulatorSlug: true, category: true, params: true, result: true, createdAt: true },
      },
      _count: { select: { events: true } },
    },
  });

  return NextResponse.json(prospects);
}
