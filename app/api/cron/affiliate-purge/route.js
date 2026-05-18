import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron/affiliate-purge
 * Cron RGPD : supprime les AffiliateClick > 13 mois (recommandation CNIL).
 * Vercel Cron : configurer dans vercel.json schedule "0 3 * * 0" (dimanche 3h).
 *
 * Sécurité : protégé par CRON_SECRET en header Authorization.
 */
export async function GET(request) {
  const expected = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000); // 13 mois

  const deleted = await prisma.affiliateClick.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  // Purge aussi les invitations FAILED anciennes (60 jours) — moins critique
  const failedCutoff = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const deletedInvites = await prisma.affiliateInvite.deleteMany({
    where: { status: 'FAILED', sentAt: { lt: failedCutoff } },
  });

  return NextResponse.json({
    success: true,
    purgedClicks: deleted.count,
    purgedFailedInvites: deletedInvites.count,
    cutoff: cutoff.toISOString(),
  });
}
