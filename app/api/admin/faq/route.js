import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

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

  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  // Les colonnes `question`/`answer` sont des String : sans contrainte de type,
  // un corps `{"question":{},"answer":[]}` passait la garde de présence et
  // faisait lever Prisma (500). Tout ce qui n'est pas une chaîne est traité
  // comme absent et retombe sur le 400 ci-dessous.
  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : '';
  const answer = typeof body.answer === 'string' ? body.answer.trim().slice(0, 5000) : '';
  const category = (typeof body.category === 'string' ? body.category.trim().slice(0, 100) : '') || 'general';
  const order = Math.trunc(Number(body.order)) || 0;

  if (!question || !answer) {
    return NextResponse.json({ error: 'Question et réponse requises' }, { status: 400 });
  }

  try {
    const faq = await prisma.fAQ.create({
      data: { question, answer, category, order },
    });
    return NextResponse.json(faq);
  } catch (err) {
    return reponseErreurPrisma(err, { contexte: 'POST /api/admin/faq' });
  }
}
