'use client';

import Link from 'next/link';
import SectorCard from '@/components/ui/SectorCard';
import ProcessStep from '@/components/ui/ProcessStep';
import StatsCard from '@/components/ui/StatsCard';
import TestimonialCard from '@/components/ui/TestimonialCard';
import Hero from '@/components/layout/Hero';
import PageTransition from '@/components/animations/PageTransition';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { sectorsData } from '@/assets/data/sectors';
import { testimonialsData } from '@/assets/data/testimonials';
import { useTranslation } from '@/lib/i18n';

export default function HomeClient() {
  const { t } = useTranslation();

  const processSteps = [
    { title: t('home.step1Title'), description: t('home.step1Desc'), icon: 'fa-file-lines', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
    { title: t('home.step2Title'), description: t('home.step2Desc'), icon: 'fa-user-tie', iconBg: 'bg-accent/10', iconColor: 'text-accent' },
    { title: t('home.step3Title'), description: t('home.step3Desc'), icon: 'fa-check-double', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600' },
    { title: t('home.step4Title'), description: t('home.step4Desc'), icon: 'fa-truck-fast', iconBg: 'bg-orange-500/10', iconColor: 'text-orange-600' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Hero />

        {/* Stats */}
        <section className="py-12 sm:py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {[
                  { icon: 'fa-users', num: '1500+', label: t('home.satisfiedClients'), color: 'secondary' },
                  { icon: 'fa-clock', num: '48h', label: t('home.responseTime'), color: 'accent' },
                  { icon: 'fa-euro-sign', num: '50M€', label: t('home.funded2025'), color: 'indigo-500' },
                  { icon: 'fa-handshake-simple', num: '98%', label: t('home.approvalRate'), color: 'orange-500' }
                ].map((stat, i) => (
                  <div key={i} className="group p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-${stat.color}/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6 group-hover:scale-110 transition-transform`}>
                      <i className={`fa-solid ${stat.icon} text-${stat.color} text-lg sm:text-2xl`}></i>
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary mb-1 sm:mb-2 tracking-tighter">{stat.num}</div>
                    <div className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-wider sm:tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Sectors */}
        <section className="py-12 sm:py-16 lg:py-24 bg-[#F8FAFC]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 lg:mb-16 gap-4 sm:gap-6">
              <div className="max-w-2xl">
                <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-accent/5 rounded-full mb-4 sm:mb-6 border border-accent/10">
                  <span className="text-accent font-bold text-[10px] sm:text-xs uppercase tracking-widest">{t('home.fundedSectors')}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary leading-tight">
                  {t('home.expertiseByTrade')} <span className="text-accent">{t('home.expertiseHighlight')}</span>
                </h2>
              </div>
              <Link href="/sectors" className="text-secondary font-bold flex items-center gap-2 group text-sm sm:text-base">
                {t('home.viewAllSectors')}
                <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {sectorsData.slice(0, 4).map((sector) => (
                <ScrollReveal key={sector.id}><SectorCard sector={sector} /></ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Insurance */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-accent/10 via-white to-secondary/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-12 border-2 border-accent/20">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div>
                    <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-accent/20 rounded-full mb-4 sm:mb-6">
                      <span className="text-accent font-semibold text-xs sm:text-sm">{t('home.professionalInsurance')}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6">{t('home.protectBusiness')}</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-5 sm:mb-6 leading-relaxed">{t('home.insuranceDesc')}</p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Link href="/assurance" className="btn-primary inline-flex items-center justify-center space-x-2 text-center">
                        <i className="fa-solid fa-shield-halved"></i>
                        <span>{t('home.discoverInsurance')}</span>
                      </Link>
                      <Link href="/contact" className="btn-outline inline-flex items-center justify-center space-x-2 text-center">
                        <span>{t('common.requestQuote')}</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    {[
                      { icon: 'fa-shield-halved', title: t('home.rcPro'), desc: t('home.rcProDesc'), color: 'accent' },
                      { icon: 'fa-user-tie', title: t('home.do'), desc: t('home.doDesc'), color: 'secondary' },
                      { icon: 'fa-truck', title: t('home.fleet'), desc: t('home.fleetDesc'), color: 'accent' },
                      { icon: 'fa-building', title: t('home.multiRisk'), desc: t('home.multiRiskDesc'), color: 'secondary' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 sm:p-5 lg:p-6 shadow-md border border-gray-100">
                        <i className={`fa-solid ${item.icon} text-${item.color} text-lg sm:text-2xl mb-2 sm:mb-3`}></i>
                        <div className="font-bold text-primary text-sm sm:text-base">{item.title}</div>
                        <div className="text-xs sm:text-sm text-gray-600 leading-snug">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Leasing */}
        <section className="py-12 sm:py-16 lg:py-24 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
              <ScrollReveal scale={0.95}>
                <div className="relative">
                  <div className="absolute -inset-10 bg-accent/5 rounded-full blur-[100px] animate-pulse-slow"></div>
                  <div className="relative bg-white rounded-2xl sm:rounded-[40px] p-1.5 sm:p-2 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100 group">
                    <div className="relative overflow-hidden rounded-xl sm:rounded-[36px] aspect-square">
                      <img
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                        src="/solutions_leasing_concepts_1772271116670.png"
                        alt="Leasing Excellence"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white rounded-xl sm:rounded-[24px] p-3 sm:p-6 shadow-2xl border border-gray-50 transform group-hover:-translate-y-2 transition-transform duration-500 z-20">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-secondary/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                          <i className="fa-solid fa-chart-line text-secondary text-sm sm:text-xl"></i>
                        </div>
                        <div>
                          <div className="text-lg sm:text-2xl font-black text-primary tracking-tighter">100%</div>
                          <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{t('home.deductible')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <div className="space-y-6 sm:space-y-10">
                <div>
                  <div className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary/5 rounded-full mb-4 sm:mb-6 border border-secondary/10">
                    <span className="text-secondary font-bold text-[10px] sm:text-xs uppercase tracking-widest">{t('home.tradeExpertise')}</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-primary mb-4 sm:mb-6 leading-tight">
                    {t('home.optimizeCapital')} <span className="text-secondary">{t('home.leasing')}</span>
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-light">
                    {t('home.leasingDesc')}
                  </p>
                </div>

                <div className="grid gap-3 sm:gap-6">
                  {[
                    { icon: 'fa-coins', color: 'accent', title: t('home.cashPreserved'), desc: t('home.cashPreservedDesc') },
                    { icon: 'fa-file-invoice-dollar', color: 'secondary', title: t('home.taxAdvantage'), desc: t('home.taxAdvantageDesc') },
                    { icon: 'fa-arrows-rotate', color: 'indigo-500', title: t('home.latestEquipment'), desc: t('home.latestEquipmentDesc') }
                  ].map((item, i) => (
                    <ScrollReveal key={i} delay={i * 0.1}>
                      <div className="group flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100">
                        <div className={`w-11 h-11 sm:w-14 sm:h-14 bg-${item.color}/10 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <i className={`fa-solid ${item.icon} text-${item.color} text-lg sm:text-2xl`}></i>
                        </div>
                        <div>
                          <h3 className="text-base sm:text-xl font-bold text-primary mb-0.5 sm:mb-1">{item.title}</h3>
                          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">{t('home.simpleProcess')}</h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto">{t('home.simpleProcessDesc')}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative">
              <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-accent to-secondary"></div>
              {processSteps.map((step, index) => (
                <ProcessStep key={index} step={step} index={index} isLast={index === processSteps.length - 1} />
              ))}
            </div>
            <div className="text-center mt-8 sm:mt-12">
              <Link href="/contact" className="btn-primary">{t('home.startRequest')}</Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">{t('home.theyTrustUs')}</h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600">{t('home.discoverTestimonials')}</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {testimonialsData.slice(0, 3).map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
            </div>
            <div className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-secondary to-accent rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white text-center">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star text-yellow-300 text-lg sm:text-2xl"></i>)}
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">4.9/5</div>
                <p className="text-sm sm:text-base lg:text-xl text-white/90 mb-6 sm:mb-8">{t('home.averageRating')}</p>
                <div className="grid grid-cols-3 gap-4 sm:gap-8">
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">98%</div>
                    <div className="text-white/80 text-xs sm:text-sm">{t('home.satisfactionRate')}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">1200+</div>
                    <div className="text-white/80 text-xs sm:text-sm">{t('home.fundedCompanies')}</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">48h</div>
                    <div className="text-white/80 text-xs sm:text-sm">{t('home.avgResponseTime')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / Companies */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">{t('home.theyTrustUs')}</h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600">{t('home.companiesChoseUs')}</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-6 lg:gap-8 items-center mb-8 sm:mb-12 lg:mb-16">
              {['BTP', 'MÉDICAL', 'TRANSPORT', 'INDUSTRIE', 'IT & TECH', 'SERVICES'].map((company, i) => (
                <div key={i} className="bg-white rounded-xl p-3 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center h-16 sm:h-24">
                  <div className="text-xs sm:text-lg lg:text-2xl font-bold text-gray-400">{company}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { icon: 'fa-award', num: '15+', label: t('home.yearsExperience'), color: 'secondary' },
                { icon: 'fa-building', num: '1200+', label: t('home.clientCompanies'), color: 'accent' },
                { icon: 'fa-euro-sign', num: '50M€', label: t('home.fundedAmount'), color: 'indigo-600' },
                { icon: 'fa-handshake', num: '98%', label: t('home.satisfactionRate'), color: 'orange-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-center">
                  <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-${item.color === 'secondary' ? 'secondary' : item.color === 'accent' ? 'accent' : 'indigo-500'}/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <i className={`fa-solid ${item.icon} text-${item.color} text-lg sm:text-2xl`}></i>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">{item.num}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-secondary to-accent rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white text-center">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-6">{t('home.readyToGrow')}</h2>
                <p className="text-sm sm:text-base lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">{t('home.readyToGrowDesc')}</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/contact" className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-secondary font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm sm:text-base">{t('home.makeRequest')}</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
