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

  // Liste inchangée : elle couvre déjà les deux appels de
  // components/admin/AdminPartnersClient.jsx — le formulaire complet
  // (name, type, contactEmail, notes) et la bascule `isActive`.
  const allowedFields = ['name', 'type', 'contactEmail', 'isActive', 'notes'];
  const data = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  try {
    const partner = await prisma.partner.update({
      where: { id },
      data,
    });
    return NextResponse.json(partner);
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'PATCH /api/admin/partners/[id]',
      introuvable: 'Partenaire introuvable',
    });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  try {
    await prisma.partner.delete({ where: { id } });
  } catch (err) {
    return reponseErreurPrisma(err, {
      contexte: 'DELETE /api/admin/partners/[id]',
      introuvable: 'Partenaire introuvable',
    });
  }

  return NextResponse.json({ success: true });
}
