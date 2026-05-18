import PartenairesClient from './PartenairesClient';

export const metadata = {
  title: 'Nos partenaires bancaires & assureurs | Finarent',
  description: '100+ partenaires financement, assurance, leasing et LOA/LLD. Banques, compagnies d\'assurance, courtiers grossistes, captives constructeurs.',
  alternates: { canonical: '/partenaires' },
};

export default function PartenairesPage() {
  return <PartenairesClient />;
}
