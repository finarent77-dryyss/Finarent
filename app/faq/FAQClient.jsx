'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FAQ_CATEGORIES } from '@/assets/data/faq';

const COLOR_MAP = {
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
  accent:    { bg: 'bg-accent/10',    text: 'text-accent',    border: 'border-accent/20' },
  primary:   { bg: 'bg-primary/10',   text: 'text-primary',   border: 'border-primary/20' },
  'rose-600':{ bg: 'bg-rose-50',      text: 'text-rose-600',  border: 'border-rose-200' },
};

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-primary px-0.5 rounded">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function FAQItem({ item, query, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left py-5 px-2 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors group"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-primary group-hover:text-secondary transition-colors flex-1">
          {highlight(item.q, query)}
        </span>
        <i className={`fa-solid fa-chevron-down text-xs text-gray-400 mt-2 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}></i>
      </button>
      {open && (
        <div className="pb-5 px-2 text-gray-600 leading-relaxed text-sm">
          {highlight(item.a, query)}
          <div className="mt-4 flex gap-3 flex-wrap">
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-accent">
              <i className="fa-solid fa-headset text-[10px]"></i>
              Parler à un conseiller
            </Link>
            <Link href="/simulateurs" className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-accent">
              <i className="fa-solid fa-calculator text-[10px]"></i>
              Faire une simulation
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQClient() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q && !activeCategory) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES
      .filter((c) => !activeCategory || c.id === activeCategory)
      .map((c) => ({
        ...c,
        questions: q
          ? c.questions.filter((it) => it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q))
          : c.questions,
      }))
      .filter((c) => c.questions.length > 0);
  }, [query, activeCategory]);

  const totalCount = useMemo(
    () => FAQ_CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0),
    [],
  );
  const visibleCount = useMemo(
    () => filtered.reduce((sum, c) => sum + c.questions.length, 0),
    [filtered],
  );

  // Schema.org FAQPage pour rich snippets Google (SEO)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_CATEGORIES.flatMap((c) =>
      c.questions.map((it) => ({
        '@type': 'Question',
        name: it.q,
        acceptedAnswer: { '@type': 'Answer', text: it.a },
      })),
    ),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Hero */}
      <section className="pt-32 pb-12 sm:pb-16 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm uppercase tracking-widest">
                {totalCount} questions · 8 thématiques
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-6 tracking-tight">
              Vos questions sur <span className="gradient-text">Finarent</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Tout ce qu'il faut savoir sur le crédit-bail, la LOA, la LLD, l'assurance pro, le financement bancaire et nos procédures.
            </p>

            {/* Recherche */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une question, un mot-clé…"
                className="w-full px-6 py-4 pl-14 border-2 border-gray-200 rounded-full focus:border-secondary focus:outline-none text-base placeholder:text-gray-400 shadow-sm"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  aria-label="Effacer la recherche"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
            {query && (
              <p className="text-sm text-gray-500 mt-3">
                {visibleCount} résultat{visibleCount > 1 ? 's' : ''} trouvé{visibleCount > 1 ? 's' : ''} pour <strong>"{query}"</strong>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pills catégories */}
      <section className="border-y border-gray-100 sticky top-0 z-20 backdrop-blur-md bg-white/95">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                !activeCategory ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            {FAQ_CATEGORIES.map((c) => {
              const colors = COLOR_MAP[c.color] || COLOR_MAP.secondary;
              const active = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(active ? null : c.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    active ? 'bg-primary text-white shadow-md' : `${colors.bg} ${colors.text} hover:opacity-80`
                  }`}
                >
                  <i className={`fa-solid ${c.icon} mr-1.5 text-xs`}></i>
                  {c.title.split('—')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-12 sm:py-16 bg-transparent">
        <div className="container mx-auto px-6 max-w-4xl">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <i className="fa-solid fa-magnifying-glass text-5xl text-gray-300 mb-4 block"></i>
              <p className="text-gray-500">Aucun résultat pour "{query}".</p>
              <Link href="/contact" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-secondary text-white rounded-full font-bold hover:bg-secondary/90">
                <i className="fa-solid fa-headset"></i>
                Poser ma question à un conseiller
              </Link>
            </div>
          ) : (
            filtered.map((cat) => {
              const colors = COLOR_MAP[cat.color] || COLOR_MAP.secondary;
              return (
                <div key={cat.id} id={cat.id} className="mb-12 scroll-mt-24">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <i className={`fa-solid ${cat.icon} ${colors.text} text-xl`}></i>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">{cat.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-100 px-4 sm:px-6">
                    {cat.questions.map((item, i) => (
                      <FAQItem key={item.q} item={item} query={query} defaultOpen={!!query && i === 0} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* CTA bas — pas trouvé sa réponse */}
      <section className="py-16 sm:py-20 bg-linear-to-br from-secondary/5 via-white to-accent/5 border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-secondary/10 items-center justify-center mb-5">
            <i className="fa-solid fa-comments text-secondary text-2xl"></i>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4 tracking-tight">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Chaque projet est unique. Un conseiller Finarent répond en moins de 48 h pour analyser votre situation gratuitement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-primary inline-flex items-center gap-2">
              <i className="fa-solid fa-headset"></i>
              <span>Contacter un conseiller</span>
            </Link>
            <Link href="/simulateurs" className="btn-outline inline-flex items-center gap-2">
              <i className="fa-solid fa-calculator"></i>
              <span>Faire une simulation</span>
            </Link>
            <a
              href="/finarent-faq.pdf"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-primary border-2 border-gray-200 rounded-full hover:border-primary hover:bg-primary hover:text-white transition-all"
            >
              <i className="fa-solid fa-file-pdf"></i>
              <span>Télécharger la FAQ (PDF)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
