'use client';

import Link from 'next/link';
import { blogData } from '@/assets/data/blog';
import { useTranslation } from '@/lib/i18n';

export default function BlogClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-bold text-primary mb-6 text-center">{t('blog.title')}</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {blogData.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100">
              <div className="h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <span className="text-secondary text-sm font-medium">{post.category}</span>
                <h3 className="text-xl font-bold text-primary mt-2 mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
