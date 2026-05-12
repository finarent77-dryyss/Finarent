'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import { LoanTypeSelector } from '@/components/simulators/TypeSelector';
import AmortizationTable from '@/components/simulators/AmortizationTable';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function MensualiteSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [loanType, setLoanType] = useState('immobilier');
  const [rate, setRate] = useState(4);
  const [insuranceRate, setInsuranceRate] = useState(0.30);

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);
  const interest = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);
  const monthlyInsurance = Math.round((amount * insuranceRate / 100) / 12);
  const totalMonthly = m + monthlyInsurance;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
        <SliderInput label="Montant emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <LoanTypeSelector value={loanType} onChange={setLoanType} onRateChange={setRate} />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Taux nominal annuel" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.1} max={25} />
          <NumberInput label="Taux assurance" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1.5} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Mensualité (avec assurance)" value={formatEUR(totalMonthly)} sub={`${formatEUR(m)} prêt + ${formatEUR(monthlyInsurance)} assurance`} accent="secondary" large />
        <ResultCard label="Coût total" value={formatEUR(cost)} sub={`Sur ${Math.round(months / 12)} ans`} accent="primary" />
        <ResultCard label="Intérêts" value={formatEUR(interest)} sub={`${((interest / amount) * 100).toFixed(1)}% du capital`} accent="accent" />
      </div>

      <AmortizationTable amount={amount} months={months} rate={rate} insuranceRate={insuranceRate} />

      <ConversionCTA simulatorName="mensualite" params={{ amount, months, rate, monthlyPayment: m, loanType }} />
    </div>
  );
}
