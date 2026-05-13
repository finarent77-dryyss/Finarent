'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Capacité de financement entreprise (basée sur CA, EBITDA, ratio dette nette). */
export default function CapaciteFinancementProSimulator() {
  const [ca, setCa] = useState(800000);
  const [ebitda, setEbitda] = useState(120000);
  const [existingDebt, setExistingDebt] = useState(50000);
  const [years, setYears] = useState(7);

  // Règle bancaire simplifiée : dette nette / EBITDA < 3x
  const maxDebt = Math.max(0, ebitda * 3 - existingDebt);
  // Mensualité raisonnable = 1/12 du DSCR (debt service coverage ratio) : 30% de l'EBITDA
  const maxMonthly = Math.round((ebitda * 0.3) / 12);
  // Capacité d'emprunt = capital maximum amortissable sur N années à 4.5% avec maxMonthly
  const rate = 4.5 / 100 / 12;
  const months = years * 12;
  const maxAmount = Math.round(maxMonthly * (1 - Math.pow(1 + rate, -months)) / rate);
  const finalCapacity = Math.min(maxDebt, maxAmount);

  // Ratios
  const debtToEbitda = (existingDebt + finalCapacity) / ebitda;
  const dscr = (ebitda / 12) / maxMonthly;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Capacité de financement entreprise basée sur l'EBITDA et le ratio dette nette / EBITDA (limite bancaire ~3x). DSCR (Debt Service Coverage Ratio) minimum recommandé : 1.25.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Chiffre d'affaires annuel" value={ca} onChange={setCa} suffix="€" step={10000} min={50000} />
          <NumberInput label="EBITDA (résultat d'exploitation)" value={ebitda} onChange={setEbitda} suffix="€" step={5000} min={0} />
          <NumberInput label="Dette nette actuelle" value={existingDebt} onChange={setExistingDebt} suffix="€" step={5000} min={0} />
          <NumberInput label="Durée du prêt" value={years} onChange={setYears} suffix="ans" step={1} min={3} max={15} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Capacité d'emprunt" value={formatEUR(finalCapacity)} sub={`Sur ${years} ans à 4.5%`} accent="secondary" large />
        <ResultCard label="Mensualité maximale" value={formatEUR(maxMonthly)} sub="30% de l'EBITDA mensuel" accent="accent" large />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Dette nette / EBITDA" value={`${debtToEbitda.toFixed(2)}x`} sub="Plafond bancaire : 3x" accent={debtToEbitda <= 3 ? 'emerald-600' : 'rose-600'} />
        <ResultCard label="DSCR" value={dscr.toFixed(2)} sub="Minimum recommandé : 1.25" accent={dscr >= 1.25 ? 'emerald-600' : 'rose-600'} />
      </div>

      <ConversionCTA simulatorName="capacite-financement-pro" params={{ ca, ebitda, existingDebt, years, finalCapacity }} />
    </div>
  );
}
