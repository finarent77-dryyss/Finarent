import { NextResponse } from 'next/server';
import { requirePartner, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requirePartner();
  if (isAuthError(auth)) return auth;

  const { dbUser } = auth;
  const where = dbUser.role === 'ADMIN' ? {} : { partnerId: dbUser.partnerId };

  const [total, transmitted, approved, completed, commissions] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: 'TRANSMITTED' } }),
    prisma.application.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.application.count({ where: { ...where, status: 'COMPLETED' } }),
    dbUser.partnerId
      ? prisma.commission.aggregate({ where: { partnerId: dbUser.partnerId }, _sum: { amount: true } })
      : { _sum: { amount: null } },
  ]);

  const totalAmount = await prisma.application.aggregate({
    where: { ...where, status: { in: ['APPROVED', 'COMPLETED'] } },
    _sum: { amount: true },
  });

  return NextResponse.json({
    total,
    transmitted,
    approved,
    completed,
    totalCommissions: commissions._sum.amount || 0,
    totalAmount: totalAmount._sum.amount || 0,
  });
}
