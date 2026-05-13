'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

const SECTORS = [
  { id: 'services',    label: 'Services / Conseil',     coef: 0.6, plafond: 500000 },
  { id: 'commerce',    label: 'Commerce / Distribution', coef: 0.8, plafond: 1000000 },
  { id: 'btp',         label: 'BTP / Construction',     coef: 1.8, plafond: 2000000 },
  { id: 'medical',     label: 'Médical / Paramédical',  coef: 1.5, plafond: 8000000 },
  { id: 'industrie',   label: 'Industrie',              coef: 1.3, plafond: 5000000 },
  { id: 'tech',        label: 'IT / Tech',              coef: 0.9, plafond: 1500000 },
];

export default function RcProSimulator() {
  const [sector, setSector] = useState('services');
  const [ca, setCa] = useState(150000);
  const [employees, setEmployees] = useState(3);
  const [coverage, setCoverage] = useState(1000000);

  const sectorInfo = SECTORS.find((s) => s.id === sector);
  const annual = useMemo(() => {
    let p = 200; // base
    p += (ca / 1000) * sectorInfo.coef * 0.8;
    p += employees * 25 * sectorInfo.coef;
    p += (coverage / 1000000) * 150;
    return Math.round(p);
  }, [sector, ca, employees, coverage, sectorInfo]);

  const monthly = Math.round(annual / 12);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        La RC Pro couvre les dommages causés à des tiers dans le cadre de votre activité. Obligatoire pour certaines professions (médical, juridique, BTP en garantie décennale).
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Secteur d'activité</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SECTORS.map((s) => (
              <button key={s.id} type="button" onClick={() => setSector(s.id)} className={`p-3 rounded-xl border-2 text-left transition ${sector === s.id ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}>
                <div className="text-xs font-bold text-primary">{s.label}</div>
                <div className="text-[10px] text-gray-400 mt-1">Plafond conseillé : {formatEUR(s.plafond)}</div>
              </button>
            ))}
          </div>
        </div>
        <NumberInput label="Chiffre d'affaires annuel" value={ca} onChange={setCa} suffix="€" step={10000} min={10000} />
        <NumberInput label="Nombre de salariés (hors dirigeant)" value={employees} onChange={setEmployees} step={1} min={0} max={500} />
        <NumberInput label="Plafond de garantie souhaité" value={coverage} onChange={setCoverage} suffix="€" step={100000} min={100000} max={10000000} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Cotisation mensuelle" value={formatEUR(monthly)} accent="secondary" large />
        <ResultCard label="Cotisation annuelle" value={formatEUR(annual)} accent="primary" large />
      </div>

      <ConversionCTA simulatorName="rc-pro" params={{ sector, ca, employees, coverage, annual }} />
    </div>
  );
}
