import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.dbUser.id },
    include: { partner: { select: { id: true, name: true, type: true } } },
  });

  return NextResponse.json(user);
}

export async function PATCH(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const allowedFields = ['name', 'phone', 'company', 'legalForm'];
  const data = {};

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      data[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: auth.dbUser.id },
    data,
  });

  return NextResponse.json(user);
}
