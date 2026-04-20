import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateScore } from '@/lib/scoring';

export async function POST(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const app = await prisma.application.findUnique({
    where: { id },
    include: { documents: true },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { score, label } = calculateScore(app, app.documents);
  const updated = await prisma.application.update({
    where: { id },
    data: { scorePreQual: score, scoreLabel: label },
  });
  return NextResponse.json(updated);
}
