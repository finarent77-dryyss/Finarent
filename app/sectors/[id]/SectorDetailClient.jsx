'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function SectorDetailClient({ sector, otherSectors }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-40 sm:pb-28 overflow-hidden bg-[#0A192F] text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Link
            href="/sectors"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold mb-8 sm:mb-12 transition-all group text-sm sm:text-base"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-2 transition-transform" />
            {t('sectorDetail.backToSectors')}
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className={`inline-flex w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br ${sector.color} rounded-[20px] sm:rounded-[24px] items-center justify-center mb-8 shadow-2xl shadow-black/20`}>
                <i className={`fa-solid ${sector.icon} text-white text-2xl sm:text-3xl`} />
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tight leading-tight">
                {sector.title}
              </h1>
              <p className="text-lg sm:text-xl text-white/70 mb-8 leading-relaxed font-light max-w-xl">
                {sector.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary font-bold rounded-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-500"
                >
                  <i className="fa-solid fa-paper-plane" />
                  {t('sectorDetail.requestFinancing')}
                </Link>
                <Link
                  href="/simulator"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <i className="fa-solid fa-calculator" />
                  {t('sectorDetail.simulateProject')}
                </Link>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { value: sector.stats.avgAmount, label: t('sectorDetail.avgAmount'), icon: 'fa-coins' },
                { value: sector.stats.clients, label: t('sectorDetail.fundedClients'), icon: 'fa-users' },
                { value: sector.stats.approval, label: t('sectorDetail.approvalRate'), icon: 'fa-check-circle' },
                { value: sector.stats.delay, label: t('sectorDetail.responseDelay'), icon: 'fa-bolt' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                    <i className={`fa-solid ${stat.icon} text-accent text-sm`} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/50 font-medium mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Equipements */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-bold text-sm mb-4">
                <i className="fa-solid fa-list-check" />
                {t('sectorDetail.eligibleEquipments')}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {t('sectorDetail.whatWeFinance')} <span className="text-secondary">{sector.title}</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sector.equipments.map((eq, i) => (
                <div key={i} className="group flex items-center gap-4 p-5 bg-linear-to-r from-slate-50 to-white rounded-2xl border border-slate-100 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${sector.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <i className="fa-solid fa-check text-white text-sm" />
                  </div>
                  <span className="font-semibold text-gray-800">{eq}</span>
                </div>
              ))}
              <div className="flex items-center gap-4 p-5 bg-linear-to-r from-accent/5 to-white rounded-2xl border-2 border-dashed border-accent/30">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-plus text-accent text-sm" />
                </div>
                <span className="font-semibold text-accent">{t('sectorDetail.andMore')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-12 sm:py-16 lg:py-24 bg-linear-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-bold text-sm mb-4">
                <i className="fa-solid fa-star" />
                {t('sectorDetail.yourAdvantages')}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {t('sectorDetail.whyFinance')} <span className="text-secondary">Finassur</span> ?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
              {sector.benefits.map((b, i) => (
                <div key={i} className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-100 hover:border-secondary/20 shadow-sm hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
                  <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${sector.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <i className={`fa-solid ${b.icon} text-white text-lg`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">{b.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent font-bold text-sm mb-4">
                <i className="fa-solid fa-route" />
                {t('sectorDetail.howItWorks')}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {t('sectorDetail.stepsToFinance')}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sector.process.map((p, i) => (
                <div key={i} className="relative group">
                  {i < sector.process.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-linear-to-r from-secondary/30 to-transparent z-0" />
                  )}
                  <div className="relative bg-linear-to-b from-slate-50 to-white rounded-2xl p-6 border border-slate-100 hover:border-secondary/20 hover:shadow-lg transition-all duration-300 text-center">
                    <div className={`w-12 h-12 rounded-full bg-linear-to-br ${sector.color} flex items-center justify-center mx-auto mb-4 text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                      {p.step}
                    </div>
                    <h3 className="font-bold text-primary mb-2">{p.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 lg:py-24 bg-linear-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary font-bold text-sm mb-4">
                <i className="fa-solid fa-circle-question" />
                FAQ
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary">
                {t('sectorDetail.faq')}
              </h2>
            </div>

            <div className="space-y-4">
              {sector.faq.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-primary text-lg flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fa-solid fa-question text-accent text-sm" />
                    </span>
                    {item.q}
                  </h3>
                  <p className="text-gray-600 mt-3 ml-11 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-24 bg-[#0A192F] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[80px]"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-4 sm:mb-6 tracking-tight">
              {t('sectorDetail.readyToEquip')} <span className="text-accent">{sector.title}</span> ?
            </h2>
            <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-10 leading-relaxed">
              {t('sectorDetail.ctaDesc').replace('{delay}', sector.stats.delay)}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-primary font-black rounded-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-500"
              >
                <i className="fa-solid fa-paper-plane" />
                {t('sectorDetail.startRequest')}
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <i className="fa-solid fa-phone" />
                {t('sectorDetail.callBack')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Autres secteurs */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-black text-primary">
              {t('sectorDetail.discoverOtherSectors')}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {otherSectors.map((s) => (
              <Link
                key={s.id}
                href={`/sectors/${s.id}`}
                className="group bg-linear-to-b from-slate-50 to-white rounded-2xl p-6 border border-slate-100 hover:border-secondary/20 hover:shadow-xl transition-all duration-500 text-center"
              >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${s.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <i className={`fa-solid ${s.icon} text-white text-lg`} />
                </div>
                <h3 className="font-bold text-primary mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.shortDesc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
