'use client';

import PageTransition from '@/components/animations/PageTransition';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyClient() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h1 className="text-4xl font-bold text-primary mb-8 text-center">{t('privacy.title')}</h1>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 space-y-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <section key={n}>
                    <h2 className="text-2xl font-bold text-primary mb-4">{t(`privacy.section${n}Title`)}</h2>
                    <p className="text-gray-600 leading-relaxed">{t(`privacy.section${n}`)}</p>
                  </section>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
