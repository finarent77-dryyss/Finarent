import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/affiliates
 * Liste les affiliés avec leurs compteurs agrégés (clics, leads, dossiers, commissions).
 */
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { clicks: true, prospects: true, applications: true, commissions: true },
      },
    },
  });

  // Agrégats commissions par statut
  const commissionStats = await prisma.affiliateCommission.groupBy({
    by: ['affiliateId', 'status'],
    _sum: { amount: true },
    _count: true,
  });

  const result = affiliates.map((a) => {
    const stats = commissionStats.filter((s) => s.affiliateId === a.id);
    const pending = stats.find((s) => s.status === 'PENDING');
    const paid = stats.find((s) => s.status === 'PAID');
    return {
      id: a.id,
      code: a.code,
      name: a.name,
      email: a.email,
      phone: a.phone,
      commissionType: a.commissionType,
      commissionValue: a.commissionValue,
      isActive: a.isActive,
      publicStatsEnabled: a.publicStatsEnabled,
      notes: a.notes,
      createdAt: a.createdAt,
      counts: {
        clicks: a._count.clicks,
        prospects: a._count.prospects,
        applications: a._count.applications,
        commissions: a._count.commissions,
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
 * POST /api/admin/affiliates
 * Crée un nouvel affilié. Génère un code court si non fourni.
 */
export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  if (!name || !email) {
    return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  // Code court (8 caractères alphanumériques) ou code fourni
  let code = String(body.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 32);
  if (!code) {
    code = generateCode();
  }

  // Vérifie unicité du code (jusqu'à 5 tentatives)
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.affiliate.findUnique({ where: { code } });
    if (!exists) break;
    code = generateCode();
  }

  const commissionType = body.commissionType === 'PERCENT' ? 'PERCENT' : 'FIXED';
  const commissionValue = Math.max(0, Number(body.commissionValue) || 0);

  try {
    const affiliate = await prisma.affiliate.create({
      data: {
        code,
        name: name.slice(0, 150),
        email: email.slice(0, 200),
        phone: body.phone ? String(body.phone).trim().slice(0, 30) : null,
        commissionType,
        commissionValue,
        isActive: body.isActive !== false,
        publicStatsEnabled: body.publicStatsEnabled !== false,
        notes: body.notes ? String(body.notes).slice(0, 1000) : null,
      },
    });
    return NextResponse.json(affiliate, { status: 201 });
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Email ou code déjà utilisé' }, { status: 409 });
    }
    console.error('POST /api/admin/affiliates error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans O/0/1/I pour lisibilité
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
