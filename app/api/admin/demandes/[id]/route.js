import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { STATUS_TO_LEGACY, STATUS_TO_DB, VALID_LEGACY_STATUSES, PRODUCT_TO_REQUEST } from '@/lib/statusMap';
import { protect, reveal } from '@/lib/sensitive';
import { computeCommission } from '@/lib/affiliate';
import { logAdminActivity } from '@/lib/admin-activity-log';

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
    const { status, adminNotes, callCenterId } = body;

    const updateData = {};
    if (status && VALID_LEGACY_STATUSES.includes(status)) {
      updateData.status = STATUS_TO_DB[status];
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    // Rattachement / détachement d'un centre d'appel
    if (callCenterId !== undefined) {
      updateData.callCenterId = callCenterId ? String(callCenterId) : null;
    }

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

    // Opérations post-update : best-effort (ne doivent pas faire échouer la réponse principale)
    // Enregistrer l'historique du changement de statut
    if (updateData.status && current && current.status !== updateData.status && dbUser) {
      try {
        await prisma.statusHistory.create({
          data: {
            applicationId: id,
            changedById: dbUser.id,
            fromStatus: current.status,
            toStatus: updateData.status,
            comment: adminNotes || null,
          },
        });
      } catch (histErr) {
        console.error('StatusHistory create error (non-bloquant):', histErr);
      }

      // Affiliation : calcul auto de la commission quand un dossier passe en SIGNED
      if (updateData.status === 'SIGNED' && application.affiliateId) {
        try {
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
        } catch (affErr) {
          console.error('AffiliateCommission create error (non-bloquant):', affErr);
        }
      }

      // Affiliation : annule la commission si le dossier passe en REJECTED après signature
      if (updateData.status === 'REJECTED' && application.affiliateId) {
        try {
          await prisma.affiliateCommission.updateMany({
            where: { applicationId: id, status: 'PENDING' },
            data: { status: 'CANCELLED' },
          });
        } catch (affErr) {
          console.error('AffiliateCommission cancel error (non-bloquant):', affErr);
        }
      }

      // Centre d'appel : commission auto au passage SIGNED
      if (updateData.status === 'SIGNED' && application.callCenterId) {
        try {
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
        } catch (ccErr) {
          console.error('CallCenterCommission create error (non-bloquant):', ccErr);
        }
      }

      // Centre d'appel : annule la commission si REJECTED
      if (updateData.status === 'REJECTED' && application.callCenterId) {
        try {
          await prisma.callCenterCommission.updateMany({
            where: { applicationId: id, status: 'PENDING' },
            data: { status: 'CANCELLED' },
          });
        } catch (ccErr) {
          console.error('CallCenterCommission cancel error (non-bloquant):', ccErr);
        }
      }
    }

    // Journal : rattachement / détachement d'un centre d'appel
    if (callCenterId !== undefined && dbUser) {
      try {
        let centerName = null;
        if (application.callCenterId) {
          const c = await prisma.callCenter.findUnique({ where: { id: application.callCenterId }, select: { name: true } });
          centerName = c?.name || application.callCenterId;
        }
        await logAdminActivity({
          actorId: dbUser.id,
          module: 'call_center',
          action: 'DEMANDE_ASSIGNED_CENTER',
          entityType: 'Application',
          entityId: id,
          summary: centerName
            ? `Demande ${application.companyName || id} rattachée au centre ${centerName}`
            : `Demande ${application.companyName || id} détachée de tout centre`,
          details: { callCenterId: application.callCenterId },
          request,
        });
      } catch (logErr) {
        console.error('logAdminActivity error (non-bloquant):', logErr);
      }
    }

    // Réponse alignée avec le GET /api/admin/demandes pour cohérence du state client
    const revealed = reveal('Application', application);
    const response = {
      ...revealed,
      status: STATUS_TO_LEGACY[revealed.status] || revealed.status,
      requestType: PRODUCT_TO_REQUEST[revealed.productType] || revealed.productType,
      message: revealed.description,
      amount: revealed.amount != null ? `${revealed.amount.toLocaleString()}€` : revealed.amount,
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('Admin demande PATCH error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
