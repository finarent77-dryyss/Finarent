import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import SecurityClient from './SecurityClient';

export const metadata = { title: 'Sécurité | Finassur' };

export default async function SecurityPage() {
  const session = await getSession();
  if (!session?.user) redirect('/espace');
  const dbUser = await syncUser(session.user);
  return <SecurityClient user={session.user} dbUser={JSON.parse(JSON.stringify(dbUser))} />;
}
