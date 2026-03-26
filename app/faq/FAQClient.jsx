'use client';

import FAQItem from '@/components/ui/FAQItem';
import ScrollReveal from '@/components/animations/ScrollReveal';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function FAQClient() {
  const { t } = useTranslation();

  const faqs = [
    {
      category: t('faq.category1'),
      items: [
        { q: t('faq.q1_1'), a: t('faq.a1_1') },
        { q: t('faq.q1_2'), a: t('faq.a1_2') },
        { q: t('faq.q1_3'), a: t('faq.a1_3') },
      ]
    },
    {
      category: t('faq.category2'),
      items: [
        { q: t('faq.q2_1'), a: t('faq.a2_1') },
        { q: t('faq.q2_2'), a: t('faq.a2_2') },
        { q: t('faq.q2_3'), a: t('faq.a2_3') },
      ]
    },
    {
      category: t('faq.category3'),
      items: [
        { q: t('faq.q3_1'), a: t('faq.a3_1') },
        { q: t('faq.q3_2'), a: t('faq.a3_2') },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="pt-32 pb-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <ScrollReveal>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-6">{t('faq.title')}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('faq.subtitle')}</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-12">
            {faqs.map((cat, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.1}>
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-secondary border-l-4 border-secondary pl-4">{cat.category}</h2>
                  <div className="space-y-4">
                    {cat.items.map((item, i) => (
                      <FAQItem key={i} question={item.q} answer={item.a} />
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.4}>
            <div className="mt-20 bg-primary rounded-3xl p-8 sm:p-12 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('faq.noAnswer')}</h2>
              <p className="text-white/80 mb-8">{t('faq.noAnswerDesc')}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-secondary px-8 py-3 rounded-xl font-bold">{t('faq.contactUs')}</Link>
                <a href="tel:0123456789" className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl border border-white/30 font-bold">
                  <i className="fa-solid fa-phone"></i>
                  {t('common.phone')}
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
