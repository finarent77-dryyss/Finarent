'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setEmail('');
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('footer.emailPlaceholder')}
          required
          disabled={isSubmitting}
          className="flex-1 min-w-0 px-4 py-3 rounded-l-xl bg-white/5 border border-r-0 border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-accent disabled:opacity-50 transition-colors"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-3 bg-accent hover:bg-accent/80 rounded-r-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 shrink-0"
        >
          {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-arrow-right"></i>}
        </button>
      </div>
      {submitStatus === 'success' && (
        <p className="text-xs text-accent mt-2 font-medium"><i className="fa-solid fa-check mr-1"></i> {t('footer.subscribed')}</p>
      )}
      {submitStatus === 'error' && (
        <p className="text-xs text-red-400 mt-2 font-medium"><i className="fa-solid fa-triangle-exclamation mr-1"></i> {t('footer.technicalError')}</p>
      )}
    </form>
  );
}

export default function Footer() {
  const { t } = useTranslation();

  const linkClass = "text-white/50 hover:text-white transition-colors duration-200";

  return (
    <footer className="bg-[#0A192F] text-white">
      {/* CTA Banner */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="py-10 sm:py-14 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2">
                {t('footer.readyToFinance')} <span className="text-accent">{t('footer.nextProject')}</span> ?
              </h3>
              <p className="text-white/50 text-sm sm:text-base">{t('footer.ctaDesc')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="px-6 py-3 bg-accent hover:bg-accent/80 font-bold rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 hover:scale-105">
                <i className="fa-solid fa-paper-plane"></i>
                {t('footer.startRequest')}
              </Link>
              <Link href="/simulator" className="px-6 py-3 bg-white/5 hover:bg-white/10 font-semibold rounded-xl border border-white/10 transition-all duration-300 text-sm flex items-center justify-center gap-2">
                <i className="fa-solid fa-calculator"></i>
                {t('footer.simulate')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="py-10 sm:py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-auto rounded-lg overflow-hidden bg-white shadow-sm">
                <img src="/Finassurs_logo.jpeg" alt="Finassur" className="h-full w-auto object-contain" />
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
              {t('footer.companyDesc')}
            </p>
            <div className="space-y-2.5 mb-6">
              <a href="tel:0123456789" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm group">
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-phone text-accent text-xs"></i>
                </div>
                <span>{t('common.phone')}</span>
              </a>
              <a href="mailto:contact@finassur.fr" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm group">
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-envelope text-accent text-xs"></i>
                </div>
                <span>{t('common.email')}</span>
              </a>
            </div>
            <div className="flex gap-2">
              {[
                { icon: 'linkedin-in', url: '#' },
                { icon: 'facebook-f', url: '#' },
                { icon: 'twitter', url: '#' },
                { icon: 'instagram', url: '#' },
              ].map((s) => (
                <a
                  key={s.icon}
                  href={s.url}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-accent flex items-center justify-center text-white/40 hover:text-white transition-all duration-300"
                  aria-label={s.icon}
                >
                  <i className={`fa-brands fa-${s.icon} text-sm`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">{t('footer.solutions')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/solutions/credit-bail" className={linkClass}>{t('footer.creditBail')}</Link></li>
              <li><Link href="/solutions/loa" className={linkClass}>{t('footer.loa')}</Link></li>
              <li><Link href="/solutions/credit-pro" className={linkClass}>{t('footer.creditPro')}</Link></li>
              <li><Link href="/solutions/leasing-operationnel" className={linkClass}>{t('footer.leasingOps')}</Link></li>
              <li><Link href="/solutions/lld" className={linkClass}>{t('footer.lld')}</Link></li>
              <li><Link href="/assurance" className="text-accent hover:text-accent/80 font-semibold transition-colors duration-200">{t('footer.insurancePro')}</Link></li>
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">{t('footer.sectors')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/sectors/btp" className={linkClass}>{t('footer.btp')}</Link></li>
              <li><Link href="/sectors/medical" className={linkClass}>{t('footer.medical')}</Link></li>
              <li><Link href="/sectors/it" className={linkClass}>{t('footer.tech')}</Link></li>
              <li><Link href="/sectors/transport" className={linkClass}>{t('footer.transport')}</Link></li>
              <li><Link href="/sectors/industry" className={linkClass}>{t('footer.industry')}</Link></li>
            </ul>
          </div>

          {/* Company + Help */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">{t('footer.finassur')}</h4>
            <ul className="space-y-2.5 text-sm mb-6">
              <li><Link href="/about" className={linkClass}>{t('footer.about')}</Link></li>
              <li><Link href="/why-leasing" className={linkClass}>{t('footer.whyUs')}</Link></li>
              <li><Link href="/process" className={linkClass}>{t('footer.process')}</Link></li>
              <li><Link href="/testimonials" className={linkClass}>{t('footer.reviews')}</Link></li>
              <li><Link href="/contact" className={linkClass}>{t('nav.contact')}</Link></li>
            </ul>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">{t('footer.help')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/blog" className={linkClass}>{t('footer.blog')}</Link></li>
              <li><Link href="/faq" className={linkClass}>{t('footer.faq')}</Link></li>
              <li><Link href="/legal" className={linkClass}>{t('footer.legal')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/5 py-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <i className="fa-solid fa-paper-plane text-accent"></i>
              <h4 className="font-bold text-sm">{t('footer.newsletter')}</h4>
            </div>
            <p className="text-white/40 text-xs sm:text-sm mb-4">{t('footer.newsletterDesc')}</p>
            <FooterNewsletter />
          </div>
        </div>

        {/* Legal bottom */}
        <div className="border-t border-white/5 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t('footer.legalInfo')}</h5>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <Link href="/legal" className={linkClass}>{t('footer.legalNotice')}</Link>
                <span className="text-white/20">|</span>
                <Link href="/terms" className={linkClass}>{t('footer.terms')}</Link>
                <span className="text-white/20">|</span>
                <Link href="/privacy" className={linkClass}>{t('footer.privacy')}</Link>
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t('footer.companyInfo')}</h5>
              <div className="text-xs text-white/40 space-y-0.5">
                <div>{t('footer.companyLegal1')}</div>
                <div>{t('footer.companyLegal2')} — {t('footer.companyLegal3')}</div>
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">{t('footer.regulation')}</h5>
              <div className="text-xs text-white/40 space-y-0.5">
                <div>{t('footer.regulationLine1')}</div>
                <div>{t('footer.regulationLine2')}</div>
                <div>{t('footer.regulationLine3')}</div>
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <i className="fa-solid fa-shield-halved text-accent/40"></i>
                </div>
                <div className="text-[10px] text-white/30 leading-tight">
                  {t('footer.secureSite')}<br />
                  <span className="text-white/50 font-medium">{t('footer.sslRgpd')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-white/5">
            <div className="text-white/30 text-xs">{t('footer.copyright')}</div>
            <div className="text-white/20 text-[10px]">
              {t('footer.madeWith')} <i className="fa-solid fa-heart text-accent/40"></i> {t('footer.inParis')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
