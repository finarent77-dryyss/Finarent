import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
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

    for (const app of documentsNeeded) {
      // Skip if a reminder was already sent in the last 7 days
      if (app.statusHistory.length > 0) continue;

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

    return NextResponse.json({
      success: true,
      remindersDocuments,
      remindersPending,
      executedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Reminders error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
