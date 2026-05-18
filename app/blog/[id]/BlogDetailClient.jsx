'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';

function renderArticle(content) {
  if (!content) return null;
  const lines = content.split('\n');
  const blocks = [];
  let current = [];

  const flush = () => {
    if (current.length === 0) return;
    const txt = current.join('\n');
    const html = txt
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
    blocks.push(<p key={blocks.length} className="text-primary leading-relaxed mb-5 text-[17px]" dangerouslySetInnerHTML={{ __html: html }} />);
    current = [];
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush();
      blocks.push(<h2 key={blocks.length} className="text-2xl sm:text-3xl font-black text-primary mt-10 mb-4 leading-tight">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      flush();
      blocks.push(<h3 key={blocks.length} className="text-xl font-bold text-primary mt-6 mb-3">{line.slice(4)}</h3>);
    } else if (line.trim() === '') {
      flush();
    } else {
      current.push(line);
    }
  }
  flush();
  return blocks;
}

export default function BlogDetailClient({ post }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <article className="pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <Link href="/blog" className="text-secondary hover:underline mb-6 inline-flex items-center gap-2 text-sm">
            <i className="fa-solid fa-arrow-left text-xs"></i>
            {t('blogDetail.backToBlog') || 'Retour aux articles'}
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 mb-4">
            {post.category}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary leading-tight mb-5">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-sm mb-8">
            <span className="font-semibold text-primary">{post.author}</span>
            <span>·</span>
            <span>{new Date(post.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readTime} {t('blogDetail.readTime') || 'de lecture'}</span>
          </div>
          {post.image && (
            <div className="h-56 sm:h-72 lg:h-96 overflow-hidden rounded-2xl mb-10">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-xl text-gray-600 leading-relaxed mb-10 border-l-4 border-emerald-500 pl-5">{post.excerpt}</p>
          <div>{renderArticle(post.content)}</div>

          {post.tags?.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 pt-8 border-t border-gray-100">
              {post.tags.map((t) => (
                <span key={t} className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">#{t}</span>
              ))}
            </div>
          )}

          <div className="mt-12 gradient-bg rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-black mb-2">Besoin d'aide sur votre projet ?</h2>
            <p className="text-white/80 mb-5">Un expert Finarent vous accompagne en 48 h. Sans engagement.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-5 py-3 rounded-2xl hover:scale-105 transition">
              <i className="fa-solid fa-headset"></i>
              Parler à un conseiller
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
