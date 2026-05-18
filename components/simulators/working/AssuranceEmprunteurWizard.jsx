'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import Wizard from '@/components/simulators/wizard/Wizard';
import { InlineNumber, InlineChoice, ChoiceCards } from '@/components/simulators/wizard/InlineInputs';
import { totalPremiumOnInitialCapital, totalPremiumOnCrd } from '@/lib/simulators/calculations/assurance';
import { formatEUR } from '@/lib/simulators/calculations/pret';

const BASES = [
  { value: 'capital', label: 'sur le capital initial', desc: 'Prime fixe — bancaire groupe' },
  { value: 'crd', label: 'sur le capital restant dû', desc: 'Prime décroissante — délégation' },
];
const QUOTITY = [
  { value: 50, label: '50 %' },
  { value: 75, label: '75 %' },
  { value: 100, label: '100 %' },
];

export default function AssuranceEmprunteurWizard() {
  const steps = [
    { id: 'amount', group: 'Capital', label: 'Capital emprunté', validate: (v) => v.amount >= 5000,
      render: ({ values, setValue }) => (
        <p>J'emprunte{' '}<InlineNumber value={values.amount} onChange={(v) => setValue('amount', v)} suffix="€" min={5000} placeholder="200000" width="8ch" />{' '}sur{' '}<InlineNumber value={values.years} onChange={(v) => { setValue('years', v); setValue('months', (v || 1) * 12); }} suffix="ans" min={1} max={30} placeholder="20" width="3ch" />.</p>
      ),
    },
    { id: 'base', group: 'Base de calcul', label: 'Base de calcul', validate: (v) => !!v.base,
      render: ({ values, setValue }) => (
        <>
          <p>La prime est calculée{' '}<InlineChoice value={values.base} onChange={(v) => setValue('base', v)} options={BASES} />.</p>
          <ChoiceCards value={values.base} onChange={(v) => setValue('base', v)} options={BASES} columns={2} />
        </>
      ),
    },
    { id: 'rate1', group: 'Emprunteur 1', label: 'Emprunteur 1', validate: (v) => v.rate1 > 0 && v.q1 > 0,
      render: ({ values, setValue }) => (
        <>
          <p>Mon taux d'assurance est de{' '}<InlineNumber value={values.rate1} onChange={(v) => setValue('rate1', v)} suffix="%" min={0.05} max={2} placeholder="0.30" width="4ch" />{' '}sur une quotité de{' '}<InlineChoice value={values.q1} onChange={(v) => setValue('q1', v)} options={QUOTITY} />.</p>
          <p className="mt-4 text-sm text-gray-500">Bancaire ~0,30 % · Délégation ~0,10–0,20 %</p>
        </>
      ),
    },
    { id: 'co', group: 'Co-emprunteur', label: 'Co-emprunteur', validate: (v) => !v.hasCo || (v.rate2 > 0 && v.q2 > 0),
      render: ({ values, setValue }) => (
        <>
          <p>J'emprunte{' '}<InlineChoice value={values.hasCo ? 'yes' : 'no'} onChange={(v) => setValue('hasCo', v === 'yes')} options={[
            { value: 'no', label: 'seul(e)' },
            { value: 'yes', label: 'à deux' },
          ]} />.</p>
          {values.hasCo && (
            <p className="mt-6">Le co-emprunteur a un taux de{' '}<InlineNumber value={values.rate2} onChange={(v) => setValue('rate2', v)} suffix="%" min={0.05} max={2} placeholder="0.30" width="4ch" />{' '}sur une quotité de{' '}<InlineChoice value={values.q2} onChange={(v) => setValue('q2', v)} options={QUOTITY} />.</p>
          )}
        </>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      initial={{ amount: 200000, years: 20, months: 240, base: 'capital', rate1: 0.30, q1: 100, hasCo: false, rate2: 0.30, q2: 100 }}
      onDone={(v, { restart }) => <ResultScreen values={v} onRestart={restart} />}
    />
  );
}

function ResultScreen({ values, onRestart }) {
  const { amount, months, base, rate1, q1, hasCo, rate2, q2 } = values;
  const total1 = useMemo(() => {
    const ba = amount * (q1 / 100);
    return base === 'capital' ? totalPremiumOnInitialCapital(ba, rate1, months) : totalPremiumOnCrd(ba, rate1, months);
  }, [amount, q1, base, rate1, months]);
  const total2 = useMemo(() => {
    if (!hasCo) return 0;
    const ba = amount * (q2 / 100);
    return base === 'capital' ? totalPremiumOnInitialCapital(ba, rate2, months) : totalPremiumOnCrd(ba, rate2, months);
  }, [hasCo, amount, q2, base, rate2, months]);

  const total = total1 + total2;
  const monthlyInitial = Math.round(((amount * q1 / 100) * (rate1 / 100) / 12) + (hasCo ? ((amount * q2 / 100) * (rate2 / 100) / 12) : 0));
  const savings = Math.round((amount * (0.30 - 0.13) / 100) * (months / 12));

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 mb-4">
        <i className="fa-solid fa-circle-check"></i> Simulation terminée
      </div>
      <h2 className="font-black text-primary leading-tight mb-3" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}>
        Coût total : <span className="gradient-text">{formatEUR(total)}</span>
      </h2>
      <p className="text-gray-600 text-[17px] mb-8 max-w-xl">
        Sur {Math.round(months / 12)} ans, base {base === 'capital' ? 'capital initial' : 'capital restant dû'}{hasCo ? ' · 2 emprunteurs' : ''}.
      </p>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <ResultPill label="Prime initiale / mois" value={formatEUR(monthlyInitial)} accent="emerald" />
        <ResultPill label="Total assurance" value={formatEUR(total)} accent="indigo" />
        <ResultPill label="Économies estimées (délégation)" value={formatEUR(Math.max(0, savings))} accent="violet" />
      </div>
      <div className="bg-[#FAF8F3] border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">Loi Lemoine</div>
        <p className="text-sm text-primary leading-relaxed">
          Vous pouvez changer d'assurance emprunteur <strong>à tout moment</strong> depuis 2022.
          La délégation permet d'économiser en moyenne <strong>40 à 60 %</strong> sur le coût total.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/contact?simulator=assurance-emprunteur&amount=${amount}&months=${months}&total=${total}`} className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition hover:-translate-y-px">
          <i className="fa-solid fa-headset"></i> Comparer les délégations
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
