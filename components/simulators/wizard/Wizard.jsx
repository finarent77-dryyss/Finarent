'use client';

import { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Wizard Pretto-style — 1 question par écran, stepper vertical à gauche.
 *
 * Props :
 *   steps   : [{ id, label, group?, render({ values, setValue, next, prev, isValid }), validate?(values) }]
 *   initial : valeurs par défaut
 *   onDone  : (values) => ReactNode  — écran final (résultats)
 *   intro   : optionnel — ({ start }) => ReactNode pour l'écran d'intro
 */
export default function Wizard({ steps, initial = {}, onDone, intro = null }) {
  const [index, setIndex] = useState(intro ? -1 : 0);
  const [values, setValuesState] = useState(initial);
  const [done, setDone] = useState(false);

  const setValue = useCallback((key, v) => {
    setValuesState((prev) => ({ ...prev, [key]: v }));
  }, []);

  const current = index >= 0 && index < steps.length ? steps[index] : null;
  const isValid = current?.validate ? current.validate(values) : true;

  const next = () => {
    if (!isValid) return;
    if (index < steps.length - 1) setIndex(index + 1);
    else setDone(true);
  };
  const prev = () => {
    if (done) { setDone(false); return; }
    if (index > 0) setIndex(index - 1);
    else if (intro && index === 0) setIndex(-1);
  };

  const progress = useMemo(() => {
    if (done) return 100;
    if (index < 0) return 0;
    return Math.round(((index + 1) / steps.length) * 100);
  }, [index, done, steps.length]);

  const groups = useMemo(() => {
    const seen = [];
    steps.forEach((s) => {
      const g = s.group || s.label;
      if (!seen.find((x) => x.id === g)) {
        seen.push({ id: g, label: g, firstIndex: steps.findIndex((x) => (x.group || x.label) === g) });
      }
    });
    return seen;
  }, [steps]);

  const currentGroupId = current ? (current.group || current.label) : null;
  const currentGroupIdx = groups.findIndex((g) => g.id === currentGroupId);

  return (
    <div className="bg-[#FAF8F3] rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-1 bg-gray-100">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] min-h-[480px]">
        <aside className="hidden lg:block border-r border-gray-100 bg-[#FAF8F3] p-8">
          <button
            type="button"
            onClick={prev}
            disabled={index <= (intro ? -1 : 0) && !done}
            className="flex items-center gap-2 text-sm font-bold text-primary mb-10 disabled:opacity-30 disabled:cursor-not-allowed hover:gap-3 transition-all"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            Retour
          </button>

          <ol className="relative">
            {groups.map((g, i) => {
              const reached = done || i <= currentGroupIdx;
              const completed = done || i < currentGroupIdx;
              const active = !done && i === currentGroupIdx;
              return (
                <li key={g.id} className="relative pl-7 pb-7 last:pb-0">
                  {i < groups.length - 1 && (
                    <span
                      className={`absolute left-[7px] top-4 bottom-0 w-px ${completed ? 'bg-emerald-400' : 'bg-gray-200'}`}
                      aria-hidden
                    />
                  )}
                  <span
                    className={`absolute left-0 top-1 inline-flex items-center justify-center rounded-full transition-all ${
                      completed
                        ? 'w-4 h-4 bg-emerald-500'
                        : active
                          ? 'w-4 h-4 bg-emerald-200 ring-4 ring-emerald-100'
                          : 'w-3.5 h-3.5 mt-0.5 bg-gray-200'
                    }`}
                  >
                    {completed && <i className="fa-solid fa-check text-[8px] text-white"></i>}
                  </span>
                  <button
                    type="button"
                    disabled={!reached && !done}
                    onClick={() => reached && setIndex(g.firstIndex)}
                    className={`text-left text-[15px] transition ${
                      active
                        ? 'font-bold text-emerald-700'
                        : completed
                          ? 'text-primary hover:text-emerald-700'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {g.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="p-8 sm:p-12 lg:p-16 bg-white">
          <AnimatePresence mode="wait">
            {index === -1 && intro && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                {intro({ start: () => setIndex(0) })}
              </motion.div>
            )}

            {!done && current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl"
              >
                <h2 className="font-black text-primary leading-tight mb-8"
                    style={{ fontSize: 'clamp(28px, 3.6vw, 44px)' }}>
                  {current.label}
                </h2>

                <div className="text-[19px] leading-relaxed text-primary">
                  {current.render({ values, setValue, next, prev, isValid })}
                </div>

                <div className="mt-12 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={next}
                    disabled={!isValid}
                    className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-7 py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-px"
                  >
                    {index === steps.length - 1 ? 'Voir le résultat' : 'Suivant'}
                    <i className="fa-solid fa-arrow-right text-sm"></i>
                  </button>
                  {(index > 0 || intro) && (
                    <button
                      type="button"
                      onClick={prev}
                      className="text-sm font-semibold text-gray-500 hover:text-primary transition"
                    >
                      Précédent
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {done && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {onDone(values, { restart: () => { setDone(false); setIndex(0); } })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
