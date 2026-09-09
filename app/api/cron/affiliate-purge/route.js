import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCronAuthorized } from '@/lib/cron-auth';
import { executerCron } from '@/lib/cron-run';

/**
 * GET /api/cron/affiliate-purge
 * Cron RGPD : supprime les AffiliateClick > 13 mois (recommandation CNIL).
 *
 * Sécurité : protégé par CRON_SECRET en header Authorization (fail-closed).
 * Chaque passage est journalisé dans CronRun (action A6).
 */
export async function GET(request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  return executerCron('affiliate-purge', async () => {
    const cutoff = new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000); // 13 mois

    const deleted = await prisma.affiliateClick.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    // Purge aussi les invitations FAILED anciennes (60 jours) — moins critique
    const failedCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const deletedInvites = await prisma.affiliateInvite.deleteMany({
      where: { status: 'FAILED', sentAt: { lt: failedCutoff } },
    });

    return {
      traites: deleted.count + deletedInvites.count,
      resume: `${deleted.count} clic(s) d'affiliation et ${deletedInvites.count} invitation(s) en échec purgés`,
      details: {
        purgedClicks: deleted.count,
        purgedFailedInvites: deletedInvites.count,
        cutoff: cutoff.toISOString(),
      },
      payload: {
        purgedClicks: deleted.count,
        purgedFailedInvites: deletedInvites.count,
        cutoff: cutoff.toISOString(),
      },
    };
  });
}
