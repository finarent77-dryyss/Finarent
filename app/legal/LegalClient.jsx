'use client';

import PageTransition from '@/components/animations/PageTransition';
import ScrollReveal from '@/components/animations/ScrollReveal';
import { useTranslation } from '@/lib/i18n';

export default function LegalClient() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <h1 className="text-4xl font-bold text-primary mb-8 text-center">{t('legal.title')}</h1>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-building text-secondary"></i>{t('legal.editor')}
                  </h2>
                  <div className="text-gray-600 leading-relaxed space-y-2">
                    <p><strong>Finassur SAS</strong></p>
                    <p>{t('legal.companyType')}</p>
                    <p>{t('legal.address')}</p>
                    <p>{t('legal.sirenRcs')}</p>
                    <p>{t('legal.tva')}</p>
                  </div>
                </section>
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-user-tie text-secondary"></i>{t('legal.director')}
                  </h2>
                  <p className="text-gray-600">{t('legal.directorDesc')}</p>
                </section>
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-server text-secondary"></i>{t('legal.hosting')}
                  </h2>
                  <div className="text-gray-600 leading-relaxed space-y-2">
                    <p>{t('legal.hostingDesc')}</p>
                    <p><strong>Vercel Inc.</strong></p>
                    <p>{t('legal.hostingAddress')}</p>
                  </div>
                </section>
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-certificate text-secondary"></i>{t('legal.regulation')}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{t('legal.regulationDesc')}</p>
                </section>
                <section>
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-copyright text-secondary"></i>{t('legal.ip')}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{t('legal.ipDesc')}</p>
                </section>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
