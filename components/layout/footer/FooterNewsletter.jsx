'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { t } = useTranslation();

  const handleNewsletterSubmit = async (e) => {
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
    } catch (error) {
      console.error('Newsletter error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h5 className="font-bold text-lg mb-4 flex items-center">
        <i className="fa-solid fa-paper-plane text-accent mr-2"></i>{t('footer.newsletter')}
      </h5>
      <p className="text-white/60 text-sm mb-4 leading-relaxed">{t('footer.newsletterDesc')}</p>
      <form onSubmit={handleNewsletterSubmit} className="space-y-3">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('footer.emailPlaceholder')} required disabled={isSubmitting}
          className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-accent disabled:opacity-50 transition-colors" />
        <button type="submit" disabled={isSubmitting}
          className="w-full px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-semibold transition-all duration-300 disabled:opacity-50">
          {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : t('footer.subscribe')}
        </button>
      </form>
      {submitStatus === 'success' && <p className="text-xs text-green-400 mt-2 font-medium"><i className="fa-solid fa-check mr-1"></i> {t('footer.subscribed')}</p>}
      {submitStatus === 'error' && <p className="text-xs text-red-400 mt-2 font-medium"><i className="fa-solid fa-triangle-exclamation mr-1"></i> {t('footer.technicalError')}</p>}
    </div>
  );
}
