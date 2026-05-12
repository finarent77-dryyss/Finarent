// Capacité d'emprunt et taux d'endettement.
import { monthlyPayment } from './pret.js';

/** Plafond légal du taux d'endettement (HCSF). */
export const MAX_DEBT_RATIO = 35;

/** Capacité d'emprunt maximale.
 *  @param {number} monthlyIncome   revenus mensuels nets cumulés (€)
 *  @param {number} currentDebts    autres mensualités déjà engagées (€)
 *  @param {number} months          durée souhaitée du nouveau prêt (mois)
 *  @param {number} annualRate      taux nominal annuel (%)
 *  @param {number} debtRatio       taux d'endettement cible (%) — défaut 35
 *  @returns {{ maxMonthly: number, maxAmount: number, usableRatio: number }}
 */
export function borrowingCapacity({ monthlyIncome, currentDebts = 0, months, annualRate, debtRatio = MAX_DEBT_RATIO }) {
  if (!monthlyIncome || !months || !annualRate) {
    return { maxMonthly: 0, maxAmount: 0, usableRatio: debtRatio };
  }
  const maxMonthly = Math.max(0, (monthlyIncome * debtRatio) / 100 - currentDebts);
  // Inverse PMT pour retrouver le capital
  const r = annualRate / 100 / 12;
  const maxAmount = Math.round(maxMonthly * (1 - Math.pow(1 + r, -months)) / r);
  return {
    maxMonthly: Math.round(maxMonthly),
    maxAmount: Math.max(0, maxAmount),
    usableRatio: debtRatio,
  };
}

/** Taux d'endettement réel.
 *  @returns {{ ratio: number, status: 'safe'|'warning'|'danger' }}
 */
export function debtRatio({ monthlyIncome, monthlyCharges }) {
  if (!monthlyIncome) return { ratio: 0, status: 'safe' };
  const ratio = (monthlyCharges / monthlyIncome) * 100;
  const status = ratio <= 33 ? 'safe' : ratio <= 35 ? 'warning' : 'danger';
  return { ratio: Math.round(ratio * 10) / 10, status };
}

/** Reste à vivre. */
export function livingBudget({ monthlyIncome, monthlyCharges, householdSize = 1 }) {
  const net = Math.max(0, monthlyIncome - monthlyCharges);
  const perPerson = householdSize > 0 ? net / householdSize : net;
  // Seuils HCSF : ≥ 1000€/pers (seul) ou ≥ 700€/pers (couple+enfants), simplifié
  const threshold = householdSize === 1 ? 1000 : 700;
  const status = perPerson >= threshold ? 'safe' : perPerson >= threshold * 0.7 ? 'warning' : 'danger';
  return {
    total: Math.round(net),
    perPerson: Math.round(perPerson),
    threshold,
    status,
  };
}
