import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const faqs = await prisma.fAQ.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  });

  return NextResponse.json(faqs);
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { question, answer, category, order } = await request.json();

  if (!question || !answer) {
    return NextResponse.json({ error: 'Question et réponse requises' }, { status: 400 });
  }

  const faq = await prisma.fAQ.create({
    data: { question, answer, category: category || 'general', order: order || 0 },
  });

  return NextResponse.json(faq);
}
