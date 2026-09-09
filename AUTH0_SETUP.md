# Configuration Auth0 pour Finarent (Next.js)

## Domaines à autoriser

L'app tourne sur :

- **Local** : `http://localhost:3000`
- **Clever Cloud (prod)** : `https://finarent.com` (domaine Primary)
- Domaines secondaires liés à l'app Clever : `finarent.fr`, `finarent.org` (servent aussi le site en direct)

> ⚠️ Domaine = `finarent` (un seul `r`). L'ancien slug Vercel `finarrent` (deux `r`) n'est plus utilisé.

## Dashboard Auth0 → Applications → Finarent → Settings

Application Type : **Regular Web Application**

Coller **tel quel** (une URL par ligne, virgule entre chaque dans Auth0) :

### Allowed Callback URLs

```
http://localhost:3000/api/auth/callback,
https://finarent.com/api/auth/callback,
https://www.finarent.com/api/auth/callback,
https://finarent.fr/api/auth/callback,
https://www.finarent.fr/api/auth/callback,
https://finarent.org/api/auth/callback,
https://www.finarent.org/api/auth/callback
```

### Allowed Logout URLs

```
http://localhost:3000,
https://finarent.com,
https://www.finarent.com,
https://finarent.fr,
https://www.finarent.fr,
https://finarent.org,
https://www.finarent.org
```

### Allowed Web Origins

```
http://localhost:3000,
https://finarent.com,
https://www.finarent.com,
https://finarent.fr,
https://www.finarent.fr,
https://finarent.org,
https://www.finarent.org
```

### Allowed Origins (CORS)

```
http://localhost:3000,
https://finarent.com,
https://www.finarent.com,
https://finarent.fr,
https://www.finarent.fr,
https://finarent.org,
https://www.finarent.org
```

→ Clique **Save Changes** en bas de la page.

## Gestion des rôles : le claim Auth0 est la source de vérité

L'app lit le rôle dans le custom claim `https://finarent/role` (cf. `middleware.ts`, `lib/auth.ts`, `lib/users.js`).

`syncUser()` recopie ce claim dans la colonne `User.role` **à chaque requête authentifiée**, avec `CLIENT` par défaut. La base est un miroir, pas une source : un rôle écrit en base seule retombe à la première navigation. C'est le constat **P1-8** de l'audit de septembre 2026 — le back-office annonçait une promotion qui ne tenait pas.

Le back-office (`PATCH /api/admin/users/[id]`) et `scripts/promote-admin.js` écrivent donc d'abord `app_metadata.role` dans Auth0 via la Management API, puis en base seulement si Auth0 a accepté. **Sans les variables `AUTH0_M2M_*` ci-dessous, le changement de rôle est refusé en 503** : un échec franc plutôt qu'un succès mensonger.

Les trois étapes ci-dessous sont indissociables — l'Action seule ne suffit pas, l'application M2M seule non plus.

### Étape 1 — Application « Machine to Machine »

1. Dashboard Auth0 → **Applications → Applications → Create Application**.
2. Nom : `Finarent Management` · Type : **Machine to Machine Applications** → *Create*.
3. API à autoriser : **Auth0 Management API** (audience `https://<AUTH0_DOMAIN>/api/v2/`).
4. Scopes à cocher, et rien de plus : **`read:users`** et **`update:users`** → *Authorize*.
5. Onglet **Settings** de l'application créée : relever le **Client ID** et le **Client Secret**.

> Le secret n'est affiché qu'ici. Il ne va ni dans le dépôt, ni dans `AUTH0_SETUP.md` : uniquement dans les variables d'environnement.

### Étape 2 — Action « Post Login » qui recopie `app_metadata.role` dans le claim

Auth0 ne remonte pas `app_metadata` dans le jeton tout seul. Sans cette Action, l'écriture de l'étape 1 est invisible côté application.

Auth0 → **Actions → Library → Build Custom** → nom `Add Role Claim`, trigger **Login / Post Login**, runtime Node 18+ :

