import { getSession } from '@auth0/nextjs-auth0';
import EspaceSidebar from '@/components/espace/EspaceSidebar';

/**
 * Layout des pages /espace : injecte une sidebar fixe sur desktop pour la
 * navigation entre Mes demandes / Profil / Parrainage / Sécurité.
 *
 * Sur mobile la sidebar est masquée (le menu Header en haut suffit).
 * Si l'utilisateur n'est pas connecté, on rend juste les children
 * (la page /espace affiche son écran de login).
 */
export default async function EspaceLayout({ children }) {
  const session = await getSession();
  if (!session?.user) return children;

  return (
    <>
      <EspaceSidebar />
      <div className="lg:pl-64">{children}</div>
    </>
  );
}
