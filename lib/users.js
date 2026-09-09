import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { signalerClaimHistorique } from './legacy-role-claim';
import { assurerCodeParrainage, enregistrerInscriptionFilleul, COOKIE_PARRAINAGE } from './referral';

const ROLE_CLAIM = 'https://finarent/role';
// Ancien namespace, conservé en repli — constat P2-4, commentaire du 9 septembre 2026.
//
// Condition de retrait : ne supprimer cette constante et son usage qu'une fois
// vérifié qu'aucun jeton ne la porte plus. Chaque lecture du repli journalise
// une ligne `[P2-4]` (cf. lib/legacy-role-claim.ts) ; quand ces lignes ont
// disparu des journaux pendant plus longtemps qu'une session Auth0, le retrait
// est sans risque. C'est ici qu'il coûterait le plus cher : `syncUser()` écrit
// le rôle en base, un repli retiré trop tôt rétrograde durablement en CLIENT
// les sessions encore ouvertes. Les trois emplacements (lib/auth.ts, ici,
// middleware.ts) doivent être retirés ensemble.
const LEGACY_ROLE_CLAIM = 'https://finassur/role';

/**
 * Synchronise un utilisateur Auth0 avec la base de données locale Prisma.
 *
 * Le claim Auth0 est la source de vérité du rôle : cette fonction le recopie en
 * base à chaque appel. Toute promotion doit donc passer par la Management API
 * (cf. lib/auth0-management.js), sinon elle est écrasée ici — constat P1-8.
 *
 * @param {Object} auth0User - L'objet utilisateur provenant de getSession().user
 */
export async function syncUser(auth0User) {
  if (!auth0User || !auth0User.sub) return null;

  let roleClaim = auth0User[ROLE_CLAIM];
  if (roleClaim === undefined || roleClaim === null) {
    roleClaim = auth0User[LEGACY_ROLE_CLAIM];
    if (roleClaim !== undefined && roleClaim !== null) {
      signalerClaimHistorique(auth0User.sub, 'lib/users.js');
    }
  }
  const roleMap = { admin: 'ADMIN', partner: 'PARTNER', insurer: 'INSURER' };
  const role = roleMap[roleClaim] || 'CLIENT';

  const user = await prisma.user.upsert({
    where: { auth0Id: auth0User.sub },
    update: {
      email: auth0User.email,
      name: auth0User.name ?? undefined,
      role,
      lastLoginAt: new Date(),
    },
    create: {
      auth0Id: auth0User.sub,
      email: auth0User.email,
      name: auth0User.name ?? null,
      role,
    },
  });

  // `lastLoginAt` n'est renseigné que par la branche `update` : le champ n'est
  // donc nul qu'au tout premier passage, ce qui distingue une création d'une
  // reconnexion sans requête supplémentaire.
  const premiereConnexion = !user.lastLoginAt;

  // Code de parrainage : il n'était généré nulle part, et la page de parrainage
  // affichait un repli calculé côté navigateur que rien ne savait résoudre.
  if (!user.referralCode) {
    user.referralCode = await assurerCodeParrainage(prisma, user.id);
  }

  if (premiereConnexion) {
    await rattacherAuParrain(user);
  }

  return user;
}

/**
 * Rattache un nouvel inscrit au parrain dont il a suivi le lien, ou à
 * l'invitation reçue par email. Best-effort : un parrainage manqué ne doit
 * jamais empêcher quelqu'un de se connecter.
 */
async function rattacherAuParrain(user) {
  try {
    let code = null;
    try {
      const store = await cookies();
      code = store.get(COOKIE_PARRAINAGE)?.value || null;
    } catch {
      // Hors contexte de requête (script, tâche planifiée) : pas de cookie.
    }
    await enregistrerInscriptionFilleul(prisma, { email: user.email, code });
  } catch (e) {
    console.error('[parrainage] rattachement impossible :', e.message);
  }
}

/**
 * Vérifie si l'utilisateur a le rôle admin.
 */
export async function isAdmin(auth0User) {
  if (!auth0User || !auth0User.sub) return false;

  const user = await prisma.user.findUnique({
    where: { auth0Id: auth0User.sub },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

/** Membre actif d'un centre d'appel (manager ou agent). */
export async function isCallCenterMember(auth0User) {
  if (!auth0User?.sub) return false;
  const user = await prisma.user.findUnique({
    where: { auth0Id: auth0User.sub },
    select: { id: true },
  });
  if (!user) return false;
  const m = await prisma.callCenterMember.findFirst({
    where: { userId: user.id, isActive: true, callCenter: { isActive: true } },
    select: { id: true },
  });
  return Boolean(m);
}
