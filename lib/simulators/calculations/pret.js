// Calculs centralisés pour les simulateurs de prêt.
// Toutes les formules sont mutualisées ici pour éviter les
// duplications entre /credit-immobilier/mensualite, /cout-credit,
// /amortissement, etc.

/** Mensualité d'un prêt amortissable (formule PMT).
 *  @param {number} amount   capital emprunté en €
 *  @param {number} months   durée en mois
 *  @param {number} annualRate taux nominal annuel en % (ex. 3.5 pour 3,5 %)
 *  @returns {number} mensualité arrondie à l'euro
 */
export function monthlyPayment(amount, months, annualRate) {
  if (!amount || !months) return 0;
  if (!annualRate) return Math.round(amount / months);
  const r = annualRate / 100 / 12;
  const m = (amount * r) / (1 - Math.pow(1 + r, -months));
  return Math.round(m);
}

/** Coût total d'un prêt (mensualité × durée). */
export function totalCost(monthly, months) {
  return Math.round(monthly * months);
}

/** Coût des intérêts uniquement (coût total − capital). */
export function totalInterest(monthly, months, amount) {
  return Math.max(0, Math.round(monthly * months - amount));
}

/** Tableau d'amortissement complet.
 *  @returns Array<{ month, payment, principal, interest, remaining }>
 */
export function amortizationSchedule(amount, months, annualRate) {
  if (!amount || !months) return [];
  const m = monthlyPayment(amount, months, annualRate);
  const r = annualRate / 100 / 12;
  const rows = [];
  let remaining = amount;
  for (let i = 1; i <= months; i++) {
    const interest = remaining * r;
    const principal = m - interest;
    remaining = Math.max(0, remaining - principal);
    rows.push({
      month: i,
      payment: Math.round(m),
      principal: Math.round(principal),
      interest: Math.round(interest),
      remaining: Math.round(remaining),
    });
  }
  return rows;
}

/** TAEG approximatif (taux + assurance + frais lissés). Simplifié. */
export function approximateTaeg({ amount, months, rate, insuranceRate = 0, fees = 0 }) {
  const m = monthlyPayment(amount, months, rate);
  const totalWithoutInsurance = totalCost(m, months);
  const insuranceCost = (amount * insuranceRate / 100) * (months / 12);
  const grandTotal = totalWithoutInsurance + insuranceCost + fees;
  // Equivalent rate that would produce this total (approximation)
  // Inverse PMT — Newton-Raphson sur deux itérations, suffisant pour démo
  const targetMonthly = grandTotal / months;
  let estimate = rate / 100 / 12;
  for (let i = 0; i < 50; i++) {
    const f = (amount * estimate) / (1 - Math.pow(1 + estimate, -months)) - targetMonthly;
    const fPrime = (amount * (1 - Math.pow(1 + estimate, -months) - estimate * months * Math.pow(1 + estimate, -months - 1))) / Math.pow(1 - Math.pow(1 + estimate, -months), 2);
    if (Math.abs(fPrime) < 1e-10) break;
    estimate = estimate - f / fPrime;
  }
  return Math.round(estimate * 12 * 10000) / 100; // en %, 2 décimales
}

/** Formatage € français */
export function formatEUR(n) {
  if (!Number.isFinite(n)) return '0 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

/** Format pourcentage */
export function formatPct(n, decimals = 2) {
  return (n || 0).toFixed(decimals).replace('.', ',') + ' %';
}
