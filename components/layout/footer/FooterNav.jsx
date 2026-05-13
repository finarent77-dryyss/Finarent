'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function FooterNav() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/90">{t('footer.solutions')}</h4>
        <ul className="space-y-2 text-sm">
          <li><Link href="/solutions/credit-bail" className="text-white/60 hover:text-white transition-colors">{t('footer.creditBail')}</Link></li>
          <li><Link href="/solutions/loa" className="text-white/60 hover:text-white transition-colors">{t('footer.loa')}</Link></li>
          <li><Link href="/solutions/credit-pro" className="text-white/60 hover:text-white transition-colors">{t('footer.creditPro')}</Link></li>
          <li><Link href="/assurance" className="text-white/60 hover:text-white transition-colors font-medium">{t('footer.insurancePro')}</Link></li>
          <li><Link href="/solutions/leasing-operationnel" className="text-white/60 hover:text-white transition-colors">{t('footer.leasingOps')}</Link></li>
          <li><Link href="/solutions/lld" className="text-white/60 hover:text-white transition-colors">{t('footer.lld')}</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/90">{t('footer.sectors')}</h4>
        <ul className="space-y-2 text-sm">
          <li><Link href="/sectors/btp" className="text-white/60 hover:text-white transition-colors">{t('footer.btp')}</Link></li>
          <li><Link href="/sectors/medical" className="text-white/60 hover:text-white transition-colors">{t('footer.medical')}</Link></li>
          <li><Link href="/sectors/it" className="text-white/60 hover:text-white transition-colors">{t('footer.tech')}</Link></li>
          <li><Link href="/sectors/transport" className="text-white/60 hover:text-white transition-colors">{t('footer.transport')}</Link></li>
          <li><Link href="/sectors/industry" className="text-white/60 hover:text-white transition-colors">{t('footer.industry')}</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/90">{t('footer.finarent')}</h4>
        <ul className="space-y-2 text-sm">
          <li><Link href="/about" className="text-white/60 hover:text-white transition-colors">{t('footer.about')}</Link></li>
          <li><Link href="/why-leasing" className="text-white/60 hover:text-white transition-colors">{t('footer.whyUs')}</Link></li>
          <li><Link href="/process" className="text-white/60 hover:text-white transition-colors">{t('footer.process')}</Link></li>
          <li><Link href="/testimonials" className="text-white/60 hover:text-white transition-colors">{t('footer.reviews')}</Link></li>
          <li><Link href="/contact" className="text-white/60 hover:text-white transition-colors">{t('nav.contact')}</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/90">{t('footer.help')}</h4>
        <ul className="space-y-2 text-sm">
          <li><Link href="/blog" className="text-white/60 hover:text-white transition-colors">{t('footer.blog')}</Link></li>
          <li><Link href="/faq" className="text-white/60 hover:text-white transition-colors">{t('footer.faq')}</Link></li>
          <li><Link href="/legal" className="text-white/60 hover:text-white transition-colors">{t('footer.legal')}</Link></li>
        </ul>
      </div>
    </div>
  );
}
