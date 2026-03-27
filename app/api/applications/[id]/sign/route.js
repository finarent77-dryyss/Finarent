import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  // Verify the application belongs to the user and is in QUOTE_ACCEPTED status
  const app = await prisma.application.findFirst({
    where: { id, userId: auth.dbUser.id, status: 'QUOTE_ACCEPTED' },
  });

  if (!app) {
    return NextResponse.json({ error: 'Dossier introuvable ou statut incorrect' }, { status: 404 });
  }

  // Update status to SIGNED
  const updated = await prisma.application.update({
    where: { id },
    data: { status: 'SIGNED' },
  });

  // Create status history
  await prisma.statusHistory.create({
    data: {
      applicationId: id,
      changedById: auth.dbUser.id,
      fromStatus: 'QUOTE_ACCEPTED',
      toStatus: 'SIGNED',
      comment: 'Signature électronique acceptée par le client',
    },
  });

  return NextResponse.json({ success: true, status: updated.status });
}
