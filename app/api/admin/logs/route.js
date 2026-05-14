import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'all';
  const search = searchParams.get('search') || '';

  // Build date filter
  const where = {};
  const now = new Date();

  if (period === 'today') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    where.createdAt = { gte: startOfDay };
  } else if (period === '7d') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: sevenDaysAgo };
  } else if (period === '30d') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    where.createdAt = { gte: thirtyDaysAgo };
  }

  // Build search filter
  if (search) {
    where.OR = [
      { comment: { contains: search, mode: 'insensitive' } },
      { application: { companyName: { contains: search, mode: 'insensitive' } } },
      { application: { equipmentType: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const logs = await prisma.statusHistory.findMany({
    where,
    include: {
      application: {
        select: { id: true, companyName: true, equipmentType: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Fetch changedBy users separately since changedById is not a relation in schema
  const userIds = [...new Set(logs.map((l) => l.changedById))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const enrichedLogs = logs.map((log) => ({
    ...log,
    changedBy: userMap[log.changedById] || { name: 'Inconnu', email: '' },
  }));

  return NextResponse.json(enrichedLogs);
}
