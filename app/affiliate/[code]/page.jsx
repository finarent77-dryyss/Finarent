import AffiliatePublicClient from './AffiliatePublicClient';

export const metadata = {
  title: 'Espace apporteur d\'affaires | Finarent',
  robots: { index: false, follow: false }, // pages perso non-indexables
};

export default async function AffiliatePublicPage({ params }) {
  const { code } = await params;
  return <AffiliatePublicClient code={code} />;
}
