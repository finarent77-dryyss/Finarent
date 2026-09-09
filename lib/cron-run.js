import { NextResponse } from 'next/server';

/**
 * Journal d'exécution des tâches planifiées — action A6.
 *
 * Le `-f --fail-with-body` posé sur les appels curl de `clevercloud/cron.json`
 * fait échouer bruyamment une tâche qui répond en erreur. Il ne dit rien du cas
 * le plus insidieux : une tâche qui ne se déclenche plus du tout. Pas d'appel,
 * pas de code de retour, pas d'alerte — la tâche peut avoir disparu depuis des
 * semaines (fichier `cron.json` non repris au déploiement, instance 0 absente,
 * `CRON_SECRET` non propagé…) sans que rien ne l'indique.
 *
 * Chaque passage écrit donc une ligne `CronRun`, succès comme échec, et
 * `/api/admin/cron-status` compare la date du dernier succès à la périodicité
 * attendue déclarée ici.
 */

/**
 * Périodicités attendues, alignées sur `clevercloud/cron.json`.
 * `toleranceMs` est la marge accordée avant de considérer la tâche disparue :
 * elle absorbe un redéploiement en cours ou un décalage d'ordonnanceur.
 */
export const TACHES_CRON = {
  reminders: {
    libelle: 'Relances automatiques',
    planification: 'tous les jours à 9 h',
    periodiciteMs: 24 * 60 * 60 * 1000,
    toleranceMs: 6 * 60 * 60 * 1000,
  },
  'sla-check': {
    libelle: 'Contrôle des délais de traitement (SLA)',
    planification: 'toutes les 2 heures',
    periodiciteMs: 2 * 60 * 60 * 1000,
    toleranceMs: 60 * 60 * 1000,
  },
  'affiliate-purge': {
    libelle: 'Purge RGPD des clics d\'affiliation',
    planification: 'le dimanche à 3 h',
    periodiciteMs: 7 * 24 * 60 * 60 * 1000,
    toleranceMs: 24 * 60 * 60 * 1000,
  },
};

/** Identifiants de tâche connus, dans l'ordre d'affichage. */
export const IDENTIFIANTS_TACHES = Object.keys(TACHES_CRON);

/**
 * Écrit la trace d'un passage. Best-effort : si l'écriture échoue (base
 * injoignable — cas fréquent quand la tâche elle-même vient d'échouer pour
 * cette raison), on trace en console et on n'empêche surtout pas la réponse
 * HTTP. Un journal manquant ne doit jamais faire échouer une tâche qui a
 * travaillé.
 */
async function enregistrerPassage(donnees) {
  try {
    // Import paresseux : `evaluerTache` est une règle pure, testable sans base.
    // Un import statique de Prisma rendrait ce module inchargeable sans
    // DATABASE_URL, donc intestable.
    const { prisma } = await import('./prisma');
    await prisma.cronRun.create({ data: donnees });
  } catch (erreur) {
    console.error('[CRON] Journalisation impossible :', erreur?.message || erreur);
  }
}

/**
 * Exécute le corps d'une tâche planifiée et journalise son passage.
 *
 * Le `travail` renvoie un objet décrivant ce qu'il a fait :
 *   - `traites` : nombre d'éléments effectivement traités ;
 *   - `resume`  : phrase lisible, affichée telle quelle dans l'admin ;
 *   - `details` : décompte structuré, propre à la tâche (optionnel) ;
 *   - `payload` : champs à fusionner dans la réponse JSON (forme historique
 *                 des réponses conservée, pour ne rien casser côté supervision).
 *
 * @param {string} job Identifiant de la tâche (clé de TACHES_CRON).
 * @param {() => Promise<{traites?: number, resume: string, details?: object, payload?: object}>} travail
 * @returns {Promise<NextResponse>}
 */
export async function executerCron(job, travail) {
  const debut = new Date();

  try {
    const resultat = await travail();
    const fin = new Date();

    await enregistrerPassage({
      job,
      status: 'SUCCES',
      startedAt: debut,
      finishedAt: fin,
      durationMs: fin.getTime() - debut.getTime(),
      processed: resultat?.traites ?? 0,
      summary: resultat?.resume ?? 'Exécution terminée',
      details: resultat?.details ?? undefined,
    });

    return NextResponse.json({
      success: true,
      ...(resultat?.payload ?? {}),
      executedAt: fin.toISOString(),
    });
  } catch (erreur) {
    const fin = new Date();
    console.error(`[CRON] ${job} error:`, erreur);

    await enregistrerPassage({
      job,
      status: 'ECHEC',
      startedAt: debut,
      finishedAt: fin,
      durationMs: fin.getTime() - debut.getTime(),
      processed: 0,
      summary: 'Échec de la tâche',
      error: String(erreur?.message || erreur).slice(0, 1000),
    });

    return NextResponse.json(
      { success: false, error: erreur?.message || 'Erreur inconnue' },
      { status: 500 },
    );
  }
}

/**
 * État d'une tâche au regard de sa périodicité attendue.
 * Fonction pure, sans base : c'est elle qui porte la règle « tâche disparue ».
 *
 * @param {string} job
 * @param {{startedAt: Date} | null} dernierSucces
 * @param {Date} maintenant
 */
export function evaluerTache(job, dernierSucces, maintenant = new Date()) {
  const definition = TACHES_CRON[job];
  const seuilMs = definition.periodiciteMs + definition.toleranceMs;

  if (!dernierSucces) {
    return {
      statut: 'JAMAIS_EXECUTEE',
      enAlerte: true,
      depuisMs: null,
      seuilMs,
      message: `Aucune exécution réussie enregistrée pour « ${definition.libelle} ».`,
    };
  }

  const depuisMs = maintenant.getTime() - new Date(dernierSucces.startedAt).getTime();
  if (depuisMs > seuilMs) {
    return {
      statut: 'EN_RETARD',
      enAlerte: true,
      depuisMs,
      seuilMs,
      message: `« ${definition.libelle} » (${definition.planification}) n'a pas réussi depuis `
        + `${Math.floor(depuisMs / 3_600_000)} h, au-delà du seuil de `
        + `${Math.floor(seuilMs / 3_600_000)} h.`,
    };
  }

  return {
    statut: 'OK',
    enAlerte: false,
    depuisMs,
    seuilMs,
    message: `Dernier succès il y a ${Math.floor(depuisMs / 60_000)} min.`,
  };
}
