'use client';

import { useState, useMemo } from 'react';
import { debtRatio } from '@/lib/simulators/calculations/capacite';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ChargesList from '@/components/simulators/ChargesList';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function TauxEndettementSimulator() {
  const [income, setIncome] = useState(4500);
  const [charges, setCharges] = useState([
    { label: 'Crédit immobilier en cours', amount: 800 },
  ]);

  const totalCharges = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const { ratio, status } = useMemo(() => debtRatio({ monthlyIncome: income, monthlyCharges: totalCharges }), [income, totalCharges]);

  const statusColors = {
    safe:    { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Saine', desc: 'Vous restez dans le plafond HCSF de 35%.' },
    warning: { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   label: 'Limite', desc: 'Vous êtes à la limite : 33-35% selon banque.' },
    danger:  { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    label: 'Élevé', desc: 'Dépassement du plafond HCSF, prêt difficile à obtenir.' },
  };
  const s = statusColors[status];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <NumberInput label="Revenus mensuels nets (foyer)" value={income} onChange={setIncome} suffix="€" step={100} min={500} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <ChargesList charges={charges} onChange={setCharges} />
      </div>

      <div className={`rounded-2xl p-6 border-2 ${s.bg} ${s.border}`}>
        <div className={`text-xs uppercase tracking-widest font-bold mb-1 ${s.text}`}>Taux d'endettement {s.label}</div>
        <div className={`text-5xl font-black ${s.text}`}>{ratio} %</div>
        <div className={`text-sm mt-2 ${s.text}`}>{s.desc}</div>
        <div className="mt-4 h-3 bg-white rounded-full overflow-hidden">
          <div className={`h-full ${ratio <= 33 ? 'bg-emerald-500' : ratio <= 35 ? 'bg-amber-500' : 'bg-rose-500'} transition-all`} style={{ width: `${Math.min(ratio, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-400">
          <span>0%</span><span className="text-emerald-600">33% (sain)</span><span className="text-amber-600">35% (HCSF)</span><span>100%</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Charges totales / mois" value={formatEUR(totalCharges)} accent="rose-600" />
        <ResultCard label="Reste après charges" value={formatEUR(income - totalCharges)} accent="emerald-600" />
      </div>

      <ConversionCTA simulatorName="taux-endettement" params={{ income, ratio, status }} />
    </div>
  );
}
