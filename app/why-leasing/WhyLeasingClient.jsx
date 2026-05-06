'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export default function WhyLeasingClient() {
  const { t } = useTranslation();
  const advantages = t('whyLeasing.advantages') || [];
  const headers = t('whyLeasing.comparisonHeaders') || [];
  const rows = t('whyLeasing.comparison') || [];
  const useCases = t('whyLeasing.useCases') || [];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm">{t('whyLeasing.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">{t('whyLeasing.title')}</h1>
            <p className="text-xl text-gray-600">{t('whyLeasing.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">{t('whyLeasing.advantagesTitle')}</h2>
            <p className="text-lg text-gray-600">{t('whyLeasing.advantagesSubtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {advantages.map((adv, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-white rounded-2xl p-7 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-secondary transition-all group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/70 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <i className={`fa-solid ${adv.icon} text-white text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{adv.title}</h3>
                <p className="text-gray-600 leading-relaxed">{adv.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">{t('whyLeasing.comparisonTitle')}</h2>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary text-white">
                      {headers.map((h, idx) => (
                        <th key={idx} className={`px-6 py-4 text-left font-semibold ${idx === headers.length - 1 ? 'bg-secondary' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ridx) => (
                      <tr key={ridx} className={ridx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {row.map((cell, cidx) => (
                          <td
                            key={cidx}
                            className={`px-6 py-4 ${cidx === 0 ? 'font-semibold text-primary' : 'text-gray-700'} ${cidx === row.length - 1 ? 'bg-secondary/5 font-medium text-secondary' : ''}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 italic">{t('whyLeasing.comparisonNote')}</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-12">{t('whyLeasing.useCasesTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {useCases.map((uc, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                  <i className={`fa-solid ${uc.icon} text-secondary text-3xl`}></i>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{uc.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary to-primary/90">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('whyLeasing.ctaTitle')}</h2>
            <p className="text-lg text-white/80 mb-8">{t('whyLeasing.ctaDescription')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/solutions" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition-colors shadow-lg">
                <i className="fa-solid fa-grip"></i>
                {t('whyLeasing.ctaSolutions')}
              </Link>
              <Link href="/simulator" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                <i className="fa-solid fa-calculator"></i>
                {t('whyLeasing.ctaSimulate')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
