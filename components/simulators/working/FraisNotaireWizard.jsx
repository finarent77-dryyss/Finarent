'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import Wizard from '@/components/simulators/wizard/Wizard';
import { InlineNumber, InlineChoice, ChoiceCards } from '@/components/simulators/wizard/InlineInputs';
import { notaryFees } from '@/lib/simulators/calculations/notaire';
import { formatEUR } from '@/lib/simulators/calculations/pret';

const TYPES = [
  { value: 'ancien', label: 'ancien', desc: '≥ 5 ans · droits ~7-8 %', icon: 'fa-house' },
  { value: 'neuf', label: 'neuf', desc: '< 5 ans / VEFA · droits ~2-3 %', icon: 'fa-house-chimney' },
];

export default function FraisNotaireWizard() {
  const steps = [
    {
      id: 'type', group: 'Type de bien', label: 'Type de bien',
      validate: (v) => !!v.type,
      render: ({ values, setValue }) => (
        <>
          <p>Il s'agit d'un logement{' '}<InlineChoice value={values.type} onChange={(v) => setValue('type', v)} options={TYPES} />.</p>
          <ChoiceCards value={values.type} onChange={(v) => setValue('type', v)} options={TYPES} columns={2} />
        </>
      ),
    },
    {
      id: 'price', group: 'Prix', label: "Prix d'achat",
      validate: (v) => v.price >= 10000,
      render: ({ values, setValue }) => (
        <p>Le prix d'achat est de{' '}<InlineNumber value={values.price} onChange={(v) => setValue('price', v)} suffix="€" min={10000} placeholder="250000" width="8ch" />.</p>
      ),
    },
    {
      id: 'apport', group: 'Apport', label: 'Apport personnel',
      validate: () => true,
      render: ({ values, setValue }) => (
        <p>Votre apport personnel s'élève à{' '}<InlineNumber value={values.apport} onChange={(v) => setValue('apport', v || 0)} suffix="€" min={0} placeholder="50000" width="7ch" />.</p>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      initial={{ type: '', price: 250000, apport: 50000 }}
      onDone={(v, { restart }) => <ResultScreen values={v} onRestart={restart} />}
    />
  );
}

function ResultScreen({ values, onRestart }) {
  const fees = useMemo(() => notaryFees({ price: values.price, type: values.type }), [values]);
  const totalAcq = values.price + fees.total;
  const loanNeeded = Math.max(0, totalAcq - (values.apport || 0));

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 mb-4">
        <i className="fa-solid fa-circle-check"></i> Simulation terminée
      </div>
      <h2 className="font-black text-primary leading-tight mb-3" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}>
        Frais de notaire : <span className="gradient-text">{formatEUR(fees.total)}</span>
      </h2>
      <p className="text-gray-600 text-[17px] mb-8 max-w-xl">
        Soit {fees.rate.toFixed(1)} % du prix. Acquisition totale : <strong>{formatEUR(totalAcq)}</strong>.
      </p>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <ResultPill label="Frais de notaire" value={formatEUR(fees.total)} accent="emerald" />
        <ResultPill label="Prix + frais" value={formatEUR(totalAcq)} accent="indigo" />
        <ResultPill label="Emprunt nécessaire" value={formatEUR(loanNeeded)} accent="violet" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/contact?simulator=frais-notaire&amount=${loanNeeded}`} className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition hover:-translate-y-px">
          <i className="fa-solid fa-headset"></i> Financer mon projet
        </Link>
        <button type="button" onClick={onRestart} className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-primary font-semibold px-6 py-4 rounded-2xl hover:bg-gray-50 transition">
          <i className="fa-solid fa-rotate-left"></i> Recommencer
        </button>
      </div>
    </div>
  );
}

function ResultPill({ label, value, accent }) {
  const accentMap = { emerald: 'text-emerald-600', indigo: 'text-indigo-600', violet: 'text-violet-600' };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">{label}</div>
      <div className={`text-2xl font-black tabular-nums mt-2 ${accentMap[accent]}`}>{value}</div>
    </div>
  );
}
