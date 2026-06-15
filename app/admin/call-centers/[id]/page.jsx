import AdminCallCenterDetailClient from '@/components/admin/AdminCallCenterDetailClient';

export const metadata = {
  title: "Centre d'appel | Admin Finarent",
};

export default async function AdminCallCenterDetailPage({ params }) {
  const { id } = await params;
  return <AdminCallCenterDetailClient centerId={id} />;
}
