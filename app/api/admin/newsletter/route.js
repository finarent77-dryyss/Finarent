import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const subscribers = await prisma.newsletter.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(subscribers);
}
