import { describe, it, expect } from 'vitest';
import {
  annualPremiumOnInitialCapital,
  totalPremiumOnInitialCapital,
  totalPremiumOnCrd,
  delegationSavings,
} from '@/lib/simulators/calculations/assurance.js';

/**
 * Assurance emprunteur : six simulateurs publics s'appuient sur ces quatre
 * fonctions, dont le comparateur « bancaire vs délégation » qui annonce à un
 * prospect le montant qu'il économiserait en changeant d'assurance. Le chiffre
 * affiché est repris tel quel dans les échanges commerciaux.
 *
 * Rappel d'unité, source des erreurs les plus coûteuses ici : `rate` est un
 * pourcentage en clair (0,36 pour 0,36 %), pas un décimal.
 */

describe('annualPremiumOnInitialCapital', () => {
  it('applique le taux annuel au capital initial', () => {
    // 200 000 € à 0,36 % = 720 € par an.
    expect(annualPremiumOnInitialCapital(200000, 0.36)).toBe(720);
  });

  it('rend une cotisation nulle à taux nul ou à capital nul', () => {
    expect(annualPremiumOnInitialCapital(200000, 0)).toBe(0);
    expect(annualPremiumOnInitialCapital(0, 0.36)).toBe(0);
  });

  it('croît proportionnellement au capital', () => {
    expect(annualPremiumOnInitialCapital(400000, 0.36)).toBe(
      2 * annualPremiumOnInitialCapital(200000, 0.36),
    );
  });

  it('arrondit à l euro', () => {
    // 123 456 € à 0,3 % = 370,368 € → 370 €.
    expect(annualPremiumOnInitialCapital(123456, 0.3)).toBe(370);
  });
});

describe('totalPremiumOnInitialCapital', () => {
  it('multiplie la cotisation annuelle par la durée en années', () => {
    expect(totalPremiumOnInitialCapital(200000, 0.36, 240)).toBe(14400); // 720 × 20 ans
  });

  it('gère une durée qui n est pas un nombre entier d années', () => {
    expect(totalPremiumOnInitialCapital(200000, 0.36, 18)).toBe(1080); // 720 × 1,5
  });

  it('renvoie zéro pour une durée nulle', () => {
    expect(totalPremiumOnInitialCapital(200000, 0.36, 0)).toBe(0);
  });

  it('n arrondit qu une fois, sur le total, et non sur la cotisation annuelle', () => {
    // 15 000 € à 0,33 % valent 49,50 €/an. Arrondir d abord la cotisation
    // annuelle à 50 € donnait 1 000 € sur 20 ans au lieu des 990 € exacts,
    // soit 10 € offerts à l argumentaire « économies » du comparateur.
    // L écart atteignait 0,50 € par an et croissait donc avec la durée.
    expect(annualPremiumOnInitialCapital(15000, 0.33)).toBe(50); // affichage annuel, à l euro
    expect(totalPremiumOnInitialCapital(15000, 0.33, 240)).toBe(990); // total exact
  });

  it('reste exact sur les durées où l arrondi annuel dérivait le plus', () => {
    // 0,25 €/an d écart × 30 ans : 7,50 € perdus sur le total.
    expect(totalPremiumOnInitialCapital(100000, 0.2505, 360)).toBe(7515);
    // Cas sans demi-centime : le résultat est inchangé par la correction.
    expect(totalPremiumOnInitialCapital(200000, 0.36, 240)).toBe(14400);
  });
});

describe('totalPremiumOnCrd', () => {
  it('coûte moitié moins que le calcul sur capital initial, par construction', () => {
    // Approximation linéaire assumée : capital moyen = capital initial / 2.
    expect(totalPremiumOnCrd(200000, 0.36, 240)).toBe(7200);
    expect(totalPremiumOnCrd(200000, 0.36, 240)).toBe(
      totalPremiumOnInitialCapital(200000, 0.36, 240) / 2,
    );
  });

  it('reste toujours inférieur ou égal au calcul sur capital initial', () => {
    for (const duree of [12, 60, 180, 300]) {
      expect(totalPremiumOnCrd(250000, 0.42, duree)).toBeLessThanOrEqual(
        totalPremiumOnInitialCapital(250000, 0.42, duree),
      );
    }
  });

  it('renvoie zéro à capital, taux ou durée nuls', () => {
    expect(totalPremiumOnCrd(0, 0.36, 240)).toBe(0);
    expect(totalPremiumOnCrd(200000, 0, 240)).toBe(0);
    expect(totalPremiumOnCrd(200000, 0.36, 0)).toBe(0);
  });
});

describe('delegationSavings', () => {
  const cas = { amount: 200000, months: 240, bankRate: 0.36, delegationRate: 0.12 };

  it('chiffre l économie et le pourcentage annoncés au prospect', () => {
    expect(delegationSavings(cas)).toEqual({
      bank: 14400,
      delegation: 4800,
      savings: 9600,
      pct: 67, // 9 600 / 14 400 = 66,67 %
    });
  });

  it('n annonce jamais d économie négative quand la délégation est plus chère', () => {
    const r = delegationSavings({ ...cas, bankRate: 0.1, delegationRate: 0.4 });
    expect(r.savings).toBe(0);
    expect(r.pct).toBe(0);
  });

  it('n annonce aucune économie à taux identiques', () => {
    const r = delegationSavings({ ...cas, delegationRate: 0.36 });
    expect(r.savings).toBe(0);
    expect(r.pct).toBe(0);
  });

  it('ne divise pas par zéro quand le contrat bancaire est gratuit', () => {
    const r = delegationSavings({ ...cas, bankRate: 0, delegationRate: 0 });
    expect(r).toEqual({ bank: 0, delegation: 0, savings: 0, pct: 0 });
  });

  it('annonce 100 % d économie quand la délégation est à taux nul', () => {
    const r = delegationSavings({ ...cas, delegationRate: 0 });
    expect(r.delegation).toBe(0);
    expect(r.pct).toBe(100);
  });

  it('reste cohérent sur un cas non arrondi : 315 000 € sur 23 ans', () => {
    // 315 000 × 0,41 % × 23 ans = 29 704,50 € (29 704,4999… en virgule
    // flottante, d où 29 704 €). Côté délégation : 315 000 × 0,19 % × 23 ans
    // = 13 765,50 € → 13 766 €.
    //
    // L ancien calcul arrondissait d abord la cotisation annuelle (1 291 € et
    // 599 €) et annonçait 29 693 € / 13 777 € : 11 € de trop côté banque et
    // 11 € de moins côté délégation, soit 22 € d économie surestimée sur un
    // seul dossier. Les valeurs ci-dessous sont celles du calcul exact.
    const r = delegationSavings({ amount: 315000, months: 276, bankRate: 0.41, delegationRate: 0.19 });
    expect(r).toEqual({ bank: 29704, delegation: 13766, savings: 15938, pct: 54 });
    expect(r.savings).toBe(r.bank - r.delegation);
  });
});
