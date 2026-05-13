'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Prêt relais : financement temporaire en attendant la vente du bien actuel. */
export default function PretRelaisSimulator() {
  const [propertyValue, setPropertyValue] = useState(350000);
  const [quotity, setQuotity] = useState(70); // % de la valeur estimée
  const [months, setMonths] = useState(18);
  const [rate, setRate] = useState(4.5);

  const loanAmount = (propertyValue * quotity) / 100;
  const monthlyInterest = useMemo(() => Math.round((loanAmount * rate) / 100 / 12), [loanAmount, rate]);
  const totalInterest = monthlyInterest * months;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Prêt relais : financement court terme (12-24 mois) pour acheter un nouveau bien avant d'avoir vendu l'ancien. Remboursement « in fine » : seuls les intérêts mensuels, le capital est remboursé en une fois à la vente.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Valeur estimée du bien à vendre" value={propertyValue} onChange={setPropertyValue} min={50000} max={2000000} step={10000} accent="secondary" />
        <SliderInput label="Quotité financée (% de la valeur)" value={quotity} onChange={setQuotity} min={50} max={80} step={1} suffix="%" format="number" accent="accent" />
        <SliderInput label="Durée du prêt relais" value={months} onChange={setMonths} min={6} max={24} step={1} suffix="mois" format="number" accent="primary" />
        <NumberInput label="Taux nominal annuel" value={rate} onChange={setRate} suffix="%" step={0.05} min={2} max={10} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Capital relais" value={formatEUR(loanAmount)} sub={`${quotity}% de ${formatEUR(propertyValue)}`} accent="secondary" large />
        <ResultCard label="Mensualité d'intérêts" value={formatEUR(monthlyInterest)} sub="In fine — capital remboursé à la vente" accent="accent" large />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Coût total intérêts" value={formatEUR(totalInterest)} accent="primary" />
        <ResultCard label="Reste à percevoir à la vente" value={formatEUR(propertyValue - loanAmount)} sub="Pour votre nouveau projet" accent="emerald-600" />
      </div>

      <ConversionCTA simulatorName="pret-relais" params={{ propertyValue, quotity, months, rate, loanAmount }} />
    </div>
  );
}
