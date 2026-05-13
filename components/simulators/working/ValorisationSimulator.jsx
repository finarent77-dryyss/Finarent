'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

// Prix m² moyen indicatif par zone (basé sur stats notaires Île-de-France / régions 2024)
const ZONE_PRICES = {
  'Paris':         { appartement: 10500, maison: 11200 },
  'Lyon':          { appartement: 5100, maison: 4800 },
  'Marseille':     { appartement: 3300, maison: 4100 },
  'Toulouse':      { appartement: 3700, maison: 3950 },
  'Bordeaux':      { appartement: 4400, maison: 4700 },
  'Lille':         { appartement: 3200, maison: 3000 },
  'Nantes':        { appartement: 3700, maison: 4100 },
  'Strasbourg':    { appartement: 3550, maison: 3300 },
  'Nice':          { appartement: 4900, maison: 5500 },
  'Banlieue parisienne': { appartement: 4800, maison: 5400 },
  'Ville moyenne': { appartement: 2200, maison: 2400 },
  'Zone rurale':   { appartement: 1400, maison: 1800 },
};

export default function ValorisationSimulator() {
  const [zone, setZone] = useState('Banlieue parisienne');
  const [propertyType, setPropertyType] = useState('appartement');
  const [surface, setSurface] = useState(75);
  const [condition, setCondition] = useState('bon');
  const [floor, setFloor] = useState('moyen');
  const [features, setFeatures] = useState({ balcony: false, parking: false, view: false, elevator: true });

  const basePrice = ZONE_PRICES[zone][propertyType];
  const baseValue = basePrice * surface;

  // Modulations
  let multiplier = 1;
  if (condition === 'neuf')        multiplier *= 1.15;
  else if (condition === 'renove') multiplier *= 1.07;
  else if (condition === 'travaux')multiplier *= 0.78;
  if (floor === 'haut')   multiplier *= 1.08;
  else if (floor === 'rdc') multiplier *= 0.92;
  if (features.balcony)  multiplier *= 1.04;
  if (features.parking)  multiplier *= 1.05;
  if (features.view)     multiplier *= 1.07;
  if (!features.elevator && floor !== 'rdc') multiplier *= 0.94;

  const estimatedValue = Math.round(baseValue * multiplier);
  const lowEstimate = Math.round(estimatedValue * 0.92);
  const highEstimate = Math.round(estimatedValue * 1.08);

  const toggleFeature = (key) => setFeatures((f) => ({ ...f, [key]: !f[key] }));

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Estimation indicative basée sur les prix moyens du marché (notaires + DVF). Pour une expertise précise et certifiée, votre conseiller Finassur vous met en relation avec un expert agréé.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Localisation</label>
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white focus:border-secondary focus:outline-none">
            {Object.keys(ZONE_PRICES).map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPropertyType('appartement')} className={`py-3 rounded-xl border-2 font-bold transition ${propertyType === 'appartement' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>🏢 Appartement</button>
            <button type="button" onClick={() => setPropertyType('maison')} className={`py-3 rounded-xl border-2 font-bold transition ${propertyType === 'maison' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>🏠 Maison</button>
          </div>
        </div>

        <SliderInput label="Surface" value={surface} onChange={setSurface} min={15} max={400} step={5} suffix="m²" format="number" accent="secondary" />

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">État général</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'travaux', label: 'À rénover' },
              { id: 'bon', label: 'Bon état' },
              { id: 'renove', label: 'Rénové' },
              { id: 'neuf', label: 'Neuf / refait' },
            ].map((c) => (
              <button key={c.id} type="button" onClick={() => setCondition(c.id)} className={`py-2 rounded-lg border-2 font-bold text-xs transition ${condition === c.id ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>{c.label}</button>
            ))}
          </div>
        </div>

        {propertyType === 'appartement' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Étage</label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setFloor('rdc')} className={`py-2 rounded-lg border-2 font-bold text-sm transition ${floor === 'rdc' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>RDC / Bas</button>
              <button type="button" onClick={() => setFloor('moyen')} className={`py-2 rounded-lg border-2 font-bold text-sm transition ${floor === 'moyen' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>Moyen</button>
              <button type="button" onClick={() => setFloor('haut')} className={`py-2 rounded-lg border-2 font-bold text-sm transition ${floor === 'haut' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>Haut</button>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Plus du bien</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'balcony', label: 'Balcon / Terrasse' },
              { id: 'parking', label: 'Parking / Box' },
              { id: 'view', label: 'Belle vue' },
              { id: 'elevator', label: 'Ascenseur' },
            ].map((f) => (
              <button key={f.id} type="button" onClick={() => toggleFeature(f.id)} className={`py-2 rounded-lg border-2 font-bold text-xs transition ${features[f.id] ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-400'}`}>
                {features[f.id] ? '✓ ' : ''}{f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-secondary/5 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
        <div className="text-xs uppercase tracking-widest font-bold text-emerald-700 mb-2">Estimation centrale</div>
        <div className="text-5xl font-black text-emerald-700">{formatEUR(estimatedValue)}</div>
        <div className="text-sm text-emerald-700 mt-2">soit <strong>{formatEUR(Math.round(estimatedValue / surface))}/m²</strong></div>
        <div className="text-xs text-gray-600 mt-3">Fourchette indicative : <strong>{formatEUR(lowEstimate)}</strong> — <strong>{formatEUR(highEstimate)}</strong></div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ResultCard label="Prix bas" value={formatEUR(lowEstimate)} sub="Estimation prudente" accent="rose-600" />
        <ResultCard label="Prix central" value={formatEUR(estimatedValue)} accent="secondary" />
        <ResultCard label="Prix haut" value={formatEUR(highEstimate)} sub="Estimation optimiste" accent="emerald-600" />
      </div>

      <ConversionCTA simulatorName="valorisation" params={{ zone, propertyType, surface, condition, estimatedValue }} />
    </div>
  );
}
