import Link from 'next/link';
import { CATEGORIES, SIMULATORS } from '@/lib/simulators/registry';

export const metadata = {
  title: 'Simulateurs financiers et assurance',
  description: 'Tous les simulateurs Finarent : capacité d\'emprunt, mensualité, coût total, assurance emprunteur, taux d\'endettement, frais de notaire et plus encore.',
  alternates: { canonical: '/simulateurs' },
};

const COLOR_BG = {
  indigo: 'bg-indigo-50',  amber: 'bg-amber-50', sky: 'bg-sky-50',
  rose: 'bg-rose-50',      emerald: 'bg-emerald-50',
};
const COLOR_TEXT = {
  indigo: 'text-indigo-600', amber: 'text-amber-600', sky: 'text-sky-600',
  rose: 'text-rose-600',     emerald: 'text-emerald-600',
};
const COLOR_BADGE = {
  indigo: 'bg-indigo-100 text-indigo-700',   amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',            rose: 'bg-rose-100 text-rose-700',
  emerald: 'bg-emerald-100 text-emerald-700',
};

export default function SimulateursHubPage() {
  const total = SIMULATORS.length;
  const available = SIMULATORS.filter((s) => s.available).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      {/* Hero */}
      <section className="pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block px-4 py-1.5 bg-secondary/10 rounded-full text-secondary text-xs font-bold uppercase tracking-widest mb-6">
            {total} simulateurs · {available} actifs
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-primary tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
            Tous nos simulateurs <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">financiers</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Crédit immobilier, prêt pro, assurance emprunteur, IARD… Simulez tout votre projet en quelques clics.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 space-y-16">
          {CATEGORIES.map((cat) => {
            const items = SIMULATORS.filter((s) => s.category === cat.slug);
            return (
              <div key={cat.slug} id={cat.slug} className="scroll-mt-28">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl ${COLOR_BG[cat.color]} flex items-center justify-center shadow-sm`}>
                    <i className={`fa-solid ${cat.icon} ${COLOR_TEXT[cat.color]} text-2xl`}></i>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-primary">{cat.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
                  </div>
                  <span className={`ml-auto text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${COLOR_BADGE[cat.color]}`}>
                    {items.length} outils
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {items.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/simulateurs/${cat.slug}/${s.slug}`}
                      className={`group relative bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 hover:border-${cat.color}-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${s.available ? '' : 'opacity-90'}`}
                    >
                      {!s.available && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Bientôt</span>
                      )}
                      {s.available && s.requiresAuth && (
                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                          <i className="fa-solid fa-lock text-[8px]"></i> Compte
                        </span>
                      )}
                      <div className={`w-10 h-10 rounded-xl ${COLOR_BG[cat.color]} flex items-center justify-center mb-3 group-hover:scale-110 transition`}>
                        <i className={`fa-solid ${s.icon} ${COLOR_TEXT[cat.color]} text-lg`}></i>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-primary mb-1 leading-tight">{s.name}</div>
                      <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">{s.desc}</div>
                      {s.available && (
                        <div className="mt-3 flex items-center text-xs font-bold text-secondary group-hover:gap-2 gap-1 transition-all">
                          <span>Simuler</span>
                          <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
