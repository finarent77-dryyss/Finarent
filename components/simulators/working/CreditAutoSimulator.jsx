'use client';
import GenericLoanSimulator from './_GenericLoanSimulator';
export default function CreditAutoSimulator() {
  return (
    <GenericLoanSimulator
      slug="credit-auto"
      minAmount={2000} maxAmount={100000} stepAmount={500}
      minMonths={12} maxMonths={84} stepMonths={6}
      defaultAmount={20000} defaultMonths={60} defaultRate={5.5}
      rateMin={2} rateMax={12}
      rateLabel="Taux nominal annuel"
      rateNote="Crédit auto neuf/occasion : 3-7% selon ancienneté véhicule"
      contextNote="Financement d'un véhicule (neuf ou occasion) en propriété. Vous êtes propriétaire dès le 1er jour."
    />
  );
}