```js
exports.onExecutePostLogin = async (event, api) => {
  const role = event.user.app_metadata?.role
    || event.authorization?.roles?.[0]
    || 'client';
  api.idToken.setCustomClaim('https://finarent/role', role);
  api.accessToken.setCustomClaim('https://finarent/role', role);
};
```

→ **Deploy**, puis Auth0 → **Actions → Triggers → post-login** : glisser l'Action dans le flow entre *Start* et *Complete*, puis **Apply**.

Valeurs admises pour `role` : `admin`, `partner`, `insurer`, `client` (cf. `mapRole()` dans `lib/auth.ts`).

> Si ton Action émettait encore `https://finassur/role`, remplace le nom du claim par `https://finarent/role`. L'ancien namespace reste accepté en repli côté application (constat `P2-4`) : il ne sera retiré qu'une fois qu'aucun jeton ne le portera plus — chaque lecture du repli journalise une ligne `[P2-4]`.

### Étape 3 — Variables d'environnement

À déclarer en local **et** sur Clever Cloud :

```
AUTH0_M2M_CLIENT_ID=<Client ID de l'application M2M>
AUTH0_M2M_CLIENT_SECRET=<Client Secret de l'application M2M>
```

Facultatif, uniquement avec un domaine personnalisé dont l'audience Management diffère du domaine du locataire :

```
AUTH0_M2M_AUDIENCE=https://<AUTH0_DOMAIN>/api/v2/
```

`AUTH0_DOMAIN` est déjà déclarée (voir plus bas) et sert à construire l'audience par défaut.

### Vérification

1. Back-office → **Admin → Utilisateurs** → changer le rôle de quelqu'un.
   - Variables absentes → bandeau d'erreur explicite (503), et **rien** n'est écrit en base : c'est le comportement attendu.
   - Variables présentes → Auth0 → *User Management → Users → \<le compte\> → Metadata* affiche `app_metadata: { "role": "admin" }`.
2. La personne se déconnecte puis se reconnecte : son jeton porte le nouveau claim.
3. Elle consulte ses notifications (`/api/notifications`, qui appelle `syncUser()`) : le rôle **tient**. C'est la preuve de clôture du constat `P1-8`.

En ligne de commande, même mécanisme :

```bash
node scripts/promote-admin.js personne@exemple.fr
```

Le script refuse de s'exécuter contre une base distante (garde `scripts/_guard.js`) et n'écrit en base que si Auth0 a accepté.

## Variables d'env côté Clever Cloud

Dans Clever Cloud → app finarent → **Environment variables** :

```
AUTH0_DOMAIN=dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_ISSUER_BASE_URL=https://dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_CLIENT_ID=f7oXNEBj5D0r1OR65ORLYuaxLgDbGgpk
AUTH0_CLIENT_SECRET=<depuis le dashboard Auth0>
AUTH0_SECRET=<openssl rand -hex 32>
AUTH0_BASE_URL=https://finarent.com
```

> `AUTH0_BASE_URL` **doit** matcher exactement une URL des "Allowed Callback URLs" (sans le `/api/auth/callback`).

## Vérification rapide après deploy

1. Aller sur `https://finarent.com/api/auth/login` → doit rediriger vers le tenant Auth0.
2. Se connecter → retour sur `https://finarent.com/api/auth/callback?...` → puis sur la home en session.
3. Si erreur `Callback URL mismatch` → l'URL listée dans le message d'erreur Auth0 doit être ajoutée à **Allowed Callback URLs**.

## .env (local)

```
AUTH0_DOMAIN=dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_ISSUER_BASE_URL=https://dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_CLIENT_ID=f7oXNEBj5D0r1OR65ORLYuaxLgDbGgpk
AUTH0_CLIENT_SECRET=<...>
AUTH0_SECRET=<openssl rand -hex 32>
AUTH0_BASE_URL=http://localhost:3000
```
