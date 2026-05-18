'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import Wizard from '@/components/simulators/wizard/Wizard';
import { InlineNumber, InlineChoice, ChoiceCards } from '@/components/simulators/wizard/InlineInputs';
import { monthlyPayment, totalCost, totalInterest, formatEUR } from '@/lib/simulators/calculations/pret';

const LOAN_TYPES = [
  { value: 'immobilier', label: 'immobilier', icon: 'fa-house', defaultRate: 3.8 },
  { value: 'auto', label: 'auto', icon: 'fa-car', defaultRate: 4.5 },
  { value: 'conso', label: 'à la consommation', icon: 'fa-cart-shopping', defaultRate: 6.5 },
  { value: 'pro', label: 'professionnel', icon: 'fa-briefcase', defaultRate: 5.2 },
];

export default function MensualiteWizard() {
  const steps = [
    {
      id: 'type', group: 'Projet', label: 'Type de prêt',
      validate: (v) => !!v.loanType,
      render: ({ values, setValue }) => (
        <>
          <p>Je souhaite simuler un prêt{' '}
            <InlineChoice value={values.loanType} onChange={(v) => {
              setValue('loanType', v);
              const t = LOAN_TYPES.find((x) => x.value === v);
              if (t) setValue('rate', t.defaultRate);
            }} options={LOAN_TYPES} />.</p>
          <ChoiceCards value={values.loanType} onChange={(v) => {
            setValue('loanType', v);
            const t = LOAN_TYPES.find((x) => x.value === v);
            if (t) setValue('rate', t.defaultRate);
          }} options={LOAN_TYPES.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))} columns={4} />
        </>
      ),
    },
    {
      id: 'amount', group: 'Montant', label: 'Montant emprunté',
      validate: (v) => v.amount >= 1000,
      render: ({ values, setValue }) => (
        <p>Je souhaite emprunter{' '}<InlineNumber value={values.amount} onChange={(v) => setValue('amount', v)} suffix="€" min={1000} placeholder="200000" width="8ch" />.</p>
      ),
    },
    {
      id: 'duration', group: 'Durée', label: 'Durée du prêt',
      validate: (v) => v.months >= 12,
      render: ({ values, setValue }) => (
        <p>Sur une durée de{' '}<InlineNumber value={values.years} onChange={(v) => { setValue('years', v); setValue('months', (v || 1) * 12); }} suffix="ans" min={1} max={30} placeholder="20" width="3ch" />.</p>
      ),
    },
    {
      id: 'rate', group: 'Taux', label: 'Taux du prêt',
      validate: (v) => v.rate > 0,
      render: ({ values, setValue }) => (
        <>
          <p>Au taux nominal de{' '}<InlineNumber value={values.rate} onChange={(v) => setValue('rate', v)} suffix="%" min={0.1} max={15} placeholder="3.8" width="4ch" />{' '}avec une assurance à{' '}<InlineNumber value={values.insuranceRate} onChange={(v) => setValue('insuranceRate', v)} suffix="%" min={0} max={1.5} placeholder="0.30" width="4ch" />.</p>
          <p className="mt-4 text-sm text-gray-500">Bancaire ~0,30 % · Délégation ~0,10–0,20 %</p>
        </>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      initial={{ loanType: 'immobilier', amount: 200000, years: 20, months: 240, rate: 3.8, insuranceRate: 0.30 }}
      onDone={(v, { restart }) => <ResultScreen values={v} onRestart={restart} />}
    />
  );
}

function ResultScreen({ values, onRestart }) {
  const m = useMemo(() => monthlyPayment(values.amount, values.months, values.rate), [values]);
  const cost = totalCost(m, values.months);
  const interest = totalInterest(m, values.months, values.amount);
  const monthlyInsurance = Math.round((values.amount * values.insuranceRate / 100) / 12);
  const totalMonthly = m + monthlyInsurance;

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 mb-4">
        <i className="fa-solid fa-circle-check"></i> Simulation terminée
      </div>
      <h2 className="font-black text-primary leading-tight mb-3" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}>
        Votre mensualité : <span className="gradient-text">{formatEUR(totalMonthly)}</span>
      </h2>
      <p className="text-gray-600 text-[17px] mb-8 max-w-xl">
        Soit {formatEUR(m)} de prêt + {formatEUR(monthlyInsurance)} d'assurance, sur {Math.round(values.months / 12)} ans à {values.rate} %.
      </p>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <ResultPill label="Mensualité totale" value={formatEUR(totalMonthly)} accent="emerald" />
        <ResultPill label="Coût total" value={formatEUR(cost)} accent="indigo" />
        <ResultPill label="Intérêts" value={formatEUR(interest)} accent="violet" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/contact?simulator=mensualite&amount=${values.amount}&months=${values.months}&rate=${values.rate}`} className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition hover:-translate-y-px">
          <i className="fa-solid fa-headset"></i> Obtenir le meilleur taux
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
