import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { STATUS_TO_LEGACY, STATUS_TO_DB, VALID_LEGACY_STATUSES } from '@/lib/statusMap';
import { protect, reveal } from '@/lib/sensitive';
import { computeCommission } from '@/lib/affiliate';

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
      data: protect('Application', updateData),
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

      // Affiliation : calcul auto de la commission quand un dossier passe en SIGNED
      if (updateData.status === 'SIGNED' && application.affiliateId) {
        const existing = await prisma.affiliateCommission.findUnique({
          where: { applicationId: id },
        });
        if (!existing) {
          const affiliate = await prisma.affiliate.findUnique({
            where: { id: application.affiliateId },
            select: { commissionType: true, commissionValue: true },
          });
          if (affiliate) {
            const amount = computeCommission(
              { type: affiliate.commissionType, value: affiliate.commissionValue },
              application.amount,
            );
            await prisma.affiliateCommission.create({
              data: {
                affiliateId: application.affiliateId,
                applicationId: id,
                type: affiliate.commissionType,
                rate: affiliate.commissionValue,
                amount,
                status: 'PENDING',
              },
            });
          }
        }
      }

      // Affiliation : annule la commission si le dossier passe en REJECTED après signature
      if (updateData.status === 'REJECTED' && application.affiliateId) {
        await prisma.affiliateCommission.updateMany({
          where: { applicationId: id, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        });
      }

      // Centre d'appel : commission auto au passage SIGNED
      if (updateData.status === 'SIGNED' && application.callCenterId) {
        const existing = await prisma.callCenterCommission.findUnique({
          where: { applicationId: id },
        });
        if (!existing) {
          const center = await prisma.callCenter.findUnique({
            where: { id: application.callCenterId },
            select: { commissionType: true, commissionValue: true },
          });
          if (center) {
            const amount = computeCommission(
              { type: center.commissionType, value: center.commissionValue },
              application.amount,
            );
            await prisma.callCenterCommission.create({
              data: {
                callCenterId: application.callCenterId,
                applicationId: id,
                type: center.commissionType,
                rate: center.commissionValue,
                amount,
                status: 'PENDING',
              },
            });
          }
        }
      }

      // Centre d'appel : annule la commission si REJECTED
      if (updateData.status === 'REJECTED' && application.callCenterId) {
        await prisma.callCenterCommission.updateMany({
          where: { applicationId: id, status: 'PENDING' },
          data: { status: 'CANCELLED' },
        });
      }
    }

    const revealed = reveal('Application', application);
    const response = {
      ...revealed,
      status: STATUS_TO_LEGACY[revealed.status] || revealed.status,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('Admin demande PATCH error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
