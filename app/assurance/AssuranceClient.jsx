'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function AssuranceClient() {
  const { t } = useTranslation();
  const assuranceTypes = [
    { id: 'rc-pro', icon: 'fa-shield-halved', color: 'from-secondary to-secondary/80', ...t('data.assurance.rcPro') },
    { id: 'do', icon: 'fa-user-tie', color: 'from-accent to-emerald-600', ...t('data.assurance.do') },
    { id: 'flotte', icon: 'fa-truck', color: 'from-accent to-emerald-700', ...t('data.assurance.flotte') },
    { id: 'multirisque', icon: 'fa-building', color: 'from-primary to-primary/80', ...t('data.assurance.multirisque') },
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-slate-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm">{t('insurance.badge')}</span>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-6">{t('insurance.title')}</h1>
            <p className="text-xl text-gray-600 mb-8">{t('insurance.subtitle')}</p>
            <Link href="/contact?fromInsurance=1" className="btn-primary inline-flex items-center space-x-2">
              <i className="fa-solid fa-file-lines"></i>
              <span>{t('insurance.requestQuote')}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t('insurance.ourSolutions')}</h2>
            <p className="text-lg text-gray-600">{t('insurance.ourSolutionsDesc')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {assuranceTypes.map((type) => (
              <div key={type.id} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-secondary/30">
                <div className={`w-16 h-16 bg-gradient-to-br ${type.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${type.icon} text-white text-3xl`}></i>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-6">{type.description}</p>
                <ul className="space-y-2 mb-6">
                  {type.advantages.map((adv, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <i className="fa-solid fa-check text-accent text-sm"></i>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-primary">{t('insurance.idealFor')}</span> {type.idealFor.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-secondary/5">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-accent/10 rounded-full mb-6">
                <span className="text-accent font-semibold text-sm">{t('insurance.advantagesTitle')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">{t('insurance.whyInsure')}</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">{t('insurance.whyInsureDesc')}</p>
              <div className="space-y-6">
                {[
                  { icon: 'fa-handshake', bg: 'bg-secondary/10', color: 'text-secondary', title: t('insurance.singleContact'), desc: t('insurance.singleContactDesc') },
                  { icon: 'fa-clock', bg: 'bg-accent/10', color: 'text-accent', title: t('insurance.quote48h'), desc: t('insurance.quote48hDesc') },
                  { icon: 'fa-scale-balanced', bg: 'bg-secondary/10', color: 'text-secondary', title: t('insurance.competitiveRates'), desc: t('insurance.competitiveRatesDesc') },
                  { icon: 'fa-headset', bg: 'bg-accent/10', color: 'text-accent', title: t('insurance.dedicatedSupport'), desc: t('insurance.dedicatedSupportDesc') },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <i className={`fa-solid ${item.icon} ${item.color} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
              <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl p-8 mb-6">
                <i className="fa-solid fa-shield-halved text-6xl text-secondary/40 mb-4"></i>
                <h3 className="text-2xl font-bold text-primary mb-4">{t('insurance.financingInsurance')}</h3>
                <p className="text-gray-600 mb-6">{t('insurance.financingInsuranceDesc')}</p>
                <Link href="/contact" className="btn-outline inline-flex items-center space-x-2">
                  <span>{t('common.requestQuote')}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <i className="fa-solid fa-check-circle text-accent text-2xl"></i>
                  <div>
                    <div className="font-bold text-primary">{t('insurance.freeQuote')}</div>
                    <div className="text-sm text-gray-600">{t('insurance.noCommitment')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <i className="fa-solid fa-check-circle text-accent text-2xl"></i>
                  <div>
                    <div className="font-bold text-primary">{t('insurance.response48h')}</div>
                    <div className="text-sm text-gray-600">{t('insurance.guaranteedDelay')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t('insurance.getQuote3Steps')}</h2>
            <p className="text-lg text-gray-600">{t('insurance.getQuote3StepsDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '1', icon: 'fa-pen-to-square', title: t('insurance.describeNeeds'), desc: t('insurance.describeNeedsDesc') },
              { step: '2', icon: 'fa-magnifying-glass', title: t('insurance.personalStudy'), desc: t('insurance.personalStudyDesc') },
              { step: '3', icon: 'fa-file-signature', title: t('insurance.quoteAndSubscription'), desc: t('insurance.quoteAndSubscriptionDesc') },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <i className={`fa-solid ${item.icon} text-white text-2xl`}></i>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">{item.step}</div>
                <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-secondary/10 via-white to-accent/10">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">{t('insurance.readyToProtect')}</h2>
            <p className="text-xl text-gray-600 mb-8">{t('insurance.readyToProtectDesc')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact?fromInsurance=1" className="btn-primary inline-flex items-center space-x-2">
                <i className="fa-solid fa-file-lines"></i>
                <span>{t('insurance.requestQuote')}</span>
              </Link>
              <Link href="/contact" className="btn-outline inline-flex items-center space-x-2">
                <i className="fa-solid fa-phone"></i>
                <span>{t('insurance.contactUs')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
