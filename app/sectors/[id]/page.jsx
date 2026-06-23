import { sectorsData } from '@/assets/data/sectors';
import { notFound } from 'next/navigation';
import SectorDetailClient from './SectorDetailClient';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const sector = sectorsData.find(s => s.id === id);
  if (!sector) return { title: 'Secteur | Finarent' };
  return pageMetadata({
    title: `Financement ${sector.title}`,
    description: sector.description,
    path: `/sectors/${id}`,
    keywords: [sector.title, 'financement professionnel', 'crédit-bail', 'Finarent'],
  });
}

export default async function SectorDetailPage({ params }) {
  const { id } = await params;
  const sector = sectorsData.find(s => s.id === id);
  if (!sector) notFound();

  const otherSectors = sectorsData.filter(s => s.id !== sector.id).slice(0, 4);

  return <SectorDetailClient sector={sector} otherSectors={otherSectors} />;
}
