import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const data = await prisma.user.findUnique({
    where: { id: auth.dbUser.id },
    include: {
      applications: {
        include: { documents: true, statusHistory: true, messages: true },
      },
      messages: true,
      referralsMade: true,
    },
  });

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="finarent-data-${auth.dbUser.id}.json"`,
    },
  });
}
