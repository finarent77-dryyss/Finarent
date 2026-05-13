'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function AdminHeader({ email }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/demandes" className="text-primary font-bold text-xl">
          Admin Finarent
        </Link>
        <span className="text-gray-500">|</span>
        <span className="text-gray-600">{email}</span>
      </div>
      <a
        href="/api/auth/logout?returnTo=/"
        className="text-sm text-gray-600 hover:text-secondary"
      >
        {t('admin.logout')}
      </a>
    </div>
  );
}
