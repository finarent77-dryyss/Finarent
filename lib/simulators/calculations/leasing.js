// Calculs leasing / LLD (Location Longue Durée), location pure sans option d'achat.
//
// Formules extraites telles quelles de components/simulators/working/LeasingSimulator.jsx,
// où elles vivaient en ligne dans un `useMemo` et n'étaient donc pas testables.
// Aucun changement de comportement : les montants affichés sont identiques.

/** Coefficient de loyer mensuel, en fraction du prix du véhicule.
 *  Barème simplifié : plus le contrat est long, plus le coefficient baisse.
 *  @param {number} months durée du contrat en mois
 *  @returns {number} ex. 0.017 pour 1,7 % du prix par mois
 */
export function leasingCoefficient(months) {
  if (months <= 24) return 0.022;
  if (months <= 36) return 0.019;
  if (months <= 48) return 0.017;
  return 0.015;
}

/** Supplément mensuel lié au kilométrage, au-delà du forfait de 15 000 km/an.
 *  @param {number} annualKm kilométrage annuel prévu
 *  @returns {number} supplément mensuel en €
 */
export function leasingKmAdjustment(annualKm) {
  return annualKm > 15000 ? ((annualKm - 15000) * 0.002) / 12 : 0;
}

/** Coût mensuel du pack services (entretien, assurance, assistance, pneus). */
export const LEASING_SERVICES_MONTHLY = 80;

/** Décomposition d'un contrat de leasing / LLD.
 *
 *  Le premier loyer est majoré (standard marché : 15 %), les suivants sont au
 *  loyer standard — d'où le `months - 1` dans le coût total.
 *
 *  @param {object} params
 *  @param {number} params.amount    prix du véhicule neuf en €
 *  @param {number} params.months    durée du contrat en mois
 *  @param {number} params.annualKm  kilométrage annuel prévu
 *  @param {boolean} [params.services] pack services inclus
 *  @param {number} [params.apport]  apport versé à la signature en €
 *  @param {number} [params.firstPaymentMarkup] majoration du premier loyer en %
 *  @returns {{ baseCoeff: number, kmAdjust: number, servicesAmount: number,
 *              financedBase: number, monthly: number, firstPayment: number, total: number }}
 */
export function leasingBreakdown({
  amount,
  months,
  annualKm,
  services = true,
  apport = 0,
  firstPaymentMarkup = 15,
}) {
  const baseCoeff = leasingCoefficient(months);
  const kmAdjust = leasingKmAdjustment(annualKm);
  const servicesAmount = services ? LEASING_SERVICES_MONTHLY : 0;
  // L'apport réduit la base financée.
  const financedBase = Math.max(amount - apport, 0);
  const monthly = Math.round(financedBase * baseCoeff + kmAdjust + servicesAmount);
  const firstPayment = Math.round(monthly * (1 + firstPaymentMarkup / 100));
  const total = apport + firstPayment + monthly * (months - 1);
  return { baseCoeff, kmAdjust, servicesAmount, financedBase, monthly, firstPayment, total };
}
