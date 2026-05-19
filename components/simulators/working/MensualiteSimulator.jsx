'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import { LoanTypeSelector, LOAN_TYPES } from '@/components/simulators/TypeSelector';
import AmortizationTable from '@/components/simulators/AmortizationTable';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function MensualiteSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [loanType, setLoanType] = useState('immobilier');
  const [rate, setRate] = useState(4);
  const [insuranceRate, setInsuranceRate] = useState(0.30);

  const typeDef = LOAN_TYPES.find((t) => t.id === loanType) || LOAN_TYPES[0];
  const isLeasing = !!typeDef.isLeasing;

  // Mode prêt classique : mensualité = annuité constante
  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);
  const interest = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);
  const monthlyInsurance = Math.round((amount * insuranceRate / 100) / 12);
  const totalMonthly = m + monthlyInsurance;

  // Mode LLD / LOA : apport % + loyer mensuel constant; mois 1 = apport + loyer
  const apportPct = typeDef.apportPercent || 0;
  const apport = Math.round((amount * apportPct) / 100);
  const leasingMonthly = useMemo(
    () => monthlyPayment(Math.max(amount - apport, 0), months, rate),
    [amount, apport, months, rate],
  );
  const month1Total = apport + leasingMonthly;
  const leasingTotal = apport + leasingMonthly * months;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
        <SliderInput label={isLeasing ? 'Prix du véhicule' : 'Montant emprunté'} value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <LoanTypeSelector value={loanType} onChange={setLoanType} onRateChange={setRate} />
        {isLeasing && (
          <div className="bg-accent/5 border border-accent/30 rounded-xl p-3 text-sm text-primary">
            <i className="fa-solid fa-circle-info text-accent mr-2"></i>
            {typeDef.hint || `Apport initial : ${apportPct} % du prix.`}
            <span className="block mt-1 text-xs text-gray-600">
              Mois 1 = apport ({apportPct} %) + mensualité. Les mois suivants = mensualité seule.
            </span>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label={isLeasing ? 'Taux financement' : 'Taux nominal annuel'} value={rate} onChange={setRate} suffix="%" step={0.05} min={0.1} max={25} />
          {!isLeasing && (
            <NumberInput label="Taux assurance" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1.5} />
          )}
        </div>
      </div>

      {isLeasing ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultCard label={`Apport (${apportPct} %)`} value={formatEUR(apport)} sub="Versé à la signature" accent="primary" />
            <ResultCard label="Mois 1 (apport + loyer)" value={formatEUR(month1Total)} sub="1er prélèvement" accent="accent" large />
            <ResultCard label="Loyer mensuel" value={formatEUR(leasingMonthly)} sub={`Mois 2 à ${months}`} accent="secondary" large />
            <ResultCard label="Coût total" value={formatEUR(leasingTotal)} sub={`Sur ${Math.round(months / 12)} ans`} accent="primary" />
          </div>
        </>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <ResultCard label="Mensualité (avec assurance)" value={formatEUR(totalMonthly)} sub={`${formatEUR(m)} prêt + ${formatEUR(monthlyInsurance)} assurance`} accent="secondary" large />
            <ResultCard label="Coût total" value={formatEUR(cost)} sub={`Sur ${Math.round(months / 12)} ans`} accent="primary" />
            <ResultCard label="Intérêts" value={formatEUR(interest)} sub={`${((interest / amount) * 100).toFixed(1)}% du capital`} accent="accent" />
          </div>
          <AmortizationTable amount={amount} months={months} rate={rate} insuranceRate={insuranceRate} />
        </>
      )}

      <ConversionCTA simulatorName="mensualite" params={isLeasing
        ? { amount, months, rate, loanType, apportPercent: apportPct, apport, leasingMonthly, month1Total }
        : { amount, months, rate, monthlyPayment: m, loanType }} />
    </div>
  );
}
