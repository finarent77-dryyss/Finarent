'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, approximateTaeg, formatEUR, formatPct } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function TaegSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);
  const [rate, setRate] = useState(3.5);
  const [insuranceRate, setInsuranceRate] = useState(0.30);
  const [fees, setFees] = useState(2000);

  const taeg = useMemo(() => approximateTaeg({ amount, months, rate, insuranceRate, fees }), [amount, months, rate, insuranceRate, fees]);
  const m = monthlyPayment(amount, months, rate);
  const monthlyInsurance = Math.round((amount * insuranceRate / 100) / 12);
  const monthlyTotal = m + monthlyInsurance + Math.round(fees / months);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Le TAEG (Taux Annuel Effectif Global) inclut tous les frais : intérêts, assurance emprunteur, frais de dossier, garantie. C'est l'indicateur officiel à comparer entre offres.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital emprunté" value={amount} onChange={setAmount} min={10000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={12} max={300} step={12} suffix="mois" format="number" accent="accent" />
        <div className="grid sm:grid-cols-3 gap-4">
          <NumberInput label="Taux nominal" value={rate} onChange={setRate} suffix="%" step={0.05} min={0.5} max={10} />
          <NumberInput label="Taux assurance" value={insuranceRate} onChange={setInsuranceRate} suffix="%" step={0.01} min={0} max={1.5} />
          <NumberInput label="Frais (dossier + garantie)" value={fees} onChange={setFees} suffix="€" step={100} min={0} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-secondary/5 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
        <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">TAEG estimé</div>
        <div className="text-5xl font-black text-emerald-600">{formatPct(taeg)}</div>
        <div className="text-sm text-emerald-700 mt-2">Taux légal usure plafond (immobilier sur 20 ans) : ~5.62% — vous êtes {taeg < 5.62 ? 'sous le seuil ✓' : 'au-dessus du seuil ✗'}</div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Mensualité capital + intérêts" value={formatEUR(m)} accent="primary" />
        <ResultCard label="Mensualité totale (avec assur. + frais)" value={formatEUR(monthlyTotal)} accent="secondary" large />
      </div>

      <ConversionCTA simulatorName="taeg" params={{ amount, months, rate, insuranceRate, fees, taeg }} />
    </div>
  );
}
