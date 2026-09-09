import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  // Objet `data` explicite, comme les autres routes d'écriture du back-office.
  // Le corps était auparavant passé tel quel à Prisma : un champ inconnu levait
  // une erreur de validation (500) et `{"id":"…"}` réécrivait la clé primaire.
  // Les quatre champs du formulaire + `isActive` (bouton publier/dépublier)
  // sont les seuls que l'écran /admin/faq envoie.
  const data = {};
  if (body.question !== undefined) {
    data.question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : '';
  }
  if (body.answer !== undefined) {
    data.answer = typeof body.answer === 'string' ? body.answer.trim().slice(0, 5000) : '';
  }
  if (body.category !== undefined) {
    data.category = (typeof body.category === 'string' ? body.category.trim().slice(0, 100) : '') || 'general';
  }
  if (body.order !== undefined) data.order = Math.trunc(Number(body.order)) || 0;
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  }
  if (data.question === '' || data.answer === '') {
    return NextResponse.json({ error: 'Question et réponse ne peuvent pas être vides' }, { status: 400 });
  }

  try {
    const faq = await prisma.fAQ.update({ where: { id }, data });
    return NextResponse.json(faq);
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'PATCH /api/admin/faq/[id]',
      introuvable: 'FAQ introuvable',
    });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  try {
    await prisma.fAQ.delete({ where: { id } });
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'DELETE /api/admin/faq/[id]',
      introuvable: 'FAQ introuvable',
    });
  }

  return NextResponse.json({ success: true });
}
