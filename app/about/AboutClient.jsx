'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';

export default function AboutClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-slate-100">
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
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800"
                  alt="L'équipe Finarent en réunion stratégique"
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

      {/* Équipe */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-14">
              <div className="inline-block px-3 py-1.5 bg-accent/10 rounded-full mb-4">
                <span className="text-accent font-bold text-xs uppercase tracking-widest">L'équipe Finarent</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Des experts à votre écoute</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une équipe pluridisciplinaire — banque, leasing, assurance, tech — pour vous accompagner sur chaque étape.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Andry S.', role: 'Fondateur & CEO', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80', bio: '15 ans en financement pro' },
              { name: 'Claire L.', role: 'Directrice commerciale', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80', bio: 'Ex-banquière BPI' },
              { name: 'Maxime D.', role: 'Lead financement', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80', bio: 'Spécialiste leasing' },
              { name: 'Léa B.', role: 'Conseillère Assurance', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80', bio: 'Expert RC Pro' },
            ].map((member, i) => (
              <ScrollReveal key={member.name} delay={i * 0.08}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={member.photo}
                      alt={`${member.name}, ${member.role} chez Finarent`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href="#" className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors" aria-label="LinkedIn">
                        <i className="fa-brands fa-linkedin-in text-xs"></i>
                      </a>
                      <a href="#" className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white hover:text-primary transition-colors" aria-label="Email">
                        <i className="fa-solid fa-envelope text-xs"></i>
                      </a>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-primary text-lg leading-tight">{member.name}</h3>
                    <p className="text-secondary text-sm font-semibold mb-2">{member.role}</p>
                    <p className="text-gray-500 text-xs">{member.bio}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-secondary to-accent rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-6">{t('about.ctaTitle')}</h2>
              <p className="text-xl text-white/90 mb-8">{t('about.ctaDesc')}</p>
              <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-3 bg-white text-secondary font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all">
                {t('about.ctaButton')}
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
