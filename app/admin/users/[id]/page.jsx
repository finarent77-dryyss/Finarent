import AdminUserDetailClient from '@/components/admin/AdminUserDetailClient';

export const metadata = {
  title: 'Profil utilisateur | Admin Finarent',
};

export default async function AdminUserDetailPage({ params }) {
  const { id } = await params;
  return <AdminUserDetailClient userId={id} />;
}
