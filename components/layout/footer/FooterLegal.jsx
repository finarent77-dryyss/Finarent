'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function FooterLegal() {
  const { t } = useTranslation();

  return (
    <div className="border-t border-white/20 pt-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <h5 className="font-bold mb-3 text-sm uppercase tracking-wider text-white/80">{t('footer.legalInfo')}</h5>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/legal" className="text-white/60 hover:text-white transition-colors">{t('footer.legalNotice')}</Link>
            <span className="text-white/30">•</span>
            <Link href="/terms" className="text-white/60 hover:text-white transition-colors">{t('footer.terms')}</Link>
            <span className="text-white/30">•</span>
            <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">{t('footer.privacy')}</Link>
          </div>
        </div>
        <div>
          <h5 className="font-bold mb-3 text-sm uppercase tracking-wider text-white/80">{t('footer.companyInfo')}</h5>
          <div className="text-sm text-white/60 space-y-1">
            <div>{t('footer.companyLegal1')}</div>
            <div>{t('footer.companyLegal2')}</div>
            <div>{t('footer.companyLegal3')}</div>
          </div>
        </div>
        <div>
          <h5 className="font-bold mb-3 text-sm uppercase tracking-wider text-white/80">{t('footer.regulation')}</h5>
          <div className="text-sm text-white/60 space-y-1">
            <div>{t('footer.regulationLine1')}</div>
            <div>{t('footer.regulationLine2')}</div>
            <div>{t('footer.regulationLine3')}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10">
        <div className="text-white/60 text-sm text-center md:text-left">{t('footer.copyright')}</div>
      </div>
    </div>
  );
}
