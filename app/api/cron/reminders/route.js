import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCronAuthorized } from '@/lib/cron-auth';
import { executerCron } from '@/lib/cron-run';
import { sendDocumentsMissing } from '@/lib/email';

/**
 * GET /api/cron/reminders
 * Relances automatiques : documents manquants (> 7 jours) et dossiers en
 * attente de traitement (> 3 jours).
 *
 * Chaque passage est journalisé dans CronRun (action A6) — c'est ce qui permet
 * à /api/admin/cron-status de détecter une tâche qui ne se déclenche plus.
 */
export async function GET(request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  return executerCron('reminders', async () => {
    const now = new Date();

    // --- 1. Relances documents manquants (DOCUMENTS_NEEDED > 7 jours) ---
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const documentsNeeded = await prisma.application.findMany({
      where: {
        status: 'DOCUMENTS_NEEDED',
        updatedAt: { lt: sevenDaysAgo },
      },
      select: {
        id: true,
        status: true,
        reference: true,
        email: true,
        user: { select: { email: true } },
        statusHistory: {
          where: {
            comment: { contains: 'REMINDER_SENT' },
            createdAt: { gte: sevenDaysAgo },
          },
          take: 1,
        },
      },
    });

    let remindersDocuments = 0;
    let relancesEnvoyees = 0;

    for (const app of documentsNeeded) {
      // Skip if a reminder was already sent in the last 7 days
      if (app.statusHistory.length > 0) continue;

      // La relance ne partait pas : cette boucle n'écrivait qu'une ligne
      // d'historique que personne ne lit. Le template existait pourtant depuis
      // le début, sans aucun appelant — les dossiers en attente de pièces
      // s'éteignaient donc en silence, or c'est l'étape où un dossier meurt.
      const destinataire = app.email || app.user?.email;
      if (destinataire) {
        const envoi = await sendDocumentsMissing({
          to: destinataire,
          reference: app.reference || app.id,
        }).catch((e) => ({ sent: false, error: e.message }));
        if (envoi?.sent) relancesEnvoyees += 1;
      }

      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          changedById: 'SYSTEM',
          fromStatus: app.status,
          toStatus: app.status,
          comment: 'REMINDER_SENT — Relance automatique : documents manquants depuis 7 jours',
        },
      });
      remindersDocuments++;
    }

    // --- 2. Relances dossiers non traites (PENDING > 3 jours) ---
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const pendingApps = await prisma.application.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: threeDaysAgo },
      },
      select: {
        id: true,
        status: true,
        statusHistory: {
          where: {
            comment: { contains: 'REMINDER_SENT' },
            createdAt: { gte: threeDaysAgo },
          },
          take: 1,
        },
      },
    });

    let remindersPending = 0;

    for (const app of pendingApps) {
      if (app.statusHistory.length > 0) continue;

      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          changedById: 'SYSTEM',
          fromStatus: app.status,
          toStatus: app.status,
          comment: 'REMINDER_SENT — Relance automatique : dossier en attente depuis 3 jours sans traitement',
        },
      });
      remindersPending++;
    }

    return {
      traites: remindersDocuments + remindersPending,
      resume: `${relancesEnvoyees} email(s) de relance envoyes, ${remindersDocuments} relance(s) documents, ${remindersPending} relance(s) dossier en attente`,
      details: { remindersDocuments, remindersPending, relancesEnvoyees },
      payload: { remindersDocuments, remindersPending, relancesEnvoyees },
    };
  });
}
