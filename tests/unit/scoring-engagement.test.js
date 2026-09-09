import { describe, it, expect, afterEach, vi } from 'vitest';
import { computeEngagementScore, scoreLabel } from '@/lib/prospects/scoring.js';

/**
 * Score d'engagement d'un prospect (0-100). Il trie la liste des leads dans
 * l'admin : un lead sous-évalué est un lead qu'on ne rappelle pas.
 *
 * Barème annoncé dans le module : email +25, téléphone +20, nom +5, société
 * +5, premier événement +5 puis +5 par événement supplémentaire dans la limite
 * de quatre, simulateur premium +15, montant ≥ 100 k€ +10, activité de moins
 * de 24 h +5.
 */

afterEach(() => {
  vi.useRealTimers();
});

const prospetComplet = {
  email: 'jean@exemple.fr',
  phone: '0612345678',
  name: 'Jean Dupont',
  company: 'ACME',
};

describe('computeEngagementScore — coordonnées', () => {
  it('donne zéro à un prospect vide, sans planter sur l absence d événements', () => {
    expect(computeEngagementScore({})).toBe(0);
    expect(computeEngagementScore({ prospect: null, events: null })).toBe(0);
    expect(computeEngagementScore({ prospect: {}, events: [] })).toBe(0);
  });

  it('valorise l email au-dessus du téléphone, et les deux au-dessus de l identité', () => {
    const email = computeEngagementScore({ prospect: { email: 'a@b.fr' } });
    const tel = computeEngagementScore({ prospect: { phone: '0612345678' } });
    const nom = computeEngagementScore({ prospect: { name: 'Jean' } });
    expect(email).toBe(25);
    expect(tel).toBe(20);
    expect(nom).toBe(5);
    expect(email).toBeGreaterThan(tel);
    expect(tel).toBeGreaterThan(nom);
  });

  it('cumule les quatre champs d identité', () => {
    expect(computeEngagementScore({ prospect: prospetComplet })).toBe(55);
  });

  it('ne compte pas une chaîne vide comme une coordonnée fournie', () => {
    expect(computeEngagementScore({ prospect: { email: '', phone: '', name: '', company: '' } })).toBe(0);
  });
});

describe('computeEngagementScore — événements', () => {
  it('accorde 5 points au premier événement', () => {
    expect(computeEngagementScore({ prospect: {}, events: [{}] })).toBe(5);
  });

  it('ajoute 5 points par événement supplémentaire', () => {
    expect(computeEngagementScore({ prospect: {}, events: [{}, {}] })).toBe(10);
    expect(computeEngagementScore({ prospect: {}, events: [{}, {}, {}] })).toBe(15);
  });

  it('plafonne la contribution des événements à 25 points', () => {
    expect(computeEngagementScore({ prospect: {}, events: new Array(5).fill({}) })).toBe(25);
    expect(computeEngagementScore({ prospect: {}, events: new Array(50).fill({}) })).toBe(25);
  });

  it('bonifie l usage d un simulateur premium, réservé aux prospects connectés', () => {
    const standard = computeEngagementScore({
      prospect: {},
      events: [{ simulatorSlug: 'taux-endettement' }],
    });
    const premium = computeEngagementScore({
      prospect: {},
      events: [{ simulatorSlug: 'leasing-pro' }],
    });
    expect(premium - standard).toBe(15);
  });

  it('ne bonifie qu une fois, même si le prospect enchaîne les simulateurs premium', () => {
    const un = computeEngagementScore({ prospect: {}, events: [{ simulatorSlug: 'scoring-bancaire' }] });
    const deux = computeEngagementScore({
      prospect: {},
      events: [{ simulatorSlug: 'scoring-bancaire' }, { simulatorSlug: 'pret-professionnel' }],
    });
    // +5 pour le deuxième événement, mais pas un second bonus premium.
    expect(deux - un).toBe(5);
  });
});

