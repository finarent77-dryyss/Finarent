'use client';

import { useState, useMemo } from 'react';
import { livingBudget } from '@/lib/simulators/calculations/capacite';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ChargesList from '@/components/simulators/ChargesList';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function ResteAVivreSimulator() {
  const [income, setIncome] = useState(4500);
  const [household, setHousehold] = useState(2);
  const [charges, setCharges] = useState([
    { label: 'Crédit immobilier', amount: 900 },
    { label: 'Charges fixes (énergie, télécom)', amount: 350 },
  ]);

  const totalCharges = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const result = useMemo(
    () => livingBudget({ monthlyIncome: income, monthlyCharges: totalCharges, householdSize: household }),
    [income, totalCharges, household],
  );

  const statusBg = result.status === 'safe' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                 : result.status === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-700'
                 : 'bg-rose-50 border-rose-200 text-rose-700';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <NumberInput label="Revenus mensuels nets du foyer" value={income} onChange={setIncome} suffix="€" step={100} min={500} />
        <NumberInput label="Personnes dans le foyer" value={household} onChange={setHousehold} suffix="pers" step={1} min={1} max={10} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <ChargesList charges={charges} onChange={setCharges} />
      </div>

      <div className={`rounded-2xl p-6 border-2 ${statusBg}`}>
        <div className="text-xs uppercase tracking-widest font-bold mb-1">Reste à vivre</div>
        <div className="text-5xl font-black">{formatEUR(result.total)}</div>
        <div className="text-sm mt-2">soit <strong>{formatEUR(result.perPerson)}</strong> par personne / mois</div>
        <div className="text-xs mt-2 opacity-80">Seuil minimum recommandé : {formatEUR(result.threshold)} / pers</div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Revenus" value={formatEUR(income)} accent="emerald-600" />
        <ResultCard label="Charges" value={formatEUR(totalCharges)} accent="rose-600" />
        <ResultCard label="Disponible" value={formatEUR(result.total)} accent="secondary" />
      </div>

      <ConversionCTA simulatorName="reste-a-vivre" params={{ income, totalCharges, household, remaining: result.total }} />
    </div>
  );
}
