'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function FooterCompanyInfo() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-chart-line text-white text-lg"></i>
        </div>
        <span className="text-2xl font-bold">Finarent</span>
      </div>
      <p className="text-white/60 mb-6 text-sm leading-relaxed pr-4">
        {t('footer.companyDesc')}
      </p>
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex items-center space-x-3 text-white/80">
          <i className="fa-solid fa-phone text-accent w-5"></i>
          <span>{t('common.phone')}</span>
        </div>
        <div className="flex items-center space-x-3 text-white/80">
          <i className="fa-solid fa-envelope text-accent w-5"></i>
          <span>{t('common.email')}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        {['linkedin-in', 'facebook-f', 'twitter', 'instagram'].map(icon => (
          <a key={icon} href="#" className="w-8 h-8 bg-white/5 rounded-md flex items-center justify-center hover:bg-secondary transition-colors text-white/70 hover:text-white">
            <i className={`fa-brands fa-${icon} text-sm`}></i>
          </a>
        ))}
      </div>
    </div>
  );
}
