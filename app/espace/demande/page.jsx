import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import DemandeWizardClient from './DemandeWizardClient';

export default async function DemandePage({ searchParams }) {
  const session = await getSession();
  const sp = (await searchParams) || {};

  if (!session?.user) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === 'string') qs.set(k, v);
      else if (Array.isArray(v) && typeof v[0] === 'string') qs.set(k, v[0]);
    }
    const qsString = qs.toString();
    const returnTo = qsString ? `/espace/demande?${qsString}` : '/espace/demande';
    redirect(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
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
