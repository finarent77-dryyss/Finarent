import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { syncUser, isAdmin } from '@/lib/users';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';
import { reveal } from '@/lib/sensitive';

/**
 * GET /api/applications/[id]
 * Détail d'une demande. Accès : propriétaire ou admin.
 */
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id } = await params;
    const dbUser = await syncUser(session.user);
    const adminAccess = await isAdmin(session.user);

    const rawApp = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!rawApp) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
    }

    if (rawApp.userId !== dbUser?.id && !adminAccess) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Déchiffre quoteDetails + adminNotes pour l'admin ; client ne verra pas adminNotes ci-dessous
    const application = reveal('Application', rawApp);

    // Ne pas exposer adminNotes au client
    const { adminNotes, ...safe } = application;
    const response = {
      ...safe,
      status: STATUS_TO_LEGACY[application.status] || application.status,
      amount: application.amount != null ? `${application.amount.toLocaleString()}€` : null,
      documents: (application.documents || []).map((d) => ({
        id: d.id,
        path: d.fileUrl,
        originalName: d.fileName,
        type: d.type,
        createdAt: d.createdAt,
      })),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/applications/[id] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
