'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { SliderInput, NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function AssuranceAutoSimulator() {
  const [formula, setFormula] = useState('tousrisques');
  const [vehicleValue, setVehicleValue] = useState(25000);
  const [vehicleAge, setVehicleAge] = useState(2);
  const [bonus, setBonus] = useState(0.50); // CRM
  const [driverAge, setDriverAge] = useState(35);
  const [annualKm, setAnnualKm] = useState(15000);

  const annual = useMemo(() => {
    // Base 2025-2026 : prime moyenne FR ≈ 650€/an pour tous risques voiture ~25k€.
    // Soit ~2.6% de la valeur. On part sur une fourchette plancher + part valeur.
    let p = 380 + vehicleValue * 0.028;
    // Formule
    if (formula === 'auTiers')         p *= 0.55;
    else if (formula === 'intermediaire') p *= 0.78;
    // Tous risques = 1.0 (base)
    // Ajustement âge véhicule (décote douce, plancher 0.65)
    p *= Math.max(0.65, 1 - vehicleAge * 0.035);
    // Bonus / CRM (effet borné — un bon CRM ne descend pas en dessous de -45%)
    p *= Math.max(0.55, bonus);
    // Âge conducteur
    if (driverAge < 25) p *= 1.75;
    else if (driverAge < 30) p *= 1.25;
    else if (driverAge >= 70) p *= 1.20;
    else if (driverAge >= 65) p *= 1.10;
    // Kilométrage
    if (annualKm > 25000) p *= 1.25;
    else if (annualKm > 20000) p *= 1.15;
    else if (annualKm < 8000) p *= 0.90;
    return Math.round(p);
  }, [formula, vehicleValue, vehicleAge, bonus, driverAge, annualKm]);

  const monthly = Math.round(annual / 12);

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Estimation indicative de cotisation auto. Le tarif réel dépend aussi du modèle exact, du lieu de garage et de l'historique sinistres précis. Devis personnalisé disponible.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Formule</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'auTiers', label: 'Au tiers' },
              { id: 'intermediaire', label: 'Tiers étendu' },
              { id: 'tousrisques', label: 'Tous risques' },
            ].map((f) => (
              <button key={f.id} type="button" onClick={() => setFormula(f.id)} className={`py-3 rounded-xl border-2 font-bold text-sm transition ${formula === f.id ? 'border-secondary bg-secondary/5 text-secondary' : 'border-gray-200 text-gray-500'}`}>{f.label}</button>
            ))}
          </div>
        </div>

        <SliderInput label="Valeur du véhicule" value={vehicleValue} onChange={setVehicleValue} min={2000} max={150000} step={1000} accent="secondary" />
        <SliderInput label="Âge du véhicule" value={vehicleAge} onChange={setVehicleAge} min={0} max={20} step={1} suffix="ans" format="number" accent="accent" />
        <div className="grid sm:grid-cols-3 gap-4">
          <NumberInput label="Bonus / CRM" value={bonus} onChange={setBonus} step={0.05} min={0.50} max={3.5} />
          <NumberInput label="Âge conducteur" value={driverAge} onChange={setDriverAge} suffix="ans" step={1} min={18} max={90} />
          <NumberInput label="Km/an" value={annualKm} onChange={setAnnualKm} suffix="km" step={1000} min={2000} max={50000} />
        </div>
        <div className="text-xs text-gray-400">CRM 0.50 = bonus 50% · CRM 1.00 = neutre · CRM &gt; 1 = malus</div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultCard label="Cotisation mensuelle" value={formatEUR(monthly)} accent="secondary" large />
        <ResultCard label="Cotisation annuelle" value={formatEUR(annual)} accent="primary" large />
      </div>

      <ConversionCTA simulatorName="assurance-auto" params={{ formula, vehicleValue, bonus, annual }} />
    </div>
  );
}
