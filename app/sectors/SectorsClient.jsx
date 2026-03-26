'use client';

import SectorCard from '@/components/ui/SectorCard';
import { sectorsData } from '@/assets/data/sectors';
import { useTranslation } from '@/lib/i18n';

export default function SectorsClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold text-sm">{t('sectors.badge')}</span>
            </div>
            <h1 className="text-5xl font-bold text-primary mb-6">{t('sectors.title')}</h1>
            <p className="text-xl text-gray-600">{t('sectors.subtitle')}</p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectorsData.map((sector) => (
              <SectorCard key={sector.id} sector={sector} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
