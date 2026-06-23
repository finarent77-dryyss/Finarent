import { solutionsData } from '@/assets/data/solutions';
import { notFound } from 'next/navigation';
import SolutionDetailClient from './SolutionDetailClient';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const sol = solutionsData.find(s => s.id === id);
  if (!sol) return { title: 'Solution | Finarent' };
  return pageMetadata({
    title: sol.title,
    description: sol.description,
    path: `/solutions/${id}`,
    keywords: [sol.title, 'financement professionnel', 'Finarent'],
  });
}

export default async function SolutionDetailPage({ params }) {
  const { id } = await params;
  const sol = solutionsData.find(s => s.id === id);
  if (!sol) notFound();

  const otherSolutions = solutionsData.filter(s => s.id !== sol.id).slice(0, 3);

  return <SolutionDetailClient sol={sol} otherSolutions={otherSolutions} />;
}
