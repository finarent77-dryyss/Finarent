/**
 * Client minimal de la Management API Auth0 — écriture du rôle d'un utilisateur.
 *
 * ── Pourquoi ce module (constat P1-8 de l'audit de septembre 2026) ────────────
 * Le rôle applicatif vient du claim `https://finarent/role` porté par le jeton
 * Auth0 (cf. `lib/auth.ts`, `middleware.ts`). `syncUser()` (`lib/users.js`)
 * recopie ce claim dans la colonne `User.role` à chaque requête authentifiée,
 * avec `CLIENT` par défaut. Écrire un rôle en base sans le propager vers Auth0
 * produit donc une promotion qui retombe silencieusement à la première
 * navigation : le back-office affiche un succès, la réalité dit le contraire.
 *
 * La base est un miroir ; la source de vérité est le claim Auth0. Toute
 * modification de rôle passe d'abord par ici, et n'est écrite en base que si
 * Auth0 l'a acceptée.
 *
 * ── Contrepartie obligatoire côté Auth0 ──────────────────────────────────────
 * Ce module écrit `app_metadata.role` sur l'utilisateur Auth0. Ce champ ne
 * remonte PAS tout seul dans le jeton : une Action « Post Login » doit le
 * recopier dans le claim personnalisé, sans quoi l'écriture reste sans effet
 * visible. Code de l'Action à déployer sur le flow *Login* :
 *
 *   exports.onExecutePostLogin = async (event, api) => {
 *     const role = event.user.app_metadata?.role
 *       || event.authorization?.roles?.[0]
 *       || 'client';
 *     api.idToken.setCustomClaim('https://finarent/role', role);
 *     api.accessToken.setCustomClaim('https://finarent/role', role);
 *   };
 *
 * Le nom du claim doit rester identique à `ROLE_CLAIM` de `lib/auth.ts`.
 * Procédure complète (application M2M, scopes, variables) : `AUTH0_SETUP.md`.
 *
 * ── Configuration, lue uniquement dans l'environnement ───────────────────────
 *   AUTH0_DOMAIN              locataire, ex. `mon-tenant.eu.auth0.com`
 *                             (à défaut, déduit de AUTH0_ISSUER_BASE_URL)
 *   AUTH0_M2M_CLIENT_ID       application « Machine to Machine » autorisée sur
 *   AUTH0_M2M_CLIENT_SECRET   la Management API (scopes read:users update:users)
 *   AUTH0_M2M_AUDIENCE        facultatif — surcharge de l'audience, utile
 *                             uniquement avec un domaine personnalisé.
 *                             Défaut : `https://${AUTH0_DOMAIN}/api/v2/`
 */

/** Délai maximal d'un appel réseau vers Auth0, en millisecondes. */
const DELAI_RESEAU_MS = 10_000;

/** Marge de sécurité retranchée à la durée de vie du jeton, en secondes. */
const MARGE_EXPIRATION_S = 60;

/** Correspondance rôle Prisma → valeur du claim (l'inverse de `mapRole`). */
const CLAIM_PAR_ROLE = {
  ADMIN: 'admin',
  PARTNER: 'partner',
  INSURER: 'insurer',
  CLIENT: 'client',
};

/** Jeton Management mis en cache jusqu'à son expiration moins la marge. */
let cacheJeton = null; // { jeton: string, expireLe: number }

/** Erreur portant un code exploitable par les appelants (route, script). */
export class ErreurAuth0Management extends Error {
  constructor(message, { code = 'inconnu', statut = null } = {}) {
    super(message);
    this.name = 'ErreurAuth0Management';
    /** `non_configuree` | `identifiant_invalide` | `role_invalide` | `jeton` | `patch` | `reseau` */
    this.code = code;
    /** Code HTTP renvoyé par Auth0, quand il y en a un. */
    this.statut = statut;
  }
}

