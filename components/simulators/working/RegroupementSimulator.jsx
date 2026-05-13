'use client';

import { useState, useMemo } from 'react';
import { monthlyPayment, formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function RegroupementSimulator() {
  const [credits, setCredits] = useState([
    { label: 'Crédit immobilier', remaining: 120000, monthly: 950, rate: 4.2 },
    { label: 'Crédit auto', remaining: 12000, monthly: 280, rate: 6.5 },
    { label: 'Crédit conso', remaining: 8500, monthly: 220, rate: 9.5 },
  ]);
  const [newRate, setNewRate] = useState(4.5);
  const [newMonths, setNewMonths] = useState(180);

  const updateCredit = (i, patch) => setCredits((c) => c.map((cr, idx) => idx === i ? { ...cr, ...patch } : cr));
  const addCredit = () => setCredits((c) => [...c, { label: '', remaining: 0, monthly: 0, rate: 5 }]);
  const removeCredit = (i) => setCredits((c) => c.filter((_, idx) => idx !== i));

  const totalRemaining = credits.reduce((s, c) => s + (Number(c.remaining) || 0), 0);
  const totalMonthly = credits.reduce((s, c) => s + (Number(c.monthly) || 0), 0);
  const newMonthly = useMemo(() => monthlyPayment(totalRemaining, newMonths, newRate), [totalRemaining, newMonths, newRate]);
  const monthlySavings = totalMonthly - newMonthly;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Le regroupement de crédits consolide plusieurs prêts en un seul, souvent à durée allongée et taux plus faible, pour réduire la mensualité globale. À utiliser avec discernement : plus long = plus d'intérêts au total.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">Vos crédits actuels</div>
          <button type="button" onClick={addCredit} className="text-xs font-bold text-secondary hover:underline">
            <i className="fa-solid fa-plus mr-1"></i>Ajouter
          </button>
        </div>
        {credits.map((c, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input placeholder="Type de crédit" value={c.label} onChange={(e) => updateCredit(i, { label: e.target.value })} className="col-span-4 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-secondary focus:outline-none" />
            <div className="col-span-3 relative">
              <input type="number" placeholder="Reste" value={c.remaining} onChange={(e) => updateCredit(i, { remaining: e.target.value })} className="w-full pl-3 pr-7 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€</span>
            </div>
            <div className="col-span-2 relative">
              <input type="number" placeholder="Mensualité" value={c.monthly} onChange={(e) => updateCredit(i, { monthly: e.target.value })} className="w-full pl-3 pr-7 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">€</span>
            </div>
            <div className="col-span-2 relative">
              <input type="number" step="0.1" placeholder="Taux" value={c.rate} onChange={(e) => updateCredit(i, { rate: e.target.value })} className="w-full pl-3 pr-7 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
            </div>
            <button type="button" onClick={() => removeCredit(i)} className="col-span-1 text-rose-500"><i className="fa-solid fa-trash"></i></button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <div className="text-sm font-semibold text-gray-700">Conditions du nouveau prêt regroupé</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Durée du nouveau prêt" value={newMonths} onChange={setNewMonths} suffix="mois" step={12} min={36} max={300} />
          <NumberInput label="Taux du nouveau prêt" value={newRate} onChange={setNewRate} suffix="%" step={0.05} min={1} max={10} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Mensualité actuelle (cumul)" value={formatEUR(totalMonthly)} sub={`${credits.length} crédits`} accent="rose-600" large />
        <ResultCard label="Nouvelle mensualité" value={formatEUR(newMonthly)} sub="1 seul prêt" accent="emerald-600" large />
      </div>

      <div className={`rounded-2xl p-5 border-2 ${monthlySavings > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className={`text-xs uppercase tracking-widest font-bold mb-1 ${monthlySavings > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {monthlySavings > 0 ? 'Économie mensuelle' : 'Surcoût mensuel'}
        </div>
        <div className={`text-3xl font-black ${monthlySavings > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          {formatEUR(Math.abs(monthlySavings))}
        </div>
        <div className={`text-xs mt-1 ${monthlySavings > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
          Soit {formatEUR(Math.abs(monthlySavings * newMonths))} sur la nouvelle durée
        </div>
      </div>

      <ConversionCTA simulatorName="regroupement-credits" params={{ totalRemaining, totalMonthly, newMonthly, newRate, newMonths }} />
    </div>
  );
}
