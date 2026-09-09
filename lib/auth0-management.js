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
 * Écrit le rôle dans `app_metadata.role` de l'utilisateur Auth0.
 *
 * L'effet n'apparaît dans le jeton qu'à la prochaine connexion (ou au
 * rafraîchissement de session) de la personne concernée, via l'Action
 * « Post Login » documentée en tête de fichier.
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

  const reponse = await appeler(
    `https://${domaine}/api/v2/users/${encodeURIComponent(auth0Id.trim())}`,
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

  return { auth0Id: auth0Id.trim(), role: role.trim().toUpperCase(), claim };
}