/** Domaine du locataire, sans schéma ni barre finale. */
function lireDomaine() {
  const direct = (process.env.AUTH0_DOMAIN || '').trim();
  if (direct) return direct.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const issuer = (process.env.AUTH0_ISSUER_BASE_URL || '').trim();
  return issuer.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

/**
 * État de la configuration Management, sans jamais exposer le secret.
 * @returns {{ configuree: boolean, manquantes: string[], domaine: string, audience: string }}
 */
export function configurationManagement() {
  const domaine = lireDomaine();
  const clientId = (process.env.AUTH0_M2M_CLIENT_ID || '').trim();
  const clientSecret = (process.env.AUTH0_M2M_CLIENT_SECRET || '').trim();

  const manquantes = [];
  if (!domaine) manquantes.push('AUTH0_DOMAIN');
  if (!clientId) manquantes.push('AUTH0_M2M_CLIENT_ID');
  if (!clientSecret) manquantes.push('AUTH0_M2M_CLIENT_SECRET');

  const audience = (process.env.AUTH0_M2M_AUDIENCE || '').trim()
    || (domaine ? `https://${domaine}/api/v2/` : '');

  return { configuree: manquantes.length === 0, manquantes, domaine, audience };
}

/** Raccourci booléen : la propagation vers Auth0 est-elle possible ? */
export function managementConfiguree() {
  return configurationManagement().configuree;
}

/** Traduit un rôle Prisma vers la valeur attendue dans le claim Auth0. */
export function claimDepuisRole(role) {
  if (typeof role !== 'string') return null;
  return CLAIM_PAR_ROLE[role.trim().toUpperCase()] ?? null;
}

/** Vide le cache du jeton (appelé sur 401/403, et utile aux tests). */
export function reinitialiserCacheJeton() {
  cacheJeton = null;
}

/** Enveloppe `fetch` pour transformer une panne réseau en erreur typée. */
async function appeler(url, options) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(DELAI_RESEAU_MS) });
  } catch (erreur) {
    const cause = erreur?.name === 'TimeoutError' ? 'délai dépassé' : (erreur?.message || 'erreur réseau');
    throw new ErreurAuth0Management(`Auth0 injoignable (${cause}).`, { code: 'reseau' });
  }
}

/** Extrait un message lisible d'une réponse Auth0 en erreur, sans tout déverser. */
async function messageErreur(reponse) {
  let corps = '';
  try {
    corps = await reponse.text();
  } catch {
    // Corps illisible : le code HTTP suffira.
  }
  if (!corps) return `HTTP ${reponse.status}`;
  try {
    const json = JSON.parse(corps);
    const detail = json.error_description || json.message || json.error || '';
    return detail ? `HTTP ${reponse.status} — ${detail}` : `HTTP ${reponse.status}`;
  } catch {
    return `HTTP ${reponse.status} — ${corps.slice(0, 200)}`;
  }
}

/**
 * Jeton d'accès à la Management API, obtenu en `client_credentials`.
 * Mis en cache jusqu'à son expiration moins {@link MARGE_EXPIRATION_S}.
 * @returns {Promise<string>}
 * @throws {ErreurAuth0Management}
 */
