import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TACHES_CRON, IDENTIFIANTS_TACHES, evaluerTache } from '@/lib/cron-run';

/**
 * GET /api/admin/cron-status
 *
 * Action A6 — surveillance des tâches planifiées. Le `-f` de curl signale une
 * tâche qui répond en erreur ; il ne dit rien d'une tâche qui ne se déclenche
 * plus du tout. Cette route répond à la seule question qui compte : « chacune
 * des trois tâches a-t-elle réussi dans le délai qu'on attend d'elle ? »
 *
 * Une tâche est en alerte si son dernier succès remonte à plus de
 * « périodicité + tolérance » (voir TACHES_CRON), ou si elle n'a jamais réussi.
 *
 * Volontairement distincte de /api/health : celle-ci contient des données
 * d'exploitation et n'a rien à faire dans une sonde publique.
 */
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const maintenant = new Date();

  const taches = await Promise.all(
    IDENTIFIANTS_TACHES.map(async (job) => {
      const definition = TACHES_CRON[job];

      const [dernierSucces, derniereExecution] = await Promise.all([
        prisma.cronRun.findFirst({
          where: { job, status: 'SUCCES' },
          orderBy: { startedAt: 'desc' },
        }),
        prisma.cronRun.findFirst({
          where: { job },
          orderBy: { startedAt: 'desc' },
        }),
      ]);

      const evaluation = evaluerTache(job, dernierSucces, maintenant);

      return {
        job,
        libelle: definition.libelle,
        planification: definition.planification,
        periodiciteMs: definition.periodiciteMs,
        seuilAlerteMs: evaluation.seuilMs,
        statut: evaluation.statut,
        enAlerte: evaluation.enAlerte,
        message: evaluation.message,
        depuisDernierSuccesMs: evaluation.depuisMs,
        dernierSucces: dernierSucces
          ? {
            executeLe: dernierSucces.startedAt.toISOString(),
            dureeMs: dernierSucces.durationMs,
            traites: dernierSucces.processed,
            resume: dernierSucces.summary,
            details: dernierSucces.details,
          }
          : null,
        // Une dernière exécution en échec alors que le dernier succès est encore
        // dans les clous : la tâche tourne mais quelque chose ne va pas.
        derniereExecutionEnEchec:
          derniereExecution && derniereExecution.status === 'ECHEC'
            ? {
              executeLe: derniereExecution.startedAt.toISOString(),
              erreur: derniereExecution.error,
            }
            : null,
      };
    }),
  );

  return NextResponse.json({
    generatedAt: maintenant.toISOString(),
    alertes: taches.filter((t) => t.enAlerte || t.derniereExecutionEnEchec).length,
    taches,
  });
}
