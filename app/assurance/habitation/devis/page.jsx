import QuoteWizardPage from '@/components/quote/QuoteWizardPage';
import { pageMetadata } from '@/lib/seo';

// Composant serveur : seul un composant serveur peut exporter `metadata`.
// Les cinq tunnels de devis héritaient sinon du titre générique du site
// (constat PAGE-05). Le tunnel lui-même reste client, dans QuoteWizardPage.
export const metadata = pageMetadata({
  title: 'Devis assurance habitation',
  description: 'Devis d\'assurance habitation en ligne : type de logement, surface, statut d\'occupation. Sans engagement.',
  path: '/assurance/habitation/devis',
  keywords: ['devis assurance habitation', 'assurance logement', 'multirisque habitation', 'Finarent'],
});

export default function HabitationDevisPage() {
  return <QuoteWizardPage product="habitation" />;
}
