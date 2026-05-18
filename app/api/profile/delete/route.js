import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logRgpdAction } from '@/lib/audit';

export async function DELETE(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const previousEmail = auth.dbUser.email;

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

  // Audit RGPD : trace l'anonymisation pour conformité (avant la mise à jour, sinon le userId est anonymisé)
  await logRgpdAction({
    userId: auth.dbUser.id,
    email: previousEmail,
    action: 'DELETE_ACCOUNT',
    details: { anonymizedAt: new Date().toISOString() },
    request,
  });

  return NextResponse.json({ success: true, message: 'Vos données ont été anonymisées' });
}
