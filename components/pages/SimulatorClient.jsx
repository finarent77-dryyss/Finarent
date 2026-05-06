'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinancingCalculator } from '@/hooks/useFinancingCalculator';
import PageTransition from '@/components/animations/PageTransition';
import ScrollReveal from '@/components/animations/ScrollReveal';
import AmortizationChart from '@/components/ui/AmortizationChart';
import { useTranslation } from '@/lib/i18n';

export default function SimulatorClient() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const { amount, setAmount, duration, setDuration, monthlyPayment, totalCost, totalInterest, interestRate } = useFinancingCalculator();
  const contactUrl = `/contact?fromSimulator=1&amount=${amount}&duration=${duration}&monthlyPayment=${monthlyPayment}&totalCost=${totalCost}`;
  const { t, locale } = useTranslation();

  const handleDemandeClick = () => {
    router.push(contactUrl);
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-slate-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
                <span className="text-secondary font-semibold text-sm">{t('simulator.badge')}</span>
              </div>
              <h1 className="text-5xl font-bold text-primary mb-6">{t('simulator.title')}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">{t('simulator.subtitle')}</p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <ScrollReveal>
              <div className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200">
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('simulator.amountLabel')}</label>
                      <input type="range" min="3000" max="500000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} step="1000" className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-secondary" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">3 000€</span>
                        <span className="text-3xl font-bold text-secondary">{amount.toLocaleString()} €</span>
                        <span className="text-sm text-gray-500">500 000€</span>
                      </div>
                      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="3000" max="500000" step="1000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none" />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('simulator.durationLabel')}</label>
                      <input type="range" min="12" max="84" value={duration} onChange={(e) => setDuration(Number(e.target.value))} step="12" className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-accent" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">12 {t('simulator.months')}</span>
                        <span className="text-3xl font-bold text-accent">{duration} {t('simulator.months')}</span>
                        <span className="text-sm text-gray-500">84 {t('simulator.months')}</span>
                      </div>
                      <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-secondary focus:outline-none bg-white">
                        {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                          <option key={m} value={m}>{m} {t('simulator.months')} ({Math.floor(m / 12)} {m > 12 ? t('simulator.years') : t('simulator.year')})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-secondary/20">
                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">{t('simulator.monthlyEstimate')}</div>
                        <div className="text-3xl sm:text-5xl font-bold text-primary mb-2">{monthlyPayment.toLocaleString()} €</div>
                        <div className="text-sm text-gray-500">{t('simulator.disclaimer')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">{t('simulator.totalCost')}</div>
                        <div className="text-2xl font-bold text-primary">{totalCost.toLocaleString()} €</div>
                        <div className="text-sm text-gray-500">{t('simulator.interest')} {totalInterest.toLocaleString()} €</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDemandeClick}
                      disabled={isChecking}
                      className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isChecking ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>{t('simulator.checking')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('simulator.requestFinancing')}</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Graphique amortissement */}
            <ScrollReveal>
              <div className="max-w-5xl mx-auto mt-8">
                <AmortizationChart
                  amount={amount}
                  duration={duration}
                  interestRate={interestRate}
                  monthlyPayment={monthlyPayment}
                  totalInterest={totalInterest}
                />
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
