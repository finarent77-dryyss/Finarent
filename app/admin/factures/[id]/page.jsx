import InvoiceDetailClient from './InvoiceDetailClient';

export const metadata = {
  title: 'Détail facture | Admin Finarent',
};

export default async function InvoiceDetailPage({ params }) {
  const { id } = await params;
  return <InvoiceDetailClient id={id} />;
}
