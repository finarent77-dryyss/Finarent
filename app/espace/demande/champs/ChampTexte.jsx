'use client';

// Champ de saisie réutilisable de l'assistant de demande (ex-FieldInput).
// Rendu et classes CSS identiques à la version d'origine.

export default function ChampTexte({ label, type = 'text', value, onChange, placeholder, error, suffix, readOnly, icon, hint, optional }) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-1.5">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optionnel)</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none
            ${readOnly
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
              : error
                ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20'
            }
            ${suffix ? 'pr-10' : ''}
            ${icon ? 'pr-10' : ''}
          `}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
            {suffix}
          </span>
        )}
        {icon && (
          <i className={`${icon} absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400`} />
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation text-[10px]" />
          {error}
        </p>
      )}
    </div>
  );
}
