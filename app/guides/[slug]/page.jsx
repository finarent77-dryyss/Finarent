import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, getGuide } from '@/lib/guides/catalog';

const COLOR_BG = {
  indigo: 'bg-indigo-50', emerald: 'bg-emerald-50', violet: 'bg-violet-50',
  sky: 'bg-sky-50', amber: 'bg-amber-50', rose: 'bg-rose-50',
};
const COLOR_TEXT = {
  indigo: 'text-indigo-600', emerald: 'text-emerald-600', violet: 'text-violet-600',
  sky: 'text-sky-600', amber: 'text-amber-600', rose: 'text-rose-600',
};

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return { title: 'Guide introuvable' };
  return {
    title: g.title,
    description: g.tagline,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: { title: `${g.title} | Finarent`, description: g.tagline, url: `/guides/${slug}`, type: 'article' },
  };
}

function renderRichText(text) {
  // Markdown léger : **gras** + paragraphes vides
  return text.split('\n\n').map((para, i) => {
    const html = para
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
    return (
      <p
        key={i}
        className="text-primary leading-relaxed mb-4 last:mb-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
}

export default async function GuideDetailPage({ params }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();

  const others = GUIDES.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-mono text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition">Accueil</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-primary transition">Guides</Link>
          <span>/</span>
          <span className="text-primary font-semibold">{g.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl ${COLOR_BG[g.color]} flex items-center justify-center`}>
              <i className={`fa-solid ${g.icon} ${COLOR_TEXT[g.color]} text-2xl`}></i>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">
              Guide · {g.sections.length} chapitres · {g.duration} min de lecture
            </div>
          </div>
          <h1 className="font-black text-primary leading-[0.95] tracking-tight"
              style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
            {g.title}
          </h1>
          <p className="mt-5 text-[19px] text-gray-600 max-w-3xl leading-relaxed">{g.tagline}</p>
        </header>

        {/* Sommaire */}
        <aside className="bg-[#FAF8F3] rounded-2xl p-5 mb-10 border border-gray-100">
          <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">Au sommaire</div>
          <ol className="space-y-2">
            {g.sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#chap-${i}`}
                  className="flex items-baseline gap-3 text-sm text-primary hover:text-emerald-700 transition"
                >
                  <span className="text-[10px] font-mono text-gray-400 w-5">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-semibold">{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </aside>

        {/* Sections */}
        <article className="space-y-12">
          {g.sections.map((s, i) => (
            <section key={i} id={`chap-${i}`} className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-5">
                <span className="text-3xl font-black text-gray-200 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-primary leading-tight">
                  {s.title}
                </h2>
              </div>
              <div className="text-[17px] pl-0 sm:pl-14">{renderRichText(s.content)}</div>
            </section>
          ))}
        </article>

        {/* CTA */}
        <div className="mt-16 gradient-bg rounded-3xl p-8 sm:p-12 text-white">
          <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/70 mb-3">
            Passer à l'action
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Prêt à concrétiser votre projet ?</h2>
          <p className="text-white/80 mb-6 max-w-xl">
            Un expert Finarent vous accompagne. Réponse sous 48 h, sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={g.cta?.href || '/simulateurs'}
              className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-6 py-3.5 rounded-2xl hover:scale-105 transition"
            >
              <i className="fa-solid fa-calculator"></i>
              {g.cta?.label || 'Simuler maintenant'}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-white/20 transition"
            >
              <i className="fa-solid fa-headset"></i>
              Parler à un conseiller
            </Link>
          </div>
        </div>

        {/* Autres guides */}
        {others.length > 0 && (
          <section className="mt-16">
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-4">Autres guides</div>
            <div className="grid sm:grid-cols-3 gap-4">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/guides/${o.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-md transition"
                >
                  <div className={`w-10 h-10 rounded-xl ${COLOR_BG[o.color]} flex items-center justify-center mb-3`}>
                    <i className={`fa-solid ${o.icon} ${COLOR_TEXT[o.color]}`}></i>
                  </div>
                  <h3 className="font-bold text-primary text-sm leading-snug group-hover:text-emerald-700 transition">{o.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
