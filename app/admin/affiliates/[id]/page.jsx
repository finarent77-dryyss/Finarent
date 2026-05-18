import AdminAffiliateDetailClient from '@/components/admin/AdminAffiliateDetailClient';

export const metadata = {
  title: 'Affilié | Admin Finarent',
};

export default async function AdminAffiliateDetailPage({ params }) {
  const { id } = await params;
  return <AdminAffiliateDetailClient affiliateId={id} />;
}
