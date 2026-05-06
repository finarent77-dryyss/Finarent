'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';

const STORAGE_KEY = 'finassur_visited';

export default function FirstVisitSplash({ children }) {
  const router = useRouter();
  const [phase, setPhase] = useState('loading');
  const [showSplash, setShowSplash] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const visited = localStorage.getItem(STORAGE_KEY);
    if (visited) {
      setShowSplash(false);
      return;
    }
    setShowSplash(true);
  }, []);

  useEffect(() => {
    document.body.toggleAttribute('data-splash-active', showSplash === true || showSplash === null);
    return () => document.body.removeAttribute('data-splash-active');
  }, [showSplash]);

  useEffect(() => {
    if (showSplash !== true) return;
    const timer = setTimeout(() => setPhase('choice'), 1200);
    return () => clearTimeout(timer);
  }, [showSplash]);

  const handleChoice = (path) => {
    localStorage.setItem(STORAGE_KEY, 'true');
    router.push(path);
  };

  if (showSplash === false) {
    return children;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-secondary/5 overflow-hidden min-h-[100dvh]">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-secondary/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]"></div>
        <div className="absolute top-[20%] left-[10%] w-[200px] h-[200px] bg-secondary/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Loading phase - logo animation */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
          phase === 'loading' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative w-[min(85vw,420px)] h-[min(85vw,420px)] sm:w-[min(75vw,480px)] sm:h-[min(75vw,480px)] md:w-[min(70vw,520px)] md:h-[min(70vw,520px)]">
          <div className="absolute -inset-8 sm:-inset-10 md:-inset-12 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full animate-whirlwind-spin">
              <defs>
                <linearGradient id="whirlwind-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
                <linearGradient id="whirlwind-shine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                  <stop offset="40%" stopColor="#fff" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#fff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M100 15 Q185 45 185 100 Q185 155 100 185 Q15 155 15 100 Q15 45 100 15" fill="none" stroke="url(#whirlwind-grad)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 6" />
              <path d="M100 40 Q165 65 165 100 Q165 135 100 160 Q35 135 35 100 Q35 65 100 40" fill="none" stroke="url(#whirlwind-grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 8" opacity="0.85" />
              <path d="M100 55 Q145 72 145 100 Q145 128 100 145 Q55 128 55 100 Q55 72 100 55" fill="none" stroke="url(#whirlwind-shine)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
          <div className="absolute -inset-5 sm:-inset-6 md:-inset-8 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full animate-whirlwind-spin-reverse">
              <path d="M100 25 Q172 55 172 100 Q172 145 100 175 Q28 145 28 100 Q28 55 100 25" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="14 10" opacity="0.5" />
              <path d="M100 45 Q155 70 155 100 Q155 130 100 155 Q45 130 45 100 Q45 70 100 45" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="6 10" opacity="0.35" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary/20 to-accent/20 shadow-2xl shadow-secondary/20 animate-whirlwind-pulse" />
          <div className="absolute inset-2 sm:inset-3 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-4 sm:p-6 md:p-8 shadow-inner">
            <img src="/finarent-logo.jpg" alt="Finarent" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      {/* Choice phase */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-all duration-700 ${
          phase === 'choice' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Skip button */}
        <button
          onClick={() => handleChoice('/')}
          className="absolute top-6 right-6 flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors"
        >
          {t('splash.accessSite')}
          <i className="fa-solid fa-arrow-right text-xs"></i>
        </button>

        {/* Logo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white shadow-xl shadow-secondary/10 border border-gray-100 mb-6 sm:mb-8">
          <img src="/finarent-logo.jpg" alt="Finarent" className="w-full h-full object-contain p-2" />
        </div>

        {/* Welcome text */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary mb-3 text-center tracking-tight">
          {t('splash.welcome')} <span className="text-transparent bg-clip-text bg-linear-to-r from-secondary to-accent">Finassur</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mb-10 sm:mb-12 text-center max-w-lg leading-relaxed">
          {t('splash.whatAreYouLooking')}
        </p>

        {/* Choice cards */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-lg">
          <button
            onClick={() => handleChoice('/assurance')}
            className="group flex-1 py-8 px-8 rounded-3xl border-2 border-secondary/20 hover:border-secondary bg-white hover:bg-secondary/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-secondary/10 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
              <i className="fa-solid fa-shield-halved text-3xl text-secondary" />
            </div>
            <span className="text-xl font-bold text-primary group-hover:text-secondary transition-colors block">{t('splash.insurance')}</span>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{t('splash.insuranceDesc')}</p>
          </button>
          <button
            onClick={() => handleChoice('/contact')}
            className="group flex-1 py-8 px-8 rounded-3xl border-2 border-accent/20 hover:border-accent bg-white hover:bg-accent/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent/10 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
              <i className="fa-solid fa-coins text-3xl text-accent" />
            </div>
            <span className="text-xl font-bold text-primary group-hover:text-accent transition-colors block">{t('splash.financing')}</span>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{t('splash.financingDesc')}</p>
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-6 sm:gap-8 mt-10 sm:mt-12 text-gray-400">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check-circle text-accent text-sm"></i>
            <span className="text-xs font-semibold uppercase tracking-wider">{t('splash.48hChrono')}</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check-circle text-accent text-sm"></i>
            <span className="text-xs font-semibold uppercase tracking-wider">{t('splash.clients1200')}</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-check-circle text-accent text-sm"></i>
            <span className="text-xs font-semibold uppercase tracking-wider">{t('splash.approval98')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
