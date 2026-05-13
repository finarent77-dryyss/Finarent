'use client';

import { useState, useMemo } from 'react';
import { delegationSavings } from '@/lib/simulators/calculations/assurance';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function ComparateurAssuranceSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [bankRate, setBankRate] = useState(0.36);
  const [delegationRate, setDelegationRate] = useState(0.14);

  const savings = useMemo(
    () => delegationSavings({ amount, months, bankRate, delegationRate }),
    [amount, months, bankRate, delegationRate],
  );

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Loi Lemoine (2022) : vous pouvez changer d'assurance emprunteur à tout moment, sans frais. Économies moyennes : 5 000 à 15 000 € sur la durée du prêt.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée du prêt" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Assurance bancaire (taux)" value={bankRate} onChange={setBankRate} suffix="%" step={0.01} min={0.05} max={1.5} />
          <NumberInput label="Délégation (taux)" value={delegationRate} onChange={setDelegationRate} suffix="%" step={0.01} min={0.05} max={1.5} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-2xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-3xl">
            💰
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-emerald-700">Économie potentielle</div>
            <div className="text-4xl font-black text-emerald-600">{formatEUR(savings.savings)}</div>
            <div className="text-sm text-emerald-700">soit <strong>{savings.pct}%</strong> de moins</div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-rose-200 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-widest font-bold text-rose-700 mb-2">Assurance bancaire</div>
          <div className="text-3xl font-black text-rose-700">{formatEUR(savings.bank)}</div>
          <div className="text-sm text-gray-500 mt-2">{formatEUR(Math.round(savings.bank / months))}/mois</div>
        </div>
        <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5">
          <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">Délégation externe</div>
          <div className="text-3xl font-black text-emerald-700">{formatEUR(savings.delegation)}</div>
          <div className="text-sm text-gray-500 mt-2">{formatEUR(Math.round(savings.delegation / months))}/mois</div>
        </div>
      </div>

      <ConversionCTA simulatorName="comparateur-assurance" params={{ amount, months, bankRate, delegationRate, savings: savings.savings }} />
    </div>
  );
}