export async function obtenirJetonManagement() {
  const { configuree, manquantes, domaine, audience } = configurationManagement();
  if (!configuree) {
    throw new ErreurAuth0Management(
      `Management API Auth0 non configurée : ${manquantes.join(', ')} absente(s) de l'environnement.`,
      { code: 'non_configuree' },
    );
  }

  if (cacheJeton && cacheJeton.expireLe > Date.now()) return cacheJeton.jeton;

  const reponse = await appeler(`https://${domaine}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: (process.env.AUTH0_M2M_CLIENT_ID || '').trim(),
      client_secret: (process.env.AUTH0_M2M_CLIENT_SECRET || '').trim(),
      audience,
    }),
  });

  if (!reponse.ok) {
    throw new ErreurAuth0Management(
      `Jeton Management refusé par Auth0 (${await messageErreur(reponse)}). `
      + `Vérifiez que l'application M2M est bien autorisée sur l'audience ${audience}.`,
      { code: 'jeton', statut: reponse.status },
    );
  }

  const donnees = await reponse.json();
  if (!donnees?.access_token) {
    throw new ErreurAuth0Management(
      'Réponse Auth0 sans access_token.',
      { code: 'jeton', statut: reponse.status },
    );
  }

  const dureeS = Number(donnees.expires_in) || 0;
  cacheJeton = {
    jeton: donnees.access_token,
    expireLe: Date.now() + Math.max(dureeS - MARGE_EXPIRATION_S, 0) * 1000,
  };
  return cacheJeton.jeton;
}

/**
 * Identifiant Auth0 du rôle RBAC portant ce nom.
 *
 * `name_filter` fait une recherche approchée : on reprend l'égalité stricte
 * ensuite, sans quoi « admin » pourrait rendre « administrateur-lecture-seule ».
 */
async function idRoleRbac(claim, domaine, jeton) {
  const reponse = await appeler(
    `https://${domaine}/api/v2/roles?name_filter=${encodeURIComponent(claim)}&per_page=100`,
    { headers: { Authorization: `Bearer ${jeton}` } },
  );

  if (reponse.status === 401 || reponse.status === 403) {
    reinitialiserCacheJeton();
    throw new ErreurAuth0Management(
      `Auth0 a refusé la lecture des rôles (${await messageErreur(reponse)}). `
      + "Vérifiez le scope read:roles de l'application M2M.",
      { code: 'roles', statut: reponse.status },
    );
  }
  if (!reponse.ok) {
    throw new ErreurAuth0Management(
      `Lecture des rôles Auth0 refusée (${await messageErreur(reponse)}).`,
      { code: 'roles', statut: reponse.status },
    );
  }

  const roles = await reponse.json().catch(() => null);
  const trouve = Array.isArray(roles) ? roles.find((r) => r?.name === claim) : null;
  if (!trouve?.id) {
    throw new ErreurAuth0Management(
      `Aucun rôle « ${claim} » sur le locataire ${domaine}. `
      + 'Créez-le dans Auth0 (User Management → Roles) avec ce nom exact, '
      + "sinon l'Action de connexion n'aura rien à lire.",
      { code: 'role_absent' },
    );
  }
  return trouve.id;
}

/**
 * Remplace les rôles RBAC de l'utilisateur par le seul rôle attendu.
 *
 * Les rôles Auth0 s'additionnent : sans retirer les précédents, une personne
 * rétrogradée d'administrateur à client porterait les deux, et l'Action de
 * connexion retiendrait le premier de la liste — c'est-à-dire n'importe lequel.
 */
