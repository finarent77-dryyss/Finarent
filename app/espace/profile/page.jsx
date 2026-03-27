import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import ProfileClient from './ProfileClient';

export const metadata = { title: 'Mon profil | Finassur' };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect('/espace');
  const dbUser = await syncUser(session.user);
  return <ProfileClient user={session.user} dbUser={dbUser} />;
}
