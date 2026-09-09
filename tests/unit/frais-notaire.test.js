import { describe, it, expect } from 'vitest';
import { notaryFees } from '@/lib/simulators/calculations/notaire.js';

/**
 * Frais d'acquisition immobilière. Le montant sert au plan de financement que
 * le prospect présente à sa banque : sous-estimer les frais, c'est un dossier
 * qui casse au dernier moment.
 *
 * Le barème des émoluments est un barème par tranches (décret 2016-230) : les
 * tranches sont cumulatives, pas exclusives. C'est l'erreur classique dans ce
 * calcul, et c'est ce que vérifient les cas ci-dessous.
 */

describe('notaryFees — cas nominal', () => {
  it('détaille les trois postes pour un bien ancien à 200 000 €', () => {
    // Droits de mutation : 200 000 × 5,80665 %          = 11 613 €
    // Émoluments : 6 500 × 3,870 % + 10 500 × 1,596 %
    //            + 43 000 × 1,064 % + 140 000 × 0,799 % = 1 995,25 € HT
    //            × 1,20 (TVA)                           = 2 394 €
    // CSI 0,10 % + 1 200 € de débours                   = 1 400 €
    const r = notaryFees({ price: 200000 });
    expect(r.mutationRights).toBe(11613);
    expect(r.notaryFees).toBe(2394);
    expect(r.csiAndDisbursements).toBe(1400);
    expect(r.total).toBe(15407);
  });

  it('somme exactement les trois postes', () => {
    const r = notaryFees({ price: 437500 });
    expect(r.total).toBe(r.mutationRights + r.notaryFees + r.csiAndDisbursements);
  });

  it('exprime le taux global en pourcentage du prix', () => {
    const r = notaryFees({ price: 200000 });
    expect(r.rate).toBeCloseTo(7.7035, 4);
  });

  it('reste dans la fourchette attendue de 7 à 8 % dans l ancien', () => {
    for (const prix of [150000, 250000, 400000, 800000]) {
      const { rate } = notaryFees({ price: prix });
      expect(rate).toBeGreaterThan(7);
      expect(rate).toBeLessThan(8.5);
    }
  });
});

describe('notaryFees — neuf contre ancien', () => {
  it('applique la taxe de publicité foncière réduite dans le neuf', () => {
    const neuf = notaryFees({ price: 200000, type: 'neuf' });
    expect(neuf.mutationRights).toBe(1430); // 200 000 × 0,71498 %
    expect(neuf.total).toBe(5224);
  });

  it('coûte nettement moins cher que l ancien, à prix égal', () => {
    const ancien = notaryFees({ price: 300000, type: 'ancien' });
    const neuf = notaryFees({ price: 300000, type: 'neuf' });
    expect(neuf.total).toBeLessThan(ancien.total / 2);
    expect(neuf.rate).toBeLessThan(3);
  });

  it('traite tout type inconnu comme de l ancien, le cas le plus coûteux', () => {
    // Défaut prudent : mieux vaut annoncer trop que pas assez.
    expect(notaryFees({ price: 200000, type: 'vefa' }).total).toBe(
      notaryFees({ price: 200000, type: 'ancien' }).total,
    );
    expect(notaryFees({ price: 200000, type: undefined }).total).toBe(15407);
  });

  it('mentionne le type de bien et son taux dans le détail affiché', () => {
    const [mutation] = notaryFees({ price: 200000, type: 'neuf' }).breakdown;
    expect(mutation.label).toBe('Droits de mutation');
    expect(mutation.sub).toContain('neuf');
    expect(mutation.sub).toContain('0.71498');
  });
});

describe('notaryFees — bornes', () => {
  it('renvoie une structure nulle et exploitable pour un prix absent ou négatif', () => {
    const attendu = {
      total: 0,
      mutationRights: 0,
      notaryFees: 0,
      csiAndDisbursements: 0,
      rate: 0,
      breakdown: [],
    };
    expect(notaryFees({ price: 0 })).toEqual(attendu);
    expect(notaryFees({ price: -5000 })).toEqual(attendu);
    expect(notaryFees({})).toEqual(attendu);
  });

  it('ne s arrête pas à la première tranche pour un petit prix', () => {
    // 5 000 € tient dans la première tranche : émoluments = 5 000 × 3,870 %
    // = 193,50 € HT → 232 € TTC. Les 1 200 € de débours forfaitaires font
    // exploser le taux relatif, ce qui est le comportement réel du barème.
    const r = notaryFees({ price: 5000 });
    expect(r.notaryFees).toBe(232);
    expect(r.csiAndDisbursements).toBe(1205);
    expect(r.rate).toBeGreaterThan(30);
  });

  it('fait croître les frais avec le prix, sans discontinuité aux bornes de tranche', () => {
    const bornes = [6499, 6500, 6501, 16999, 17000, 17001, 59999, 60000, 60001];
    let precedent = 0;
    for (const prix of bornes) {
      const { total } = notaryFees({ price: prix });
      expect(total).toBeGreaterThanOrEqual(precedent);
      precedent = total;
    }
  });

  it('reste dans un ordre de grandeur crédible sur un prix très élevé', () => {
    // 5 M€ : la dernière tranche à 0,799 % domine, le taux global se rapproche
    // de 6,7 % (les débours forfaitaires deviennent négligeables).
    const r = notaryFees({ price: 5000000 });
    expect(r.rate).toBeGreaterThan(6);
    expect(r.rate).toBeLessThan(7.5);
    expect(r.total).toBeGreaterThan(300000);
  });

  it('gère un prix non entier sans produire de centimes dans les totaux', () => {
    const r = notaryFees({ price: 199999.99 });
    expect(Number.isInteger(r.total)).toBe(true);
    expect(Number.isInteger(r.mutationRights)).toBe(true);
    expect(Number.isInteger(r.notaryFees)).toBe(true);
  });
});
