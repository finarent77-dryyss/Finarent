'use client';

import { useState, useMemo } from 'react';
import { notaryFees } from '@/lib/simulators/calculations/notaire';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function FraisNotaireSimulator() {
  const [type, setType] = useState('ancien');
  const [price, setPrice] = useState(250000);
  const [apport, setApport] = useState(50000);

  const fees = useMemo(() => notaryFees({ price, type }), [price, type]);
  const totalAcquisition = price + fees.total;
  const loanNeeded = Math.max(0, totalAcquisition - apport);

  return (
    <div className="space-y-6">
      {/* Type de bien */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Type de bien</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { id: 'ancien', label: 'Ancien', sub: '≥ 5 ans',                rate: '~ 7-8 %' },
              { id: 'neuf',   label: 'Neuf',   sub: '< 5 ans / VEFA',          rate: '~ 2-3 %' },
            ].map((opt) => {
              const active = type === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setType(opt.id)}
                  className={`text-left rounded-2xl border-2 p-4 transition ${active
                    ? 'border-secondary bg-secondary/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-bold text-primary text-base">{opt.label}</span>
                    {active && <i className="fa-solid fa-check text-secondary"></i>}
                  </div>
                  <div className="text-xs text-gray-500">{opt.sub}</div>
                  <div className={`text-xs mt-1 font-semibold ${active ? 'text-secondary' : 'text-gray-400'}`}>Droits {opt.rate}</div>
                </button>
              );
            })}
          </div>
        </div>

        <SliderInput label="Prix d'achat" value={price} onChange={setPrice} min={20000} max={2000000} step={5000} accent="secondary" />
        <SliderInput label="Apport personnel" value={apport} onChange={setApport} min={0} max={Math.min(price, 1000000)} step={1000} accent="emerald-500" />
      </div>

      {/* Résultats principaux */}
      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Total frais de notaire" value={formatEUR(fees.total)} sub={`Soit ${fees.rate.toFixed(1)} % du prix d'achat`} accent="secondary" large />
        <ResultCard label="Prix + frais" value={formatEUR(totalAcquisition)} sub="Coût total de l'acquisition" accent="primary" />
        <ResultCard label="Emprunt estimé" value={formatEUR(loanNeeded)} sub="prix + frais − apport" accent="emerald-600" />
      </div>

      {/* Répartition des frais */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Répartition des frais</div>
        <div className="space-y-3">
          {fees.breakdown.map((b) => {
            const pct = (b.value / fees.total) * 100;
            return (
              <div key={b.label}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-semibold text-primary">{b.label}</span>
                  <span className={`text-sm font-bold text-${b.color}`}>{formatEUR(b.value)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-${b.color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-gray-400 mt-1">{b.sub}</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
          <i className="fa-solid fa-circle-info text-secondary mr-1.5"></i>
          Estimation basée sur le barème 2024. Les frais réels peuvent varier légèrement selon le département et la nature de la transaction.
        </div>
      </div>

      <ConversionCTA simulatorName="frais-notaire" params={{ price, type, apport, loanNeeded, fees: fees.total }} />
    </div>
  );
}
