'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function MensualiteSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);
  const interest = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
        <SliderInput label="Montant emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux nominal annuel" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Mensualité" value={formatEUR(m)} sub="Hors assurance" accent="secondary" large />
        <ResultCard label="Coût total" value={formatEUR(cost)} sub={`Sur ${Math.round(months / 12)} ans`} accent="primary" />
        <ResultCard label="Intérêts" value={formatEUR(interest)} sub={`${((interest / amount) * 100).toFixed(1)}% du capital`} accent="accent" />
      </div>

      <ConversionCTA simulatorName="mensualite" params={{ amount, months, rate, monthlyPayment: m }} />
    </div>
  );
}
