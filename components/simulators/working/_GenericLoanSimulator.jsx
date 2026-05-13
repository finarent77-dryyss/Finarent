'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import AmortizationTable from '@/components/simulators/AmortizationTable';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/**
 * Composant générique pour tous les simulateurs de prêt qui se résument
 * à : montant × durée × taux → mensualité + coût total + intérêts.
 * Diffèrent uniquement par les bornes, le taux par défaut et le contexte.
 */
export default function GenericLoanSimulator({
  slug,
  minAmount, maxAmount, stepAmount = 500,
  minMonths, maxMonths, stepMonths = 6,
  defaultAmount, defaultMonths, defaultRate,
  rateMin = 0.5, rateMax = 25, rateStep = 0.05,
  rateLabel = 'Taux nominal annuel',
  rateNote,
  defaultInsuranceRate = 0,
  insuranceLabel = 'Taux assurance emprunteur',
  showAmortization = true,
  contextNote,
}) {
  const [amount, setAmount] = useState(defaultAmount);
  const [months, setMonths] = useState(defaultMonths);
  const [rate, setRate] = useState(defaultRate);
  const [insuranceRate, setInsuranceRate] = useState(defaultInsuranceRate);

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);
  const interest = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);
  const monthlyInsurance = Math.round((amount * insuranceRate / 100) / 12);
  const totalMonthly = m + monthlyInsurance;

  return (
    <div className="space-y-6">
      {contextNote && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
          <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
          {contextNote}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8">
        <SliderInput label="Montant emprunté" value={amount} onChange={setAmount} min={minAmount} max={maxAmount} step={stepAmount} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={minMonths} max={maxMonths} step={stepMonths} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <NumberInput label={rateLabel} value={rate} onChange={setRate} suffix="%" step={rateStep} min={rateMin} max={rateMax} />
            {rateNote && <div className="text-xs text-gray-400 mt-1"><i className="fa-solid fa-info-circle mr-1"></i>{rateNote}</div>}
          </div>
          {insuranceLabel !== null && (
            <NumberInput label={insuranceLabel} value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1.5} />
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard
          label={monthlyInsurance > 0 ? 'Mensualité totale' : 'Mensualité'}
          value={formatEUR(totalMonthly)}
          sub={monthlyInsurance > 0 ? `${formatEUR(m)} prêt + ${formatEUR(monthlyInsurance)} assur.` : 'Hors assurance'}
          accent="secondary"
          large
        />
        <ResultCard label="Coût total" value={formatEUR(cost)} sub={`Sur ${Math.round(months / 12 * 10) / 10} ans`} accent="primary" />
        <ResultCard label="Intérêts" value={formatEUR(interest)} sub={`${amount > 0 ? ((interest / amount) * 100).toFixed(1) : 0}% du capital`} accent="accent" />
      </div>

      {showAmortization && (
        <AmortizationTable amount={amount} months={months} rate={rate} insuranceRate={insuranceRate} />
      )}

      <ConversionCTA simulatorName={slug} params={{ amount, months, rate, monthly: m }} />
    </div>
  );
}
