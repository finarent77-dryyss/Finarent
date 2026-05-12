'use client';

/**
 * Sélecteur visuel "Type de prêt" — pattern repéré dans les maquettes
 * partenaire : 4 tuiles (Immobilier / Auto / Conso / Revolving) avec emoji
 * et fourchette de taux.
 */

export const LOAN_TYPES = [
  { id: 'immobilier', label: 'Immobilier', emoji: '🏠', rateRange: '3–5 %',   defaultRate: 3.5 },
  { id: 'auto',       label: 'Auto',       emoji: '🚗', rateRange: '5–8 %',   defaultRate: 6.0 },
  { id: 'conso',      label: 'Conso',      emoji: '💳', rateRange: '8–15 %',  defaultRate: 10  },
  { id: 'revolving',  label: 'Revolving',  emoji: '🔁', rateRange: '15–21 %', defaultRate: 18  },
];

export function LoanTypeSelector({ value, onChange, onRateChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">Type de prêt</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LOAN_TYPES.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onChange(t.id);
                if (onRateChange) onRateChange(t.defaultRate);
              }}
              className={`relative rounded-xl border-2 px-3 py-3 text-center transition-all ${active
                ? 'border-secondary bg-secondary/5 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="text-2xl mb-1">{t.emoji}</div>
              <div className="text-sm font-bold text-primary">{t.label}</div>
              <div className={`text-xs mt-0.5 ${active ? 'text-secondary font-semibold' : 'text-gray-400'}`}>{t.rateRange}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
