import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/call-centers
 * Liste des centres d'appel avec compteurs agrégés (membres, applications,
 * interactions, commissions à verser).
 *
 * Filtres : ?type=INTERNAL|EXTERNAL, ?active=true|false
 */
export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const activeOnly = searchParams.get('active') === 'true';

  const where = {};
  if (type === 'INTERNAL' || type === 'EXTERNAL') where.type = type;
  if (activeOnly) where.isActive = true;

  const centers = await prisma.callCenter.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { members: true, applications: true, interactions: true, commissions: true },
      },
    },
  });

  // Agrégat commissions par centre + statut
  const commissionAgg = await prisma.callCenterCommission.groupBy({
    by: ['callCenterId', 'status'],
    _sum: { amount: true },
    _count: true,
  });

  const result = centers.map((c) => {
    const stats = commissionAgg.filter((s) => s.callCenterId === c.id);
    const pending = stats.find((s) => s.status === 'PENDING');
    const paid = stats.find((s) => s.status === 'PAID');
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      type: c.type,
      isActive: c.isActive,
      address: c.address,
      phone: c.phone,
      email: c.email,
      iban: c.iban ? `${c.iban.slice(0, 4)}…${c.iban.slice(-4)}` : null, // masqué pour la liste
      commissionType: c.commissionType,
      commissionValue: c.commissionValue,
      notes: c.notes,
      createdAt: c.createdAt,
      counts: {
        members: c._count.members,
        applications: c._count.applications,
        interactions: c._count.interactions,
        commissions: c._count.commissions,
      },
      commissions: {
        pendingAmount: pending?._sum.amount || 0,
        pendingCount: pending?._count || 0,
        paidAmount: paid?._sum.amount || 0,
        paidCount: paid?._count || 0,
      },
    };
  });

  return NextResponse.json(result);
}

/**
 * POST /api/admin/call-centers
 * Crée un nouveau centre d'appel.
 *
 * Body : { name, type, code?, address?, phone?, email?, iban?,
 *          commissionType, commissionValue, notes? }
 */
export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const name = String(body.name || '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Nom du centre requis' }, { status: 400 });
  }

  const type = body.type === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';

  // Code auto si non fourni
  let code = String(body.code || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (!code) {
    const slug = name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 12);
    code = `CC-${slug}`;
  }

  // Unicité du code (jusqu'à 5 tentatives)
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.callCenter.findUnique({ where: { code } });
    if (!exists) break;
    code = `${code}-${Math.floor(Math.random() * 100)}`;
  }

  const commissionType = body.commissionType === 'FIXED' ? 'FIXED' : 'PERCENT';
  const commissionValue = Math.max(0, Number(body.commissionValue) || 0);

  try {
    const center = await prisma.callCenter.create({
      data: {
        code,
        name: name.slice(0, 150),
        type,
        address: body.address ? String(body.address).slice(0, 200) : null,
        phone: body.phone ? String(body.phone).slice(0, 30) : null,
        email: body.email ? String(body.email).trim().toLowerCase().slice(0, 200) : null,
        iban: body.iban ? String(body.iban).replace(/\s+/g, '').slice(0, 40) : null,
        commissionType,
        commissionValue,
        isActive: body.isActive !== false,
        notes: body.notes ? String(body.notes).slice(0, 1000) : null,
      },
    });
    return NextResponse.json(center, { status: 201 });
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Code centre déjà utilisé' }, { status: 409 });
    }
    console.error('POST /api/admin/call-centers error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
