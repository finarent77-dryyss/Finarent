'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export default function ProcessClient() {
  const { t } = useTranslation();
  const steps = t('process.steps') || [];
  const guarantees = t('process.guarantees') || [];
  const faq = t('process.faq') || [];
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm">{t('process.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">{t('process.title')}</h1>
            <p className="text-xl text-gray-600">{t('process.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t('process.stepsTitle')}</h2>
            <p className="text-lg text-gray-600">{t('process.stepsSubtitle')}</p>
          </div>

          <div className="max-w-5xl mx-auto relative">
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-secondary/20 via-secondary/40 to-secondary/20" />
            <div className="space-y-12">
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative grid lg:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
                >
                  <div className={`${idx % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl flex items-center justify-center">
                          <i className={`fa-solid ${step.icon} text-white text-2xl`}></i>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wider text-secondary font-semibold">{step.label}</span>
                          <h3 className="text-2xl font-bold text-primary">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-4">{step.description}</p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-700">
                        <i className="fa-regular fa-clock text-secondary"></i>
                        <span className="font-medium">{step.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`hidden lg:flex justify-center ${idx % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="relative">
                      <div className="w-24 h-24 bg-white border-4 border-secondary rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-3xl font-bold text-primary">{idx + 1}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-primary/90">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">{t('process.guaranteesTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {guarantees.map((g, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                  <i className={`fa-solid ${g.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{g.title}</h3>
                <p className="text-sm text-white/80 leading-relaxed">{g.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">{t('process.faqTitle')}</h2>
            <div className="space-y-3">
              {faq.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-primary">{item.q}</span>
                    <i className={`fa-solid fa-chevron-down text-secondary transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}></i>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t('process.ctaTitle')}</h2>
            <p className="text-lg text-gray-600 mb-8">{t('process.ctaDescription')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/simulator" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-colors shadow-lg">
                <i className="fa-solid fa-calculator"></i>
                {t('process.ctaSimulate')}
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors">
                <i className="fa-solid fa-headset"></i>
                {t('process.ctaContact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
