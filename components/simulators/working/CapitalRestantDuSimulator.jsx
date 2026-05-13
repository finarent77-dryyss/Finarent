'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, amortizationSchedule, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function CapitalRestantDuSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);
  const [atMonth, setAtMonth] = useState(60);

  const schedule = useMemo(() => amortizationSchedule(amount, months, rate), [amount, months, rate]);
  const m = monthlyPayment(amount, months, rate);
  const row = schedule.find((r) => r.month === atMonth) || schedule[schedule.length - 1];
  const crd = row?.remaining || 0;
  const capitalRembourse = amount - crd;
  const pctRembourse = (capitalRembourse / amount) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Le Capital Restant Dû (CRD) est ce qu'il vous reste à rembourser à un instant T. Utile pour préparer un remboursement anticipé, un rachat de prêt ou calculer une indemnité.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté initial" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée totale" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
        <SliderInput label="CRD au mois n°" value={atMonth} onChange={setAtMonth} min={1} max={months} step={1} suffix={`/ ${months}`} format="number" accent="primary" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Capital restant dû" value={formatEUR(crd)} sub={`Au mois ${atMonth} (${Math.round(atMonth / 12 * 10) / 10} ans)`} accent="rose-600" large />
        <ResultCard label="Capital remboursé" value={formatEUR(capitalRembourse)} sub={`${pctRembourse.toFixed(1)}% du total`} accent="emerald-600" large />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Évolution du CRD</div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${pctRembourse}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>Mois 0 : {formatEUR(amount)}</span>
          <span className="font-bold text-emerald-700">{pctRembourse.toFixed(0)}% remboursé</span>
          <span>Mois {months} : 0€</span>
        </div>
      </div>

      <ResultCard label="Mensualité" value={formatEUR(m)} accent="primary" />

      <ConversionCTA simulatorName="capital-restant-du" params={{ amount, months, rate, atMonth, crd }} />
    </div>
  );
}
