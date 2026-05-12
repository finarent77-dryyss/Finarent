'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Met en évidence le rapport capital / intérêts via une barre proportionnelle. */
export default function CoutCreditSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.34);

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const interestCost = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);
  const insuranceCost = useMemo(() => Math.round((amount * insuranceRate / 100) * (months / 12)), [amount, insuranceRate, months]);
  const grandTotal = amount + interestCost + insuranceCost;
  const pctCapital = (amount / grandTotal) * 100;
  const pctInterest = (interestCost / grandTotal) * 100;
  const pctInsurance = (insuranceCost / grandTotal) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
          <NumberInput label="Taux assurance" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Coût global de l'emprunt</div>
        <div className="text-4xl sm:text-5xl font-black text-primary mb-6">{formatEUR(grandTotal)}</div>

        {/* Barre proportionnelle */}
        <div className="space-y-2 mb-6">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div className="bg-emerald-500" style={{ width: `${pctCapital}%` }} title="Capital" />
            <div className="bg-amber-500" style={{ width: `${pctInterest}%` }} title="Intérêts" />
            <div className="bg-rose-500" style={{ width: `${pctInsurance}%` }} title="Assurance" />
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" />Capital ({pctCapital.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" />Intérêts ({pctInterest.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500" />Assurance ({pctInsurance.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <ResultCard label="Capital remboursé" value={formatEUR(amount)} accent="emerald-600" />
          <ResultCard label="Intérêts" value={formatEUR(interestCost)} accent="amber-600" />
          <ResultCard label="Assurance" value={formatEUR(insuranceCost)} accent="rose-600" />
        </div>
      </div>

      <ConversionCTA simulatorName="cout-credit" params={{ amount, months, rate, totalCost: grandTotal }} />
    </div>
  );
}
