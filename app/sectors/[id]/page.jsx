import { sectorsData } from '@/assets/data/sectors';
import { notFound } from 'next/navigation';
import SectorDetailClient from './SectorDetailClient';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const sector = sectorsData.find(s => s.id === id);
  if (!sector) return { title: 'Secteur | Finassur' };
  return { title: `${sector.title} | Finassur`, description: sector.description };
}

export default async function SectorDetailPage({ params }) {
  const { id } = await params;
  const sector = sectorsData.find(s => s.id === id);
  if (!sector) notFound();

  const otherSectors = sectorsData.filter(s => s.id !== sector.id).slice(0, 4);

  return <SectorDetailClient sector={sector} otherSectors={otherSectors} />;
}
