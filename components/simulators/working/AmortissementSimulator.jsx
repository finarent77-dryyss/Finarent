'use client';

import { useState } from 'react';
import { monthlyPayment, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import AmortizationTable from '@/components/simulators/AmortizationTable';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function AmortissementSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.30);

  const m = monthlyPayment(amount, months, rate);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Visualisez le détail mois par mois ou année par année de votre prêt : combien de capital, d'intérêts et d'assurance vous remboursez à chaque échéance.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
          <NumberInput label="Taux assurance" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1.5} />
        </div>
      </div>

      <ResultCard label="Mensualité (hors assurance)" value={formatEUR(m)} accent="secondary" large />

      <AmortizationTable amount={amount} months={months} rate={rate} insuranceRate={insuranceRate} />

      <ConversionCTA simulatorName="amortissement" params={{ amount, months, rate }} />
    </div>
  );
}
