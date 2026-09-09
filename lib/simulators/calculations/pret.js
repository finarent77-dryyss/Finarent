// Calculs centralisés pour les simulateurs de prêt.
// Toutes les formules sont mutualisées ici pour éviter les
// duplications entre /credit-immobilier/mensualite, /cout-credit,
// /amortissement, etc.

/** Mensualité d'un prêt amortissable (formule PMT).
 *  @param {number} amount   capital emprunté en €
 *  @param {number} months   durée en mois
 *  @param {number} annualRate taux nominal annuel en % (ex. 3.5 pour 3,5 %)
 *  @returns {number} mensualité arrondie à l'euro, jamais négative
 */
export function monthlyPayment(amount, months, annualRate) {
  const capital = Number(amount);
  const duree = Number(months);
  // Bornes d'entrée : un apport supérieur au prix rend le capital financé
  // négatif dans plusieurs simulateurs (LOA, apport personnel). Sans borne, la
  // formule PMT propageait le signe et affichait une mensualité négative.
  if (!Number.isFinite(capital) || !Number.isFinite(duree)) return 0;
  if (capital <= 0 || duree <= 0) return 0;

  const taux = Number(annualRate);
  if (!Number.isFinite(taux) || taux === 0) return Math.round(capital / duree);

  const r = taux / 100 / 12;
  const m = (capital * r) / (1 - Math.pow(1 + r, -duree));
  if (!Number.isFinite(m)) return 0;
  return Math.max(0, Math.round(m));
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

/** Mensualité théorique (non arrondie) pour un taux périodique donné.
 *
 *  Passage à la limite en i → 0 : (capital × i) / (1 − (1+i)^−n) tend vers
 *  capital / n. C'est exactement le point où l'ancienne inversion par
 *  Newton-Raphson divisait par zéro et rendait NaN.
 */
function mensualiteAuTauxPeriodique(capital, duree, i) {
  if (Math.abs(i) < 1e-12) return capital / duree;
  return (capital * i) / (1 - Math.pow(1 + i, -duree));
}

/** TAEG approximatif (taux nominal + assurance + frais lissés). Simplifié.
 *
 *  Le taux périodique équivalent est trouvé par dichotomie : la mensualité est
 *  strictement croissante en i, la recherche est donc sûre et bornée, sans la
 *  singularité en i = 0 de l'inversion de Newton-Raphson.
 *
 *  @returns {number} TAEG en %, deux décimales, ou NaN si non calculable
 *           (durée nulle). `formatPct` affiche alors « — » et non « 0,00 % ».
 */
export function approximateTaeg({ amount, months, rate, insuranceRate = 0, fees = 0 }) {
  const capital = Number(amount);
  const duree = Number(months);
  const taux = Number(rate) || 0;

  // Sans durée, aucun taux périodique n'a de sens : on refuse de répondre
  // plutôt que d'annoncer un TAEG nul, qui serait lu comme un crédit gratuit.
  if (!Number.isFinite(duree) || duree <= 0) return NaN;
  if (!Number.isFinite(capital)) return NaN;
  // Sans capital, le TAEG se confond avec le taux nominal.
  if (capital <= 0) return Math.round(taux * 100) / 100;

  const m = monthlyPayment(capital, duree, taux);
  const totalHorsAssurance = totalCost(m, duree);
  const coutAssurance = (capital * (Number(insuranceRate) || 0) / 100) * (duree / 12);
  const grandTotal = totalHorsAssurance + coutAssurance + (Number(fees) || 0);
  const mensualiteCible = grandTotal / duree;
  if (!Number.isFinite(mensualiteCible)) return NaN;

  // Coût total inférieur ou égal au capital : financement gratuit (taux nominal
  // nul et aucun frais), ou simple effet de l'arrondi à l'euro de la mensualité.
  // Le plancher est alors 0 %, et non un TAEG négatif.
  if (mensualiteAuTauxPeriodique(capital, duree, 0) >= mensualiteCible) return 0;

  let bas = 0;
  let haut = 1; // 100 % par mois : très au-delà de toute offre réelle
  while (mensualiteAuTauxPeriodique(capital, duree, haut) < mensualiteCible && haut < 1e6) {
    haut *= 2;
  }
  for (let i = 0; i < 100; i++) {
    const milieu = (bas + haut) / 2;
    if (mensualiteAuTauxPeriodique(capital, duree, milieu) < mensualiteCible) bas = milieu;
    else haut = milieu;
  }
  const estimate = (bas + haut) / 2;
  return Math.round(estimate * 12 * 10000) / 100; // en %, 2 décimales
}

const FORMAT_EUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** Formatage € français.
 *  Le repli passe par le même formateur que le cas nominal : écrit en dur,
 *  « 0 € » utilisait une espace ordinaire là où Intl produit une insécable, et
 *  `formatEUR(NaN)` différait de `formatEUR(0)` à l'octet près.
 */
export function formatEUR(n) {
  if (!Number.isFinite(n)) return FORMAT_EUR.format(0);
  return FORMAT_EUR.format(n);
}

/** Format pourcentage.
 *  Une valeur non calculable (NaN, absente, non numérique) s'affiche « — » :
 *  la replier sur « 0,00 % » présentait un calcul raté comme un taux nul,
 *  c'est-à-dire comme une offre gratuite.
 */
export function formatPct(n, decimals = 2) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  return n.toFixed(decimals).replace('.', ',') + ' %';
}
