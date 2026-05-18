'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Quiz à 5 questions → recommandation pondérée d'un produit Finarent.
// Chaque option attribue des points à un ou plusieurs produits.

const PRODUCTS = {
  PRET_PRO: {
    label: 'Prêt professionnel',
    desc: 'La solution classique : vous devenez propriétaire, mensualité fixe, capital amorti.',
    icon: 'fa-briefcase',
    color: 'violet',
    cta: '/simulateurs/credit-professionnel/pret-professionnel',
    guide: '/guides/pret-professionnel',
  },
  CREDIT_BAIL: {
    label: 'Crédit-bail',
    desc: 'Le leasing financier idéal pour équipement pro : 100 % déductible, hors bilan, option d\'achat finale.',
    icon: 'fa-handshake',
    color: 'indigo',
    cta: '/simulateurs/credit-conso-auto/leasing-pro',
    guide: '/guides/credit-bail',
  },
  LOA: {
    label: 'LOA',
    desc: 'Location avec option d\'achat. Souplesse maximale, vous décidez à la fin si vous achetez ou rendez.',
    icon: 'fa-car',
    color: 'sky',
    cta: '/simulateurs/credit-conso-auto/loa',
    guide: '/guides/loa-vs-lld-vs-credit',
  },
  LLD: {
    label: 'LLD',
    desc: 'Location longue durée tout compris (entretien + assurance). Vous changez de matériel tous les 3-5 ans.',
    icon: 'fa-truck',
    color: 'emerald',
    cta: '/simulateurs/credit-conso-auto/leasing',
    guide: '/guides/loa-vs-lld-vs-credit',
  },
  ASSURANCE: {
    label: 'Assurance emprunteur',
    desc: 'Optimisez votre assurance de prêt : depuis la loi Lemoine, économisez jusqu\'à 60 %.',
    icon: 'fa-shield-heart',
    color: 'rose',
    cta: '/simulateurs/assurance-emprunteur/assurance-emprunteur',
    guide: '/guides/assurance-emprunteur',
  },
};

const QUESTIONS = [
  {
    id: 'goal',
    q: 'Qu\'est-ce que vous souhaitez financer ?',
    options: [
      { label: 'Un véhicule (utilitaire, voiture, flotte)', scores: { LOA: 3, LLD: 3, CREDIT_BAIL: 2 } },
      { label: 'Du matériel ou équipement professionnel', scores: { CREDIT_BAIL: 4, PRET_PRO: 2 } },
      { label: 'L\'achat d\'un local, fonds de commerce, parts sociales', scores: { PRET_PRO: 5 } },
      { label: 'Optimiser une assurance emprunteur existante', scores: { ASSURANCE: 5 } },
    ],
  },
  {
    id: 'ownership',
    q: 'Tenez-vous à devenir propriétaire dès le 1er jour ?',
    options: [
      { label: 'Oui, je veux le bien à mon nom tout de suite', scores: { PRET_PRO: 4 } },
      { label: 'Peu importe, ce qui compte c\'est l\'usage', scores: { LOA: 2, LLD: 3, CREDIT_BAIL: 3 } },
      { label: 'Je préfère renouveler régulièrement le matériel', scores: { LLD: 4, CREDIT_BAIL: 2 } },
      { label: 'Non concerné — c\'est de l\'assurance', scores: { ASSURANCE: 3 } },
    ],
  },
  {
    id: 'cash',
    q: 'Quelle est votre situation de trésorerie ?',
    options: [
      { label: 'Très bonne, je peux mettre un apport conséquent', scores: { PRET_PRO: 3 } },
      { label: 'Correcte mais je veux la préserver pour d\'autres projets', scores: { CREDIT_BAIL: 4, LOA: 2, LLD: 3 } },
      { label: 'Tendue, je cherche du financement à 100 %', scores: { CREDIT_BAIL: 3, LLD: 3 } },
      { label: 'Variable selon les mois (saisonnalité)', scores: { LLD: 3, CREDIT_BAIL: 2 } },
    ],
  },
  {
    id: 'tax',
    q: 'L\'optimisation fiscale est-elle importante pour vous ?',
    options: [
      { label: 'Oui, je cherche à maximiser les déductions', scores: { CREDIT_BAIL: 4, LLD: 3 } },
      { label: 'Important mais pas prioritaire', scores: { PRET_PRO: 2, CREDIT_BAIL: 2 } },
      { label: 'Pas vraiment, je veux surtout simplicité', scores: { LOA: 2, LLD: 3 } },
      { label: 'Je veux comprendre les implications fiscales', scores: { CREDIT_BAIL: 2, PRET_PRO: 2 } },
    ],
  },
  {
    id: 'horizon',
    q: 'Sur quelle durée envisagez-vous d\'utiliser ce bien ?',
    options: [
      { label: 'Très longtemps (> 7 ans)', scores: { PRET_PRO: 4, CREDIT_BAIL: 2 } },
      { label: 'Moyen terme (4-7 ans)', scores: { CREDIT_BAIL: 4, LOA: 2 } },
      { label: 'Court terme (2-4 ans)', scores: { LLD: 4, LOA: 3 } },
      { label: 'Je veux pouvoir m\'adapter rapidement', scores: { LLD: 3, LOA: 3 } },
    ],
  },
];

