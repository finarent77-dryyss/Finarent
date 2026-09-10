import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  // L'écran envoie soit le formulaire complet (authorName, initials, position,
  // company, sector, rating, text, amount, isApproved, isPublished), soit le
  // seul { action } des boutons approuver / rejeter / publier / dépublier :
  // dans les deux cas un objet, jamais un corps vide — mais le corps vide
  // donnait un 500 au lieu d'un 400 (constat ADM1-07).
  const body = await lireCorpsJson(request);
  if (!body) return reponseCorpsInvalide();

  const data = {};
  if ('authorName' in body) data.authorName = body.authorName;
  if ('initials' in body) data.initials = body.initials;
  if ('position' in body) data.position = body.position;
  if ('company' in body) data.company = body.company;
  if ('sector' in body) data.sector = body.sector;
  if ('rating' in body) data.rating = Math.max(1, Math.min(5, parseInt(body.rating, 10) || 5));
  if ('text' in body) data.text = body.text;
  if ('amount' in body) data.amount = body.amount;
  if ('isPublished' in body) data.isPublished = !!body.isPublished;

  if (body.action === 'approve') {
    data.isApproved = true;
    data.isPublished = true;
    data.rejectedAt = null;
    data.approvedAt = new Date();
  } else if (body.action === 'reject') {
    data.isApproved = false;
    data.isPublished = false;
    data.rejectedAt = new Date();
    data.approvedAt = null;
  } else if (body.action === 'unpublish') {
    data.isPublished = false;
  } else if (body.action === 'publish') {
    data.isPublished = true;
    if (!body.skipApprove) {
      data.isApproved = true;
      data.approvedAt = new Date();
      data.rejectedAt = null;
    }
  }

  try {
    const t = await prisma.testimonial.update({ where: { id }, data });
    return NextResponse.json(t);
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'PATCH /api/admin/testimonials/[id]',
      introuvable: 'Témoignage introuvable',
    });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  try {
    await prisma.testimonial.delete({ where: { id } });
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'DELETE /api/admin/testimonials/[id]',
      introuvable: 'Témoignage introuvable',
    });
  }
  return NextResponse.json({ success: true });
}
