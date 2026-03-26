import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { isAdmin, syncUser } from '@/lib/users';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminMobileNav from '@/components/admin/AdminMobileNav';

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
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar email={session.user.email || session.user.name} />
      <AdminMobileNav />
      <main className="lg:ml-64 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
