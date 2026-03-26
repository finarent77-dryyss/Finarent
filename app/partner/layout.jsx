import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import { prisma } from '@/lib/prisma';
import PartnerSidebar from '@/components/partner/PartnerSidebar';

export default async function PartnerLayout({ children }) {
  const session = await getSession();
  if (!session?.user) {
    redirect('/api/auth/login?returnTo=/partner');
  }

  const dbUser = await syncUser(session.user);

  if (dbUser.role !== 'PARTNER' && dbUser.role !== 'ADMIN') {
    redirect('/espace');
  }

  let partnerName = 'Partenaire';
  if (dbUser.partnerId) {
    const partner = await prisma.partner.findUnique({ where: { id: dbUser.partnerId }, select: { name: true } });
    if (partner) partnerName = partner.name;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PartnerSidebar email={session.user.email} partnerName={partnerName} />
      <main className="lg:ml-64 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
