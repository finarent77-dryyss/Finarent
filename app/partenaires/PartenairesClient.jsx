'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PARTNER_GROUPS, PARTNER_FAMILIES } from '@/assets/data/partners';

const COLOR_MAP = {
  secondary:    { text: 'text-secondary',    bg: 'bg-secondary/10',    border: 'border-secondary/20' },
  accent:       { text: 'text-accent',       bg: 'bg-accent/10',       border: 'border-accent/20' },
  primary:      { text: 'text-primary',      bg: 'bg-primary/10',      border: 'border-primary/20' },
  'rose-600':   { text: 'text-rose-600',     bg: 'bg-rose-50',         border: 'border-rose-200' },
  'violet-600': { text: 'text-violet-600',   bg: 'bg-violet-50',       border: 'border-violet-200' },
  'sky-600':    { text: 'text-sky-600',      bg: 'bg-sky-50',          border: 'border-sky-200' },
  'amber-600':  { text: 'text-amber-600',    bg: 'bg-amber-50',        border: 'border-amber-200' },
  'emerald-600':{ text: 'text-emerald-600',  bg: 'bg-emerald-50',      border: 'border-emerald-200' },
};

function PartnerCard({ item }) {
  return (
    <div
      title={`${item.name} — ${item.specialty}`}
      className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-secondary/30 hover:shadow-lg transition-all"
    >
      <div className="h-14 flex items-center justify-center mb-3">
        <img
          src={`https://logo.clearbit.com/${item.domain}?size=128`}
          alt={item.name}
          loading="lazy"
          className="max-h-12 max-w-[80%] object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
          onError={(e) => {
            // Fallback : on cache l'image et affiche les initiales
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <span
          className="hidden text-2xl font-black text-primary"
          aria-hidden="true"
        >
          {item.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase().slice(0, 3)}
        </span>
      </div>
      <div className="text-sm font-bold text-primary truncate text-center">{item.name}</div>
      <div className="text-[10px] text-gray-400 mt-0.5 text-center uppercase tracking-wider truncate">{item.specialty}</div>
      <div className="text-xs text-gray-600 mt-3 leading-snug">{item.atout}</div>
    </div>
  );
}

export default function PartenairesClient() {
  const [family, setFamily] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PARTNER_GROUPS
      .filter((g) => family === 'all' || g.family === family)
      .map((g) => ({
        ...g,
        items: q
          ? g.items.filter((it) =>
              it.name.toLowerCase().includes(q) ||
              it.specialty.toLowerCase().includes(q) ||
              it.atout.toLowerCase().includes(q),
            )
          : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [family, query]);

  const totalCount = useMemo(
    () => PARTNER_GROUPS.reduce((sum, g) => sum + g.items.length, 0),
    [],
  );
  const visibleCount = useMemo(
    () => filtered.reduce((sum, g) => sum + g.items.length, 0),
    [filtered],
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 sm:pb-16 bg-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm uppercase tracking-widest">
                {totalCount}+ partenaires · 4 métiers
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary mb-6 tracking-tight">
              Nos <span className="gradient-text">partenaires</span> bancaires & assureurs
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Finarent compare et négocie auprès des principaux acteurs du financement et de l'assurance professionnelle en France pour vous proposer la meilleure offre.
            </p>

            {/* Recherche */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un partenaire ou une spécialité…"
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
                {visibleCount} résultat{visibleCount > 1 ? 's' : ''} pour <strong>"{query}"</strong>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pills famille */}
      <section className="sticky top-0 z-20 backdrop-blur-md bg-white/40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap justify-center gap-2">
            {PARTNER_FAMILIES.map((f) => {
              const active = family === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFamily(f.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    active ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <i className={`fa-solid ${f.icon} mr-1.5 text-xs`}></i>
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Groupes */}
      <section className="py-12 sm:py-16 bg-transparent">
        <div className="container mx-auto px-6 max-w-7xl">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <i className="fa-solid fa-magnifying-glass text-5xl text-gray-300 mb-4 block"></i>
              <p className="text-gray-500">Aucun partenaire ne correspond à "{query}".</p>
            </div>
          ) : (
            filtered.map((group) => {
              const colors = COLOR_MAP[group.color] || COLOR_MAP.secondary;
              return (
                <div key={group.id} className="mb-14">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0`}>
                      <i className={`fa-solid ${group.icon} ${colors.text} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">{group.title}</h2>
                        <span className="text-sm text-gray-400 font-mono">{group.items.length} partenaires</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {group.items.map((item) => <PartnerCard key={item.name} item={item} />)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Comment nous travaillons — Stratégie & critères de sélection */}
      <section className="py-16 sm:py-20 bg-transparent">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-4">
              <span className="text-accent font-semibold text-xs uppercase tracking-widest">Notre méthode</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4 tracking-tight">
              Comment nous travaillons avec <span className="gradient-text">nos partenaires</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un seul interlocuteur, plusieurs offres comparées. Notre rôle : challenger le marché pour vous trouver les meilleures conditions.
            </p>
          </div>

          {/* Critères de sélection */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {[
              { icon: 'fa-percent',           title: 'Taux de commission compétitifs',  desc: 'Volume négocié, rétro-commissions pour répercuter de meilleures conditions client.' },
              { icon: 'fa-bolt',              title: 'Outils digitaux performants',     desc: 'Tarification en ligne, devis et souscription rapides chez le partenaire.' },
              { icon: 'fa-clock',             title: 'Délai de réponse < 48 h',         desc: 'Critère éliminatoire : pour tenir notre promesse, le partenaire doit suivre le rythme.' },
              { icon: 'fa-map-location-dot',  title: 'Couverture nationale',            desc: 'Géographique et sectorielle, pour couvrir tous les profils d\'entreprise.' },
              { icon: 'fa-handshake',         title: 'Support commercial dédié',        desc: 'Inspecteurs partenariats joignables, formation produit, hotline souscription.' },
              { icon: 'fa-shield-halved',     title: 'Solidité financière auditée',     desc: 'Rating, ancienneté, encours : seuls les acteurs solides intègrent notre panel.' },
            ].map((c) => (
              <div key={c.title} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-accent/30 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                  <i className={`fa-solid ${c.icon} text-accent`}></i>
                </div>
                <h3 className="font-bold text-primary text-sm mb-1.5">{c.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed max-w-3xl mx-auto">
              <i className="fa-solid fa-circle-info mr-1.5"></i>
              Cartographie indicative à jour de Mai 2026. La liste évolue régulièrement. Finarent est un courtier indépendant immatriculé à l'ORIAS (IOBSP + IAS), soumis au contrôle de l'ACPR.
              La mention d'un acteur n'implique pas un accord commercial exclusif. Pour connaître nos partenaires sous mandat pour votre projet, contactez-nous.
            </p>
          </div>
        </div>
      </section>

      {/* CTA bas */}
      <section className="py-16 sm:py-20 bg-transparent">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4 tracking-tight">
            Un seul interlocuteur, <span className="gradient-text">tous les partenaires</span>.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Vous nous appelez, on consulte les acteurs pertinents pour votre projet et on vous présente la meilleure offre. Sans frais.
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
              href="/finarent-partenaires.pdf"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-primary border-2 border-gray-200 rounded-full hover:border-primary hover:bg-primary hover:text-white transition-all"
            >
              <i className="fa-solid fa-file-pdf"></i>
              <span>Cartographie complète (PDF)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
