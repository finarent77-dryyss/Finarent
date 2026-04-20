import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const HOURS = (h) => h * 60 * 60 * 1000;

/**
 * GET /api/admin/sla-alerts
 * Retourne les demandes en retard (SLA), groupées par niveau.
 * Niveau 1 : PENDING > 4h
 * Niveau 2 : REVIEWING > 24h
 * Niveau 3 : DOCUMENTS_NEEDED > 48h
 */
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const now = Date.now();
  const baseSelect = {
    id: true,
    companyName: true,
    status: true,
    amount: true,
    createdAt: true,
    updatedAt: true,
    user: { select: { id: true, name: true, email: true } },
  };

  const [level1, level2, level3] = await Promise.all([
    prisma.application.findMany({
      where: { status: 'PENDING', createdAt: { lt: new Date(now - HOURS(4)) } },
      orderBy: { createdAt: 'asc' },
      select: baseSelect,
    }),
    prisma.application.findMany({
      where: { status: 'REVIEWING', updatedAt: { lt: new Date(now - HOURS(24)) } },
      orderBy: { updatedAt: 'asc' },
      select: baseSelect,
    }),
    prisma.application.findMany({
      where: { status: 'DOCUMENTS_NEEDED', updatedAt: { lt: new Date(now - HOURS(48)) } },
      orderBy: { updatedAt: 'asc' },
      select: baseSelect,
    }),
  ]);

  return NextResponse.json({ level1, level2, level3 });
}
