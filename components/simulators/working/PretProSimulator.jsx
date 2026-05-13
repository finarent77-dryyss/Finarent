'use client';
import GenericLoanSimulator from './_GenericLoanSimulator';
export default function PretProSimulator() {
  return (
    <GenericLoanSimulator
      slug="pret-professionnel"
      minAmount={5000} maxAmount={2000000} stepAmount={1000}
      minMonths={12} maxMonths={180} stepMonths={12}
      defaultAmount={150000} defaultMonths={84} defaultRate={4.5}
      rateMin={2} rateMax={10}
      rateLabel="Taux nominal annuel"
      rateNote="Prêt professionnel bancaire : 3.5-6% selon profil entreprise"
      insuranceLabel="Taux assurance dirigeant (homme-clé)"
      defaultInsuranceRate={0.25}
      contextNote="Prêt amortissable classique pour financer le développement de votre activité. Intérêts déductibles."
    />
  );
}
