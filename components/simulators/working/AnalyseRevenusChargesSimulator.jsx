'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function AnalyseRevenusChargesSimulator() {
  const [ca, setCa] = useState(800000);
  const [achats, setAchats] = useState(280000);
  const [salaires, setSalaires] = useState(220000);
  const [externes, setExternes] = useState(100000);
  const [impots, setImpots] = useState(35000);
  const [dettes, setDettes] = useState(80000);

  const margeBrute = ca - achats;
  const valeurAjoutee = margeBrute - externes;
  const ebe = valeurAjoutee - salaires - impots;
  const resultatNet = Math.round(ebe * 0.75 - dettes * 0.04); // approximation après IS et frais financiers
  const margeBruteRate = (margeBrute / ca) * 100;
  const ebeRate = (ebe / ca) * 100;

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Analyse rapide du compte de résultat : marge brute, valeur ajoutée, EBE et résultat net pour évaluer la santé financière de votre entreprise.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <NumberInput label="Chiffre d'affaires" value={ca} onChange={setCa} suffix="€" step={10000} min={0} />
        <NumberInput label="Achats et matières premières" value={achats} onChange={setAchats} suffix="€" step={5000} min={0} />
        <NumberInput label="Salaires et charges sociales" value={salaires} onChange={setSalaires} suffix="€" step={5000} min={0} />
        <NumberInput label="Autres charges externes (loyer, télécom...)" value={externes} onChange={setExternes} suffix="€" step={5000} min={0} />
        <NumberInput label="Impôts et taxes" value={impots} onChange={setImpots} suffix="€" step={1000} min={0} />
        <NumberInput label="Dettes financières existantes" value={dettes} onChange={setDettes} suffix="€" step={5000} min={0} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Marge brute" value={formatEUR(margeBrute)} sub={`${margeBruteRate.toFixed(1)}% du CA`} accent="emerald-600" />
        <ResultCard label="Valeur ajoutée" value={formatEUR(valeurAjoutee)} sub="Création de richesse" accent="secondary" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="EBE (Excédent Brut d'Exploitation)" value={formatEUR(ebe)} sub={`${ebeRate.toFixed(1)}% du CA`} accent="primary" large />
        <ResultCard label="Résultat net estimé" value={formatEUR(resultatNet)} sub="Après IS & charges financières" accent={resultatNet > 0 ? 'emerald-600' : 'rose-600'} large />
      </div>

      <ConversionCTA simulatorName="analyse-revenus-charges" params={{ ca, margeBrute, ebe, resultatNet }} />
    </div>
  );
}
