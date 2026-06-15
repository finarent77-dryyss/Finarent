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
  const callCenterId = searchParams.get('callCenterId');

  const where = {};
  if (status && status !== 'ALL') where.status = status;
  if (callCenterId === 'none') where.callCenterId = null;
  else if (callCenterId) where.callCenterId = callCenterId;
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

  const sort = searchParams.get('sort') || 'recent';
  const orderBy = sort === 'score'
    ? [{ engagementScore: 'desc' }, { lastSeenAt: 'desc' }]
    : [{ lastSeenAt: 'desc' }];

  const prospects = await prisma.prospect.findMany({
    where,
    orderBy,
    take: 200,
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, simulatorSlug: true, category: true, params: true, result: true, createdAt: true },
      },
      callCenter: { select: { id: true, name: true, code: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
      _count: { select: { events: true } },
    },
  });

  return NextResponse.json(prospects);
}
