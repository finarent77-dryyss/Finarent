'use client';

import { useState, useMemo } from 'react';
import { totalPremiumOnInitialCapital, annualPremiumOnInitialCapital } from '@/lib/simulators/calculations/assurance';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function AssuranceCapitalInitialSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(0.34);

  const annual = useMemo(() => annualPremiumOnInitialCapital(amount, rate), [amount, rate]);
  const monthly = Math.round(annual / 12);
  const total = useMemo(() => totalPremiumOnInitialCapital(amount, rate, months), [amount, rate, months]);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Assurance sur capital initial : la prime reste constante pendant toute la durée du prêt. C'est le mode utilisé par les assurances groupe bancaires (majoritaire).
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée du prêt" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux d'assurance annuel" value={rate} onChange={setRate} suffix="%" step={0.01} min={0.05} max={1.5} />
        <div className="text-xs text-gray-400">Bancaire groupe ~0,30 % · Délégation ~0,10–0,25 %</div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Cotisation mensuelle" value={formatEUR(monthly)} accent="secondary" large />
        <ResultCard label="Cotisation annuelle" value={formatEUR(annual)} accent="accent" />
        <ResultCard label="Coût total" value={formatEUR(total)} sub={`Sur ${Math.round(months / 12)} ans`} accent="primary" />
      </div>

      <ConversionCTA simulatorName="assurance-capital-initial" params={{ amount, months, rate, total }} />
    </div>
  );
}
