import { describe, it, expect } from 'vitest';
import { monthlyPayment } from '@/lib/simulators/calculations/pret.js';
import {
  MAX_DEBT_RATIO,
  borrowingCapacity,
  debtRatio,
  livingBudget,
} from '@/lib/simulators/calculations/capacite.js';

/**
 * Capacité d'emprunt, taux d'endettement, reste à vivre : les trois chiffres
 * qu'un prospect retient. Les seuils encodés ici sont réglementaires (HCSF),
 * pas décoratifs — un seuil qui glisse fausse une orientation commerciale.
 */

describe('borrowingCapacity', () => {
  it('applique le plafond HCSF de 35 % par défaut', () => {
    expect(MAX_DEBT_RATIO).toBe(35);
    const { maxMonthly } = borrowingCapacity({
      monthlyIncome: 3000,
      months: 240,
      annualRate: 3.5,
    });
    expect(maxMonthly).toBe(1050); // 35 % de 3 000 €
  });

  it('déduit les mensualités déjà engagées', () => {
    const { maxMonthly } = borrowingCapacity({
      monthlyIncome: 3000,
      currentDebts: 400,
      months: 240,
      annualRate: 3.5,
    });
    expect(maxMonthly).toBe(650);
  });

  it('ne descend jamais sous zéro quand les dettes dépassent le plafond', () => {
    const { maxMonthly, maxAmount } = borrowingCapacity({
      monthlyIncome: 2000,
      currentDebts: 1500,
      months: 240,
      annualRate: 3.5,
    });
    expect(maxMonthly).toBe(0);
    expect(maxAmount).toBe(0);
  });

  it('retourne une capacité nulle si un paramètre essentiel manque', () => {
    expect(borrowingCapacity({ monthlyIncome: 0, months: 240, annualRate: 3.5 }).maxAmount).toBe(0);
    expect(borrowingCapacity({ monthlyIncome: 3000, months: 0, annualRate: 3.5 }).maxAmount).toBe(0);
    expect(borrowingCapacity({ monthlyIncome: 3000, months: 240, annualRate: 0 }).maxAmount).toBe(0);
  });

  it('est bien l inverse de la mensualité : réemprunter le capital max redonne la mensualité max', () => {
    const { maxMonthly, maxAmount } = borrowingCapacity({
      monthlyIncome: 4200,
      months: 300,
      annualRate: 3.2,
    });
    const verification = monthlyPayment(maxAmount, 300, 3.2);
    // Un euro d écart admis, dû aux arrondis de part et d autre.
    expect(Math.abs(verification - maxMonthly)).toBeLessThanOrEqual(1);
  });

  it('accepte un taux d endettement dérogatoire', () => {
    const { maxMonthly, usableRatio } = borrowingCapacity({
      monthlyIncome: 3000,
      months: 240,
      annualRate: 3.5,
      debtRatio: 40,
    });
    expect(usableRatio).toBe(40);
    expect(maxMonthly).toBe(1200);
  });
});

describe('debtRatio', () => {
  it('classe en « safe » jusqu à 33 % inclus', () => {
    expect(debtRatio({ monthlyIncome: 3000, monthlyCharges: 990 })).toEqual({
      ratio: 33,
      status: 'safe',
    });
  });

  it('classe en « warning » entre 33 et 35 % inclus', () => {
    expect(debtRatio({ monthlyIncome: 3000, monthlyCharges: 1020 }).status).toBe('warning');
    expect(debtRatio({ monthlyIncome: 3000, monthlyCharges: 1050 }).status).toBe('warning');
  });

  it('classe en « danger » au-delà de 35 %', () => {
    expect(debtRatio({ monthlyIncome: 3000, monthlyCharges: 1080 })).toEqual({
      ratio: 36,
      status: 'danger',
    });
  });

  it('ne divise pas par zéro quand le revenu est absent', () => {
    expect(debtRatio({ monthlyIncome: 0, monthlyCharges: 500 })).toEqual({
      ratio: 0,
      status: 'safe',
    });
  });

  it('arrondit au dixième de point', () => {
    expect(debtRatio({ monthlyIncome: 3000, monthlyCharges: 1000 }).ratio).toBe(33.3);
  });
});

describe('livingBudget', () => {
  it('applique le seuil de 1 000 € pour une personne seule', () => {
    const r = livingBudget({ monthlyIncome: 3000, monthlyCharges: 1000, householdSize: 1 });
    expect(r).toEqual({ total: 2000, perPerson: 2000, threshold: 1000, status: 'safe' });
  });

  it('applique le seuil de 700 € par personne dès deux occupants', () => {
    const r = livingBudget({ monthlyIncome: 3000, monthlyCharges: 1000, householdSize: 4 });
    expect(r.threshold).toBe(700);
    expect(r.perPerson).toBe(500);
    expect(r.status).toBe('warning'); // 500 ≥ 490, soit 70 % du seuil
  });

  it('bascule en danger sous 70 % du seuil', () => {
    const r = livingBudget({ monthlyIncome: 3000, monthlyCharges: 2800, householdSize: 4 });
    expect(r.perPerson).toBe(50);
    expect(r.status).toBe('danger');
  });

  it('ne produit jamais un reste à vivre négatif', () => {
    const r = livingBudget({ monthlyIncome: 1000, monthlyCharges: 2500 });
    expect(r.total).toBe(0);
    expect(r.status).toBe('danger');
  });
});
