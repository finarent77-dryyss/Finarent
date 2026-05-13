'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** LOA = Location avec Option d'Achat. Capital diminué de la valeur résiduelle. */
export default function LOASimulator() {
  const [amount, setAmount] = useState(25000);
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(5.5);
  const [residual, setResidual] = useState(20); // % du prix initial
  const [apport, setApport] = useState(0); // Apport à la signature (€)
  // Majoration appliquée sur le premier loyer (standard marché : 15 %).
  const [firstPaymentMarkup, setFirstPaymentMarkup] = useState(15);

  const residualValue = (amount * residual) / 100;
  const financedAmount = Math.max(amount - apport - residualValue, 0);

  const monthly = useMemo(
    () => monthlyPayment(financedAmount, months, rate),
    [financedAmount, months, rate],
  );
  const firstPayment = monthly * (1 + firstPaymentMarkup / 100);
  const totalPaid = apport + firstPayment + monthly * (months - 1) + residualValue;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Location avec Option d'Achat : louez le véhicule avec une option pour le racheter en fin de contrat (valeur résiduelle).
        <span className="block mt-1 text-xs text-gray-600">
          Le premier loyer est majoré de <strong>15&nbsp;%</strong> par rapport au loyer mensuel standard (standard marché LOA/LLD).
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Prix d'achat du véhicule" value={amount} onChange={setAmount} min={5000} max={150000} step={500} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={24} max={72} step={6} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Apport à la signature (€)" value={apport} onChange={setApport} suffix="€" step={500} min={0} max={amount} />
          <NumberInput label="Majoration premier loyer (%)" value={firstPaymentMarkup} onChange={setFirstPaymentMarkup} suffix="%" step={1} min={0} max={50} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Valeur résiduelle (%)" value={residual} onChange={setResidual} suffix="%" step={1} min={5} max={40} />
          <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.1} min={2} max={12} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResultCard label="Apport signature" value={formatEUR(apport)} sub={apport > 0 ? 'Versé à la signature' : 'Aucun apport'} accent="primary" />
        <ResultCard label="Premier loyer (majoré)" value={formatEUR(firstPayment)} sub={`+${firstPaymentMarkup}% vs loyer standard`} accent="accent" />
        <ResultCard label="Loyer mensuel" value={formatEUR(monthly)} accent="secondary" large />
        <ResultCard label="Option d'achat finale" value={formatEUR(residualValue)} sub={`${residual}% du prix`} accent="primary" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Coût total si vous rachetez" value={formatEUR(totalPaid)} accent="primary" />
        <ResultCard label="Coût total si vous restituez" value={formatEUR(totalPaid - residualValue)} sub="Sans option d'achat" accent="accent" />
      </div>

      <ConversionCTA simulatorName="loa" params={{ amount, months, rate, residual, apport, firstPaymentMarkup, firstPayment, monthly }} />
    </div>
  );
}
