'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

const ZONE_LIMITS = {
  A:    { 1: 150000, 2: 210000, 3: 255000, 4: 285000, 5: 315000 },
  Abis: { 1: 150000, 2: 210000, 3: 255000, 4: 285000, 5: 315000 },
  B1:   { 1: 135000, 2: 189000, 3: 230000, 4: 255000, 5: 285000 },
  B2:   { 1: 110000, 2: 154000, 3: 187000, 4: 207000, 5: 231000 },
  C:    { 1: 100000, 2: 140000, 3: 170000, 4: 188000, 5: 210000 },
};

/** Prêt à Taux Zéro : éligibilité + montant max. */
export default function PTZSimulator() {
  const [zone, setZone] = useState('B1');
  const [household, setHousehold] = useState(3);
  const [income, setIncome] = useState(36000);
  const [propertyPrice, setPropertyPrice] = useState(220000);
  const [type, setType] = useState('neuf'); // neuf | ancien

  // Plafond ressources HCSF 2024 (simplifié) selon zone + taille foyer
  const incomeLimits = {
    A:    { 1: 49000, 2: 73500, 3: 88200, 4: 102900, 5: 117600 },
    Abis: { 1: 49000, 2: 73500, 3: 88200, 4: 102900, 5: 117600 },
    B1:   { 1: 34500, 2: 51750, 3: 62100, 4: 72450, 5: 82800 },
    B2:   { 1: 31500, 2: 47250, 3: 56700, 4: 66150, 5: 75600 },
    C:    { 1: 28500, 2: 42750, 3: 51300, 4: 59850, 5: 68400 },
  };

  const householdKey = Math.min(household, 5);
  const incomeLimit = incomeLimits[zone][householdKey];
  const propertyLimit = ZONE_LIMITS[zone][householdKey];
  const eligible = income <= incomeLimit && propertyPrice <= propertyLimit && type === 'neuf';

  // Quotité PTZ : 40% des opérations en zone A/Abis/B1, 20% en B2/C, du prix dans la limite
  const quotityRate = (zone === 'A' || zone === 'Abis' || zone === 'B1') ? 40 : 20;
  const eligibleBase = Math.min(propertyPrice, propertyLimit);
  const ptzAmount = eligible ? Math.round((eligibleBase * quotityRate) / 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Le Prêt à Taux Zéro permet d'emprunter sans intérêts pour financer une partie de votre résidence principale neuve, sous conditions de ressources et de zone géographique.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Zone géographique</label>
          <div className="grid grid-cols-5 gap-2">
            {['Abis', 'A', 'B1', 'B2', 'C'].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZone(z)}
                className={`py-2 rounded-lg border-2 font-bold text-sm transition ${zone === z ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}
              >
                {z}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2">A bis/A : tension forte · B1 : tension moyenne · B2/C : zones détendues</div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setType('neuf')} className={`py-3 rounded-xl border-2 font-bold transition ${type === 'neuf' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>Neuf / VEFA</button>
            <button type="button" onClick={() => setType('ancien')} className={`py-3 rounded-xl border-2 font-bold transition ${type === 'ancien' ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>Ancien</button>
          </div>
        </div>

        <SliderInput label="Personnes dans le foyer" value={household} onChange={setHousehold} min={1} max={5} step={1} suffix="pers" format="number" accent="accent" />
        <NumberInput label="Revenus fiscaux du foyer (annuels)" value={income} onChange={setIncome} suffix="€" step={1000} min={10000} />
        <NumberInput label="Prix d'achat du bien" value={propertyPrice} onChange={setPropertyPrice} suffix="€" step={5000} min={50000} />
      </div>

      <div className={`rounded-2xl p-6 ${eligible ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-rose-50 border-2 border-rose-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 ${eligible ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <i className={`fa-solid ${eligible ? 'fa-check' : 'fa-xmark'} text-xl`}></i>
          </div>
          <div className="flex-1">
            <div className={`text-xs uppercase tracking-widest font-bold mb-1 ${eligible ? 'text-emerald-700' : 'text-rose-700'}`}>
              {eligible ? 'Éligible au PTZ' : 'Non éligible'}
            </div>
            {eligible ? (
              <>
                <div className="text-3xl font-black text-emerald-700">{formatEUR(ptzAmount)}</div>
                <div className="text-sm text-emerald-700 mt-1">Montant maximal de votre PTZ ({quotityRate}% de l'opération)</div>
              </>
            ) : (
              <div className="text-sm text-rose-700 mt-1">
                {type === 'ancien' && 'Le PTZ neuf seul est éligible (sauf zone B2/C avec travaux). '}
                {income > incomeLimit && `Revenus > plafond ${formatEUR(incomeLimit)}. `}
                {propertyPrice > propertyLimit && `Prix > plafond ${formatEUR(propertyLimit)}.`}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Plafond ressources zone" value={formatEUR(incomeLimit)} sub={`Foyer ${household} pers.`} accent="primary" large />
        <ResultCard label="Plafond opération zone" value={formatEUR(propertyLimit)} accent="accent" />
      </div>

      <ConversionCTA simulatorName="ptz" params={{ zone, household, income, propertyPrice, type, ptzAmount }} />
    </div>
  );
}
