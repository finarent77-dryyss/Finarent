'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Comparaison taux fixe vs variable avec scénario hausse. */
export default function FixeVsVariableSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [fixedRate, setFixedRate] = useState(3.8);
  const [variableRate, setVariableRate] = useState(3.2);
  const [stressVariableRate, setStressVariableRate] = useState(5.5);

  const mFixed = useMemo(() => monthlyPayment(amount, months, fixedRate), [amount, months, fixedRate]);
  const mVariable = useMemo(() => monthlyPayment(amount, months, variableRate), [amount, months, variableRate]);
  const mStressed = useMemo(() => monthlyPayment(amount, months, stressVariableRate), [amount, months, stressVariableRate]);

  const intFixed = totalInterest(mFixed, months, amount);
  const intVariable = totalInterest(mVariable, months, amount);
  const intStressed = totalInterest(mStressed, months, amount);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Comparez taux fixe (sécurité) vs taux variable (souvent plus bas mais évolutif). Le scénario de stress simule une hausse brutale du taux variable.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-3 gap-4">
          <NumberInput label="Taux fixe" value={fixedRate} onChange={setFixedRate} suffix="%" step={0.05} min={1} max={10} />
          <NumberInput label="Taux variable initial" value={variableRate} onChange={setVariableRate} suffix="%" step={0.05} min={1} max={10} />
          <NumberInput label="Taux variable stressé" value={stressVariableRate} onChange={setStressVariableRate} suffix="%" step={0.05} min={1} max={15} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5">
          <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">Taux fixe</div>
          <div className="text-2xl font-black text-emerald-700">{formatEUR(mFixed)}/mois</div>
          <div className="text-xs text-gray-500 mt-2">Intérêts totaux : {formatEUR(intFixed)}</div>
          <div className="text-xs text-emerald-700 mt-1 font-semibold">✓ Mensualité garantie</div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-blue-200 p-5">
          <div className="text-xs uppercase tracking-widest font-bold text-blue-700 mb-2">Variable (initial)</div>
          <div className="text-2xl font-black text-blue-700">{formatEUR(mVariable)}/mois</div>
          <div className="text-xs text-gray-500 mt-2">Intérêts totaux : {formatEUR(intVariable)}</div>
          <div className="text-xs text-blue-700 mt-1 font-semibold">↘ {formatEUR(mFixed - mVariable)}/mois vs fixe</div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-rose-200 p-5">
          <div className="text-xs uppercase tracking-widest font-bold text-rose-700 mb-2">Variable (stressé)</div>
          <div className="text-2xl font-black text-rose-700">{formatEUR(mStressed)}/mois</div>
          <div className="text-xs text-gray-500 mt-2">Intérêts totaux : {formatEUR(intStressed)}</div>
          <div className="text-xs text-rose-700 mt-1 font-semibold">↗ {formatEUR(mStressed - mFixed)}/mois vs fixe</div>
        </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
        <div className="font-bold mb-1">📊 Notre analyse</div>
        Le taux variable est gagnant tant que la hausse moyenne reste sous {((fixedRate - variableRate) * 100 / 100).toFixed(2)} pts. Au-delà du scénario stressé ({stressVariableRate}%), le coût total dépasse le fixe de {formatEUR(intStressed - intFixed)}.
      </div>

      <ConversionCTA simulatorName="fixe-vs-variable" params={{ amount, months, fixedRate, variableRate, stressVariableRate }} />
    </div>
  );
}
