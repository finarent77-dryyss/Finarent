'use client';

import { formatEUR } from '@/lib/simulators/calculations/pret';

/** Slider avec valeur affichée + champ numérique en dessous. */
export function SliderInput({ label, value, onChange, min, max, step = 1, suffix = '€', format = 'eur', accent = 'secondary' }) {
  const displayed = format === 'eur' ? formatEUR(value) : `${value.toLocaleString('fr-FR')} ${suffix}`;
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className={`text-2xl font-black text-${accent}`}>{displayed}</span>
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
