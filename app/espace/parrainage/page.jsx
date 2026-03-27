import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import ParrainageClient from './ParrainageClient';

export const metadata = { title: 'Parrainage | Finassur' };

export default async function ParrainagePage() {
  const session = await getSession();
  if (!session?.user) redirect('/espace');
  const dbUser = await syncUser(session.user);
  return <ParrainageClient user={session.user} dbUser={JSON.parse(JSON.stringify(dbUser))} />;
}
