'use client';

import Link from 'next/link';
import SectorCard from '@/components/ui/SectorCard';
import ProcessStep from '@/components/ui/ProcessStep';
import StatsCard from '@/components/ui/StatsCard';
import TestimonialCarousel from '@/components/ui/TestimonialCarousel';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import Hero from '@/components/layout/Hero';
import HomeQuickSimulator from '@/components/home/HomeQuickSimulator';
import AuroraBackground from '@/components/ui/AuroraBackground';
import Tilt3D from '@/components/ui/Tilt3D';
import Marquee from '@/components/ui/Marquee';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
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
    { title: t('home.step3Title'), description: t('home.step3Desc'), icon: 'fa-check-double', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
    { title: t('home.step4Title'), description: t('home.step4Desc'), icon: 'fa-truck-fast', iconBg: 'bg-accent/10', iconColor: 'text-accent' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Hero />

        {/* Section 1 — Stats (transparente, laisse voir le fond iridescent) */}
        <section className="relative py-12 sm:py-16 lg:py-24 bg-transparent overflow-hidden">
          <div className="absolute inset-0 mesh-bg opacity-60"></div>
          <AuroraBackground variant="vivid" />
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <ScrollReveal>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {[
                  { icon: 'fa-users', to: 1500, suffix: '+', label: t('home.satisfiedClients'), color: 'secondary' },
                  { icon: 'fa-clock', to: 48, suffix: 'h', label: t('home.responseTime'), color: 'accent', duration: 1200 },
                  { icon: 'fa-euro-sign', to: 50, suffix: 'M€', label: t('home.funded2025'), color: 'secondary' },
                  { icon: 'fa-handshake-simple', to: 98, suffix: '%', label: t('home.approvalRate'), color: 'accent' },
                ].map((stat, i) => (
                  <Tilt3D key={i} max={14} className="rounded-2xl sm:rounded-[32px]">
                    <div className="group p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] bg-white/90 backdrop-blur-md border border-white shadow-xl text-center hover:shadow-2xl transition-shadow duration-500">
                      <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-${stat.color}/30 to-${stat.color}/5 flex items-center justify-center mx-auto mb-3 sm:mb-6 group-hover:animate-glow-pulse`}>
                        <div className={`absolute inset-0 rounded-2xl bg-${stat.color}/20 animate-pulse-slow`}></div>
                        <i className={`fa-solid ${stat.icon} text-${stat.color} text-xl sm:text-3xl relative z-10`}></i>
                      </div>
                      <AnimatedCounter
                        to={stat.to}
                        suffix={stat.suffix}
                        duration={stat.duration || 1800}
                        className="block text-2xl sm:text-3xl lg:text-5xl font-black text-primary mb-1 sm:mb-2 tracking-tighter tabular-nums"
                      />
                      <div className="text-[10px] sm:text-sm font-bold text-gray-500 uppercase tracking-wider sm:tracking-widest">{stat.label}</div>
                    </div>
                  </Tilt3D>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <HomeQuickSimulator />

        {/* Section 2 — Trust strip (colorée pastel) */}
        <section className="py-12 sm:py-16 border-y border-white/40" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.05) 50%, rgba(34,214,126,0.06) 100%)' }}>
          <div className="mb-8 sm:mb-10 px-4">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary text-center">
                  30+ partenaires bancaires & assureurs
                </p>
                <span className="hidden sm:inline text-gray-300">|</span>
                <p className="text-xs sm:text-sm text-gray-500">
                  Une mise en concurrence pour <span className="font-bold text-secondary">les meilleures conditions du marché</span>
                </p>
              </div>
            </ScrollReveal>
          </div>
          <Marquee speed="slow">
            {[
              { name: 'BNP Paribas', initial: 'BNP', color: 'from-emerald-700 to-emerald-800' },
              { name: 'Société Générale', initial: 'SG', color: 'from-red-600 to-red-700' },
              { name: 'BPCE Lease', initial: 'BPCE', color: 'from-purple-700 to-purple-800' },
              { name: 'Crédit Agricole', initial: 'CA', color: 'from-emerald-600 to-green-700' },
              { name: 'CIC Lease', initial: 'CIC', color: 'from-blue-600 to-blue-700' },
              { name: 'LCL', initial: 'LCL', color: 'from-amber-500 to-orange-600' },
              { name: 'Bpifrance', initial: 'BPI', color: 'from-sky-600 to-sky-700' },
              { name: 'Arval', initial: 'ARV', color: 'from-cyan-600 to-cyan-700' },
              { name: 'Ayvens', initial: 'AYV', color: 'from-indigo-600 to-indigo-700' },
              { name: 'BNP Lease', initial: 'BNL', color: 'from-emerald-600 to-teal-700' },
              { name: 'SG Equipment', initial: 'SGE', color: 'from-rose-600 to-pink-700' },
              { name: 'Hello Bank', initial: 'HB', color: 'from-fuchsia-600 to-purple-700' },
            ].map((p) => (
              <div key={p.name} className="group flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl hover:border-secondary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shrink-0">
                <span className={`w-12 h-12 rounded-xl bg-linear-to-br ${p.color} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  {p.initial}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-primary truncate">{p.name}</div>
                  <div className="text-[10px] text-gray-400">Partenaire</div>
                </div>
              </div>
            ))}
          </Marquee>
        </section>

        {/* Section 3 — Showcase espace client (transparente) */}
        <section className="py-12 sm:py-16 lg:py-24 bg-transparent overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <ScrollReveal>
                <div className="inline-block px-3 py-1.5 bg-secondary/10 rounded-full mb-4 sm:mb-6">
                  <span className="text-secondary font-bold text-[10px] sm:text-xs uppercase tracking-widest">Espace client digital</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-primary mb-4 sm:mb-6 tracking-tight leading-tight">
                  Suivez votre dossier <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">en temps réel</span>
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                  Timeline visuelle, progression des documents, messagerie avec votre conseiller, signature électronique légale eIDAS. Tout pour gérer votre financement sans friction.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    { icon: 'fa-route', label: 'Timeline 5 étapes : Dépôt → Étude → Offre → Signature → Fonds' },
                    { icon: 'fa-file-circle-check', label: 'Progression documents (KBIS, RIB, CNI, Bilan) en un coup d\'œil' },
                    { icon: 'fa-comments', label: 'Messagerie sécurisée avec votre conseiller dédié' },
                    { icon: 'fa-piggy-bank', label: 'Estimation des économies fiscales sur vos contrats actifs' },
                    { icon: 'fa-bell', label: 'Notifications en temps réel à chaque étape' },
                  ].map((f) => (
                    <li key={f.icon} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <i className={`fa-solid ${f.icon} text-accent text-sm`}></i>
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{f.label}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/espace" className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg">
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  Accéder à mon espace
                </Link>
              </ScrollReveal>

              <ScrollReveal>
                {/* Mockup dashboard espace client */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl blur-2xl opacity-60"></div>
                  <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 sm:p-6">
                    {/* Header mockup */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-accent"></div>
                        <div>
                          <div className="text-xs font-bold text-primary">Bonjour, Marie</div>
                          <div className="text-[10px] text-gray-400">ID #A7C2</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">Dossier actif</span>
                    </div>

                    {/* Timeline mockup */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Mon financement BTP — 120 000€</div>
                        <span className="text-[9px] font-bold text-emerald-600">Étape 3/5</span>
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-secondary to-accent" style={{ width: '50%' }}></div>
                        {['fa-paper-plane', 'fa-magnifying-glass', 'fa-file-invoice', 'fa-pen-fancy', 'fa-flag-checkered'].map((icon, i) => (
                          <div key={i} className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[9px] ${
                            i < 2 ? 'bg-secondary text-white' :
                            i === 2 ? 'bg-white border-2 border-secondary text-secondary ring-2 ring-secondary/20' :
                            'bg-white border-2 border-gray-200 text-gray-300'
                          }`}>
                            <i className={`fa-solid ${i < 2 ? 'fa-check' : icon}`}></i>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stat cards mockup */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { num: '3', label: 'Dossiers', color: 'bg-secondary' },
                        { num: '2', label: 'En cours', color: 'bg-accent' },
                        { num: '1', label: 'Signés', color: 'bg-emerald-500' },
                      ].map((s) => (
                        <div key={s.label} className={`${s.color} rounded-xl p-2.5 text-white`}>
                          <div className="text-lg font-black">{s.num}</div>
                          <div className="text-[9px] font-semibold opacity-80 uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Documents progress mockup */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between text-[10px] font-bold mb-2">
                        <span className="text-emerald-600"><i className="fa-solid fa-circle-check mr-1"></i>Documents requis : 3/4</span>
                        <span className="text-amber-600">Manquant : Bilan</span>
                      </div>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-secondary to-accent" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Section 4 — Sectors (colorée pastel violet/indigo) */}
        <section className="py-12 sm:py-16 lg:py-24" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.07) 0%, rgba(99,102,241,0.07) 100%)' }}>
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

        {/* Section 5 — Insurance (transparente) */}
        <section className="py-12 sm:py-16 lg:py-20 bg-transparent">
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

        {/* Section 6 — Leasing (colorée pastel sage/emerald) */}
        <section className="py-12 sm:py-16 lg:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(34,214,126,0.07) 0%, rgba(99,102,241,0.05) 100%)' }}>
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
                    { icon: 'fa-arrows-rotate', color: 'secondary', title: t('home.latestEquipment'), desc: t('home.latestEquipmentDesc') }
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

        {/* Section 7 — Process (transparente) */}
        <section className="py-12 sm:py-16 lg:py-20 bg-transparent">
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

        {/* Section 8 — Cas clients (colorée pastel rose/violet) */}
        <section className="py-12 sm:py-16 lg:py-24" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(168,85,247,0.07) 100%)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="text-center mb-10 sm:mb-14">
                <div className="inline-block px-3 py-1.5 bg-accent/10 rounded-full mb-4">
                  <span className="text-accent font-bold text-[10px] sm:text-xs uppercase tracking-widest">Cas clients</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3">Des projets concrets, financés en 48h</h2>
                <p className="text-sm sm:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto">
                  Découvrez comment nos clients ont accéléré leur croissance grâce à un financement adapté.
                </p>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  sector: 'BTP',
                  amount: '180 000€',
                  duration: '48 mois',
                  image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
                  title: 'Renouvellement flotte utilitaire',
                  desc: '12 véhicules financés en LOA pour Martin Construction. Mensualité optimisée et maintenance incluse.',
                  highlight: '−25% vs achat comptant',
                  color: 'from-orange-500 to-orange-600',
                  icon: 'fa-truck',
                },
                {
                  sector: 'Médical',
                  amount: '85 000€',
                  duration: '60 mois',
                  image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
                  title: 'Équipement cabinet dentaire',
                  desc: 'Cabinet Dupont équipé en crédit-bail : fauteuil, scanner 3D et instrumentation, déductibles fiscalement.',
                  highlight: '100% déductible',
                  color: 'from-blue-500 to-blue-600',
                  icon: 'fa-stethoscope',
                },
                {
                  sector: 'Industrie',
                  amount: '380 000€',
                  duration: '60 mois',
                  image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80',
                  title: 'Ligne de production CNC',
                  desc: 'Industries Dubois : financement d\'une ligne automatisée. Trésorerie préservée pour la R&D.',
                  highlight: 'Réponse en 36h',
                  color: 'from-amber-500 to-amber-600',
                  icon: 'fa-industry',
                },
              ].map((c, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <div className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg`}>
                          <i className={`fa-solid ${c.icon} text-sm`}></i>
                        </div>
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-primary text-[10px] font-bold uppercase tracking-wider rounded-md">{c.sector}</span>
                      </div>
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-full shadow-lg">
                        <i className="fa-solid fa-bolt mr-1"></i>{c.highlight}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-2xl font-black text-primary tracking-tight">{c.amount}</span>
                        <span className="text-xs text-gray-400 font-medium">sur {c.duration}</span>
                      </div>
                      <h3 className="text-lg font-bold text-primary mb-2 leading-tight">{c.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4">{c.desc}</p>
                      <Link href="/contact" className="inline-flex items-center gap-2 text-secondary font-bold text-sm hover:text-primary transition-colors">
                        Mon projet similaire
                        <i className="fa-solid fa-arrow-right text-xs"></i>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Section 9 — Testimonials (transparente) */}
        <section className="py-12 sm:py-16 lg:py-20 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">{t('home.theyTrustUs')}</h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600">{t('home.discoverTestimonials')}</p>
            </div>
            <TestimonialCarousel testimonials={testimonialsData} />
            <div className="mt-8 sm:mt-12 lg:mt-16 bg-gradient-to-r from-secondary to-accent rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white text-center">
              <div className="max-w-3xl mx-auto">
                <div className="flex justify-center space-x-1 sm:space-x-2 mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => <i key={i} className="fa-solid fa-star text-accent text-lg sm:text-2xl"></i>)}
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

        {/* Section 10 — Trust / Companies (colorée pastel teal/indigo) */}
        <section className="py-12 sm:py-16 lg:py-20" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.06) 0%, rgba(99,102,241,0.07) 100%)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">{t('home.theyTrustUs')}</h2>
              <p className="text-sm sm:text-base lg:text-xl text-gray-600">{t('home.companiesChoseUs')}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mb-8 sm:mb-12 lg:mb-16">
              {[
                { name: 'Transport', icon: 'fa-truck-fast',     count: '180+', gradient: 'from-sky-500/10 to-blue-500/5',       accent: 'text-sky-600',     ring: 'hover:ring-sky-400/40' },
                { name: 'BTP',       icon: 'fa-helmet-safety',  count: '320+', gradient: 'from-amber-500/10 to-orange-500/5',   accent: 'text-amber-600',   ring: 'hover:ring-amber-400/40' },
                { name: 'Services',  icon: 'fa-briefcase',      count: '290+', gradient: 'from-emerald-500/10 to-teal-500/5',   accent: 'text-emerald-600', ring: 'hover:ring-emerald-400/40' },
                { name: 'IT & Tech', icon: 'fa-microchip',      count: '240+', gradient: 'from-violet-500/10 to-indigo-500/5',  accent: 'text-violet-600',  ring: 'hover:ring-violet-400/40' },
                { name: 'Industrie', icon: 'fa-industry',       count: '150+', gradient: 'from-slate-500/10 to-zinc-500/5',     accent: 'text-slate-700',   ring: 'hover:ring-slate-400/40' },
                { name: 'Médical',   icon: 'fa-stethoscope',    count: '210+', gradient: 'from-rose-500/10 to-pink-500/5',      accent: 'text-rose-600',    ring: 'hover:ring-rose-400/40' },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`group relative bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-transparent ${s.ring} overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative flex flex-col items-center text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`fa-solid ${s.icon} ${s.accent} text-base sm:text-xl`}></i>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-primary tracking-tight uppercase">{s.name}</div>
                    <div className={`text-[10px] sm:text-xs font-semibold ${s.accent} mt-0.5`}>{s.count} PME</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {[
                { icon: 'fa-award', num: '15+', label: t('home.yearsExperience'), color: 'secondary' },
                { icon: 'fa-building', num: '1200+', label: t('home.clientCompanies'), color: 'accent' },
                { icon: 'fa-euro-sign', num: '50M€', label: t('home.fundedAmount'), color: 'secondary' },
                { icon: 'fa-handshake', num: '98%', label: t('home.satisfactionRate'), color: 'accent' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-center">
                  <div className={`w-10 h-10 sm:w-16 sm:h-16 bg-${item.color === 'secondary' ? 'secondary' : item.color === 'accent' ? 'accent' : 'secondary'}/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <i className={`fa-solid ${item.icon} text-${item.color} text-lg sm:text-2xl`}></i>
                  </div>
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2">{item.num}</div>
                  <div className="text-gray-600 text-xs sm:text-sm">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 11 — CTA final (transparente, le bandeau .gradient-bg intérieur fait le spot) */}
        <section className="py-12 sm:py-16 lg:py-20 bg-transparent">
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
