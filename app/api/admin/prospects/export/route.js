import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scoreLabel } from '@/lib/prospects/scoring';
import { logAdminActivity } from '@/lib/admin-activity-log';

/**
 * GET /api/admin/prospects/export
 * Export CSV des prospects. Reprend les mêmes filtres que la liste
 * (?status, ?q, ?simulator, ?sort) pour exporter exactement ce qui est affiché.
 *
 * Le fichier inclut un BOM UTF-8 pour un affichage correct des accents
 * dans Excel, et peut être réimporté via /api/admin/prospects/import.
 */
export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('q');
  const simulator = searchParams.get('simulator');
  const sort = searchParams.get('sort') || 'recent';
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
  if (simulator) where.events = { some: { simulatorSlug: simulator } };

  const orderBy = sort === 'score'
    ? [{ engagementScore: 'desc' }, { lastSeenAt: 'desc' }]
    : [{ lastSeenAt: 'desc' }];

  const prospects = await prisma.prospect.findMany({
    where,
    orderBy,
    include: {
      events: { orderBy: { createdAt: 'desc' }, take: 1, select: { simulatorSlug: true } },
      _count: { select: { events: true } },
    },
  });

  const header = [
    'name', 'email', 'phone', 'company', 'status', 'score', 'scoreLabel',
    'source', 'utmSource', 'utmCampaign', 'referrer', 'lastSimulator',
    'events', 'firstSeenAt', 'lastSeenAt', 'notes',
  ];

  const lines = [header.join(',')];
  for (const p of prospects) {
    lines.push(csvRow([
      p.name,
      p.email,
      p.phone,
      p.company,
      p.status,
      p.engagementScore ?? 0,
      scoreLabel(p.engagementScore || 0).label,
      p.source,
      p.utmSource,
      p.utmCampaign,
      p.referrer,
      p.events?.[0]?.simulatorSlug,
      p._count?.events ?? 0,
      p.firstSeenAt?.toISOString(),
      p.lastSeenAt?.toISOString(),
      p.notes,
    ]));
  }

  // BOM UTF-8 pour Excel (accents)
  const csv = '\uFEFF' + lines.join('\r\n');
  const filename = `finarent-prospects-${new Date().toISOString().slice(0, 10)}.csv`;

  await logAdminActivity({
    actorId: auth.dbUser?.id,
    module: 'exports',
    action: 'EXPORT',
    entityType: 'Prospect',
    summary: `Export CSV prospects — ${prospects.length} ligne(s)`,
    details: { rowCount: prospects.length, status, callCenterId, simulator },
    request,
  });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

function csvRow(values) {
  return values.map(csvCell).join(',');
}

function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
