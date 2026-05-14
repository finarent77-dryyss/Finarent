'use client';

/**
 * Cartes de choix avec icône, titre, description.
 * @param {Array<{value: string, label: string, desc?: string, icon?: string, badge?: string}>} options
 */
export default function ChoiceCards({ options, value, onChange, columns = 2 }) {
  const colCls = columns === 3 ? 'sm:grid-cols-3' : columns === 1 ? '' : 'sm:grid-cols-2';
  return (
    <div className={`grid grid-cols-1 ${colCls} gap-3`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
              selected
                ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/10'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-start gap-3">
              {opt.icon && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <i className={`fa-solid ${opt.icon}`}></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`font-bold ${selected ? 'text-secondary' : 'text-primary'}`}>{opt.label}</span>
                  {opt.badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">{opt.badge}</span>}
                </div>
                {opt.desc && <div className="text-xs text-gray-500 leading-relaxed">{opt.desc}</div>}
              </div>
              <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-secondary bg-secondary' : 'border-gray-300 bg-white'}`}>
                {selected && <i className="fa-solid fa-check text-white text-[10px]"></i>}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
