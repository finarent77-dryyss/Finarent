'use client';

import Link from 'next/link';
import AuroraBackground from '@/components/ui/AuroraBackground';
import { getCategory, getSimulatorsByCategory } from '@/lib/simulators/registry';

// Couleurs Tailwind par catégorie — mappées en classes statiques pour
// que Tailwind les détecte au build (pas d'interpolation).
const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700',   ring: 'ring-indigo-200' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700',     ring: 'ring-amber-200' },
  sky:     { bg: 'bg-sky-50',     text: 'text-sky-600',     badge: 'bg-sky-100 text-sky-700',         ring: 'ring-sky-200' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    badge: 'bg-rose-100 text-rose-700',       ring: 'ring-rose-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-200' },
};

export function getCategoryColors(slug) {
  const c = getCategory(slug);
  return COLOR_MAP[c?.color] || COLOR_MAP.indigo;
}

/**
 * Layout commun à tous les simulateurs.
 * Fond pastel + aurora cohérent avec HomeQuickSimulator pour l'uniformité visuelle.
 * Header hero (badge + gradient text), breadcrumb, sidebar siblings.
 */
export default function SimulatorShell({ category, simulator, children }) {
  const cat = getCategory(category);
  const colors = COLOR_MAP[cat?.color] || COLOR_MAP.indigo;
  const siblings = getSimulatorsByCategory(category).filter((s) => s.slug !== simulator?.slug);

  return (
    <div className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 mesh-bg"></div>
      <AuroraBackground variant="vivid" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6 text-gray-500">
          <Link href="/" className="hover:text-primary">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href="/simulateurs" className="hover:text-primary">Simulateurs</Link>
          {cat && (<>
            <span className="mx-2">/</span>
            <Link href={`/simulateurs#${cat.slug}`} className="hover:text-primary">{cat.name}</Link>
          </>)}
          {simulator && (<>
            <span className="mx-2">/</span>
            <span className="text-primary font-semibold">{simulator.name}</span>
          </>)}
        </nav>

        {/* Header hero — badge + titre gradient pour matcher HomeQuickSimulator */}
        <div className="text-center mb-10 sm:mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full mb-4 shadow-lg border border-secondary/20`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className={`font-bold text-[10px] sm:text-xs uppercase tracking-widest ${colors.text}`}>{cat?.name}</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center shadow-sm`}>
              <i className={`fa-solid ${simulator?.icon || 'fa-calculator'} ${colors.text} text-2xl`}></i>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary tracking-tight max-w-3xl">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary via-purple-500 to-accent animate-gradient-sweep">
                {simulator?.name}
              </span>
            </h1>
            {simulator?.desc && (
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">{simulator.desc}</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main */}
          <div>{children}</div>

          {/* Sidebar siblings */}
          <aside className="lg:sticky lg:top-28 self-start space-y-3">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-lg p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Autres simulateurs</div>
              <ul className="space-y-1">
                {siblings.slice(0, 8).map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/simulateurs/${category}/${s.slug}`}
                      className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition ${s.available ? '' : 'opacity-60'}`}
                    >
                      <i className={`fa-solid ${s.icon} ${colors.text} text-sm w-4`}></i>
                      <span className="text-sm text-gray-700 flex-1">{s.name}</span>
                      {!s.available && <span className="text-[10px] uppercase font-bold text-gray-400">Bientôt</span>}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/simulateurs" className="mt-4 block text-center text-sm font-semibold text-primary hover:underline">
                Voir tous les simulateurs →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
