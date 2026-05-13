'use client';

import { useState, useMemo } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';
import { NumberInput, ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

export default function CoutTotalAssuranceSimulator() {
  const [auto, setAuto] = useState(680);
  const [habitation, setHabitation] = useState(220);
  const [sante, setSante] = useState(950);
  const [prevoyance, setPrevoyance] = useState(450);
  const [rcpro, setRcpro] = useState(0);
  const [emprunteur, setEmprunteur] = useState(720);
  const [autres, setAutres] = useState(0);

  const total = useMemo(() => auto + habitation + sante + prevoyance + rcpro + emprunteur + autres, [auto, habitation, sante, prevoyance, rcpro, emprunteur, autres]);
  const monthly = Math.round(total / 12);

  const items = [
    { label: 'Auto', val: auto, set: setAuto, icon: '🚗' },
    { label: 'Habitation', val: habitation, set: setHabitation, icon: '🏠' },
    { label: 'Santé / mutuelle', val: sante, set: setSante, icon: '❤️‍🩹' },
    { label: 'Prévoyance', val: prevoyance, set: setPrevoyance, icon: '🛡️' },
    { label: 'RC Pro', val: rcpro, set: setRcpro, icon: '💼' },
    { label: 'Emprunteur', val: emprunteur, set: setEmprunteur, icon: '🏦' },
    { label: 'Autres', val: autres, set: setAutres, icon: '📋' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Synthèse annuelle de toutes vos cotisations d'assurance. Un audit Finassur identifie souvent 20-30% d'économies par ré-négociation/délégation.
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{it.icon}</div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700">{it.label}</label>
            </div>
            <div className="w-40">
              <NumberInput value={it.val} onChange={it.set} suffix="€/an" step={50} min={0} label={null} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary to-[#0F2748] text-white rounded-2xl p-8">
        <div className="text-xs uppercase tracking-widest font-bold text-accent mb-2">Coût total annuel</div>
        <div className="text-5xl font-black">{formatEUR(total)}</div>
        <div className="text-sm text-white/70 mt-2">soit {formatEUR(monthly)} / mois</div>
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
        <div className="text-xs uppercase tracking-widest font-bold text-emerald-700">Économies potentielles avec un audit Finassur</div>
        <div className="text-2xl font-black text-emerald-700 mt-1">{formatEUR(Math.round(total * 0.25))} / an</div>
        <div className="text-sm text-emerald-700 mt-1">Soit ~25% via ré-négociation, délégation et optimisation des garanties</div>
      </div>

      <ConversionCTA simulatorName="cout-total-assurance" params={{ total, monthly, savings: Math.round(total * 0.25) }} />
    </div>
  );
}
