'use client';

import { useState, useMemo } from 'react';
import { totalPremiumOnInitialCapital, totalPremiumOnCrd, delegationSavings } from '@/lib/simulators/calculations/assurance';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function AssuranceEmprunteurSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [bankRate, setBankRate] = useState(0.36);
  const [delegationRate, setDelegationRate] = useState(0.14);

  const bankTotal = useMemo(() => totalPremiumOnInitialCapital(amount, bankRate, months), [amount, bankRate, months]);
  const delegationTotal = useMemo(() => totalPremiumOnInitialCapital(amount, delegationRate, months), [amount, delegationRate, months]);
  const crdTotal = useMemo(() => totalPremiumOnCrd(amount, delegationRate, months), [amount, delegationRate, months]);
  const savings = useMemo(() => delegationSavings({ amount, months, bankRate, delegationRate }), [amount, months, bankRate, delegationRate]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée du prêt" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Taux assurance bancaire" value={bankRate} onChange={setBankRate} suffix="%" step={0.01} min={0.01} max={1.5} />
          <NumberInput label="Taux délégation (externe)" value={delegationRate} onChange={setDelegationRate} suffix="%" step={0.01} min={0.01} max={1.5} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-100 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
            <i className="fa-solid fa-piggy-bank text-2xl"></i>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-emerald-700">Économies grâce à la délégation</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">{formatEUR(savings.savings)}</div>
            <div className="text-sm text-emerald-700">soit <strong>{savings.pct}%</strong> de moins que l'assurance bancaire</div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Assurance bancaire (totale)" value={formatEUR(bankTotal)} sub={`Sur ${Math.round(months / 12)} ans`} accent="rose-600" />
        <ResultCard label="Délégation (totale)" value={formatEUR(delegationTotal)} sub={`Sur ${Math.round(months / 12)} ans`} accent="emerald-600" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Mensualité assurance (bancaire)" value={formatEUR(bankTotal / months)} accent="primary" />
        <ResultCard label="Sur CRD (estimation)" value={formatEUR(crdTotal)} sub="Si calculé sur capital restant dû" accent="accent" />
      </div>

      <ConversionCTA simulatorName="assurance-emprunteur" params={{ amount, months, bankRate, delegationRate, savings: savings.savings }} />
    </div>
  );
}
