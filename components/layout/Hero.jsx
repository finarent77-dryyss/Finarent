'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 sm:pt-36 pb-16 sm:pb-32 bg-[#0A192F] text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-secondary/15 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-accent/15 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-10">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/5 backdrop-blur-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 shadow-2xl animate-fade-in">
                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-accent"></span>
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white/80">{t('hero.badge')}</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-xl px-3 py-1.5 rounded-full border border-emerald-400/20">
                <span className="text-emerald-400 text-xs">★★★★★</span>
                <span className="text-[10px] sm:text-xs font-bold text-white/80 tracking-wider"><span className="text-emerald-400">4.9/5</span> · 1500+ avis</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
              {t('hero.title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-accent underline decoration-accent/30 underline-offset-4 sm:underline-offset-8">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-base sm:text-xl lg:text-2xl text-white/70 leading-relaxed max-w-xl font-light">
              {t('hero.subtitle')} <span className="text-white font-bold border-b-2 border-accent">{t('hero.subtitle48h')}</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 lg:gap-6">
              <Link href="/contact" className="group relative px-6 py-4 sm:px-10 sm:py-5 bg-white text-primary font-black rounded-xl sm:rounded-2xl hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-500 overflow-hidden text-center text-sm sm:text-base">
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  🚀 {t('hero.ctaPrimary')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>

              <Link href="/assurance" className="px-6 py-4 sm:px-10 sm:py-5 bg-accent/10 hover:bg-accent/20 backdrop-blur-md text-accent font-bold rounded-xl sm:rounded-2xl border-2 border-accent/30 hover:border-accent transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                <i className="fa-solid fa-shield-halved"></i>
                <span>{t('hero.ctaSecondary')}</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-8 lg:gap-x-10 pt-2 sm:pt-6 px-1 sm:px-2 opacity-80">
              {[
                { icon: 'fa-check', text: t('hero.noDeposit') },
                { icon: 'fa-bolt', text: t('hero.fast48h') },
                { icon: 'fa-shield', text: t('hero.approval98') }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <i className={`fa-solid ${item.icon} text-accent text-[8px] sm:text-[10px]`}></i>
                  </div>
                  <span className="text-[10px] sm:text-sm font-bold tracking-wider sm:tracking-widest uppercase">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-delayed"></div>

            <div className="relative group perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent via-secondary to-accent rounded-[48px] blur-xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>

              <div className="relative bg-[#0D2137] rounded-[44px] p-3 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden transform transition-all duration-700 group-hover:rotate-1 group-hover:scale-[1.02]">
                <div className="relative h-[600px] w-full rounded-[36px] overflow-hidden">
                  <img
                    className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-2000"
                    src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=1200&q=80"
                    alt="Cheffe d'entreprise française accompagnée par Finarent pour son financement"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>

                  <div className="absolute bottom-10 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="grid grid-cols-3 gap-1 bg-white/5 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-3xl">
                      <div className="text-center">
                        <div className="text-3xl font-black text-accent tracking-tighter">50M€</div>
                        <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-1">{t('hero.funded')}</div>
                      </div>
                      <div className="text-center border-x border-white/10">
                        <div className="text-3xl font-black text-white tracking-tighter">1200+</div>
                        <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-1">{t('hero.clients')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-white tracking-tighter">4.9/5</div>
                        <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-1">{t('hero.reviews')}</div>
                      </div>
                    </div>
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
