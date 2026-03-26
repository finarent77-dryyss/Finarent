'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function EspaceLoginClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-accent to-secondary"></div>

            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100">
              <img src="/Finassurs_logo.jpeg" alt="Finassur" className="h-10 w-auto object-contain" />
            </div>

            <h1 className="text-3xl font-black text-primary mb-4 leading-tight">
              {t('espace.growthPartner')} <span className="text-secondary">{t('espace.growth')}</span>
            </h1>

            <p className="text-gray-500 mb-10 leading-relaxed font-light text-lg">
              {t('espace.loginDesc')}
            </p>

            <div className="space-y-4">
              <a
                href="/api/auth/login?returnTo=/espace"
                className="group relative flex items-center justify-center gap-3 w-full px-8 py-5 bg-primary text-white font-black rounded-2xl hover:shadow-[0_20px_40px_rgba(10,25,47,0.3)] transition-all duration-500 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <i className="fa-solid fa-right-to-bracket text-accent"></i>
                  {t('espace.loginButton')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </a>

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-primary transition-colors py-2"
              >
                {t('espace.backHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
