import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { STATUS_TO_LEGACY, STATUS_TO_DB, VALID_LEGACY_STATUSES } from '@/lib/statusMap';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const adminAccess = await isAdmin(session.user);
    if (!adminAccess) {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    const updateData = {};
    if (status && VALID_LEGACY_STATUSES.includes(status)) {
      updateData.status = STATUS_TO_DB[status];
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
    }

    // Récupérer le statut actuel pour l'historique
    const current = await prisma.application.findUnique({ where: { id }, select: { status: true } });
    const dbUser = await prisma.user.findUnique({ where: { auth0Id: session.user.sub }, select: { id: true } });

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    // Enregistrer l'historique du changement de statut
    if (updateData.status && current && current.status !== updateData.status && dbUser) {
      await prisma.statusHistory.create({
        data: {
          applicationId: id,
          changedById: dbUser.id,
          fromStatus: current.status,
          toStatus: updateData.status,
          comment: adminNotes || null,
        },
      });
    }

    const response = {
      ...application,
      status: STATUS_TO_LEGACY[application.status] || application.status,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('Admin demande PATCH error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
