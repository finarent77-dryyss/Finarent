'use client';

import { useState, useMemo } from 'react';

/**
 * Grille de logos de marques avec recherche.
 * @param {Array<{name: string, domain: string}>} brands
 * @param {string} value
 * @param {(v: string) => void} onChange
 */
export default function BrandGrid({ brands, value, onChange, searchPlaceholder = 'Rechercher une marque' }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query.trim()) return brands;
    const q = query.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, query]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:border-secondary focus:outline-none text-base placeholder:text-gray-400"
        />
        <i className="fa-solid fa-magnifying-glass absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((b) => {
          const selected = value === b.name;
          return (
            <button
              key={b.name}
              type="button"
              onClick={() => onChange(b.name)}
              className={`relative bg-sky-50/50 border-2 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 transition-all hover:bg-sky-100/60 hover:-translate-y-0.5 ${
                selected ? 'border-secondary ring-4 ring-secondary/20 bg-sky-100' : 'border-transparent'
              }`}
            >
              <span className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 ${selected ? 'bg-secondary border-secondary' : 'border-gray-300 bg-white'}`}>
                {selected && <i className="fa-solid fa-check text-white text-[8px] flex items-center justify-center h-full"></i>}
              </span>
              <div className="h-12 sm:h-14 w-full flex items-center justify-center">
                <img
                  src={`https://logo.clearbit.com/${b.domain}?size=128`}
                  alt={b.name}
                  loading="lazy"
                  className="max-h-full max-w-[80%] object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-primary">{b.name}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-sm text-gray-400 py-6">
          <i className="fa-solid fa-magnifying-glass text-2xl mb-2 block"></i>
          Aucune marque trouvée pour "{query}"
        </div>
      )}
    </div>
  );
}
