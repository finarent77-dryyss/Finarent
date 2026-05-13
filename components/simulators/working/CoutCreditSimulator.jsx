'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, totalInterest, approximateTaeg, formatEUR, formatPct } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import { LoanTypeSelector } from '@/components/simulators/TypeSelector';
import AmortizationTable from '@/components/simulators/AmortizationTable';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function CoutCreditSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [loanType, setLoanType] = useState('immobilier');
  const [rate, setRate] = useState(4);
  const [insuranceRate, setInsuranceRate] = useState(0.30);

  const m = useMemo(() => monthlyPayment(amount, months, rate), [amount, months, rate]);
  const interestCost = useMemo(() => totalInterest(m, months, amount), [m, months, amount]);
  const insuranceCost = useMemo(() => Math.round((amount * insuranceRate / 100) * (months / 12)), [amount, insuranceRate, months]);
  const grandTotal = amount + interestCost + insuranceCost;
  const taeg = useMemo(() => approximateTaeg({ amount, months, rate, insuranceRate, fees: 0 }), [amount, months, rate, insuranceRate]);

  const pctCapital = (amount / grandTotal) * 100;
  const pctInterest = (interestCost / grandTotal) * 100;
  const pctInsurance = (insuranceCost / grandTotal) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Montant emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée du prêt" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <LoanTypeSelector value={loanType} onChange={setLoanType} onRateChange={setRate} />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.1} max={25} />
          <NumberInput label="Taux assurance" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1.5} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Coût total du crédit</div>
            <div className="text-4xl sm:text-5xl font-black text-primary mb-1">{formatEUR(grandTotal)}</div>
            <div className="text-sm text-gray-500">{Math.round(months / 12)} ans · TAEG estimé <span className="font-bold text-secondary">{formatPct(taeg)}</span></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Capital</span>
              <span className="font-bold text-emerald-600">{formatEUR(amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Intérêts</span>
              <span className="font-bold text-rose-600">{formatEUR(interestCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Assurance</span>
              <span className="font-bold text-amber-600">{formatEUR(insuranceCost)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
              <span className="font-bold text-primary">Total remboursé</span>
              <span className="font-black text-primary">{formatEUR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Barre proportionnelle */}
        <div className="space-y-2">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div className="bg-emerald-500" style={{ width: `${pctCapital}%` }} title="Capital" />
            <div className="bg-rose-500" style={{ width: `${pctInterest}%` }} title="Intérêts" />
            <div className="bg-amber-500" style={{ width: `${pctInsurance}%` }} title="Assurance" />
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" />Capital ({pctCapital.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500" />Intérêts ({pctInterest.toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500" />Assurance ({pctInsurance.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
          <ResultCard label="Mensualité (hors assurance)" value={formatEUR(m)} accent="primary" large />
          <ResultCard label="TAEG estimé" value={formatPct(taeg)} sub="Taux Annuel Effectif Global" accent="secondary" />
        </div>
      </div>

      <AmortizationTable amount={amount} months={months} rate={rate} insuranceRate={insuranceRate} />

      <ConversionCTA simulatorName="cout-credit" params={{ amount, months, rate, totalCost: grandTotal, taeg }} />
    </div>
  );
}
