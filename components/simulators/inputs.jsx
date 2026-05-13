'use client';

import { useState, useEffect, useRef } from 'react';
import { formatEUR } from '@/lib/simulators/calculations/pret';

/** Slider avec valeur affichée éditable (clic pour saisir au clavier) + champ numérique en dessous. */
export function SliderInput({ label, value, onChange, min, max, step = 1, suffix = '€', format = 'eur', accent = 'secondary' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const displayed = format === 'eur' ? formatEUR(value) : `${value.toLocaleString('fr-FR')} ${suffix}`;

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, value]);

  const commit = () => {
    const raw = draft.replace(/[^\d.,-]/g, '').replace(',', '.');
    const parsed = Number(raw);
    if (!Number.isNaN(parsed) && raw !== '') {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setEditing(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {editing ? (
          <div className={`flex items-baseline gap-1 text-2xl font-black text-${accent}`}>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commit(); }
                if (e.key === 'Escape') { e.preventDefault(); setEditing(false); }
              }}
              className={`w-32 text-right bg-transparent border-b-2 border-${accent} focus:outline-none tabular-nums`}
            />
            <span>{suffix}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`text-2xl font-black text-${accent} hover:opacity-80 transition cursor-text border-b-2 border-dashed border-transparent hover:border-${accent}/30`}
            title="Cliquer pour saisir la valeur"
          >
            {displayed}
          </button>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${accent}`}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{format === 'eur' ? formatEUR(min) : `${min.toLocaleString('fr-FR')} ${suffix}`}</span>
        <span>{format === 'eur' ? formatEUR(max) : `${max.toLocaleString('fr-FR')} ${suffix}`}</span>
      </div>
    </div>
  );
}

/** Champ numérique avec préfixe/suffixe (€, %, mois). */
export function NumberInput({ label, value, onChange, suffix, prefix, min, max, step = 1 }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={`w-full ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'} py-2.5 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none transition`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

/** Carte résultat. */
export function ResultCard({ label, value, sub, accent = 'primary', large = false }) {
  return (
    <div className={`bg-white rounded-2xl border-2 border-${accent}/10 p-5 ${large ? 'sm:p-7' : ''}`}>
      <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">{label}</div>
      <div className={`${large ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl'} font-black text-${accent} tracking-tight`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-2">{sub}</div>}
    </div>
  );
}
