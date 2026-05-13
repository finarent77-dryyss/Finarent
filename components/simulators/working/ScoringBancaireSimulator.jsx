'use client';

import { useState, useMemo } from 'react';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

/** Scoring bancaire prédictif (modèle simplifié). */
export default function ScoringBancaireSimulator() {
  const [revenu, setRevenu] = useState(4500);
  const [endettement, setEndettement] = useState(25); // %
  const [anciennete, setAnciennete] = useState(5); // ans dans la boîte
  const [apport, setApport] = useState(15); // %
  const [historiqueIncidents, setHistoriqueIncidents] = useState(false);
  const [statutEmploi, setStatutEmploi] = useState('CDI');

  const score = useMemo(() => {
    let s = 50;
    // Revenus (max +20)
    if (revenu >= 5000) s += 20;
    else if (revenu >= 3500) s += 15;
    else if (revenu >= 2500) s += 8;
    else s -= 5;
    // Endettement (max +15, négatif si > 35)
    if (endettement <= 25) s += 15;
    else if (endettement <= 33) s += 8;
    else if (endettement <= 35) s += 2;
    else s -= 20;
    // Ancienneté (max +10)
    if (anciennete >= 5) s += 10;
    else if (anciennete >= 2) s += 5;
    // Apport (max +15)
    if (apport >= 20) s += 15;
    else if (apport >= 10) s += 8;
    else if (apport >= 5) s += 3;
    // Statut emploi
    if (statutEmploi === 'CDI') s += 10;
    else if (statutEmploi === 'CDD') s -= 5;
    else if (statutEmploi === 'TNS') s += 3;
    else if (statutEmploi === 'FONCTIONNAIRE') s += 12;
    // Incidents
    if (historiqueIncidents) s -= 25;
    return Math.max(0, Math.min(100, s));
  }, [revenu, endettement, anciennete, apport, statutEmploi, historiqueIncidents]);

  const grade = score >= 85 ? 'A — Excellent' : score >= 70 ? 'B — Bon' : score >= 55 ? 'C — Correct' : score >= 40 ? 'D — Limite' : 'E — Difficile';
  const acceptRate = score >= 85 ? 98 : score >= 70 ? 88 : score >= 55 ? 65 : score >= 40 ? 32 : 12;
  const color = score >= 70 ? 'emerald' : score >= 55 ? 'amber' : 'rose';

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Score prédictif basé sur les critères classiques d'analyse bancaire : revenus, endettement, ancienneté, apport, statut. Les banques utilisent des modèles plus complexes mais les principes sont identiques.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberInput label="Revenus nets mensuels" value={revenu} onChange={setRevenu} suffix="€" step={100} min={500} />
          <NumberInput label="Endettement actuel" value={endettement} onChange={setEndettement} suffix="%" step={1} min={0} max={50} />
          <NumberInput label="Ancienneté pro" value={anciennete} onChange={setAnciennete} suffix="ans" step={1} min={0} max={40} />
          <NumberInput label="Apport personnel" value={apport} onChange={setApport} suffix="%" step={1} min={0} max={50} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Statut professionnel</label>
          <div className="grid grid-cols-4 gap-2">
            {['CDI', 'CDD', 'TNS', 'FONCTIONNAIRE'].map((s) => (
              <button key={s} type="button" onClick={() => setStatutEmploi(s)} className={`py-2 rounded-lg border-2 font-bold text-xs transition ${statutEmploi === s ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-400'}`}>{s}</button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={historiqueIncidents} onChange={(e) => setHistoriqueIncidents(e.target.checked)} className="w-5 h-5 accent-rose-500" />
          <span className="text-sm font-semibold text-gray-700">Incidents bancaires (interdit bancaire, FICP, etc.)</span>
        </label>
      </div>

      <div className={`bg-${color}-50 border-2 border-${color}-200 rounded-2xl p-8`}>
        <div className={`text-xs uppercase tracking-widest font-bold text-${color}-700 mb-2`}>Score Finassur</div>
        <div className={`text-6xl font-black text-${color}-600`}>{score} <span className="text-3xl text-gray-400">/ 100</span></div>
        <div className={`text-lg font-bold text-${color}-700 mt-2`}>{grade}</div>
        <div className="mt-4 h-3 bg-white rounded-full overflow-hidden">
          <div className={`h-full bg-${color}-500 transition-all`} style={{ width: `${score}%` }} />
        </div>
        <div className={`text-sm text-${color}-700 mt-3`}>
          Taux d'acceptation estimé : <strong>{acceptRate}%</strong>
        </div>
      </div>

      <ConversionCTA simulatorName="scoring-bancaire" params={{ score, grade, acceptRate }} />
    </div>
  );
}
