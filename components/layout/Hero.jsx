'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

/**
 * Hero hybride — pattern HeroSplit Claude Design × photo Finarent.
 * • Fond ambient iridescent (violet/indigo/sage) au lieu de dark navy
 * • Layout 2 colonnes : contenu gauche, photo équipe droite
 * • Titre BOLD Plus Jakarta Sans avec dernier segment en gradient rainbow animé
 * • Pill ORIAS + 38 partenaires bancaires
 * • Boutons : primary solid indigo + ghost
 * • Photo : ma photo locale d'équipe avec stats overlay
 */
export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
      {/* Ambient iridescent — 3 radial gradients (violet / indigo / sage) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(at 20% 30%, rgba(168, 85, 247, 0.10) 0%, transparent 45%),
            radial-gradient(at 80% 50%, rgba(99, 102, 241, 0.10) 0%, transparent 45%),
            radial-gradient(at 60% 90%, rgba(34, 214, 126, 0.10) 0%, transparent 45%)
          `,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* COLONNE GAUCHE — contenu */}
          <div>
            {/* Pill ORIAS */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-100 text-emerald-700 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Agréé ORIAS · 38 partenaires bancaires
            </div>

            {/* Titre BOLD avec dernier mot en gradient */}
            <h1 className="font-black text-primary leading-[0.94] tracking-tight"
                style={{ fontSize: 'clamp(40px, 7vw, 84px)' }}>
              {t('hero.title')}
              <br />
              <span className="gradient-text inline-block">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="mt-7 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-[46ch]">
              {t('hero.subtitle')}{' '}
              <span className="text-primary font-bold">{t('hero.subtitle48h')}</span>.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">
                {t('hero.ctaPrimary')} <span>→</span>
              </Link>
              <Link href="/assurance" className="btn-ghost">
                <i className="fa-solid fa-shield-halved text-xs"></i>
                <span>{t('hero.ctaSecondary')}</span>
              </Link>
            </div>

            {/* 3 mini-features */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
              {[
                { icon: 'fa-check', text: t('hero.noDeposit') },
                { icon: 'fa-bolt', text: t('hero.fast48h') },
                { icon: 'fa-shield-check', text: t('hero.approval98') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <i className={`fa-solid ${item.icon} text-emerald-600 text-[9px]`}></i>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase text-gray-600">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE DROITE — photo + stats overlay */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-100 to-emerald-100 shadow-2xl">
              <img
                src="/hero_business_team_premium_v2_1772271137874.png"
                alt="Équipe Finarent — courtage financement & assurance"
                className="w-full h-full object-cover"
              />
              {/* Overlay sombre bas */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent" />

              {/* Stats card flottante */}
              <div className="absolute bottom-5 left-5 right-5">
                <div className="grid grid-cols-3 gap-1 bg-white/95 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-black text-secondary tabular-nums tracking-tight">50M€</div>
                    <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mt-1">{t('hero.funded')}</div>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <div className="text-2xl font-black text-primary tabular-nums tracking-tight">1200+</div>
                    <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mt-1">{t('hero.clients')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-accent tabular-nums tracking-tight">4.9/5</div>
                    <div className="text-[9px] uppercase font-bold text-gray-500 tracking-widest mt-1">{t('hero.reviews')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
