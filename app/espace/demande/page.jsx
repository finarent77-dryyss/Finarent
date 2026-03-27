import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import DemandeWizardClient from './DemandeWizardClient';

export default async function DemandePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/espace');
  }

  const dbUser = await syncUser(session.user);

  if (dbUser.role === 'ADMIN') redirect('/admin');
  if (dbUser.role === 'PARTNER') redirect('/partner');
  if (dbUser.role === 'INSURER') redirect('/insurer');

  return (
    <DemandeWizardClient
      user={session.user}
      dbUser={{
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        phone: dbUser.phone,
        company: dbUser.company,
        legalForm: dbUser.legalForm,
      }}
    />
  );
}
