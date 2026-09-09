// Calculs LOA (Location avec Option d'Achat).
//
// Formules extraites telles quelles de components/simulators/working/LOASimulator.jsx,
// où elles vivaient en ligne dans des `useMemo` et n'étaient donc pas testables.
// Aucun changement de comportement : les montants affichés sont identiques.

import { monthlyPayment } from './pret.js';

/** Décomposition d'un contrat de LOA.
 *
 *  Le capital financé est le prix diminué de l'apport ET de la valeur
 *  résiduelle : le locataire ne finance pas la part qu'il rachètera (ou
 *  restituera) en fin de contrat.
 *
 *  Le premier loyer est majoré (standard marché : 15 %), les suivants sont au
 *  loyer standard — d'où le `months - 1` dans le coût total.
 *
 *  @param {object} params
 *  @param {number} params.amount   prix d'achat du véhicule en €
 *  @param {number} params.months   durée du contrat en mois
 *  @param {number} params.rate     taux nominal annuel en % (ex. 5.5)
 *  @param {number} params.residual valeur résiduelle en % du prix initial
 *  @param {number} [params.apport] apport versé à la signature en €
 *  @param {number} [params.firstPaymentMarkup] majoration du premier loyer en %
 *  @returns {{ residualValue: number, financedAmount: number, monthly: number,
 *              firstPayment: number, totalPaid: number, totalIfReturned: number }}
 */
export function loaBreakdown({
  amount,
  months,
  rate,
  residual,
  apport = 0,
  firstPaymentMarkup = 15,
}) {
  const residualValue = (amount * residual) / 100;
  const financedAmount = Math.max(amount - apport - residualValue, 0);
  const monthly = monthlyPayment(financedAmount, months, rate);
  const firstPayment = monthly * (1 + firstPaymentMarkup / 100);
  const totalPaid = apport + firstPayment + monthly * (months - 1) + residualValue;
  return {
    residualValue,
    financedAmount,
    monthly,
    firstPayment,
    totalPaid,
    // Sans levée de l'option d'achat, la valeur résiduelle n'est pas versée.
    totalIfReturned: totalPaid - residualValue,
  };
}
