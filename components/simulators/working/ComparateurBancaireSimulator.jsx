'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, totalCost, formatEUR, formatPct } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

const BANKS = [
  { name: 'BNP Paribas',         rate: 3.65, fees: 1500, insurance: 0.34 },
  { name: 'Crédit Agricole',     rate: 3.55, fees: 1200, insurance: 0.32 },
  { name: 'Société Générale',    rate: 3.70, fees: 1800, insurance: 0.36 },
  { name: 'LCL',                 rate: 3.60, fees: 1500, insurance: 0.34 },
  { name: 'Crédit Mutuel',       rate: 3.50, fees: 1000, insurance: 0.30 },
  { name: 'Banque Populaire',    rate: 3.60, fees: 1300, insurance: 0.32 },
  { name: 'Boursorama',          rate: 3.45, fees: 0,    insurance: 0.28 },
  { name: 'Fortuneo',            rate: 3.40, fees: 0,    insurance: 0.26 },
  { name: 'Délégation Finarent', rate: 3.40, fees: 800,  insurance: 0.14 },
];

export default function ComparateurBancaireSimulator() {
  const [amount, setAmount] = useState(200000);
  const [months, setMonths] = useState(240);

  const offers = useMemo(() => {
    return BANKS.map((b) => {
      const m = monthlyPayment(amount, months, b.rate);
      const interestCost = m * months - amount;
      const insuranceCost = (amount * b.insurance / 100) * (months / 12);
      const total = interestCost + insuranceCost + b.fees;
      const monthlyAll = m + Math.round((amount * b.insurance / 100) / 12);
      return { ...b, m, monthlyAll, interestCost, insuranceCost, total };
    }).sort((a, b) => a.total - b.total);
  }, [amount, months]);

  const cheapest = offers[0];
  const mostExpensive = offers[offers.length - 1];
  const savings = mostExpensive.total - cheapest.total;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Comparaison de 9 acteurs (banques traditionnelles, banques en ligne, délégation). Taux indicatifs pour profil bon dossier — votre conseiller Finarent négocie pour vous des conditions sur-mesure.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <SliderInput label="Capital" value={amount} onChange={setAmount} min={50000} max={1000000} step={5000} accent="secondary" />
        <SliderInput label="Durée" value={months} onChange={setMonths} min={120} max={300} step={12} suffix="mois" format="number" accent="accent" />
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
        <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-1">Économie potentielle</div>
        <div className="text-3xl font-black text-emerald-700">{formatEUR(savings)}</div>
        <div className="text-sm text-emerald-700">Entre la meilleure offre ({cheapest.name}) et la plus chère ({mostExpensive.name})</div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="text-left px-4 py-3">Établissement</th>
                <th className="text-right px-3 py-3">Taux</th>
                <th className="text-right px-3 py-3">Mens. (avec ass.)</th>
                <th className="text-right px-3 py-3">Frais</th>
                <th className="text-right px-3 py-3">Assurance</th>
                <th className="text-right px-4 py-3">Coût total</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o, i) => (
                <tr key={o.name} className={`border-t border-gray-50 ${i === 0 ? 'bg-emerald-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-bold text-primary flex items-center gap-2">
                      {i === 0 && <span className="text-[9px] font-bold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded">Top</span>}
                      {o.name}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-semibold">{formatPct(o.rate)}</td>
                  <td className="px-3 py-3 text-right font-bold text-secondary">{formatEUR(o.monthlyAll)}</td>
                  <td className="px-3 py-3 text-right text-gray-500">{formatEUR(o.fees)}</td>
                  <td className="px-3 py-3 text-right text-gray-500">{formatPct(o.insurance)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{formatEUR(Math.round(o.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConversionCTA simulatorName="comparateur-bancaire" params={{ amount, months, cheapest: cheapest.name, savings }} />
    </div>
  );
}