describe('computeEngagementScore — montant simulé', () => {
  const avecMontant = (params) => computeEngagementScore({ prospect: {}, events: [{ params }] });

  it('bonifie un montant supérieur ou égal à 100 000 €', () => {
    expect(avecMontant({ amount: 100000 })).toBe(15); // 5 (événement) + 10
    expect(avecMontant({ amount: 99999 })).toBe(5);
  });

  it('accepte les trois noms de paramètre utilisés par les simulateurs', () => {
    expect(avecMontant({ montant: 250000 })).toBe(15);
    expect(avecMontant({ maxAmount: 250000 })).toBe(15);
    expect(avecMontant({ amount: 250000 })).toBe(15);
  });

  it('lit un montant transmis en chaîne par la query string', () => {
    expect(avecMontant({ amount: '150000' })).toBe(15);
  });

  it('lit un montant déjà mis en forme, sans perdre le bonus en silence', () => {
    // « 150 000 » ou « 150 000 € » ne passaient pas Number() → NaN : le
    // prospect le plus intéressant perdait 10 points selon le simulateur
    // d origine, sans trace ni erreur.
    expect(avecMontant({ amount: '150 000' })).toBe(15);
    expect(avecMontant({ amount: '150000 €' })).toBe(15);
    expect(avecMontant({ amount: '150 000 €' })).toBe(15);
    // Espace insécable étroite (U+202F), celle qu insère Intl en français.
    expect(avecMontant({ amount: '150 000 €' })).toBe(15);
    // Virgule décimale française.
    expect(avecMontant({ amount: '150000,50' })).toBe(15);
  });

  it('ne se laisse pas abuser par une chaîne qui n est pas un montant', () => {
    expect(avecMontant({ amount: 'beaucoup' })).toBe(5);
    expect(avecMontant({ amount: '' })).toBe(5);
    expect(avecMontant({ amount: '99 999 €' })).toBe(5);
  });

  it('ignore un événement sans paramètres', () => {
    expect(computeEngagementScore({ prospect: {}, events: [{}, { params: null }] })).toBe(10);
  });
});

describe('computeEngagementScore — fraîcheur et plafond', () => {
  it('bonifie une activité de moins de 24 heures', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00Z'));
    const recent = computeEngagementScore({ prospect: { lastSeenAt: '2026-09-09T02:00:00Z' } });
    const ancien = computeEngagementScore({ prospect: { lastSeenAt: '2026-09-01T12:00:00Z' } });
    expect(recent).toBe(5);
    expect(ancien).toBe(0);
  });

  it('bascule exactement à 24 heures', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00Z'));
    expect(computeEngagementScore({ prospect: { lastSeenAt: '2026-09-08T12:00:01Z' } })).toBe(5);
    expect(computeEngagementScore({ prospect: { lastSeenAt: '2026-09-08T12:00:00Z' } })).toBe(0);
  });

  it('ne dépasse jamais 100, même quand le barème cumule 110 points', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00Z'));
    const score = computeEngagementScore({
      prospect: { ...prospetComplet, lastSeenAt: '2026-09-09T11:00:00Z' },
      events: [
        { simulatorSlug: 'leasing-pro', params: { amount: 500000 } },
        {}, {}, {}, {},
      ],
    });
    expect(score).toBe(100);
  });

  it('reste dans l intervalle 0-100 sur des entrées absurdes', () => {
    const score = computeEngagementScore({
      prospect: { email: 'a@b.fr', lastSeenAt: 'pas-une-date' },
      events: new Array(1000).fill({ params: { amount: -999999 } }),
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('scoreLabel', () => {
  it('découpe les quatre paliers commerciaux', () => {
    expect(scoreLabel(0).label).toBe('Froid');
    expect(scoreLabel(24).label).toBe('Froid');
    expect(scoreLabel(25).label).toBe('Engagé');
    expect(scoreLabel(49).label).toBe('Engagé');
    expect(scoreLabel(50).label).toBe('Tiède');
    expect(scoreLabel(74).label).toBe('Tiède');
    expect(scoreLabel(75).label).toBe('Chaud');
    expect(scoreLabel(100).label).toBe('Chaud');
  });

  it('fournit systématiquement une couleur et un emoji pour l affichage', () => {
    for (const score of [0, 25, 50, 75]) {
      const r = scoreLabel(score);
      expect(r.color).toBeTruthy();
      expect(r.emoji).toBeTruthy();
    }
  });

  it('classe « Froid » un score aberrant plutôt que de renvoyer undefined', () => {
    expect(scoreLabel(-10).label).toBe('Froid');
    expect(scoreLabel(NaN).label).toBe('Froid');
  });

  it('le palier « Chaud » est atteignable par un prospect réel', () => {
    // Email + téléphone + nom + société + 5 événements = 80 points, sans même
    // de simulateur premium : le palier haut n est pas décoratif.
    const score = computeEngagementScore({
      prospect: prospetComplet,
      events: new Array(5).fill({}),
    });
    expect(score).toBe(80);
    expect(scoreLabel(score).label).toBe('Chaud');
  });
});
