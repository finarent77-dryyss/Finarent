import { NextResponse } from 'next/server';
import { requirePartner, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { filtreDossiersPartenaire } from '@/lib/acces-dossier';

export async function GET() {
  const auth = await requirePartner();
  if (isAuthError(auth)) return auth;

  const { dbUser } = auth;

  // Admin voit tout, partenaire voit ses dossiers transmis. Le filtre n'est
  // jamais construit à partir d'un `partnerId` nul : `{ partnerId: null }`
  // ramenait tous les dossiers non attribués. `requirePartner` refuse déjà ce
  // cas, la garde ci-dessous en est le second verrou.
  const where = filtreDossiersPartenaire(dbUser);
  if (!where) {
    return NextResponse.json(
      { error: 'Compte partenaire non rattaché à une société : accès refusé.' },
      { status: 403 },
    );
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      documents: true,
      user: { select: { id: true, name: true, email: true, company: true } },
    },
  });

  return NextResponse.json(applications);
}
