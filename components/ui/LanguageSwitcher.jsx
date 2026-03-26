'use client';

import { useTranslation } from '@/lib/i18n';

export default function LanguageSwitcher({ isOverDarkHero = false }) {
  const { locale, setLocale } = useTranslation();

  const toggleLocale = () => {
    setLocale(locale === 'fr' ? 'en' : 'fr');
  };

  return (
    <button
      onClick={toggleLocale}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
        isOverDarkHero
          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
      }`}
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
    >
      <span className="text-base leading-none">{locale === 'fr' ? '🇬🇧' : '🇫🇷'}</span>
      <span className="hidden sm:inline">{locale === 'fr' ? 'EN' : 'FR'}</span>
    </button>
  );
}
