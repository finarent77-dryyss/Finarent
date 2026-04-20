import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/offers
 * Liste toutes les offres avec application et partenaire associés.
 */
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          productType: true,
          amount: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      partner: { select: { id: true, name: true, type: true } },
    },
  });

  return NextResponse.json(offers);
}

/**
 * POST /api/admin/offers
 * Crée une offre pour une demande (envoyée directement).
 */
export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const {
    applicationId,
    amount,
    durationMonths,
    monthlyPayment,
    rate,
    totalCost,
    partnerId,
    conditions,
    expiresInDays,
  } = body;

  if (!applicationId || amount == null || !durationMonths || monthlyPayment == null || rate == null || totalCost == null) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const app = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!app) {
    return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
  }

  const days = Number(expiresInDays) > 0 ? Number(expiresInDays) : 7;
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + days);

  const offer = await prisma.offer.create({
    data: {
      applicationId,
      amount: Number(amount),
      durationMonths: Number(durationMonths),
      monthlyPayment: Number(monthlyPayment),
      rate: Number(rate),
      totalCost: Number(totalCost),
      partnerId: partnerId || null,
      conditions: conditions || null,
      status: 'SENT',
      sentAt: now,
      expiresAt,
      createdBy: auth.dbUser.id,
    },
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          productType: true,
          amount: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      partner: { select: { id: true, name: true, type: true } },
    },
  });

  return NextResponse.json(offer, { status: 201 });
}
