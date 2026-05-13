'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { totalPremiumOnInitialCapital } from '@/lib/simulators/calculations/assurance';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

const QUOTITY_OPTIONS = [50, 75, 100];

export default function QuotiteSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(0.34);
  const [q1, setQ1] = useState(100);
  const [q2, setQ2] = useState(0);

  const cost1 = useMemo(() => totalPremiumOnInitialCapital(amount * (q1 / 100), rate, months), [amount, q1, rate, months]);
  const cost2 = useMemo(() => totalPremiumOnInitialCapital(amount * (q2 / 100), rate, months), [amount, q2, rate, months]);
  const totalQuotity = q1 + q2;
  const valid = totalQuotity >= 100;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        La quotité est la part du capital couverte en cas de décès / invalidité totale d'un emprunteur. La somme des quotités doit toujours être ≥ 100%. Choix typiques : 100/100 (sécurité max) ou 50/50 (cotisation minimale).
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux assurance" value={rate} onChange={setRate} suffix="%" step={0.01} min={0.05} max={1.5} />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Quotité Emprunteur 1</label>
          <div className="grid grid-cols-3 gap-2">
            {QUOTITY_OPTIONS.map((q) => (
              <button key={q} type="button" onClick={() => setQ1(q)} className={`py-3 rounded-xl border-2 font-bold transition ${q1 === q ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>{q} %</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Quotité Emprunteur 2 (co-emprunteur)</label>
          <div className="grid grid-cols-4 gap-2">
            <button type="button" onClick={() => setQ2(0)} className={`py-3 rounded-xl border-2 font-bold transition ${q2 === 0 ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>0 %</button>
            {QUOTITY_OPTIONS.map((q) => (
              <button key={q} type="button" onClick={() => setQ2(q)} className={`py-3 rounded-xl border-2 font-bold transition ${q2 === q ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>{q} %</button>
            ))}
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-5 border-2 ${valid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className={`text-xs uppercase tracking-widest font-bold ${valid ? 'text-emerald-700' : 'text-rose-700'} mb-1`}>
          Quotité totale : {totalQuotity}%
        </div>
        <div className={`text-sm ${valid ? 'text-emerald-700' : 'text-rose-700'}`}>
          {valid ? '✓ Couverture valide (≥ 100%)' : '✗ Couverture insuffisante : la somme doit être ≥ 100%'}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label={`Emprunteur 1 (${q1}%)`} value={formatEUR(cost1)} accent="secondary" />
        <ResultCard label={`Emprunteur 2 (${q2}%)`} value={formatEUR(cost2)} accent="accent" />
      </div>

      <ResultCard label="Coût total assurance" value={formatEUR(cost1 + cost2)} accent="primary" large />

      <ConversionCTA simulatorName="quotite" params={{ amount, months, q1, q2, total: cost1 + cost2 }} />
    </div>
  );
}
