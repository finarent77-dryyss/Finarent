import { NextResponse } from 'next/server';
import { requireInsurer, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireInsurer();
  if (isAuthError(auth)) return auth;

  // Assureur voit les dossiers d'assurance (RC_PRO)
  const applications = await prisma.application.findMany({
    where: { productType: 'RC_PRO' },
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

  const application = await prisma.application.update({
    where: { id },
    data,
  });

  return NextResponse.json(application);
}
