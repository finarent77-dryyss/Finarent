'use client';

// Zone de texte réutilisable de l'assistant de demande (ex-FieldTextarea).
// Rendu et classes CSS identiques à la version d'origine.

export default function ChampZoneTexte({ label, value, onChange, placeholder, error, optional }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-1.5">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optionnel)</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`
          w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none resize-none
          ${error
            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
          }
        `}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation text-[10px]" />
          {error}
        </p>
      )}
    </div>
  );
}
