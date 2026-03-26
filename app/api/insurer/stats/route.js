import { NextResponse } from 'next/server';
import { requireInsurer, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireInsurer();
  if (isAuthError(auth)) return auth;

  const where = { productType: 'RC_PRO' };

  const [total, pending, approved, rejected] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: { in: ['PENDING', 'REVIEWING', 'QUOTE_SENT'] } } }),
    prisma.application.count({ where: { ...where, status: { in: ['APPROVED', 'COMPLETED'] } } }),
    prisma.application.count({ where: { ...where, status: 'REJECTED' } }),
  ]);

  const totalAmount = await prisma.application.aggregate({
    where: { ...where, status: { in: ['APPROVED', 'COMPLETED'] } },
    _sum: { amount: true },
  });

  return NextResponse.json({
    total,
    pending,
    approved,
    rejected,
    totalAmount: totalAmount._sum.amount || 0,
  });
}
