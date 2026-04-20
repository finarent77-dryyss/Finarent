import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  // Anonymize rather than hard-delete to preserve business records (obligations légales)
  await prisma.user.update({
    where: { id: auth.dbUser.id },
    data: {
      email: `deleted-${auth.dbUser.id}@deleted.local`,
      name: 'Utilisateur supprimé',
      phone: null,
      company: null,
      legalForm: null,
      auth0Id: `deleted-${auth.dbUser.id}`,
      referralCode: null,
    },
  });

  return NextResponse.json({ success: true, message: 'Vos données ont été anonymisées' });
}
