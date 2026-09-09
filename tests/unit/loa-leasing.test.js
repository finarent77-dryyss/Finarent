import { describe, it, expect } from 'vitest';
import { loaBreakdown } from '@/lib/simulators/calculations/loa.js';
import {
  leasingBreakdown,
  leasingCoefficient,
  leasingKmAdjustment,
  LEASING_SERVICES_MONTHLY,
} from '@/lib/simulators/calculations/leasing.js';

/**
 * LOA et leasing / LLD : les deux simulateurs de location du site public.
 *
 * Leurs formules vivaient en ligne dans les composants React, à l'intérieur de
 * `useMemo`, sans export : aucun test ne pouvait les atteindre alors qu'elles
 * annoncent un loyer et un coût total à des prospects. Elles ont été extraites
 * vers lib/simulators/calculations/ à comportement strictement constant — les
 * valeurs de référence ci-dessous sont celles qu'affichait le composant avant
 * extraction, au centime près.
 */

describe('loaBreakdown — valeurs affichées avant extraction', () => {
  it('reproduit le cas par défaut du simulateur (25 000 € / 48 mois / 5,5 % / 20 %)', () => {
    expect(loaBreakdown({ amount: 25000, months: 48, rate: 5.5, residual: 20 })).toEqual({
      residualValue: 5000,
      financedAmount: 20000,
      monthly: 465,
      firstPayment: 534.75,
      totalPaid: 27389.75,
      totalIfReturned: 22389.75,
    });
  });

  it('reproduit le même cas avec 3 000 € d apport', () => {
    const r = loaBreakdown({ amount: 25000, months: 48, rate: 5.5, residual: 20, apport: 3000 });
    expect(r.financedAmount).toBe(17000);
    expect(r.monthly).toBe(395);
    expect(r.totalPaid).toBeCloseTo(27019.25, 2);
  });
});

describe('loaBreakdown — structure du contrat', () => {
  it('ne finance ni l apport ni la valeur résiduelle', () => {
    const r = loaBreakdown({ amount: 40000, months: 60, rate: 4, residual: 25, apport: 4000 });
    expect(r.residualValue).toBe(10000); // 25 % de 40 000
    expect(r.financedAmount).toBe(40000 - 4000 - 10000);
  });

  it('majore le premier loyer du pourcentage demandé', () => {
    const r = loaBreakdown({ amount: 25000, months: 48, rate: 5.5, residual: 20, firstPaymentMarkup: 15 });
    expect(r.firstPayment).toBeCloseTo(r.monthly * 1.15, 10);
  });

  it('sans majoration, le premier loyer est un loyer comme les autres', () => {
    const r = loaBreakdown({ amount: 25000, months: 48, rate: 5.5, residual: 20, firstPaymentMarkup: 0 });
    expect(r.firstPayment).toBe(r.monthly);
    expect(r.totalPaid).toBeCloseTo(r.monthly * 48 + r.residualValue, 6);
  });

  it('compte exactement une échéance par mois, majoration comprise', () => {
    const r = loaBreakdown({ amount: 30000, months: 36, rate: 6, residual: 15, apport: 2000 });
    expect(r.totalPaid).toBeCloseTo(
      2000 + r.firstPayment + r.monthly * 35 + r.residualValue,
      6,
    );
  });

  it('restituer le véhicule économise exactement la valeur résiduelle', () => {
    const r = loaBreakdown({ amount: 25000, months: 48, rate: 5.5, residual: 20 });
    expect(r.totalPaid - r.totalIfReturned).toBe(r.residualValue);
  });

  it('coûte plus cher quand le taux monte', () => {
    const bas = loaBreakdown({ amount: 25000, months: 48, rate: 2, residual: 20 });
    const haut = loaBreakdown({ amount: 25000, months: 48, rate: 12, residual: 20 });
    expect(haut.monthly).toBeGreaterThan(bas.monthly);
    expect(haut.totalPaid).toBeGreaterThan(bas.totalPaid);
  });

  it('n annonce jamais de loyer négatif quand l apport dépasse le montant à financer', () => {
    // Apport supérieur au prix : le capital financé passerait sous zéro. Le
    // loyer doit tomber à 0, pas devenir négatif — c est le cas limite qui
    // faisait afficher une mensualité négative avant le bornage de PMT.
    const r = loaBreakdown({ amount: 25000, months: 48, rate: 5.5, residual: 20, apport: 30000 });
    expect(r.financedAmount).toBe(0);
    expect(r.monthly).toBe(0);
    expect(r.firstPayment).toBe(0);
    // Reste dû : l apport versé et l option d achat.
    expect(r.totalPaid).toBe(35000);
  });

  it('reste défini à valeur résiduelle nulle (LOA sans option réelle)', () => {
    const r = loaBreakdown({ amount: 25000, months: 48, rate: 5.5, residual: 0 });
    expect(r.residualValue).toBe(0);
    expect(r.financedAmount).toBe(25000);
    expect(r.totalIfReturned).toBe(r.totalPaid);
  });
});

