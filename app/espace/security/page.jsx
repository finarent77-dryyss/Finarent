import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import { serializeBank } from '@/lib/profile-bank.js';
import { identityProvider } from '@/lib/identity-provider.js';
import SecurityClient from './SecurityClient';

export const metadata = { title: 'Sécurité | Finarent' };

export default async function SecurityPage() {
  const session = await getSession();
  if (!session?.user) redirect('/espace');
  const dbUser = await syncUser(session.user);

  // Le navigateur ne reçoit que le nécessaire : ni IBAN chiffré, ni identifiants internes.
  const safeUser = {
    name: dbUser.name,
    role: dbUser.role,
    createdAt: dbUser.createdAt.toISOString(),
    lastLoginAt: dbUser.lastLoginAt ? dbUser.lastLoginAt.toISOString() : null,
  };

  return (
    <SecurityClient
      user={{ email: session.user.email, email_verified: session.user.email_verified }}
      dbUser={safeUser}
      bank={serializeBank(dbUser)}
      provider={identityProvider(session.user.sub)}
    />
  );
}