async function remplacerRoleRbac(auth0Id, claim, domaine, jeton) {
  const idCible = await idRoleRbac(claim, domaine, jeton);
  const urlRoles = `https://${domaine}/api/v2/users/${encodeURIComponent(auth0Id)}/roles`;
  const entetes = { Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json' };

  const lecture = await appeler(urlRoles, { headers: { Authorization: `Bearer ${jeton}` } });
  if (lecture.status === 404) {
    throw new ErreurAuth0Management(
      `Aucun compte ${auth0Id} sur le locataire ${domaine} : le compte n'existe `
      + "qu'en base (données de démonstration ?) ou le locataire actif n'est pas le bon.",
      { code: 'roles', statut: 404 },
    );
  }
  if (!lecture.ok) {
    throw new ErreurAuth0Management(
      `Lecture des rôles du compte refusée (${await messageErreur(lecture)}).`,
      { code: 'roles', statut: lecture.status },
    );
  }

  const actuels = (await lecture.json().catch(() => null)) || [];
  const aRetirer = (Array.isArray(actuels) ? actuels : [])
    .filter((r) => r?.id && r.id !== idCible)
    .map((r) => r.id);

  if (aRetirer.length) {
    const retrait = await appeler(urlRoles, {
      method: 'DELETE',
      headers: entetes,
      body: JSON.stringify({ roles: aRetirer }),
    });
    if (!retrait.ok && retrait.status !== 204) {
      throw new ErreurAuth0Management(
        `Retrait des anciens rôles refusé (${await messageErreur(retrait)}). `
        + 'Vérifiez le scope delete:role_members.',
        { code: 'roles', statut: retrait.status },
      );
    }
  }

  const dejaPorte = (Array.isArray(actuels) ? actuels : []).some((r) => r?.id === idCible);
  if (!dejaPorte) {
    const ajout = await appeler(urlRoles, {
      method: 'POST',
      headers: entetes,
      body: JSON.stringify({ roles: [idCible] }),
    });
    if (!ajout.ok && ajout.status !== 204) {
      throw new ErreurAuth0Management(
        `Attribution du rôle refusée (${await messageErreur(ajout)}). `
        + 'Vérifiez le scope create:role_members.',
        { code: 'roles', statut: ajout.status },
      );
    }
  }

  return { idRole: idCible, retires: aRetirer.length };
}

/**
 * Attribue le rôle à l'utilisateur Auth0, des deux façons possibles.
 *
 * CORRIGÉ LE 12 SEPTEMBRE 2026 — ce module n'écrivait que `app_metadata.role`,
 * en supposant une Action « Post Login » qui le relise. L'Action réellement
 * déployée sur le locataire de production ne fait pas cela : elle lit les
 * **rôles RBAC Auth0**. La métadonnée était donc écrite, l'écran annonçait un
 * succès, et le rôle retombait à l'ancien à la reconnexion suivante — le défaut
 * même que ce module était censé corriger, déplacé d'un cran.
 *
 * D'où les deux écritures, dans cet ordre :
 *   1. le **rôle RBAC**, qui produit l'effet avec l'Action en place ;
 *   2. `app_metadata.role`, que lit la variante d'Action documentée dans
 *      `AUTH0_SETUP.md`.
 *
 * Le RBAC passe en premier : si la seconde écriture échoue, le rôle a malgré
 * tout pris effet. L'inverse aurait laissé un succès de façade.
 *
 * L'effet n'apparaît dans le jeton qu'à la prochaine connexion (ou au
 * rafraîchissement de session) de la personne concernée.
 *
 * @param {string} auth0Id  identifiant Auth0 complet, ex. `auth0|abc123`
 * @param {string} role     rôle Prisma (`ADMIN`, `PARTNER`, `INSURER`, `CLIENT`)
 * @returns {Promise<{ auth0Id: string, role: string, claim: string }>}
 * @throws {ErreurAuth0Management}
 */
export async function definirRoleUtilisateur(auth0Id, role) {
  if (typeof auth0Id !== 'string' || !auth0Id.trim()) {
    throw new ErreurAuth0Management(
      "Identifiant Auth0 absent : impossible de propager le rôle.",
      { code: 'identifiant_invalide' },
    );
  }

  const claim = claimDepuisRole(role);
  if (!claim) {
    throw new ErreurAuth0Management(`Rôle inconnu : ${role}`, { code: 'role_invalide' });
  }

  const { domaine } = configurationManagement();
  const jeton = await obtenirJetonManagement();
  const identifiant = auth0Id.trim();

  // 1. Le rôle RBAC : c'est lui que lit l'Action en place, donc lui qui décide.
  const rbac = await remplacerRoleRbac(identifiant, claim, domaine, jeton);

  // 2. La métadonnée, pour la variante d'Action documentée.
  const reponse = await appeler(
    `https://${domaine}/api/v2/users/${encodeURIComponent(identifiant)}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_metadata: { role: claim } }),
    },
  );

  if (reponse.status === 401 || reponse.status === 403) {
    // Jeton révoqué, expiré côté Auth0 ou scopes insuffisants : le cache ne vaut
    // plus rien, la tentative suivante doit en redemander un.
    reinitialiserCacheJeton();
    throw new ErreurAuth0Management(
      `Auth0 a refusé la modification (${await messageErreur(reponse)}). `
      + "Vérifiez les scopes read:users et update:users de l'application M2M.",
      { code: 'patch', statut: reponse.status },
    );
  }

  if (reponse.status === 404) {
    throw new ErreurAuth0Management(
      `Aucun compte ${auth0Id} sur le locataire ${domaine} : le compte n'existe `
      + "qu'en base (données de démonstration ?) ou le locataire actif n'est pas le bon.",
      { code: 'patch', statut: 404 },
    );
  }

  if (!reponse.ok) {
    throw new ErreurAuth0Management(
      `Écriture du rôle refusée par Auth0 (${await messageErreur(reponse)}).`,
      { code: 'patch', statut: reponse.status },
    );
  }

  return {
    auth0Id: identifiant,
    role: role.trim().toUpperCase(),
    claim,
    idRoleAuth0: rbac.idRole,
    rolesRetires: rbac.retires,
  };
}
