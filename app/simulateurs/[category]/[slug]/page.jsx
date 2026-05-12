import { notFound } from 'next/navigation';
import { getSimulator, getCategory, SIMULATORS } from '@/lib/simulators/registry';
import SimulatorShell from '@/components/simulators/SimulatorShell';
import ComingSoonStub from '@/components/simulators/ComingSoonStub';

// 4 simulateurs fonctionnels — registry mappé statiquement pour
// que Next.js puisse code-split correctement.
import MensualiteSimulator from '@/components/simulators/working/MensualiteSimulator';
import CapaciteEmpruntSimulator from '@/components/simulators/working/CapaciteEmpruntSimulator';
import CoutCreditSimulator from '@/components/simulators/working/CoutCreditSimulator';
import AssuranceEmprunteurSimulator from '@/components/simulators/working/AssuranceEmprunteurSimulator';

const WORKING = {
  'credit-immobilier/mensualite': MensualiteSimulator,
  'credit-immobilier/capacite-emprunt': CapaciteEmpruntSimulator,
  'credit-immobilier/cout-credit': CoutCreditSimulator,
  'assurance-emprunteur/assurance-emprunteur': AssuranceEmprunteurSimulator,
};

export function generateStaticParams() {
  return SIMULATORS.map((s) => ({ category: s.category, slug: s.slug }));
}

export async function generateMetadata({ params }) {
  const { category, slug } = await params;
  const sim = getSimulator(category, slug);
  const cat = getCategory(category);
  if (!sim) return { title: 'Simulateur introuvable' };
  return {
    title: `Simulateur ${sim.name}`,
    description: sim.desc,
    alternates: { canonical: `/simulateurs/${category}/${slug}` },
    openGraph: {
      title: `Simulateur ${sim.name} | Finassur`,
      description: sim.desc,
      url: `/simulateurs/${category}/${slug}`,
      type: 'website',
    },
  };
}

export default async function SimulatorPage({ params }) {
  const { category, slug } = await params;
  const sim = getSimulator(category, slug);
  if (!sim) notFound();

  const key = `${category}/${slug}`;
  const Working = WORKING[key];

  return (
    <SimulatorShell category={category} simulator={sim}>
      {Working ? <Working /> : <ComingSoonStub simulator={sim} />}
    </SimulatorShell>
  );
}
