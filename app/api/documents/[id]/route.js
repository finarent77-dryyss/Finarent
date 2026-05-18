import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { syncUser, isAdmin } from '@/lib/users';
import { logDocumentAccess } from '@/lib/audit';

/**
 * DELETE /api/documents/[id]
 * Soft-delete d'un document : marque deletedAt + deletedById, conserve le record
 * en base 30 jours pour rétention légale puis purge via cron.
 *
 * Accès : propriétaire du dossier ou admin.
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { application: { select: { userId: true } } },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    }

    if (document.deletedAt) {
      return NextResponse.json({ error: 'Déjà supprimé' }, { status: 410 });
    }

    const dbUser = await syncUser(session.user);
    const adminAccess = await isAdmin(session.user);

    if (document.application.userId !== dbUser?.id && !adminAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Soft-delete : on garde 30 jours pour rétention légale et possibilité de restauration
    await prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: dbUser.id,
      },
    });

    await logDocumentAccess({
      documentId: id,
      accessedById: dbUser.id,
      action: 'DELETE',
      request,
    });

    return NextResponse.json({ success: true, retainedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
  } catch (err) {
    console.error('Document DELETE error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
