import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/users';
import ProfileClient from './ProfileClient';

export const metadata = { title: 'Mon profil | Finarent' };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect('/espace');
  const dbUser = await syncUser(session.user);

  // Champs strictement nécessaires au formulaire : l'IBAN chiffré ne descend pas au navigateur.
  const safeUser = {
    name: dbUser.name,
    phone: dbUser.phone,
    company: dbUser.company,
    legalForm: dbUser.legalForm,
  };

  return <ProfileClient user={session.user} dbUser={safeUser} />;
}
