'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="text-center px-6">
        <h1 className="text-9xl font-bold text-secondary">404</h1>
        <h2 className="text-2xl font-bold text-primary mt-4 mb-6">{t('notFound.title')}</h2>
        <p className="text-gray-600 mb-8">{t('notFound.description')}</p>
        <Link href="/" className="btn-primary">{t('notFound.backHome')}</Link>
      </div>
    </div>
  );
}
