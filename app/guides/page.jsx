import Link from 'next/link';
import { GUIDES } from '@/lib/guides/catalog';

export const metadata = {
  title: 'Guides pédagogiques',
  description: 'Apprenez tout sur le crédit-bail, le prêt professionnel, l\'assurance emprunteur, la LOA et la RC Pro. Des guides clairs écrits par les experts Finarent.',
  alternates: { canonical: '/guides' },
};

const COLOR_BG = {
  indigo: 'bg-indigo-50', emerald: 'bg-emerald-50', violet: 'bg-violet-50',
  sky: 'bg-sky-50', amber: 'bg-amber-50', rose: 'bg-rose-50',
};
const COLOR_TEXT = {
  indigo: 'text-indigo-600', emerald: 'text-emerald-600', violet: 'text-violet-600',
  sky: 'text-sky-600', amber: 'text-amber-600', rose: 'text-rose-600',
};

export default function GuidesHubPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-mono text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition">Accueil</Link>
          <span>/</span>
          <span className="text-primary font-semibold">Guides</span>
        </nav>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {GUIDES.length} guides experts
          </div>
          <h1 className="font-black text-primary leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(40px, 5.5vw, 72px)' }}>
            Guides <span className="gradient-text">pédagogiques</span>
          </h1>
          <p className="mt-5 text-[17px] text-gray-600 max-w-2xl leading-relaxed">
            Tout ce que vous devez savoir avant de signer. Écrit par les courtiers Finarent,
            mis à jour avec la réglementation 2026.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group bg-white rounded-3xl border border-gray-100 p-6 hover:border-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${COLOR_BG[g.color]} flex items-center justify-center mb-5 group-hover:scale-110 transition`}>
                <i className={`fa-solid ${g.icon} ${COLOR_TEXT[g.color]} text-2xl`}></i>
              </div>
              <h2 className="text-lg font-black text-primary leading-tight mb-2 group-hover:text-emerald-700 transition">
                {g.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{g.tagline}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                  {g.sections.length} chapitres · {g.duration} min
                </span>
                <span className="text-xs font-bold text-emerald-700 group-hover:gap-2 gap-1 flex items-center transition-all">
                  Lire <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-black text-primary mb-3">Pas trouvé votre sujet ?</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Posez votre question à un expert Finarent — réponse personnalisée sous 24 h, sans engagement.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition hover:-translate-y-px"
          >
            <i className="fa-solid fa-paper-plane"></i>
            Poser ma question
          </Link>
        </div>
      </div>
    </div>
  );
}
