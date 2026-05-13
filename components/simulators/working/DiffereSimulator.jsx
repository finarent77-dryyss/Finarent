'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Différé partiel ou total : reporter le début des remboursements. */
export default function DiffereSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);
  const [differeMonths, setDiffereMonths] = useState(12);
  const [differeType, setDiffereType] = useState('partiel'); // partiel | total

  // Intérêts mensuels pendant le différé
  const monthlyInterestOnly = Math.round((amount * rate) / 100 / 12);

  // Pendant différé partiel : on paye juste les intérêts. Pendant différé total : rien (intérêts capitalisés).
  const interestDuringDeferred = differeType === 'partiel'
    ? monthlyInterestOnly * differeMonths
    : 0; // capitalisés
  const capitalForRemainingMonths = differeType === 'partiel'
    ? amount
    : Math.round(amount * Math.pow(1 + rate / 100 / 12, differeMonths)); // capitalisation

  const remainingMonths = months - differeMonths;
  const m = useMemo(() => monthlyPayment(capitalForRemainingMonths, remainingMonths, rate), [capitalForRemainingMonths, remainingMonths, rate]);
  const totalCost = interestDuringDeferred + m * remainingMonths;
  const totalCostNormal = monthlyPayment(amount, months, rate) * months;
  const extraCost = totalCost - totalCostNormal;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Différé partiel : vous ne payez que les intérêts pendant N mois. Différé total : vous ne payez rien, mais les intérêts sont capitalisés (votre capital emprunté augmente).
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type de différé</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setDiffereType('partiel')} className={`p-4 rounded-2xl border-2 text-left transition ${differeType === 'partiel' ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}>
              <div className="font-bold text-primary">Différé partiel</div>
              <div className="text-xs text-gray-500 mt-1">Vous payez les intérêts pendant le différé.</div>
            </button>
            <button type="button" onClick={() => setDiffereType('total')} className={`p-4 rounded-2xl border-2 text-left transition ${differeType === 'total' ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}>
              <div className="font-bold text-primary">Différé total</div>
              <div className="text-xs text-gray-500 mt-1">Rien à payer, mais intérêts capitalisés.</div>
            </button>
          </div>
        </div>

        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée totale (avec différé)" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <SliderInput label="Durée du différé" value={differeMonths} onChange={setDiffereMonths} min={3} max={36} step={1} suffix="mois" format="number" accent="primary" />
        <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label={`Pendant les ${differeMonths} mois`} value={differeType === 'partiel' ? formatEUR(monthlyInterestOnly) + '/mois' : '0 €/mois'} sub={differeType === 'partiel' ? 'Intérêts seuls' : 'Rien à payer'} accent="amber-600" />
        <ResultCard label={`Après différé (${remainingMonths} mois)`} value={formatEUR(m) + '/mois'} sub="Capital + intérêts" accent="secondary" large />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Coût total du prêt" value={formatEUR(totalCost)} accent="primary" />
        <ResultCard label="Surcoût vs sans différé" value={formatEUR(extraCost)} sub={`${((extraCost / totalCostNormal) * 100).toFixed(1)}% en plus`} accent="rose-600" />
      </div>

      <ConversionCTA simulatorName="differe" params={{ amount, months, rate, differeMonths, differeType, m }} />
    </div>
  );
}
