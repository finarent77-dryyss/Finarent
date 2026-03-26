'use client';

import { useTranslation } from '@/lib/i18n';

export default function EspaceLoginPrompt({ returnTo }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 flex items-center justify-center">
      <div className="container mx-auto px-6 text-center">
        <p className="text-gray-600 mb-4">{t('espace.loginToAccess')}</p>
        <a
          href={`/api/auth/login?returnTo=${returnTo}`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <i className="fa-solid fa-right-to-bracket"></i>
          {t('espace.login')}
        </a>
      </div>
    </div>
  );
}
