// Calculs assurance emprunteur.

/** Cotisation annuelle d'assurance sur capital initial.
 *  @param {number} amount     capital emprunté
 *  @param {number} rate       taux assurance (% annuel, ex. 0.36)
 *  @returns {number} cotisation annuelle (€)
 */
export function annualPremiumOnInitialCapital(amount, rate) {
  return Math.round((amount * rate) / 100);
}

/** Cotisation totale sur la durée du prêt (capital initial). */
export function totalPremiumOnInitialCapital(amount, rate, months) {
  return Math.round(annualPremiumOnInitialCapital(amount, rate) * (months / 12));
}

/** Cotisation totale sur CRD (capital restant dû).
 *  Approximation linéaire : (capital initial / 2) × taux × durée.
 *  Suffisant pour démo, à raffiner avec le tableau d'amortissement
 *  pour un calcul exact.
 */
export function totalPremiumOnCrd(amount, rate, months) {
  return Math.round((amount / 2) * (rate / 100) * (months / 12));
}

/** Économies générées par une délégation d'assurance.
 *  @returns {{ bank: number, delegation: number, savings: number, pct: number }}
 */
export function delegationSavings({ amount, months, bankRate, delegationRate }) {
  const bank = totalPremiumOnInitialCapital(amount, bankRate, months);
  const delegation = totalPremiumOnInitialCapital(amount, delegationRate, months);
  const savings = Math.max(0, bank - delegation);
  const pct = bank > 0 ? Math.round((savings / bank) * 100) : 0;
  return { bank, delegation, savings, pct };
}
