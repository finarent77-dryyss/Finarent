import { TERMS } from '@/lib/glossaire/terms';
import GlossaireClient from './GlossaireClient';

export const metadata = {
  title: 'Glossaire financier',
  description: 'Définitions claires des termes du financement professionnel, du crédit immobilier et de l\'assurance. TAEG, crédit-bail, LOA, assurance emprunteur, loi Lemoine et plus.',
  alternates: { canonical: '/glossaire' },
};

export default function GlossairePage() {
  return <GlossaireClient terms={TERMS} />;
}
