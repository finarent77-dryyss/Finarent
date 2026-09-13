import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import InsurerSidebar from '@/components/insurer/InsurerSidebar';

export default async function InsurerLayout({ children }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/api/auth/login?returnTo=/insurer');
  }

  const dbUser = await syncUser(session.user);

  if (dbUser.role !== 'INSURER' && dbUser.role !== 'ADMIN') {
    redirect('/espace');
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <InsurerSidebar email={session.user.email} />
      {/* pb-28 sous lg : la navigation mobile est fixée en bas d'écran (zone sûre iPhone
          comprise) et masquait la fin du contenu. */}
      <main className="lg:ml-64 pt-20 pb-28 lg:pb-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
