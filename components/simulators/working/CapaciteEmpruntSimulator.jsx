'use client';

import { useState, useMemo } from 'react';
import { borrowingCapacity, MAX_DEBT_RATIO } from '@/lib/simulators/calculations/capacite';
import { monthlyPayment, totalCost, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import { LoanTypeSelector, LOAN_TYPES } from '@/components/simulators/TypeSelector';
import ChargesList from '@/components/simulators/ChargesList';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function CapaciteEmpruntSimulator() {
  const [income, setIncome] = useState(4500);
  const [charges, setCharges] = useState([]);
  const [months, setMonths] = useState(240);
  const [loanType, setLoanType] = useState('immobilier');
  const [rate, setRate] = useState(4);
  const [insuranceRate, setInsuranceRate] = useState(0.30);
  const [debtRatio, setDebtRatio] = useState(35);

  const currentDebts = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const capacity = useMemo(
    () => borrowingCapacity({ monthlyIncome: income, currentDebts, months, annualRate: rate, debtRatio }),
    [income, currentDebts, months, rate, debtRatio]
  );
  const m = useMemo(() => monthlyPayment(capacity.maxAmount, months, rate), [capacity.maxAmount, months, rate]);
  const cost = useMemo(() => totalCost(m, months), [m, months]);
  const remainingToLive = income - capacity.maxMonthly - currentDebts;
  const loanTypeInfo = LOAN_TYPES.find((t) => t.id === loanType);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <NumberInput label="Revenus mensuels nets (foyer)" value={income} onChange={setIncome} suffix="€" step={100} min={500} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <ChargesList charges={charges} onChange={setCharges} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <i className="fa-solid fa-gear text-gray-400"></i>
          <h3 className="font-bold text-primary">Paramètres du prêt</h3>
        </div>
        <SliderInput label="Durée du prêt" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="secondary" />
        <div className="text-xs text-gray-400 -mt-3">{Math.round(months / 12)} ans</div>

        <LoanTypeSelector value={loanType} onChange={setLoanType} onRateChange={setRate} />

        <NumberInput label="Taux nominal annuel" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.1} max={25} />
        <div className="text-xs text-gray-400 -mt-3">
          <i className="fa-solid fa-circle-info mr-1"></i>
          {loanTypeInfo?.label} · taux marché {loanTypeInfo?.rateRange}
        </div>

        <NumberInput label="Taux assurance emprunteur" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1.5} />
        <div className="text-xs text-gray-400 -mt-3">Bancaire ~0,30 % · Délégation ~0,10–0,20 %</div>

        <SliderInput label="Taux d'endettement maximum" value={debtRatio} onChange={setDebtRatio} min={10} max={50} step={1} suffix="%" format="number" accent="accent" />
        <div className="text-xs text-gray-400 -mt-3">Plafond HCSF recommandé : 35 %</div>
      </div>

      {/* Résultats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Capacité d'emprunt" value={formatEUR(capacity.maxAmount)} sub={`À ${rate}% sur ${Math.round(months / 12)} ans`} accent="secondary" large />
        <ResultCard label="Mensualité maximale" value={formatEUR(capacity.maxMonthly)} sub={`Plafond ${debtRatio}%`} accent="accent" large />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Charges actuelles" value={formatEUR(currentDebts)} accent="rose-600" />
        <ResultCard label="Coût total du crédit" value={formatEUR(cost)} accent="primary" />
        <ResultCard label="Reste pour vivre" value={formatEUR(remainingToLive)} sub="Après mensualités" accent={remainingToLive > 1000 ? 'emerald-600' : 'rose-600'} />
      </div>

      <ConversionCTA simulatorName="capacite-emprunt" params={{ amount: capacity.maxAmount, months, rate, income, loanType }} />
    </div>
  );
}
