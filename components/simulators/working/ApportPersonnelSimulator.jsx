'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Compare différents niveaux d'apport et leur impact sur mensualité + coût total. */
export default function ApportPersonnelSimulator() {
  const [propertyPrice, setPropertyPrice] = useState(300000);
  const [apport, setApport] = useState(30000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(4);

  const apportPct = (apport / propertyPrice) * 100;
  const loanAmount = propertyPrice - apport;
  const m = useMemo(() => monthlyPayment(loanAmount, months, rate), [loanAmount, months, rate]);
  const cost = totalCost(m, months);
  const interest = totalInterest(m, months, loanAmount);

  // Comparaison à 0% apport pour mesurer l'économie
  const m0 = monthlyPayment(propertyPrice, months, rate);
  const interest0 = totalInterest(m0, months, propertyPrice);
  const savings = interest0 - interest;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Un apport personnel réduit le capital emprunté, baisse vos mensualités et économise des intérêts. La plupart des banques exigent au moins 10% d'apport pour les frais de notaire.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Prix du bien" value={propertyPrice} onChange={setPropertyPrice} min={50000} max={2000000} step={5000} accent="secondary" />
        <SliderInput label="Apport personnel" value={apport} onChange={setApport} min={0} max={Math.min(propertyPrice, 1000000)} step={1000} accent="emerald-500" />
        <div className="text-xs text-gray-400 -mt-3">
          {apportPct.toFixed(1)}% du prix · {apportPct < 10 ? 'Apport trop faible' : apportPct < 20 ? 'Apport correct' : 'Apport solide'}
        </div>
        <SliderInput label="Durée du prêt" value={months} onChange={setMonths} min={60} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Capital à emprunter" value={formatEUR(loanAmount)} sub={`${(100 - apportPct).toFixed(0)}% du prix`} accent="secondary" large />
        <ResultCard label="Mensualité" value={formatEUR(m)} sub="Hors assurance" accent="primary" />
        <ResultCard label="Intérêts économisés" value={formatEUR(savings)} sub="vs 0% apport" accent="emerald-600" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Impact comparatif</div>
        <div className="space-y-3">
          {[10, 20, 30, 40].map((pct) => {
            const altApport = (propertyPrice * pct) / 100;
            const altLoan = propertyPrice - altApport;
            const altM = monthlyPayment(altLoan, months, rate);
            const altCost = totalCost(altM, months);
            return (
              <div key={pct} className={`flex items-center justify-between p-3 rounded-lg ${Math.abs(pct - apportPct) < 5 ? 'bg-secondary/5 ring-1 ring-secondary/30' : 'bg-gray-50'}`}>
                <div className="text-sm font-bold text-primary w-16">{pct}% apport</div>
                <div className="text-xs text-gray-500 flex-1 mx-3">{formatEUR(altLoan)} empruntés</div>
                <div className="text-sm font-bold text-primary w-24 text-right">{formatEUR(altM)}/mois</div>
              </div>
            );
          })}
        </div>
      </div>

      <ConversionCTA simulatorName="apport-personnel" params={{ propertyPrice, apport, months, rate, loanAmount }} />
    </div>
  );
}
