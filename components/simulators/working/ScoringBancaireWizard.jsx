'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import Wizard from '@/components/simulators/wizard/Wizard';
import { InlineNumber, InlineChoice, ChoiceCards } from '@/components/simulators/wizard/InlineInputs';

const STATUS = [
  { value: 'CDI', label: 'CDI', icon: 'fa-briefcase' },
  { value: 'CDD', label: 'CDD', icon: 'fa-file-contract' },
  { value: 'TNS', label: 'Indépendant', icon: 'fa-user-tie' },
  { value: 'FONCTIONNAIRE', label: 'Fonctionnaire', icon: 'fa-building-columns' },
];
const INCIDENTS = [
  { value: 'no', label: 'aucun incident' },
  { value: 'yes', label: 'des incidents bancaires (FICP, interdit…)' },
];

function compute({ revenu, endettement, anciennete, apport, statutEmploi, incidents }) {
  let s = 50;
  if (revenu >= 5000) s += 20; else if (revenu >= 3500) s += 15; else if (revenu >= 2500) s += 8; else s -= 5;
  if (endettement <= 25) s += 15; else if (endettement <= 33) s += 8; else if (endettement <= 35) s += 2; else s -= 20;
  if (anciennete >= 5) s += 10; else if (anciennete >= 2) s += 5;
  if (apport >= 20) s += 15; else if (apport >= 10) s += 8; else if (apport >= 5) s += 3;
  if (statutEmploi === 'CDI') s += 10;
  else if (statutEmploi === 'CDD') s -= 5;
  else if (statutEmploi === 'TNS') s += 3;
  else if (statutEmploi === 'FONCTIONNAIRE') s += 12;
  if (incidents === 'yes') s -= 25;
  return Math.max(0, Math.min(100, s));
}

export default function ScoringBancaireWizard() {
  const steps = [
    { id: 'revenu', group: 'Revenus', label: 'Revenus', validate: (v) => v.revenu >= 500,
      render: ({ values, setValue }) => (
        <p>Mes revenus nets mensuels sont de{' '}<InlineNumber value={values.revenu} onChange={(v) => setValue('revenu', v)} suffix="€" min={500} placeholder="4500" width="6ch" />.</p>
      ),
    },
    { id: 'endettement', group: 'Endettement', label: 'Taux d\'endettement', validate: (v) => v.endettement >= 0,
      render: ({ values, setValue }) => (
        <p>Mon taux d'endettement actuel est de{' '}<InlineNumber value={values.endettement} onChange={(v) => setValue('endettement', v)} suffix="%" min={0} max={60} placeholder="25" width="3ch" />.</p>
      ),
    },
    { id: 'pro', group: 'Situation pro', label: 'Statut professionnel', validate: (v) => !!v.statutEmploi && v.anciennete >= 0,
      render: ({ values, setValue }) => (
        <>
          <p>Je suis en{' '}<InlineChoice value={values.statutEmploi} onChange={(v) => setValue('statutEmploi', v)} options={STATUS} />{' '}depuis{' '}<InlineNumber value={values.anciennete} onChange={(v) => setValue('anciennete', v)} suffix="ans" min={0} max={50} placeholder="5" width="3ch" />.</p>
          <ChoiceCards value={values.statutEmploi} onChange={(v) => setValue('statutEmploi', v)} options={STATUS} columns={4} />
        </>
      ),
    },
    { id: 'apport', group: 'Apport', label: 'Apport personnel', validate: (v) => v.apport >= 0,
      render: ({ values, setValue }) => (
        <p>Mon apport représente{' '}<InlineNumber value={values.apport} onChange={(v) => setValue('apport', v)} suffix="%" min={0} max={100} placeholder="15" width="3ch" />{' '}du prix du bien.</p>
      ),
    },
    { id: 'incidents', group: 'Historique', label: 'Historique bancaire', validate: (v) => !!v.incidents,
      render: ({ values, setValue }) => (
        <p>J'ai eu{' '}<InlineChoice value={values.incidents} onChange={(v) => setValue('incidents', v)} options={INCIDENTS} />{' '}ces 5 dernières années.</p>
      ),
    },
  ];

  return (
    <Wizard
      steps={steps}
      initial={{ revenu: 4500, endettement: 25, anciennete: 5, apport: 15, statutEmploi: 'CDI', incidents: 'no' }}
      onDone={(v, { restart }) => <ResultScreen values={v} onRestart={restart} />}
    />
  );
}

function ResultScreen({ values, onRestart }) {
  const score = useMemo(() => compute({
    revenu: Number(values.revenu) || 0,
    endettement: Number(values.endettement) || 0,
    anciennete: Number(values.anciennete) || 0,
    apport: Number(values.apport) || 0,
    statutEmploi: values.statutEmploi,
    incidents: values.incidents,
  }), [values]);

  const grade = score >= 85 ? 'A — Excellent' : score >= 70 ? 'B — Bon' : score >= 55 ? 'C — Correct' : score >= 40 ? 'D — Limite' : 'E — Difficile';
  const accept = score >= 85 ? 98 : score >= 70 ? 88 : score >= 55 ? 65 : score >= 40 ? 32 : 12;
  const color = score >= 70 ? 'emerald' : score >= 55 ? 'amber' : 'rose';
  const cm = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', value: 'text-emerald-600', bar: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', value: 'text-amber-600', bar: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', value: 'text-rose-600', bar: 'bg-rose-500' },
  }[color];

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 mb-4">
        <i className="fa-solid fa-circle-check"></i> Score calculé
      </div>
      <h2 className="font-black text-primary leading-tight mb-3" style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}>
        Votre score : <span className="gradient-text">{score}/100</span>
      </h2>
      <p className="text-gray-600 text-[17px] mb-8 max-w-xl">
        Catégorie <strong>{grade}</strong>. Taux d'acceptation estimé : <strong>{accept} %</strong>.
      </p>
      <div className={`${cm.bg} ${cm.border} border-2 rounded-2xl p-6 mb-8`}>
        <div className={`text-[10px] font-mono uppercase tracking-[0.12em] ${cm.text} mb-2`}>Score Finarent</div>
        <div className={`text-6xl font-black ${cm.value}`}>{score}<span className="text-3xl text-gray-300">/100</span></div>
        <div className="h-3 bg-white rounded-full overflow-hidden mt-4">
          <div className={`h-full ${cm.bar} transition-all`} style={{ width: `${score}%` }} />
        </div>
        <div className={`text-sm ${cm.text} mt-3 font-bold`}>{grade}</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/contact?simulator=scoring-bancaire&score=${score}`} className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition hover:-translate-y-px">
          <i className="fa-solid fa-headset"></i> Maximiser mes chances
        </Link>
        <button type="button" onClick={onRestart} className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-primary font-semibold px-6 py-4 rounded-2xl hover:bg-gray-50 transition">
          <i className="fa-solid fa-rotate-left"></i> Recommencer
        </button>
      </div>
    </div>
  );
}
