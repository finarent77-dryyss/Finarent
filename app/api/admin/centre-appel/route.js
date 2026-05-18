import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Statuts considérés "à appeler" — c-a-d pas encore traités ou en cours de qualif
const PROSPECT_CALL_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED'];
const APPLICATION_CALL_STATUSES = ['PENDING', 'REVIEWING', 'DOCUMENTS_NEEDED'];

export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all'; // all | prospects | demandes | rappels
  const search = (searchParams.get('q') || '').trim().toLowerCase();

  const [prospects, applications] = await Promise.all([
    prisma.prospect.findMany({
      where: {
        phone: { not: null },
        status: { in: PROSPECT_CALL_STATUSES },
      },
      orderBy: [{ status: 'asc' }, { lastSeenAt: 'desc' }],
      take: 200,
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { simulatorSlug: true, category: true, createdAt: true },
        },
        _count: { select: { events: true } },
      },
    }),
    prisma.application.findMany({
      where: {
        status: { in: APPLICATION_CALL_STATUSES },
        user: { phone: { not: null } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: { select: { name: true, phone: true, email: true, company: true } },
      },
    }),
  ]);

  const queue = [
    ...prospects.map((p) => ({
      kind: 'prospect',
      id: p.id,
      status: p.status,
      name: p.name || p.company || null,
      email: p.email,
      phone: p.phone,
      company: p.company,
      lastEvent: p.events[0] || null,
      eventCount: p._count.events,
      notes: p.notes,
      lastTouchAt: p.lastSeenAt,
      createdAt: p.createdAt,
    })),
    ...applications.map((a) => ({
      kind: 'demande',
      id: a.id,
      status: a.status,
      name: a.user?.name || null,
      email: a.user?.email,
      phone: a.user?.phone,
      company: a.companyName || a.user?.company,
      productType: a.productType,
      amount: a.amount,
      sector: a.sector,
      notes: a.adminNotes,
      lastTouchAt: a.updatedAt,
      createdAt: a.createdAt,
    })),
  ];

  const filtered = queue
    .filter((it) => {
      if (filter === 'prospects' && it.kind !== 'prospect') return false;
      if (filter === 'demandes' && it.kind !== 'demande') return false;
      if (filter === 'rappels' && !/\[RAPPEL/i.test(it.notes || '')) return false;
      if (!search) return true;
      const hay = [it.name, it.email, it.phone, it.company].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(search);
    })
    .sort((a, b) => new Date(b.lastTouchAt) - new Date(a.lastTouchAt));

  return NextResponse.json({
    items: filtered,
    stats: {
      total: queue.length,
      prospects: queue.filter((q) => q.kind === 'prospect').length,
      demandes: queue.filter((q) => q.kind === 'demande').length,
      rappels: queue.filter((q) => /\[RAPPEL/i.test(q.notes || '')).length,
    },
  });
}
