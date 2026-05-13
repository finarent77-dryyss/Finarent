'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { totalPremiumOnInitialCapital } from '@/lib/simulators/calculations/assurance';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Optimisation à 2 emprunteurs : 2 profils avec leur taux + quotité spécifique. */
export default function CoEmprunteurSimulator() {
  const [amount, setAmount] = useState(250000);
  const [months, setMonths] = useState(240);
  const [age1, setAge1] = useState(35);
  const [rate1, setRate1] = useState(0.14);
  const [q1, setQ1] = useState(50);
  const [age2, setAge2] = useState(35);
  const [rate2, setRate2] = useState(0.16);
  const [q2, setQ2] = useState(50);

  const cost1 = useMemo(() => totalPremiumOnInitialCapital(amount * (q1 / 100), rate1, months), [amount, q1, rate1, months]);
  const cost2 = useMemo(() => totalPremiumOnInitialCapital(amount * (q2 / 100), rate2, months), [amount, q2, rate2, months]);
  const total = cost1 + cost2;
  const valid = q1 + q2 >= 100;

  // Calcul d'une quotité 100/100 pour comparaison
  const cost100_1 = useMemo(() => totalPremiumOnInitialCapital(amount, rate1, months), [amount, rate1, months]);
  const cost100_2 = useMemo(() => totalPremiumOnInitialCapital(amount, rate2, months), [amount, rate2, months]);
  const total100 = cost100_1 + cost100_2;
  const savings = total100 - total;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        À 2 emprunteurs, vous pouvez répartir les quotités selon vos profils : majoriser le plus à risque (âge, métier, santé). 50/50 = cotisation minimale. 100/100 = couverture totale.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-primary/20 p-5 space-y-4">
          <div className="font-bold text-primary flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center">1</span> Emprunteur 1</div>
          <NumberInput label="Âge" value={age1} onChange={setAge1} suffix="ans" step={1} min={18} max={75} />
          <NumberInput label="Taux assurance" value={rate1} onChange={setRate1} suffix="%" step={0.01} min={0.05} max={1.5} />
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Quotité</label>
            <div className="grid grid-cols-3 gap-1">
              {[50, 75, 100].map((q) => (
                <button key={q} type="button" onClick={() => setQ1(q)} className={`py-2 rounded-lg border-2 font-bold text-sm transition ${q1 === q ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-400'}`}>{q}%</button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border-2 border-accent/20 p-5 space-y-4">
          <div className="font-bold text-primary flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-accent text-white text-sm flex items-center justify-center">2</span> Emprunteur 2</div>
          <NumberInput label="Âge" value={age2} onChange={setAge2} suffix="ans" step={1} min={18} max={75} />
          <NumberInput label="Taux assurance" value={rate2} onChange={setRate2} suffix="%" step={0.01} min={0.05} max={1.5} />
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Quotité</label>
            <div className="grid grid-cols-3 gap-1">
              {[50, 75, 100].map((q) => (
                <button key={q} type="button" onClick={() => setQ2(q)} className={`py-2 rounded-lg border-2 font-bold text-sm transition ${q2 === q ? 'border-accent bg-accent/5 text-accent' : 'border-gray-200 text-gray-400'}`}>{q}%</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl p-4 border-2 text-sm ${valid ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
        <strong>Quotité totale : {q1 + q2}%</strong> — {valid ? '✓ Couverture conforme (≥100%)' : '✗ Insuffisante (somme < 100%)'}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label={`Coût Emprunteur 1`} value={formatEUR(cost1)} sub={`${q1}% à ${rate1}%`} accent="primary" />
        <ResultCard label={`Coût Emprunteur 2`} value={formatEUR(cost2)} sub={`${q2}% à ${rate2}%`} accent="accent" />
        <ResultCard label="Total" value={formatEUR(total)} sub={`vs 100/100 : économie ${formatEUR(savings)}`} accent="emerald-600" large />
      </div>

      <ConversionCTA simulatorName="co-emprunteur" params={{ amount, months, age1, q1, rate1, age2, q2, rate2, total }} />
    </div>
  );
}
