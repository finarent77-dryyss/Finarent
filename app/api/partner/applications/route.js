import { NextResponse } from 'next/server';
import { requirePartner, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requirePartner();
  if (isAuthError(auth)) return auth;

  const { dbUser } = auth;

  // Admin voit tout, Partner voit ses dossiers transmis
  const where = dbUser.role === 'ADMIN'
    ? {}
    : { partnerId: dbUser.partnerId };

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      documents: true,
      user: { select: { id: true, name: true, email: true, company: true } },
    },
  });

  return NextResponse.json(applications);
}