describe('leasingCoefficient', () => {
  it('applique le barème par palier de durée', () => {
    expect(leasingCoefficient(24)).toBe(0.022);
    expect(leasingCoefficient(36)).toBe(0.019);
    expect(leasingCoefficient(48)).toBe(0.017);
    expect(leasingCoefficient(60)).toBe(0.015);
  });

  it('décroît, ou reste stable, quand la durée s allonge', () => {
    let precedent = Infinity;
    for (let m = 24; m <= 60; m += 6) {
      const c = leasingCoefficient(m);
      expect(c).toBeLessThanOrEqual(precedent);
      precedent = c;
    }
  });

  it('bascule au bon mois, et pas un mois plus tard', () => {
    expect(leasingCoefficient(25)).toBe(0.019);
    expect(leasingCoefficient(37)).toBe(0.017);
    expect(leasingCoefficient(49)).toBe(0.015);
  });
});

describe('leasingKmAdjustment', () => {
  it('n applique aucun supplément jusqu au forfait de 15 000 km', () => {
    expect(leasingKmAdjustment(5000)).toBe(0);
    expect(leasingKmAdjustment(15000)).toBe(0);
  });

  it('facture le kilométrage supplémentaire au mois', () => {
    // 10 000 km de plus × 0,002 € = 20 € par an, soit 1,67 € par mois.
    expect(leasingKmAdjustment(25000)).toBeCloseTo(20 / 12, 10);
  });
});

describe('leasingBreakdown — valeurs affichées avant extraction', () => {
  it('reproduit le cas par défaut du simulateur (30 000 € / 48 mois / 15 000 km / services)', () => {
    expect(leasingBreakdown({ amount: 30000, months: 48, annualKm: 15000 })).toEqual({
      baseCoeff: 0.017,
      kmAdjust: 0,
      servicesAmount: 80,
      financedBase: 30000,
      monthly: 590, // 30 000 × 1,7 % + 80 €
      firstPayment: 679, // 590 × 1,15, arrondi
      total: 28409, // 679 + 590 × 47
    });
  });

  it('reproduit le cas gros rouleur (25 000 km/an)', () => {
    const r = leasingBreakdown({ amount: 30000, months: 48, annualKm: 25000 });
    expect(r.monthly).toBe(592);
    expect(r.firstPayment).toBe(681);
    expect(r.total).toBe(28505);
  });

  it('reproduit le cas 60 mois, sans services, avec 5 000 € d apport', () => {
    const r = leasingBreakdown({
      amount: 30000,
      months: 60,
      annualKm: 15000,
      services: false,
      apport: 5000,
    });
    expect(r).toEqual({
      baseCoeff: 0.015,
      kmAdjust: 0,
      servicesAmount: 0,
      financedBase: 25000,
      monthly: 375,
      firstPayment: 431,
      total: 27556,
    });
  });
});

describe('leasingBreakdown — structure du contrat', () => {
  it('ajoute le pack services au loyer, et le retire quand il est refusé', () => {
    const avec = leasingBreakdown({ amount: 30000, months: 48, annualKm: 15000, services: true });
    const sans = leasingBreakdown({ amount: 30000, months: 48, annualKm: 15000, services: false });
    expect(avec.monthly - sans.monthly).toBe(LEASING_SERVICES_MONTHLY);
  });

  it('l apport réduit la base financée, donc le loyer', () => {
    const sans = leasingBreakdown({ amount: 30000, months: 48, annualKm: 15000 });
    const avec = leasingBreakdown({ amount: 30000, months: 48, annualKm: 15000, apport: 6000 });
    expect(avec.financedBase).toBe(24000);
    expect(avec.monthly).toBeLessThan(sans.monthly);
  });

  it('compte exactement une échéance par mois, majoration comprise', () => {
    const r = leasingBreakdown({ amount: 45000, months: 36, annualKm: 30000, apport: 2500 });
    expect(r.total).toBe(2500 + r.firstPayment + r.monthly * 35);
  });

  it('rend des montants entiers, comme les cartes de résultat les affichent', () => {
    const r = leasingBreakdown({ amount: 37500, months: 42, annualKm: 22000, apport: 1250 });
    expect(Number.isInteger(r.monthly)).toBe(true);
    expect(Number.isInteger(r.firstPayment)).toBe(true);
    expect(Number.isInteger(r.total)).toBe(true);
  });

  it('n annonce jamais de loyer négatif quand l apport dépasse le prix', () => {
    const r = leasingBreakdown({ amount: 30000, months: 48, annualKm: 15000, apport: 40000 });
    expect(r.financedBase).toBe(0);
    // Il reste les services, facturés indépendamment du financement.
    expect(r.monthly).toBe(LEASING_SERVICES_MONTHLY);
    expect(r.total).toBeGreaterThan(0);
  });

  it('reste positif et fini sur tout le domaine des curseurs', () => {
    for (let amount = 10000; amount <= 150000; amount += 10000) {
      for (const months of [24, 30, 36, 42, 48, 54, 60]) {
        for (const annualKm of [5000, 15000, 25000, 35000, 45000]) {
          const r = leasingBreakdown({ amount, months, annualKm, apport: 0 });
          expect(Number.isFinite(r.total)).toBe(true);
          expect(r.monthly).toBeGreaterThan(0);
          expect(r.total).toBeGreaterThanOrEqual(r.monthly);
        }
      }
    }
  });
});
