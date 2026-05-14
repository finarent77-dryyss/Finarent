'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import Wizard from '@/components/simulators/wizard/Wizard';
import { InlineNumber, InlineChoice, ChoiceCards } from '@/components/simulators/wizard/InlineInputs';
import { borrowingCapacity } from '@/lib/simulators/calculations/capacite';
import { monthlyPayment, totalCost, formatEUR } from '@/lib/simulators/calculations/pret';

const PROPERTY_TYPES = [
  { value: 'ancien', label: 'un logement ancien', desc: 'Construit il y a plus de 5 ans' },
  { value: 'neuf', label: 'un logement neuf', desc: 'VEFA ou construction récente' },
  { value: 'terrain', label: 'un terrain', desc: 'Achat de foncier' },
];
const FAMILY = [
  { value: 'celibataire', label: 'célibataire' },
  { value: 'couple', label: 'en couple' },
  { value: 'marie', label: 'marié(e) / pacsé(e)' },
];
const STATUS = [
  { value: 'cdi', label: 'CDI', icon: 'fa-briefcase' },
  { value: 'cdd', label: 'CDD', icon: 'fa-file-contract' },
  { value: 'indep', label: 'Indépendant', icon: 'fa-user-tie' },
  { value: 'fonctionnaire', label: 'Fonctionnaire', icon: 'fa-building-columns' },
];

