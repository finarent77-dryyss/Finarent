import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const partners = await prisma.partner.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { applications: true, users: true, commissions: true } },
    },
  });

  return NextResponse.json(partners);
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const { name, type, contactEmail, notes } = body;

  if (!name || !type || !contactEmail) {
    return NextResponse.json({ error: 'Champs requis : name, type, contactEmail' }, { status: 400 });
  }

  if (!['BANK', 'INSURANCE', 'LEASING'].includes(type)) {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  }

  const partner = await prisma.partner.create({
    data: { name, type, contactEmail, notes },
  });

  return NextResponse.json(partner, { status: 201 });
}
