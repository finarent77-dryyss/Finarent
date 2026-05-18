import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reveal } from '@/lib/sensitive';
import { logRgpdAction } from '@/lib/audit';

export async function GET(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const data = await prisma.user.findUnique({
    where: { id: auth.dbUser.id },
    include: {
      applications: {
        include: { documents: true, statusHistory: true, messages: true },
      },
      messages: true,
      referralsMade: true,
    },
  });

  // Déchiffre les champs sensibles avant export (le user a le droit d'accéder à ses propres données en clair)
  if (data?.applications) {
    data.applications = data.applications.map((app) => reveal('Application', app));
  }

  // Audit RGPD : trace l'export pour conformité art. 30
  await logRgpdAction({
    userId: auth.dbUser.id,
    email: auth.dbUser.email,
    action: 'EXPORT',
    request,
  });

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="finarent-data-${auth.dbUser.id}.json"`,
    },
  });
}