export default function CapaciteEmpruntWizard() {
  const steps = [
    {
      id: 'project-type', group: 'Projet', label: 'Projet',
      validate: (v) => !!v.propertyType,
      render: ({ values, setValue }) => (
        <>
          <p>Il s'agit d'{' '}<InlineChoice value={values.propertyType} onChange={(v) => setValue('propertyType', v)} options={PROPERTY_TYPES} />.</p>
          <ChoiceCards value={values.propertyType} onChange={(v) => setValue('propertyType', v)}
            options={PROPERTY_TYPES.map((p) => ({ value: p.value, label: p.label.replace(/^un[e]? /, ''), desc: p.desc, icon: p.value === 'neuf' ? 'fa-house-chimney' : p.value === 'ancien' ? 'fa-house' : 'fa-map' }))}
            columns={3} />
        </>
      ),
    },
    {
      id: 'age', group: 'Situation perso', label: 'Situation perso',
      validate: (v) => v.age >= 18 && v.age <= 80,
      render: ({ values, setValue }) => (
        <p>Vous avez{' '}<InlineNumber value={values.age} onChange={(v) => setValue('age', v)} min={18} max={80} placeholder="35" width="3ch" />{' '}ans.</p>
      ),
    },
    {
      id: 'family', group: 'Situation perso', label: 'Situation familiale',
      validate: (v) => !!v.family,
      render: ({ values, setValue }) => (
        <p>Vous êtes{' '}<InlineChoice value={values.family} onChange={(v) => setValue('family', v)} options={FAMILY} />.</p>
      ),
    },
    {
      id: 'status', group: 'Situation pro', label: 'Situation pro',
      validate: (v) => !!v.status,
      render: ({ values, setValue }) => (
        <>
          <p>Quel est votre statut professionnel ?</p>
          <ChoiceCards value={values.status} onChange={(v) => setValue('status', v)} options={STATUS} columns={4} />
        </>
      ),
    },
    {
      id: 'income', group: 'Revenus', label: 'Revenus',
      validate: (v) => v.income >= 500,
      render: ({ values, setValue }) => (
        <>
          <p>Vos revenus mensuels nets du foyer sont de{' '}<InlineNumber value={values.income} onChange={(v) => setValue('income', v)} suffix="€" min={500} placeholder="4500" width="6ch" />.</p>
          <p className="mt-4 text-sm text-gray-500">Salaires nets + revenus locatifs + primes lissées.</p>
        </>
      ),
    },
    {
      id: 'charges', group: 'Charges', label: 'Charges',
      validate: () => true,
      render: ({ values, setValue }) => (
        <>
          <p>Vous remboursez actuellement{' '}<InlineNumber value={values.charges} onChange={(v) => setValue('charges', v || 0)} suffix="€" min={0} placeholder="0" width="5ch" />{' '}par mois en crédits.</p>
          <p className="mt-4 text-sm text-gray-500">Crédits auto, conso, prêts étudiants, autres prêts immobiliers…</p>
        </>
      ),
    },
    {
      id: 'apport', group: 'Apport', label: 'Apport',
      validate: () => true,
      render: ({ values, setValue }) => (
        <>
          <p>Votre apport personnel s'élève à{' '}<InlineNumber value={values.apport} onChange={(v) => setValue('apport', v || 0)} suffix="€" min={0} placeholder="30000" width="7ch" />.</p>
          <p className="mt-4 text-sm text-gray-500">Idéalement 10 à 20 % du prix du bien.</p>
        </>
      ),
    },
    {
      id: 'rate', group: 'Taux personnalisé', label: 'Durée & taux',
      validate: (v) => v.months >= 60 && v.rate > 0,
      render: ({ values, setValue }) => (
        <>
          <p>Vous souhaitez emprunter sur{' '}<InlineNumber value={values.years} onChange={(v) => { setValue('years', v); setValue('months', (v || 20) * 12); }} suffix="ans" min={5} max={25} placeholder="20" width="3ch" />{' '}à un taux de{' '}<InlineNumber value={values.rate} onChange={(v) => setValue('rate', v)} suffix="%" min={0.1} max={15} placeholder="4" width="4ch" />.</p>
          <p className="mt-4 text-sm text-gray-500">Taux marché immobilier 2026 : 3,2 % à 4,1 % selon profil.</p>
        </>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      initial={{ propertyType: '', age: '', family: '', status: '', income: '', charges: 0, apport: 0, years: 20, months: 240, rate: 3.8 }}
      onDone={(v, { restart }) => <ResultScreen values={v} onRestart={restart} />}
    />
  );
}

function ResultScreen({ values, onRestart }) {
  const capacity = useMemo(
    () => borrowingCapacity({ monthlyIncome: Number(values.income) || 0, currentDebts: Number(values.charges) || 0, months: Number(values.months) || 240, annualRate: Number(values.rate) || 4, debtRatio: 35 }),
    [values],
  );
  const m = monthlyPayment(capacity.maxAmount, values.months, values.rate);
  const cost = totalCost(m, values.months);
  const budgetMax = capacity.maxAmount + (Number(values.apport) || 0);
  const remainingToLive = (Number(values.income) || 0) - capacity.maxMonthly - (Number(values.charges) || 0);

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 mb-4">
        <i className="fa-solid fa-circle-check"></i> Simulation terminée
      </div>
      <h2 className="font-black text-primary leading-tight mb-3" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}>
        Vous pouvez emprunter jusqu'à <span className="gradient-text">{formatEUR(capacity.maxAmount)}</span>
      </h2>
      <p className="text-gray-600 text-[17px] mb-8 max-w-xl">
        Soit un budget total de <strong>{formatEUR(budgetMax)}</strong> avec votre apport, sur {Math.round(values.months / 12)} ans à {values.rate} %.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <ResultPill label="Mensualité maximale" value={formatEUR(capacity.maxMonthly)} accent="emerald" />
        <ResultPill label="Reste pour vivre" value={formatEUR(remainingToLive)} accent={remainingToLive > 1000 ? 'emerald' : 'rose'} />
        <ResultPill label="Coût total du crédit" value={formatEUR(cost)} accent="indigo" />
        <ResultPill label="Apport" value={formatEUR(Number(values.apport) || 0)} accent="violet" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/contact?simulator=capacite-emprunt&amount=${capacity.maxAmount}&months=${values.months}`} className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-px">
          <i className="fa-solid fa-headset"></i> Être recontacté par un expert
        </Link>
        <button type="button" onClick={onRestart} className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-primary font-semibold px-6 py-4 rounded-2xl hover:bg-gray-50 transition">
          <i className="fa-solid fa-rotate-left"></i> Recommencer
        </button>
      </div>
    </div>
  );
}

function ResultPill({ label, value, accent = 'indigo' }) {
  const accentMap = { emerald: 'text-emerald-600', indigo: 'text-indigo-600', violet: 'text-violet-600', rose: 'text-rose-600' };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">{label}</div>
      <div className={`text-2xl font-black tabular-nums mt-2 ${accentMap[accent]}`}>{value}</div>
    </div>
  );
}
