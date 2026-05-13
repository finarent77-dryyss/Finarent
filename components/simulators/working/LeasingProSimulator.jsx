'use client';
import GenericLoanSimulator from './_GenericLoanSimulator';
export default function LeasingProSimulator() {
  return (
    <GenericLoanSimulator
      slug="leasing-pro"
      minAmount={10000} maxAmount={500000} stepAmount={1000}
      minMonths={24} maxMonths={84} stepMonths={6}
      defaultAmount={80000} defaultMonths={48} defaultRate={4.2}
      rateMin={2.5} rateMax={8}
      rateLabel="Taux nominal annuel"
      rateNote="Taux marché leasing pro : 3-6% selon profil entreprise et durée"
      insuranceLabel={null}
      contextNote="Crédit-bail mobilier pour entreprise : machine, flotte, équipement. Loyers 100% déductibles du résultat imposable."
    />
  );
}
