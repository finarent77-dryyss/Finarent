'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';

export default function AboutClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
                <span className="text-secondary font-semibold text-sm">{t('about.ourStory')}</span>
              </div>
              <h1 className="text-5xl font-bold text-primary mb-6">{t('about.title')}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">{t('about.subtitle')}</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-3xl blur-3xl"></div>
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
                  alt="Finassur"
                  className="relative rounded-3xl shadow-2xl z-10"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">{t('about.partnerTitle')}</h2>
                <div className="space-y-6">
                  <p className="text-gray-600 text-lg leading-relaxed">{t('about.partnerDesc1')}</p>
                  <p className="text-gray-600 text-lg leading-relaxed">{t('about.partnerDesc2')}</p>
                  <div className="grid grid-cols-2 gap-6 mt-8">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-3xl font-bold text-secondary mb-1">1200+</div>
                      <div className="text-sm text-gray-500">{t('about.fundedCompanies')}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-3xl font-bold text-accent mb-1">98%</div>
                      <div className="text-sm text-gray-500">{t('about.approvalRate')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-4">{t('about.valuesTitle')}</h2>
            <p className="text-xl text-gray-600">{t('about.valuesSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'fa-rocket', title: t('about.reactivity'), desc: t('about.reactivityDesc') },
              { icon: 'fa-shield-heart', title: t('about.transparency'), desc: t('about.transparencyDesc') },
              { icon: 'fa-users-gear', title: t('about.proximity'), desc: t('about.proximityDesc') },
            ].map((val, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-secondary/30 transition-all group">
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-all">
                    <i className={`fa-solid ${val.icon} text-2xl`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{val.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{val.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-secondary to-accent rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">{t('about.ctaTitle')}</h2>
            <p className="text-xl text-white/90 mb-8">{t('about.ctaDesc')}</p>
            <Link href="/contact" className="px-8 py-3 bg-white text-secondary font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all">
              {t('about.ctaButton')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
