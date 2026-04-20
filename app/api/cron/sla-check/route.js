import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const HOURS = (h) => h * 60 * 60 * 1000;

/**
 * Cron SLA - vérifie les dossiers en retard de traitement.
 * Niveau 1 : PENDING > 4h sans activité opérateur
 * Niveau 2 : REVIEWING > 24h sans mise à jour
 * Niveau 3 : DOCUMENTS_NEEDED > 48h sans mise à jour
 *
 * Déduplication : pas d'alerte si une alerte identique a été créée
 * dans les 24h précédentes pour la même application et le même niveau.
 */
async function hasRecentAlert(applicationId, level, windowMs) {
  const since = new Date(Date.now() - windowMs);
  const existing = await prisma.statusHistory.findFirst({
    where: {
      applicationId,
      comment: { startsWith: `SLA_ALERT_L${level}` },
      createdAt: { gte: since },
    },
  });
  return Boolean(existing);
}

async function createAlert(applicationId, currentStatus, level, message) {
  await prisma.statusHistory.create({
    data: {
      applicationId,
      changedById: 'SYSTEM',
      fromStatus: currentStatus,
      toStatus: currentStatus,
      comment: `SLA_ALERT_L${level}: ${message}`,
    },
  });
}

export async function GET() {
  try {
    const now = new Date();
    const dedupeWindow = HOURS(24);

    // --- Niveau 1 : PENDING > 4h ---
    const l1Threshold = new Date(now.getTime() - HOURS(4));
    const l1Apps = await prisma.application.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: l1Threshold },
      },
      select: { id: true, status: true },
    });

    let l1Count = 0;
    for (const app of l1Apps) {
      if (await hasRecentAlert(app.id, 1, dedupeWindow)) continue;
      await createAlert(app.id, app.status, 1, 'Dossier non traité sous 4h');
      l1Count++;
    }

    // --- Niveau 2 : REVIEWING > 24h ---
    const l2Threshold = new Date(now.getTime() - HOURS(24));
    const l2Apps = await prisma.application.findMany({
      where: {
        status: 'REVIEWING',
        updatedAt: { lt: l2Threshold },
      },
      select: { id: true, status: true },
    });

    let l2Count = 0;
    for (const app of l2Apps) {
      if (await hasRecentAlert(app.id, 2, dedupeWindow)) continue;
      await createAlert(app.id, app.status, 2, 'Analyse dépassée 24h');
      l2Count++;
    }

    // --- Niveau 3 : DOCUMENTS_NEEDED > 48h ---
    const l3Threshold = new Date(now.getTime() - HOURS(48));
    const l3Apps = await prisma.application.findMany({
      where: {
        status: 'DOCUMENTS_NEEDED',
        updatedAt: { lt: l3Threshold },
      },
      select: { id: true, status: true },
    });

    let l3Count = 0;
    for (const app of l3Apps) {
      if (await hasRecentAlert(app.id, 3, dedupeWindow)) continue;
      await createAlert(app.id, app.status, 3, 'Relance documents client');
      l3Count++;
    }

    return NextResponse.json({
      success: true,
      level1: l1Count,
      level2: l2Count,
      level3: l3Count,
      executedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('[CRON] SLA check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
