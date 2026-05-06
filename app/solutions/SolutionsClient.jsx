'use client';

import Link from 'next/link';
import { solutionsData } from '@/assets/data/solutions';
import { useTranslation } from '@/lib/i18n';

export default function SolutionsClient() {
  const { t } = useTranslation();
  const solutionKeys = ['creditBail', 'loa', 'creditPro', 'leasingOps', 'lld', 'surMesure'];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm">{t('solutions.badge')}</span>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-6">{t('solutions.title')}</h1>
            <p className="text-xl text-gray-600">{t('solutions.subtitle')}</p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutionsData.map((sol, idx) => {
              const key = solutionKeys[idx];
              const translated = t(`data.solutions.${key}`);
              return (
                <Link key={sol.id} href={`/solutions/${sol.id}`} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-secondary relative">
                  {sol.monthlyFrom && (
                    <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold">
                      <i className="fa-solid fa-tag text-[10px]"></i>
                      {sol.monthlyFrom === 'Sur devis' ? sol.monthlyFrom : `dès ${sol.monthlyFrom}`}
                    </div>
                  )}
                  <div className={`w-16 h-16 bg-gradient-to-br ${sol.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <i className={`fa-solid ${sol.icon} text-white text-3xl`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-3">{translated.title}</h3>
                  <p className="text-gray-600 mb-4">{translated.description}</p>
                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                      <i className="fa-solid fa-coins text-secondary"></i>
                      {sol.minAmount} – {sol.maxAmount}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                      <i className="fa-regular fa-calendar text-secondary"></i>
                      {sol.duration}
                    </span>
                  </div>
                  <span className="text-secondary font-semibold inline-flex items-center gap-2">{t('solutions.learnMore')} <i className="fa-solid fa-arrow-right"></i></span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
