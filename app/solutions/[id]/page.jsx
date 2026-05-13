import { solutionsData } from '@/assets/data/solutions';
import { notFound } from 'next/navigation';
import SolutionDetailClient from './SolutionDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const sol = solutionsData.find(s => s.id === id);
  if (!sol) return { title: 'Solution | Finarent' };
  return { title: `${sol.title} | Finarent`, description: sol.description };
}

export default async function SolutionDetailPage({ params }) {
  const { id } = await params;
  const sol = solutionsData.find(s => s.id === id);
  if (!sol) notFound();

  const otherSolutions = solutionsData.filter(s => s.id !== sol.id).slice(0, 3);

  return <SolutionDetailClient sol={sol} otherSolutions={otherSolutions} />;
}
