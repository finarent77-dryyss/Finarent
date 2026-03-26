import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get('applicationId');

  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId requis' }, { status: 400 });
  }

  // Vérifier l'accès au dossier
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, partnerId: true },
  });

  if (!application) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  const { dbUser } = auth;
  const isOwner = application.userId === dbUser.id;
  const isAdmin = dbUser.role === 'ADMIN';
  const isPartner = dbUser.role === 'PARTNER' && application.partnerId === dbUser.partnerId;
  const isInsurer = dbUser.role === 'INSURER';

  if (!isOwner && !isAdmin && !isPartner && !isInsurer) {
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
    select: { userId: true, partnerId: true },
  });

  if (!application) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  const { dbUser } = auth;
  const isOwner = application.userId === dbUser.id;
  const isAdmin = dbUser.role === 'ADMIN';
  const isPartner = dbUser.role === 'PARTNER' && application.partnerId === dbUser.partnerId;
  const isInsurer = dbUser.role === 'INSURER';

  if (!isOwner && !isAdmin && !isPartner && !isInsurer) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Seuls admin/partner/insurer peuvent envoyer des messages admin-only
  const adminOnly = isAdminOnly && (isAdmin || isPartner || isInsurer) ? true : false;

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
