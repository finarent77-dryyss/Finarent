'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalInterest, amortizationSchedule, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function RemboursementAnticipeSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);
  const [atMonth, setAtMonth] = useState(60);
  const [advanceAmount, setAdvanceAmount] = useState(50000);

  const schedule = useMemo(() => amortizationSchedule(amount, months, rate), [amount, months, rate]);
  const m = monthlyPayment(amount, months, rate);
  const baseInterest = totalInterest(m, months, amount);

  const row = schedule.find((r) => r.month === atMonth);
  const crdAtMonth = row?.remaining || 0;
  const effectiveAdvance = Math.min(advanceAmount, crdAtMonth);
  const newCrd = crdAtMonth - effectiveAdvance;

  // Nouvelle mensualité maintenue, mais durée raccourcie
  const remainingMonths = months - atMonth;
  // Calculer durée restante avec le nouveau CRD à mensualité constante
  let newRemainingMonths = remainingMonths;
  if (newCrd > 0 && m > 0) {
    const r = rate / 100 / 12;
    newRemainingMonths = Math.ceil(-Math.log(1 - (newCrd * r) / m) / Math.log(1 + r));
  } else {
    newRemainingMonths = 0;
  }
  const monthsSaved = remainingMonths - newRemainingMonths;
  // Indemnité de remboursement anticipé : 3% du capital remboursé ou 6 mois d'intérêts, le plus petit (loi française)
  const indemnity = Math.min(effectiveAdvance * 0.03, 6 * (crdAtMonth * rate / 100 / 12));
  // Économies en intérêts
  const interestSaved = monthsSaved * (m - effectiveAdvance / newRemainingMonths);
  const netSavings = Math.max(0, interestSaved - indemnity);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Calculez les économies réelles d'un remboursement anticipé (RA), après déduction de l'indemnité de remboursement anticipé légalement plafonnée à 3% du capital remboursé ou 6 mois d'intérêts.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital initial du prêt" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée totale" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
        <SliderInput label="RA effectué au mois n°" value={atMonth} onChange={setAtMonth} min={6} max={months - 6} step={1} suffix={`/ ${months}`} format="number" accent="primary" />
        <SliderInput label="Montant remboursé en avance" value={advanceAmount} onChange={setAdvanceAmount} min={1000} max={Math.max(crdAtMonth, 1000)} step={1000} accent="emerald-500" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Économies brutes" value={formatEUR(Math.round(interestSaved))} sub="Intérêts évités" accent="emerald-600" />
        <ResultCard label="Indemnité (IRA)" value={formatEUR(Math.round(indemnity))} sub="À payer à la banque" accent="rose-600" />
        <ResultCard label="Gain net" value={formatEUR(Math.round(netSavings))} sub="Après indemnité" accent="secondary" large />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Mois économisés" value={`${monthsSaved} mois`} sub={`Soit ${(monthsSaved / 12).toFixed(1)} ans`} accent="accent" />
        <ResultCard label="CRD après RA" value={formatEUR(newCrd)} accent="primary" />
      </div>

      <ConversionCTA simulatorName="remboursement-anticipe" params={{ amount, months, rate, atMonth, advanceAmount, netSavings: Math.round(netSavings) }} />
    </div>
  );
}
