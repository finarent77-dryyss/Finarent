import { describe, it, expect } from 'vitest';
import { TACHES_CRON, IDENTIFIANTS_TACHES, evaluerTache } from '@/lib/cron-run.js';
import { debutDeFenetre } from '@/lib/rateLimit.js';

/**
 * Deux règles pures, testables sans base :
 *  - le calcul de fenêtre du limiteur de débit, dont dépend l'atomicité de
 *    l'incrément (deux instances doivent tomber sur la même ligne) ;
 *  - la détection d'une tâche planifiée disparue (action A6), qui est le seul
 *    filet contre un cron qui ne se déclenche plus du tout.
 */

describe('debutDeFenetre', () => {
  it('aligne la fenêtre sur l époque, indépendamment de l instant exact', () => {
    const heure = 60 * 60 * 1000;
    const a = debutDeFenetre(Date.UTC(2026, 8, 9, 14, 3, 12), heure);
    const b = debutDeFenetre(Date.UTC(2026, 8, 9, 14, 59, 59), heure);
    expect(a.getTime()).toBe(b.getTime());
    expect(a.toISOString()).toBe('2026-09-09T14:00:00.000Z');
  });

  it('bascule sur une nouvelle fenêtre au franchissement', () => {
    const heure = 60 * 60 * 1000;
    const avant = debutDeFenetre(Date.UTC(2026, 8, 9, 14, 59, 59), heure);
    const apres = debutDeFenetre(Date.UTC(2026, 8, 9, 15, 0, 0), heure);
    expect(apres.getTime() - avant.getTime()).toBe(heure);
  });
});

describe('evaluerTache', () => {
  const maintenant = new Date('2026-09-09T12:00:00.000Z');

  it('déclare les trois tâches attendues', () => {
    expect(IDENTIFIANTS_TACHES).toEqual(['reminders', 'sla-check', 'affiliate-purge']);
  });

  it('alerte quand aucune exécution réussie n a jamais été enregistrée', () => {
    const resultat = evaluerTache('sla-check', null, maintenant);
    expect(resultat.statut).toBe('JAMAIS_EXECUTEE');
    expect(resultat.enAlerte).toBe(true);
  });

  it('reste au vert tant que le dernier succès est dans la périodicité', () => {
    // SLA : toutes les 2 h, tolérance 1 h → 1 h de retard reste acceptable.
    const dernier = { startedAt: new Date('2026-09-09T11:00:00.000Z') };
    const resultat = evaluerTache('sla-check', dernier, maintenant);
    expect(resultat.statut).toBe('OK');
    expect(resultat.enAlerte).toBe(false);
  });

  it('alerte quand la tâche a silencieusement disparu', () => {
    // Relances : quotidiennes, tolérance 6 h → un succès vieux de 3 jours est
    // exactement le cas que l échec bruyant de curl ne sait pas voir.
    const dernier = { startedAt: new Date('2026-09-06T09:00:00.000Z') };
    const resultat = evaluerTache('reminders', dernier, maintenant);
    expect(resultat.statut).toBe('EN_RETARD');
    expect(resultat.enAlerte).toBe(true);
    expect(resultat.depuisMs).toBeGreaterThan(resultat.seuilMs);
  });

  it('accorde à la purge hebdomadaire un seuil de huit jours', () => {
    const seuil = TACHES_CRON['affiliate-purge'].periodiciteMs
      + TACHES_CRON['affiliate-purge'].toleranceMs;
    expect(seuil).toBe(8 * 24 * 60 * 60 * 1000);

    const sixJours = { startedAt: new Date('2026-09-03T03:00:00.000Z') };
    expect(evaluerTache('affiliate-purge', sixJours, maintenant).enAlerte).toBe(false);

    const dixJours = { startedAt: new Date('2026-08-30T03:00:00.000Z') };
    expect(evaluerTache('affiliate-purge', dixJours, maintenant).enAlerte).toBe(true);
  });
});
