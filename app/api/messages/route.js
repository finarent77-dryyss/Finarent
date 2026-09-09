import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { peutAccederAuDossier, peutEcrireMessageInterne } from '@/lib/acces-dossier';

/**
 * Champs strictement nécessaires à la décision d'accès.
 * `productType` s'y ajoute : sans lui, la borne « assureur » ne peut pas être
 * évaluée et tout compte INSURER lisait la messagerie de n'importe quel dossier.
 */
const CHAMPS_ACCES = { userId: true, partnerId: true, productType: true };

export async function GET(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get('applicationId');

  if (!applicationId) {
    return NextResponse.json({ error: 'Identifiant du dossier requis' }, { status: 400 });
  }

  // Vérifier l'accès au dossier
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: CHAMPS_ACCES,
  });

  if (!application) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  const { dbUser } = auth;

  // Le contrôle passe par le garde partagé : il refuse le rattachement nul des
  // deux côtés (`null === null`) et borne l'assureur à son périmètre produit.
  if (!peutAccederAuDossier(dbUser, application)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const where = { applicationId };
  // Les clients ne voient pas les messages admin-only
  if (dbUser.role === 'CLIENT') {
    where.isAdminOnly = false;
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json(messages);
}

export async function POST(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { applicationId, content, isAdminOnly } = await request.json();

  if (!applicationId || !content?.trim()) {
    return NextResponse.json({ error: 'applicationId et content requis' }, { status: 400 });
  }

  // Vérifier l'accès
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: CHAMPS_ACCES,
  });

  if (!application) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  const { dbUser } = auth;

  if (!peutAccederAuDossier(dbUser, application)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Seuls les profils réellement rattachés au dossier (admin, partenaire lié,
  // assureur du périmètre) peuvent écrire un message interne au client.
  const adminOnly = Boolean(isAdminOnly) && peutEcrireMessageInterne(dbUser, application);

  const message = await prisma.message.create({
    data: {
      applicationId,
      senderId: dbUser.id,
      content: content.trim(),
      isAdminOnly: adminOnly,
    },
    include: {
      sender: { select: { id: true, name: true, role: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
