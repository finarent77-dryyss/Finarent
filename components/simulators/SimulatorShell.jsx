'use client';

import Link from 'next/link';
import { getCategory, getSimulatorsByCategory } from '@/lib/simulators/registry';

// Couleurs vibrant par catégorie — utilisées pour pill + icône
const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     badge: 'bg-sky-100 text-sky-700' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
};

export function getCategoryColors(slug) {
  const c = getCategory(slug);
  return COLOR_MAP[c?.color] || COLOR_MAP.indigo;
}

/**
 * Layout simulateur — pattern Claude Design (palette vibrant).
 * • Breadcrumb mono uppercase tracking-widest
 * • Header : pill catégorie + titre h1 BOLD avec dernier mot en gradient rainbow animé
 * • Side card "Temps estimé" en haut à droite
 * • Layout 2 colonnes : main (1fr) + aside sticky (320px) avec autres simulateurs
 */
export default function SimulatorShell({ category, simulator, children }) {
  const cat = getCategory(category);
  const colors = COLOR_MAP[cat?.color] || COLOR_MAP.indigo;
  const allSiblings = getSimulatorsByCategory(category);
  const siblings = allSiblings.filter((s) => s.slug !== simulator?.slug);

  // Sépare le dernier mot du nom pour appliquer le gradient
  const nameParts = (simulator?.name || '').trim().split(/\s+/);
  const lastWord = nameParts.pop();
  const firstWords = nameParts.join(' ');

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Breadcrumb mono uppercase */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-mono text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition">Accueil</Link>
          <span>/</span>
          <Link href="/simulateurs" className="hover:text-primary transition">Simulateurs</Link>
          {cat && (<>
            <span>/</span>
            <Link href={`/simulateurs#${cat.slug}`} className="hover:text-primary transition">{cat.short || cat.name}</Link>
          </>)}
          {simulator && (<>
            <span>/</span>
            <span className="text-primary font-semibold">{simulator.name}</span>
          </>)}
        </nav>

        {/* Header — titre + side card "Temps estimé" */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide ${colors.badge} mb-4`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              {cat?.name} · {allSiblings.length} outils
            </div>

            <h1 className="font-black text-primary leading-[0.95] tracking-tight"
                style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}>
              {firstWords && <>{firstWords} </>}
              <span className="gradient-text inline-block">{lastWord}</span>
            </h1>

            {simulator?.desc && (
              <p className="mt-5 text-[17px] text-gray-600 max-w-[52ch] leading-relaxed">
                {simulator.desc}
              </p>
            )}
          </div>

          {/* Side card temps estimé */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 lg:min-w-[260px]">
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-2">
              Temps estimé
            </div>
            <div className="text-3xl font-black text-primary tabular-nums">4 minutes</div>
            <div className="text-xs text-gray-400 mt-2">
              Aucune donnée enregistrée. Estimation à titre indicatif.
            </div>
          </div>
        </div>

        {/* Main + Aside */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-12 items-start">
          <div className="min-w-0">{children}</div>

          <aside className="lg:sticky lg:top-24 space-y-4 self-start">
            {/* Autres outils */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-4">
                Outils du même thème
              </div>
              <ul className="divide-y divide-gray-100">
                {siblings.slice(0, 8).map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/simulateurs/${category}/${s.slug}`}
                      className="flex items-center justify-between py-3 text-sm text-primary hover:text-secondary transition group"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <i className={`fa-solid ${s.icon} ${colors.text} text-xs w-4 shrink-0`}></i>
                        <span className="truncate">{s.name}</span>
                      </span>
                      <span className="text-gray-300 group-hover:text-secondary group-hover:translate-x-0.5 transition">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/simulateurs"
                className="mt-4 flex items-center justify-center w-full py-2.5 text-xs font-semibold text-primary border border-gray-200 rounded-full hover:bg-gray-50 transition"
              >
                Voir les {allSiblings.length} outils {cat?.short?.toLowerCase()}
              </Link>
            </div>

            {/* Card mini-CTA conseiller */}
            <div className="gradient-bg rounded-3xl p-5 text-white">
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/70 mb-2">
                Besoin d'un conseil ?
              </div>
              <div className="text-base font-bold leading-tight mb-3">
                Un expert Finarent analyse votre simulation gratuitement.
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white text-primary px-3 py-2 rounded-full hover:scale-105 transition"
              >
                Être recontacté <span>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