const COLOR_BG = { indigo: 'bg-indigo-50', emerald: 'bg-emerald-50', violet: 'bg-violet-50', sky: 'bg-sky-50', rose: 'bg-rose-50' };
const COLOR_TEXT = { indigo: 'text-indigo-600', emerald: 'text-emerald-600', violet: 'text-violet-600', sky: 'text-sky-600', rose: 'text-rose-600' };

function computeResult(answers) {
  const scores = { PRET_PRO: 0, CREDIT_BAIL: 0, LOA: 0, LLD: 0, ASSURANCE: 0 };
  for (const a of answers) {
    if (!a) continue;
    for (const [k, v] of Object.entries(a.scores)) {
      scores[k] = (scores[k] || 0) + v;
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    winner: sorted[0][0],
    runnerUp: sorted[1][0],
    scores,
  };
}

export default function QuizClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [done, setDone] = useState(false);

  const result = useMemo(() => done ? computeResult(answers) : null, [done, answers]);

  const choose = (opt) => {
    const next = [...answers];
    next[step] = opt;
    setAnswers(next);
    setTimeout(() => {
      if (step < QUESTIONS.length - 1) setStep(step + 1);
      else setDone(true);
    }, 250);
  };

  const restart = () => {
    setStep(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setDone(false);
  };

  const progress = done ? 100 : Math.round((step / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-mono text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition">Accueil</Link>
          <span>/</span>
          <span className="text-primary font-semibold">Quiz</span>
        </nav>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 mb-4">
            <i className="fa-solid fa-bolt"></i>
            Quiz · 2 min
          </div>
          <h1 className="font-black text-primary leading-tight" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
            Quelle solution de financement <span className="gradient-text">pour vous</span> ?
          </h1>
          <p className="mt-4 text-[17px] text-gray-600 max-w-2xl">
            5 questions, 1 recommandation personnalisée. Sans inscription, sans engagement.
          </p>
        </div>

        {/* Carte du quiz */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8 sm:p-12 min-h-[460px]">
            <AnimatePresence mode="wait">
              {!done && (
                <motion.div
                  key={`q-${step}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">
                    Question {step + 1} / {QUESTIONS.length}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-primary leading-tight mb-8">
                    {QUESTIONS[step].q}
                  </h2>
                  <div className="space-y-3">
                    {QUESTIONS[step].options.map((opt, i) => {
                      const selected = answers[step]?.label === opt.label;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => choose(opt)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                            selected
                              ? 'border-emerald-500 bg-emerald-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                              {selected && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                            </span>
                            <span className={`font-semibold ${selected ? 'text-emerald-700' : 'text-primary'}`}>{opt.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="mt-6 text-sm font-semibold text-gray-500 hover:text-primary transition"
                    >
                      ← Précédent
                    </button>
                  )}
                </motion.div>
              )}

              {done && result && <ResultBlock result={result} onRestart={restart} answers={answers} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultBlock({ result, onRestart, answers }) {
  const winner = PRODUCTS[result.winner];
  const runner = PRODUCTS[result.runnerUp];
  const totalScore = Object.values(result.scores).reduce((s, v) => s + v, 0) || 1;
  const matchPct = Math.round((result.scores[result.winner] / totalScore) * 100);

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 mb-4">
        <i className="fa-solid fa-circle-check"></i> Recommandation calculée
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-primary leading-tight mb-2">
        Votre meilleure option : <span className="gradient-text">{winner.label}</span>
      </h2>
      <p className="text-gray-600 text-[17px] mb-6">{winner.desc}</p>

      <div className={`${COLOR_BG[winner.color]} rounded-2xl p-6 mb-6 border border-${winner.color}-200`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-white ${COLOR_TEXT[winner.color]} flex items-center justify-center shrink-0`}>
            <i className={`fa-solid ${winner.icon} text-xl`}></i>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-500">Compatibilité</div>
              <div className={`text-2xl font-black ${COLOR_TEXT[winner.color]}`}>{matchPct} %</div>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div className={`h-full bg-${winner.color}-500 transition-all`} style={{ width: `${matchPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link
          href={winner.cta}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition hover:-translate-y-px"
        >
          <i className="fa-solid fa-calculator"></i>
          Simuler {winner.label}
        </Link>
        <Link
          href={winner.guide}
          className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-primary font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-50 transition"
        >
          <i className="fa-solid fa-book-open"></i>
          Lire le guide complet
        </Link>
      </div>

      {/* Runner up */}
      <div className="bg-[#FAF8F3] rounded-2xl p-5 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-2">
          Alternative à considérer
        </div>
        <div className="flex items-center gap-3">
          <i className={`fa-solid ${runner.icon} ${COLOR_TEXT[runner.color]}`}></i>
          <Link href={runner.guide} className="font-bold text-primary hover:text-emerald-700 transition">
            {runner.label}
          </Link>
          <span className="text-xs text-gray-500 ml-auto">{Math.round((result.scores[result.runnerUp] / totalScore) * 100)} %</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="text-sm font-semibold text-gray-500 hover:text-primary transition"
        >
          <i className="fa-solid fa-rotate-left mr-1"></i>
          Refaire le quiz
        </button>
        <Link href="/contact" className="text-sm font-semibold text-gray-500 hover:text-primary transition ml-auto">
          Échanger avec un conseiller →
        </Link>
      </div>
    </motion.div>
  );
}
