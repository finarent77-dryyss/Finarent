import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCronAuthorized } from '@/lib/cron-auth';
import { executerCron } from '@/lib/cron-run';
import { purgerCompteursExpires } from '@/lib/rateLimit';

const HOURS = (h) => h * 60 * 60 * 1000;

/**
 * Cron SLA - vérifie les dossiers en retard de traitement.
 * Niveau 1 : PENDING > 4h sans activité opérateur
 * Niveau 2 : REVIEWING > 24h sans mise à jour
 * Niveau 3 : DOCUMENTS_NEEDED > 48h sans mise à jour
 *
 * Déduplication : pas d'alerte si une alerte identique a été créée
 * dans les 24h précédentes pour la même application et le même niveau.
 *
 * Cette tâche porte aussi la purge des fenêtres de limitation de débit
 * expirées (constat P2-3) : c'est le cron le plus fréquent (toutes les
 * 2 heures), donc celui dont la cadence colle le mieux à des fenêtres d'une
 * heure. Purger ici plutôt qu'à chaque requête évite d'ajouter un DELETE au
 * chemin critique des formulaires publics.
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

export async function GET(request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  return executerCron('sla-check', async () => {
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

    // --- Entretien : fenêtres de limitation de débit expirées ---
    // Best-effort : un échec de purge ne doit pas faire passer la surveillance
    // des délais de traitement pour défaillante.
    let purgedRateLimits = 0;
    try {
      purgedRateLimits = await purgerCompteursExpires(now);
    } catch (erreur) {
      console.error('[CRON] Purge des compteurs de débit impossible :', erreur?.message || erreur);
    }

    return {
      traites: l1Count + l2Count + l3Count,
      resume: `${l1Count} alerte(s) N1, ${l2Count} N2, ${l3Count} N3 ; `
        + `${purgedRateLimits} compteur(s) de débit purgé(s)`,
      details: {
        level1: l1Count,
        level2: l2Count,
        level3: l3Count,
        purgedRateLimits,
      },
      payload: {
        level1: l1Count,
        level2: l2Count,
        level3: l3Count,
        purgedRateLimits,
      },
    };
  });
}
