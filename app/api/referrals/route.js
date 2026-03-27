import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const referrals = await prisma.referral.findMany({
    where: { referrerId: auth.dbUser.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(referrals);
}

export async function POST(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { refereeEmail, refereeName } = await request.json();

  if (!refereeEmail) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const referral = await prisma.referral.create({
    data: {
      referrerId: auth.dbUser.id,
      refereeEmail: refereeEmail.trim().toLowerCase(),
      refereeName: refereeName?.trim() || null,
      code,
    },
  });

  return NextResponse.json(referral);
}
