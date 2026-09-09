'use client';

// Liste déroulante réutilisable de l'assistant de demande (ex-FieldSelect).
// Rendu et classes CSS identiques à la version d'origine.

export default function ChampSelection({ label, value, onChange, options, placeholder, error, optional }) {
  const isObjectOptions = options.length > 0 && typeof options[0] === 'object';

  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-1.5">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optionnel)</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none appearance-none bg-white
          ${error
            ? 'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20'
          }
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {isObjectOptions
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))
          : options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))
        }
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <i className="fa-solid fa-circle-exclamation text-[10px]" />
          {error}
        </p>
      )}
    </div>
  );
}
