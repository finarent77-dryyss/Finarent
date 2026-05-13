'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Modulation d'échéances : impact d'une variation +/- de la mensualité. */
export default function ModulationSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);
  const [modulation, setModulation] = useState(15); // % de variation

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const newMonthly = Math.round(m * (1 + modulation / 100));

  // Nouvelle durée avec mensualité modulée (in fine de durée)
  const r = rate / 100 / 12;
  let newMonths = months;
  if (newMonthly > 0 && newMonthly > amount * r) {
    newMonths = Math.ceil(-Math.log(1 - (amount * r) / newMonthly) / Math.log(1 + r));
  }
  const monthsDiff = months - newMonths;
  const newInterest = totalInterest(newMonthly, newMonths, amount);
  const baseInterest = totalInterest(m, months, amount);
  const interestDiff = baseInterest - newInterest;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        La modulation permet d'augmenter ou diminuer vos mensualités (généralement ±10% à ±30% selon contrat). Augmenter raccourcit la durée et économise des intérêts.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée initiale" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
        <SliderInput label="Modulation mensualité" value={modulation} onChange={setModulation} min={-30} max={30} step={1} suffix="%" format="number" accent="primary" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Mensualité initiale" value={formatEUR(m)} accent="primary" />
        <ResultCard label="Mensualité modulée" value={formatEUR(newMonthly)} sub={`${modulation > 0 ? '+' : ''}${modulation}%`} accent="secondary" large />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Nouvelle durée" value={`${newMonths} mois`} sub={`${monthsDiff > 0 ? '−' : '+'}${Math.abs(monthsDiff)} mois`} accent={monthsDiff > 0 ? 'emerald-600' : 'rose-600'} />
        <ResultCard label="Intérêts économisés" value={formatEUR(Math.abs(interestDiff))} sub={interestDiff > 0 ? 'Économie' : 'Surcoût'} accent={interestDiff > 0 ? 'emerald-600' : 'rose-600'} />
      </div>

      <ConversionCTA simulatorName="modulation-echeances" params={{ amount, months, rate, modulation, newMonthly }} />
    </div>
  );
}
