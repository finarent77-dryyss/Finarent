'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function AssuranceHabitationSimulator() {
  const [status, setStatus] = useState('proprietaire');
  const [surface, setSurface] = useState(80);
  const [rooms, setRooms] = useState(3);
  const [propertyType, setPropertyType] = useState('appartement');
  const [contentValue, setContentValue] = useState(20000);
  const [zone, setZone] = useState('moyenne');

  const annual = useMemo(() => {
    // Base : 1.50€/m² pour appartement, 1.80€/m² pour maison
    let p = surface * (propertyType === 'maison' ? 1.8 : 1.5);
    // Statut
    if (status === 'proprietaire') p *= 1.0;
    else if (status === 'locataire') p *= 0.75;
    else if (status === 'pno') p *= 0.6; // propriétaire non occupant
    // Contenu (max +30%)
    p += Math.min(contentValue * 0.005, 250);
    // Zone géographique (risque)
    if (zone === 'haute') p *= 1.3;
    else if (zone === 'basse') p *= 0.85;
    // Nombre de pièces (au-delà de 4)
    if (rooms > 4) p += (rooms - 4) * 15;
    return Math.round(p);
  }, [status, surface, rooms, propertyType, contentValue, zone]);

  const monthly = Math.round(annual / 12);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Multirisque habitation (MRH) couvrant incendie, dégâts des eaux, vol, responsabilité civile. Estimation indicative.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'proprietaire', label: 'Propriétaire occupant' },
              { id: 'locataire', label: 'Locataire' },
              { id: 'pno', label: 'PNO (loue le bien)' },
            ].map((s) => (
              <button key={s.id} type="button" onClick={() => setStatus(s.id)} className={`py-3 rounded-xl border-2 font-bold text-xs transition ${status === s.id ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>{s.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPropertyType('appartement')} className={`py-3 rounded-xl border-2 font-bold transition ${propertyType === 'appartement' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>🏢 Appartement</button>
            <button type="button" onClick={() => setPropertyType('maison')} className={`py-3 rounded-xl border-2 font-bold transition ${propertyType === 'maison' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>🏠 Maison</button>
          </div>
        </div>

        <SliderInput label="Surface" value={surface} onChange={setSurface} min={15} max={300} step={5} suffix="m²" format="number" accent="secondary" />
        <SliderInput label="Nombre de pièces" value={rooms} onChange={setRooms} min={1} max={10} step={1} suffix="pcs" format="number" accent="accent" />
        <NumberInput label="Valeur du mobilier / contenu" value={contentValue} onChange={setContentValue} suffix="€" step={1000} min={5000} max={200000} />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Zone géographique</label>
          <div className="grid grid-cols-3 gap-2">
            {['basse', 'moyenne', 'haute'].map((z) => (
              <button key={z} type="button" onClick={() => setZone(z)} className={`py-2 rounded-lg border-2 font-bold text-sm capitalize transition ${zone === z ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>Risque {z}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Cotisation mensuelle" value={formatEUR(monthly)} accent="secondary" large />
        <ResultCard label="Cotisation annuelle" value={formatEUR(annual)} accent="primary" large />
      </div>

      <ConversionCTA simulatorName="assurance-habitation" params={{ status, surface, propertyType, annual }} />
    </div>
  );
}
