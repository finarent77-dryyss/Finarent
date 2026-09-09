import { NextResponse } from 'next/server';
import { requireInsurer, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { estAdmin, estAssureurDuDossier, PRODUIT_ASSURANCE } from '@/lib/acces-dossier';

export async function GET() {
  const auth = await requireInsurer();
  if (isAuthError(auth)) return auth;

  // Assureur voit les dossiers d'assurance (RC_PRO)
  const applications = await prisma.application.findMany({
    where: { productType: PRODUIT_ASSURANCE },
    orderBy: { createdAt: 'desc' },
    include: {
      documents: true,
      user: { select: { id: true, name: true, email: true, company: true } },
    },
  });

  return NextResponse.json(applications);
}

export async function PATCH(request) {
  const auth = await requireInsurer();
  if (isAuthError(auth)) return auth;

  const { id, status, adminNotes } = await request.json();

  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  const allowedStatuses = ['REVIEWING', 'QUOTE_SENT', 'APPROVED', 'REJECTED'];
  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: 'Statut non autorisé pour un assureur' }, { status: 400 });
  }

  const data = {};
  if (status) data.status = status;
  if (adminNotes !== undefined) data.adminNotes = adminNotes;

  // Le GET est borné à RC_PRO, le PATCH ne l'était pas : un assureur pouvait
  // approuver ou rejeter — et annoter — un crédit-bail, une LOA ou un prêt
  // professionnel qui ne le concerne en rien. Le périmètre d'écriture est
  // désormais celui du périmètre de lecture.
  const cible = await prisma.application.findUnique({
    where: { id },
    select: { id: true, productType: true },
  });

  if (!cible) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  if (!estAdmin(auth.dbUser) && !estAssureurDuDossier(auth.dbUser, cible)) {
    return NextResponse.json(
      { error: 'Ce dossier est hors du périmètre assurance.' },
      { status: 403 },
    );
  }

  const application = await prisma.application.update({
    where: { id },
    data,
  });

  return NextResponse.json(application);
}
