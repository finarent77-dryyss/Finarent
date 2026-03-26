'use client';

import { useTranslation } from '@/lib/i18n';

export default function WhyLeasingClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-primary mb-6">{t('whyLeasing.title')}</h1>
        <p className="text-xl text-gray-600">{t('whyLeasing.subtitle')}</p>
      </div>
    </div>
  );
}
