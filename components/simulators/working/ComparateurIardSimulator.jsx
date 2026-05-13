'use client';

import { ResultCard } from '@/components/simulators/inputs';
import ConversionCTA from '@/components/simulators/ConversionCTA';

const GARANTIES = [
  { name: 'Responsabilité civile', auto: '✅', habitation: '✅', rcpro: '✅', sante: '—' },
  { name: 'Dommages tous accidents', auto: '✅ (Tous risques)', habitation: '—', rcpro: '—', sante: '—' },
  { name: 'Vol & vandalisme', auto: '✅', habitation: '✅', rcpro: '⚠️ option', sante: '—' },
  { name: 'Incendie / explosion', auto: '✅', habitation: '✅', rcpro: '⚠️ option', sante: '—' },
  { name: 'Dégâts des eaux', auto: '—', habitation: '✅', rcpro: '⚠️ option', sante: '—' },
  { name: 'Bris de glace', auto: '✅', habitation: '✅ option', rcpro: '—', sante: '—' },
  { name: 'Catastrophes naturelles', auto: '✅', habitation: '✅', rcpro: '✅', sante: '—' },
  { name: 'Protection juridique', auto: '⚠️ option', habitation: '⚠️ option', rcpro: '⚠️ option', sante: '—' },
  { name: 'Assistance dépannage', auto: '✅', habitation: '⚠️ option', rcpro: '—', sante: '—' },
  { name: 'Garantie corporelle conducteur', auto: '⚠️ option', habitation: '—', rcpro: '—', sante: '—' },
  { name: 'Décennale (BTP)', auto: '—', habitation: '—', rcpro: '✅ obligatoire BTP', sante: '—' },
  { name: 'Hospitalisation', auto: '—', habitation: '—', rcpro: '—', sante: '✅' },
  { name: 'Optique / dentaire', auto: '—', habitation: '—', rcpro: '—', sante: '✅' },
  { name: 'Médecines douces', auto: '—', habitation: '—', rcpro: '—', sante: '⚠️ Confort+' },
];

export default function ComparateurIardSimulator() {
  return (
    <div className="space-y-6">
      <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 text-sm text-primary">
        <i className="fa-solid fa-circle-info text-secondary mr-2"></i>
        Synthèse des garanties typiques des contrats IARD (Incendie, Accidents, Risques Divers) et santé. ✅ = inclus de base · ⚠️ = en option · — = non concerné.
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="text-left px-5 py-3 text-xs uppercase tracking-widest">Garantie</th>
              <th className="text-center px-3 py-3 text-xs">Auto</th>
              <th className="text-center px-3 py-3 text-xs">Habitation</th>
              <th className="text-center px-3 py-3 text-xs">RC Pro</th>
              <th className="text-center px-3 py-3 text-xs">Santé</th>
            </tr>
          </thead>
          <tbody>
            {GARANTIES.map((g, i) => (
              <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-2.5 font-semibold text-primary">{g.name}</td>
                <td className="px-3 py-2.5 text-center text-xs">{g.auto}</td>
                <td className="px-3 py-2.5 text-center text-xs">{g.habitation}</td>
                <td className="px-3 py-2.5 text-center text-xs">{g.rcpro}</td>
                <td className="px-3 py-2.5 text-center text-xs">{g.sante}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <ResultCard label="Auto" value="🚗" sub="Tarif: 350-1200€/an" accent="secondary" />
        <ResultCard label="Habitation" value="🏠" sub="Tarif: 150-450€/an" accent="emerald-600" />
        <ResultCard label="RC Pro" value="💼" sub="Tarif: 250-2000€/an" accent="primary" />
        <ResultCard label="Santé" value="❤️‍🩹" sub="Tarif: 400-1800€/an" accent="rose-600" />
      </div>

      <ConversionCTA simulatorName="comparateur-iard" />
    </div>
  );
}
