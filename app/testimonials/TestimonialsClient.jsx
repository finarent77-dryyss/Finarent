'use client';

import TestimonialCard from '@/components/ui/TestimonialCard';
import { testimonialsData } from '@/assets/data/testimonials';
import { useTranslation } from '@/lib/i18n';

export default function TestimonialsClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-primary mb-6 text-center">{t('testimonials.title')}</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {testimonialsData.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
        </div>
      </div>
    </div>
  );
}
