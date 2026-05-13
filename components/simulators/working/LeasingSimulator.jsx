'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Leasing / LLD : location pure sans option d'achat, services inclus. */
export default function LeasingSimulator() {
  const [amount, setAmount] = useState(30000);
  const [months, setMonths] = useState(48);
  const [annualKm, setAnnualKm] = useState(15000);
  const [services, setServices] = useState(true);
  const [apport, setApport] = useState(0); // Apport à la signature (€)
  // Majoration appliquée sur le premier loyer (standard marché : 15 %).
  const [firstPaymentMarkup, setFirstPaymentMarkup] = useState(15);

  // Coefficient leasing simplifié : ~1.5-2% du prix par mois selon durée
  const baseCoeff = months <= 24 ? 0.022 : months <= 36 ? 0.019 : months <= 48 ? 0.017 : 0.015;
  // Ajustement km
  const kmAdjust = annualKm > 15000 ? (annualKm - 15000) * 0.002 / 12 : 0;
  // Services entretien/assurance ~80€/mois
  const servicesAmount = services ? 80 : 0;
  // L'apport réduit la base financée
  const financedBase = Math.max(amount - apport, 0);

  const monthly = useMemo(
    () => Math.round(financedBase * baseCoeff + kmAdjust + servicesAmount),
    [financedBase, baseCoeff, kmAdjust, servicesAmount],
  );
  const firstPayment = Math.round(monthly * (1 + firstPaymentMarkup / 100));
  const total = apport + firstPayment + monthly * (months - 1);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Location Longue Durée : louez sans engagement d'achat. Services inclus (entretien, assurance, assistance).
        <span className="block mt-1 text-xs text-gray-600">
          Le premier loyer est majoré de <strong>15&nbsp;%</strong> par rapport au loyer mensuel standard (standard marché LLD/LOA).
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Prix du véhicule neuf" value={amount} onChange={setAmount} min={10000} max={150000} step={500} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={24} max={60} step={6} suffix="mois" format="number" accent="accent" />
        <SliderInput label="Kilométrage annuel" value={annualKm} onChange={setAnnualKm} min={5000} max={45000} step={5000} suffix="km" format="number" accent="primary" />
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Apport à la signature (€)" value={apport} onChange={setApport} suffix="€" step={500} min={0} max={amount} />
          <NumberInput label="Majoration premier loyer (%)" value={firstPaymentMarkup} onChange={setFirstPaymentMarkup} suffix="%" step={1} min={0} max={50} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={services} onChange={(e) => setServices(e.target.checked)} className="w-5 h-5 accent-secondary" />
          <span className="text-sm font-semibold text-gray-700">Pack services inclus (entretien, assurance, assistance, pneus)</span>
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResultCard label="Apport signature" value={formatEUR(apport)} sub={apport > 0 ? 'Versé à la signature' : 'Aucun apport'} accent="primary" />
        <ResultCard label="Premier loyer (majoré)" value={formatEUR(firstPayment)} sub={`+${firstPaymentMarkup}% vs loyer standard`} accent="accent" />
        <ResultCard label="Loyer mensuel TTC" value={formatEUR(monthly)} sub="Tout compris" accent="secondary" large />
        <ResultCard label="Coût total location" value={formatEUR(total)} sub={`Sur ${months} mois`} accent="primary" large />
      </div>

      <ConversionCTA simulatorName="leasing" params={{ amount, months, annualKm, apport, firstPaymentMarkup, firstPayment, monthly }} />
    </div>
  );
}
