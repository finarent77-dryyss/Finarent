'use client';
import GenericLoanSimulator from './_GenericLoanSimulator';
export default function CreditConsoSimulator() {
  return (
    <GenericLoanSimulator
      slug="credit-consommation"
      minAmount={500} maxAmount={75000} stepAmount={500}
      minMonths={6} maxMonths={84} stepMonths={6}
      defaultAmount={10000} defaultMonths={48} defaultRate={6.5}
      rateMin={2} rateMax={21}
      rateLabel="Taux nominal annuel (TAN)"
      rateNote="Taux marché crédit conso : 4-9% selon profil et montant"
      contextNote="Prêt personnel non affecté pour financer un projet, des travaux, un achat important."
    />
  );
}
