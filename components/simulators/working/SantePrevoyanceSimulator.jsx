'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function SantePrevoyanceSimulator() {
  const [age, setAge] = useState(40);
  const [status, setStatus] = useState('TNS');
  const [niveau, setNiveau] = useState('confort');
  const [income, setIncome] = useState(45000);
  const [withFamily, setWithFamily] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);

  // Santé (mutuelle complémentaire)
  const santeAnnual = useMemo(() => {
    const baseSante = niveau === 'eco' ? 35 : niveau === 'confort' ? 65 : 110;
    let p = baseSante * 12;
    // Âge
    if (age >= 60) p *= 1.6;
    else if (age >= 50) p *= 1.3;
    else if (age >= 40) p *= 1.1;
    // Statut
    if (status === 'TNS') p *= 1.15;
    // Famille
    if (withFamily) p *= 1.8;
    if (childrenCount > 0) p += childrenCount * 280;
    return Math.round(p);
  }, [age, status, niveau, withFamily, childrenCount]);

  // Prévoyance (incapacité, invalidité, décès)
  const prevoyanceAnnual = useMemo(() => {
    let p = income * 0.012; // 1.2% du revenu pour couverture basique
    if (niveau === 'confort') p *= 1.4;
    else if (niveau === 'optimal') p *= 1.8;
    if (status === 'TNS') p *= 1.2;
    if (age >= 50) p *= 1.3;
    return Math.round(p);
  }, [income, status, age, niveau]);

  const total = santeAnnual + prevoyanceAnnual;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Mutuelle santé (complémentaire au remboursement Sécu) + Prévoyance (perte de revenus en cas d'arrêt maladie, invalidité, décès). Contrats déductibles fiscalement pour les TNS (loi Madelin).
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'TNS', label: 'TNS / Indépendant' },
              { id: 'salarie', label: 'Salarié' },
              { id: 'dirigeant', label: 'Dirigeant assimilé salarié' },
            ].map((s) => (
              <button key={s.id} type="button" onClick={() => setStatus(s.id)} className={`py-3 rounded-xl border-2 font-bold text-xs transition ${status === s.id ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>{s.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau de couverture</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'eco', label: 'Économique' },
              { id: 'confort', label: 'Confort' },
              { id: 'optimal', label: 'Optimal' },
            ].map((n) => (
              <button key={n.id} type="button" onClick={() => setNiveau(n.id)} className={`py-3 rounded-xl border-2 font-bold transition ${niveau === n.id ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>{n.label}</button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Âge" value={age} onChange={setAge} suffix="ans" step={1} min={18} max={90} />
          <NumberInput label="Revenu annuel" value={income} onChange={setIncome} suffix="€" step={5000} min={10000} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={withFamily} onChange={(e) => setWithFamily(e.target.checked)} className="w-5 h-5 accent-secondary" />
          <span className="text-sm font-semibold text-gray-700">Inclure conjoint</span>
        </label>
        <NumberInput label="Nombre d'enfants à charge" value={childrenCount} onChange={setChildrenCount} step={1} min={0} max={10} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Mutuelle santé" value={`${formatEUR(Math.round(santeAnnual / 12))}/mois`} sub={`${formatEUR(santeAnnual)}/an`} accent="emerald-600" />
        <ResultCard label="Prévoyance" value={`${formatEUR(Math.round(prevoyanceAnnual / 12))}/mois`} sub={`${formatEUR(prevoyanceAnnual)}/an`} accent="secondary" />
      </div>

      <ResultCard label="Total annuel" value={formatEUR(total)} sub={status === 'TNS' ? 'Déductible loi Madelin' : ''} accent="primary" large />

      <ConversionCTA simulatorName="sante-prevoyance" params={{ age, status, niveau, total }} />
    </div>
  );
}
