'use client';

import { useState, useMemo } from 'react';
import { borrowingCapacity, MAX_DEBT_RATIO } from '@/lib/simulators/calculations/capacite';
import { monthlyPayment, totalCost, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function CapaciteEmpruntSimulator() {
  const [income, setIncome] = useState(4500);
  const [currentDebts, setCurrentDebts] = useState(0);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);

  const capacity = useMemo(() => borrowingCapacity({ monthlyIncome: income, currentDebts, months, annualRate: rate }), [income, currentDebts, months, rate]);
  const m = useMemo(() => monthlyPayment(capacity.maxAmount, months, rate), [capacity.maxAmount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <NumberInput label="Revenus mensuels nets (foyer)" value={income} onChange={setIncome} suffix="€" step={100} min={500} />
          <NumberInput label="Crédits déjà en cours" value={currentDebts} onChange={setCurrentDebts} suffix="€" step={50} min={0} />
        </div>
        <SliderInput label="Durée souhaitée" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux nominal annuel" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
          Calcul basé sur le taux d'endettement maximal HCSF de <strong>{MAX_DEBT_RATIO}%</strong>.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Capacité d'emprunt" value={formatEUR(capacity.maxAmount)} sub={`À ${rate}% sur ${Math.round(months / 12)} ans`} accent="secondary" large />
        <ResultCard label="Mensualité maximale" value={formatEUR(capacity.maxMonthly)} sub="Plafond légal" accent="accent" large />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Coût total du crédit" value={formatEUR(cost)} accent="primary" />
        <ResultCard label="Reste pour vivre" value={formatEUR(income - capacity.maxMonthly - currentDebts)} sub="Après mensualités" accent="primary" />
      </div>

      <ConversionCTA simulatorName="capacite-emprunt" params={{ amount: capacity.maxAmount, months, rate, income }} />
    </div>
  );
}
