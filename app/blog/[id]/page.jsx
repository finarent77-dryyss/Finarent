import { blogData } from '@/assets/data/blog';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = blogData.find(p => p.id === Number(id));
  if (!post) return { title: 'Article | Finassur' };
  return { title: `${post.title} | Finassur`, description: post.excerpt };
}

export default async function BlogDetailPage({ params }) {
  const { id } = await params;
  const post = blogData.find(p => p.id === Number(id));
  if (!post) notFound();

  return <BlogDetailClient post={post} />;
}
