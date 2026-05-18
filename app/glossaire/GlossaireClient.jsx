'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '@/lib/glossaire/terms';

const CAT_COLORS = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function GlossaireClient({ terms }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('ALL');
  const [openSlug, setOpenSlug] = useState(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return terms
      .filter((t) => activeCat === 'ALL' || t.category === activeCat)
      .filter((t) => !s ||
        t.term.toLowerCase().includes(s) ||
        t.short.toLowerCase().includes(s) ||
        t.definition.toLowerCase().includes(s))
      .sort((a, b) => a.term.localeCompare(b.term, 'fr'));
  }, [terms, search, activeCat]);

  // Index alphabétique
  const byLetter = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const l = t.term[0].toUpperCase();
      if (!map[l]) map[l] = [];
      map[l].push(t);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
  }, [filtered]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Header */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-mono text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition">Accueil</Link>
          <span>/</span>
          <span className="text-primary font-semibold">Glossaire</span>
        </nav>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide bg-indigo-100 text-indigo-700 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {terms.length} définitions
          </div>
          <h1 className="font-black text-primary leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}>
            Glossaire <span className="gradient-text">financier</span>
          </h1>
          <p className="mt-5 text-[17px] text-gray-600 max-w-2xl leading-relaxed">
            Tous les termes du financement professionnel, du crédit immobilier et de l'assurance,
            expliqués simplement.
          </p>
        </div>

        {/* Search + filtres */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-8 sticky top-20 z-20 backdrop-blur">
          <div className="relative mb-4">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input
              type="search"
              placeholder="Rechercher un terme, une définition…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeCat === 'ALL' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Toutes ({terms.length})
            </button>
            {CATEGORIES.map((c) => {
              const count = terms.filter((t) => t.category === c.slug).length;
              return (
                <button
                  key={c.slug}
                  onClick={() => setActiveCat(c.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${activeCat === c.slug ? CAT_COLORS[c.color] : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  {c.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Index alphabétique */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
            <i className="fa-solid fa-book-open text-4xl mb-3 block text-gray-200"></i>
            Aucun terme ne correspond à votre recherche.
          </div>
        ) : (
          <div className="space-y-8">
            {byLetter.map(([letter, list]) => (
              <section key={letter} id={`lettre-${letter}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl gradient-bg text-white flex items-center justify-center font-black text-lg">
                    {letter}
                  </div>
                  <div className="h-px flex-1 bg-gray-100"></div>
                  <div className="text-xs text-gray-400 font-mono">{list.length}</div>
                </div>
                <div className="space-y-3">
                  {list.map((t) => {
                    const cat = CATEGORIES.find((c) => c.slug === t.category);
                    const isOpen = openSlug === t.slug;
                    return (
                      <motion.article
                        key={t.slug}
                        layout
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
                      >
                        <button
                          onClick={() => setOpenSlug(isOpen ? null : t.slug)}
                          className="w-full text-left p-5 flex items-start gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-black text-primary">{t.term}</h3>
                              {cat && (
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CAT_COLORS[cat.color]}`}>
                                  {cat.label}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1.5 text-[15px] leading-relaxed">{t.short}</p>
                          </div>
                          <i className={`fa-solid fa-chevron-down text-gray-300 text-sm mt-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden border-t border-gray-100"
                            >
                              <div className="p-5 pt-4">
                                <p className="text-primary text-[15px] leading-relaxed">{t.definition}</p>
                                {t.related?.length > 0 && (
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 self-center">Voir aussi :</span>
                                    {t.related.map((r) => {
                                      const rt = terms.find((x) => x.slug === r);
                                      if (!rt) return null;
                                      return (
                                        <button
                                          key={r}
                                          onClick={() => setOpenSlug(r)}
                                          className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition"
                                        >
                                          {rt.term}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* CTA bas de page */}
        <div className="mt-16 gradient-bg rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Une question sur un terme précis ?</h2>
          <p className="text-white/80 mb-6 max-w-xl">
            Un expert Finarent vous explique en 15 minutes votre situation et les options disponibles. Gratuit, sans engagement.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-6 py-3 rounded-2xl hover:scale-105 transition"
          >
            <i className="fa-solid fa-headset"></i>
            Parler à un conseiller
          </Link>
        </div>
      </div>
    </div>
  );
}
