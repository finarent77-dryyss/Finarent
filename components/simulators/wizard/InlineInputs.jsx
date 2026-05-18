'use client';

import { useRef, useEffect, useState } from 'react';

// Pill numérique éditable inline ─────────────────────────────────
export function InlineNumber({ value, onChange, suffix = '', min = 0, max = Infinity, placeholder = '0', width }) {
  const ref = useRef(null);
  const display = value === '' || value == null ? '' : String(value);
  const inputWidth = width || `${Math.max(2, display.length || placeholder.length)}ch`;

  return (
    <span className="inline-flex items-baseline gap-1 align-baseline">
      <span className="inline-flex items-baseline bg-emerald-50 border-2 border-emerald-500 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.15)] transition">
        <input
          ref={ref}
          type="number"
          inputMode="decimal"
          value={display}
          placeholder={placeholder}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') return onChange('');
            const n = Number(v);
            if (Number.isNaN(n)) return;
            if (n < min) return onChange(min);
            if (n > max) return onChange(max);
            onChange(n);
          }}
          style={{ width: inputWidth }}
          className="bg-transparent outline-none font-bold text-emerald-700 tabular-nums text-center appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && <span className="font-bold text-emerald-700 ml-0.5">{suffix}</span>}
      </span>
    </span>
  );
}

// Pill choix (select déguisé en pill) ────────────────────────────
export function InlineChoice({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <span className="relative inline-block align-baseline" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-500 rounded-xl px-3 py-1.5 font-bold text-emerald-700 hover:bg-white transition"
      >
        {current?.label || '—'}
        <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 left-0 min-w-[220px] bg-white border border-gray-200 rounded-2xl shadow-xl p-1.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left text-[15px] px-3 py-2 rounded-xl transition ${
                value === opt.value
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-primary hover:bg-gray-50'
              }`}
            >
              {opt.label}
              {opt.desc && <div className="text-xs text-gray-500 font-normal mt-0.5">{opt.desc}</div>}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

// Boutons-cartes pour gros choix
export function ChoiceCards({ value, onChange, options, columns = 2 }) {
  const colClass = columns === 3 ? 'sm:grid-cols-3' : columns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-2';
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-3 mt-6`}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`text-left rounded-2xl border-2 p-4 transition ${
              active
                ? 'border-emerald-500 bg-emerald-50 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.3)]'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
            }`}
          >
            {opt.icon && (
              <div className={`text-2xl mb-2 ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
                <i className={`fa-solid ${opt.icon}`}></i>
              </div>
            )}
            <div className={`font-bold text-[15px] ${active ? 'text-emerald-700' : 'text-primary'}`}>
              {opt.label}
            </div>
            {opt.desc && <div className="text-xs text-gray-500 mt-1">{opt.desc}</div>}
          </button>
        );
      })}
    </div>
  );
}
