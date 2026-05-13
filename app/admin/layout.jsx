import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { isAdmin, syncUser } from '@/lib/users';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/api/auth/login?returnTo=/admin');
  }

  await syncUser(session.user);
  const adminAccess = await isAdmin(session.user);

  if (!adminAccess) {
    redirect('/espace');
  }

  return (
    <AdminLayoutClient email={session.user.email || session.user.name}>
      {children}
    </AdminLayoutClient>
  );
}
