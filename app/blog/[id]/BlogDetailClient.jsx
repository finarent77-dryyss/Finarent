'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

export default function BlogDetailClient({ post }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <article className="pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Link href="/blog" className="text-secondary hover:underline mb-4 sm:mb-6 inline-block text-sm sm:text-base">{t('blogDetail.backToBlog')}</Link>
          <span className="text-secondary text-sm font-medium">{post.category}</span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary mt-2 mb-4 sm:mb-6">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            <span>{post.author}</span>
            <span>{post.date}</span>
            <span>{post.readTime} {t('blogDetail.readTime')}</span>
          </div>
          <div className="h-48 sm:h-72 lg:h-96 overflow-hidden rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600">{post.excerpt}</p>
            <p className="mt-6 text-gray-600">{t('blogDetail.articlePlaceholder')}</p>
          </div>
        </div>
      </article>
    </div>
  );
}
