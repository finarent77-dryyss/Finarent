import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  definirRoleUtilisateur,
  claimDepuisRole,
  reinitialiserCacheJeton,
  ErreurAuth0Management,
} from '@/lib/auth0-management.js';

/**
 * Attribution du rôle Auth0 depuis le back-office.
 *
 * Ce module a livré pendant deux jours un succès de façade : il écrivait
 * `app_metadata.role`, alors que l'Action déployée sur le locataire de
 * production lit les **rôles RBAC**. L'écran annonçait « rôle modifié », et le
 * rôle retombait à l'ancien à la reconnexion. Aucun test ne couvrait le module :
 * rien ne pouvait le dire.
 *
 * Ces cas verrouillent donc ce qui compte réellement — que le rôle RBAC soit
 * bien attribué, et que l'ancien soit retiré — et pas seulement qu'un appel
 * HTTP parte.
 */

const DOMAINE = 'locataire-de-test.eu.auth0.com';
const UTILISATEUR = 'auth0|abc123';
const ID_ROLE_ADMIN = 'rol_admin';
const ID_ROLE_CLIENT = 'rol_client';

let envInitial;

/** Construit un faux Auth0 et note tout ce qu'on lui demande. */
function auth0Simule({ rolesDuCompte = [], rolesDuLocataire = null } = {}) {
  const appels = [];
  const catalogue = rolesDuLocataire ?? [
    { id: ID_ROLE_ADMIN, name: 'admin' },
    { id: ID_ROLE_CLIENT, name: 'client' },
  ];

  const reponse = (corps, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => corps,
    text: async () => JSON.stringify(corps),
  });

  const fetchSimule = vi.fn(async (url, init = {}) => {
    const methode = init.method || 'GET';
    const corps = init.body ? JSON.parse(init.body) : null;
    appels.push({ url: String(url), methode, corps });

    if (String(url).endsWith('/oauth/token')) {
      return reponse({ access_token: 'jeton-de-test', expires_in: 86400 });
    }
    if (String(url).includes('/api/v2/roles?')) {
      const nom = new URL(String(url)).searchParams.get('name_filter');
      return reponse(catalogue.filter((r) => r.name.includes(nom)));
    }
    if (String(url).includes('/roles')) {
      if (methode === 'GET') return reponse(rolesDuCompte);
      return reponse(null, 204);
    }
    return reponse({ user_id: UTILISATEUR });
  });

  vi.stubGlobal('fetch', fetchSimule);
  return appels;
}

const appelsVers = (appels, fragment, methode) =>
  appels.filter((a) => a.url.includes(fragment) && (!methode || a.methode === methode));

describe('definirRoleUtilisateur — le rôle doit réellement prendre effet', () => {
  beforeEach(() => {
    envInitial = { ...process.env };
    process.env.AUTH0_DOMAIN = DOMAINE;
    process.env.AUTH0_M2M_CLIENT_ID = 'client-de-test';
    process.env.AUTH0_M2M_CLIENT_SECRET = 'secret-de-test';
    reinitialiserCacheJeton();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = envInitial;
    reinitialiserCacheJeton();
  });

  it('attribue le rôle RBAC, et pas seulement la métadonnée', async () => {
    const appels = auth0Simule();
    const resultat = await definirRoleUtilisateur(UTILISATEUR, 'ADMIN');

    const attributions = appelsVers(appels, '/roles', 'POST');
    expect(attributions).toHaveLength(1);
    expect(attributions[0].corps).toEqual({ roles: [ID_ROLE_ADMIN] });
    expect(resultat.idRoleAuth0).toBe(ID_ROLE_ADMIN);

    // La métadonnée reste écrite, pour la variante d'Action documentée.
    const patch = appelsVers(appels, '/api/v2/users/', 'PATCH');
    expect(patch).toHaveLength(1);
    expect(patch[0].corps).toEqual({ app_metadata: { role: 'admin' } });
  });

  it("retire l'ancien rôle : les rôles Auth0 s'additionnent sinon", async () => {
    // Une personne rétrogradée d'administrateur à client porterait les deux, et
    // l'Action retiendrait le premier de la liste — c'est-à-dire n'importe lequel.
    const appels = auth0Simule({ rolesDuCompte: [{ id: ID_ROLE_ADMIN, name: 'admin' }] });
    const resultat = await definirRoleUtilisateur(UTILISATEUR, 'CLIENT');

    const retraits = appelsVers(appels, '/roles', 'DELETE');
    expect(retraits).toHaveLength(1);
    expect(retraits[0].corps).toEqual({ roles: [ID_ROLE_ADMIN] });
    expect(resultat.rolesRetires).toBe(1);

    expect(appelsVers(appels, '/roles', 'POST')[0].corps).toEqual({ roles: [ID_ROLE_CLIENT] });
  });

  it("n'attribue pas deux fois un rôle déjà porté", async () => {
    const appels = auth0Simule({ rolesDuCompte: [{ id: ID_ROLE_ADMIN, name: 'admin' }] });
    await definirRoleUtilisateur(UTILISATEUR, 'ADMIN');

    expect(appelsVers(appels, '/roles', 'POST')).toHaveLength(0);
    expect(appelsVers(appels, '/roles', 'DELETE')).toHaveLength(0);
  });

  it('échoue franchement si le rôle n\u2019existe pas sur le locataire', async () => {
    auth0Simule({ rolesDuLocataire: [] });
    await expect(definirRoleUtilisateur(UTILISATEUR, 'ADMIN')).rejects.toThrow(ErreurAuth0Management);
    // Un rôle absent doit se dire, pas se deviner : le message nomme la cause.
    await expect(definirRoleUtilisateur(UTILISATEUR, 'ADMIN')).rejects.toThrow(/Aucun rôle/);
  });

  it("n'écrit pas la métadonnée quand l'attribution RBAC a échoué", async () => {
    // L'ordre compte : écrire la métadonnée d'abord aurait laissé un succès de
    // façade — exactement le défaut que cette correction supprime.
    const appels = auth0Simule({ rolesDuLocataire: [] });
    await expect(definirRoleUtilisateur(UTILISATEUR, 'ADMIN')).rejects.toThrow();
    expect(appelsVers(appels, '/api/v2/users/', 'PATCH')).toHaveLength(0);
  });

  it('refuse un rôle inconnu avant tout appel réseau', async () => {
    const appels = auth0Simule();
    await expect(definirRoleUtilisateur(UTILISATEUR, 'SUPERVISEUR')).rejects.toThrow(/Rôle inconnu/);
    expect(appels).toHaveLength(0);
  });

  it('traduit les rôles Prisma vers les noms de rôles Auth0', () => {
    expect(claimDepuisRole('ADMIN')).toBe('admin');
    expect(claimDepuisRole('CLIENT')).toBe('client');
    expect(claimDepuisRole('n\u2019importe quoi')).toBeNull();
  });
});
