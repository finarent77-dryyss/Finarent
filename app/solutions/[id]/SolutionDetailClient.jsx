'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function SolutionDetailClient({ sol, otherSolutions }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-32 overflow-hidden bg-[#0A192F] text-white">
        {sol.heroImage && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={sol.heroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/85 to-[#0A192F]/40"></div>
          </div>
        )}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Link
            href="/solutions"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold mb-6 sm:mb-12 transition-all group text-sm sm:text-base"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-2 transition-transform" />
            {t('solutionDetail.backToSolutions')}
          </Link>
          <div className="max-w-4xl">
            <div className={`inline-flex w-20 h-20 bg-linear-to-br ${sol.color} rounded-[24px] items-center justify-center mb-10 shadow-2xl shadow-black/20`}>
              <i className={`fa-solid ${sol.icon} text-white text-3xl`} />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 tracking-tight leading-tight">
              {sol.title}
            </h1>
            <p className="text-xl sm:text-2xl text-white/70 mb-12 leading-relaxed font-light max-w-3xl">
              {sol.description}
            </p>
            <div className="flex flex-wrap gap-4">
              {sol.monthlyFrom && (
                <span className="inline-flex items-center gap-3 px-6 py-3 bg-accent text-white rounded-2xl font-bold shadow-xl shadow-accent/30">
                  <i className="fa-solid fa-tag" />
                  {sol.monthlyFrom === 'Sur devis' ? sol.monthlyFrom : `À partir de ${sol.monthlyFrom}`}
                </span>
              )}
              <span className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white font-bold shadow-xl">
                <i className="fa-solid fa-clock text-accent" />
                {t('solutionDetail.delay')} : {sol.duration}
              </span>
              <span className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white font-bold shadow-xl">
                <i className="fa-solid fa-euro-sign text-accent" />
                {sol.minAmount} - {sol.maxAmount}
              </span>
            </div>
            {sol.monthlyFrom && sol.monthlyFrom !== 'Sur devis' && (
              <p className="text-xs text-white/40 mt-4 italic">
                * Mensualité indicative pour {sol.minAmount} sur 36 mois. Taux personnalisé selon votre dossier.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contenu */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Avantages */}
              <div className="bg-linear-to-br from-slate-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <i className="fa-solid fa-check-double text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-primary">{t('solutionDetail.advantages')}</h2>
                </div>
                <ul className="space-y-4">
                  {sol.advantages.map((a, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center mt-0.5">
                        <i className="fa-solid fa-check text-accent text-xs" />
                      </span>
                      <span className="text-gray-700 leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Idéal pour */}
              <div className="bg-linear-to-br from-secondary/5 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-secondary/10 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <i className="fa-solid fa-building text-secondary" />
                  </div>
                  <h2 className="text-xl font-bold text-primary">{t('solutionDetail.idealFor')}</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sol.idealFor.map((item, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-white rounded-xl border border-secondary/20 text-secondary font-medium shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-secondary/10">
                  <h3 className="font-bold text-primary mb-4">{t('solutionDetail.financingDetails')}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('solutionDetail.duration')}</span>
                      <span className="font-bold text-primary">{sol.duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('solutionDetail.minAmount')}</span>
                      <span className="font-bold text-primary">{sol.minAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('solutionDetail.maxAmount')}</span>
                      <span className="font-bold text-primary">{sol.maxAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{t('solutionDetail.initialDeposit')}</span>
                      <span className="font-bold text-accent">{t('solutionDetail.notRequired')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 sm:mt-16 text-center">
              <div className="bg-linear-to-r from-slate-50 to-white rounded-3xl p-8 sm:p-12 border border-slate-100">
                <h2 className="text-2xl sm:text-3xl font-black text-primary mb-4">
                  {t('solutionDetail.interestedIn')} {sol.title} ?
                </h2>
                <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                  {t('solutionDetail.ctaDesc')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/contact"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-linear-to-r from-secondary to-accent text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-secondary/25 hover:scale-105 transition-all duration-300"
                  >
                    {t('solutionDetail.startRequest')}
                    <i className="fa-solid fa-arrow-right" />
                  </Link>
                  <Link
                    href="/simulator"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary border-2 border-slate-200 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-lg transition-all duration-300"
                  >
                    <i className="fa-solid fa-calculator" />
                    {t('solutionDetail.simulateFinancing')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autres solutions */}
      <section className="py-12 sm:py-16 lg:py-20 bg-linear-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-primary">{t('solutionDetail.discoverOtherSolutions')}</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {otherSolutions.map((s) => (
              <Link
                key={s.id}
                href={`/solutions/${s.id}`}
                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-secondary/20 hover:shadow-xl transition-all duration-500 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${s.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <i className={`fa-solid ${s.icon} text-white text-lg`} />
                </div>
                <h3 className="font-bold text-primary mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{s.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
