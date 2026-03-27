import { NextResponse } from 'next/server';
import { requirePartner, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requirePartner();
  if (isAuthError(auth)) return auth;

  const commissions = await prisma.commission.findMany({
    where: { partnerId: auth.dbUser.partnerId },
    include: {
      application: { select: { id: true, companyName: true, equipmentType: true, amount: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalPaid = commissions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0);
  const totalPending = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0);

  return NextResponse.json({ commissions, totalPaid, totalPending });
}
