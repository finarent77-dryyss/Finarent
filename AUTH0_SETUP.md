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

## Auth0 → Actions → Library → "Add Role Claim"

L'app lit le rôle dans le custom claim `https://finarent/role` (cf. `middleware.ts`, `lib/auth.ts`, `lib/users.js`).

Si ton Action Auth0 émettait encore `https://finassur/role`, remplace dans le code de l'Action :

```js
exports.onExecutePostLogin = async (event, api) => {
  const role = event.authorization?.roles?.[0] || 'client';
  api.idToken.setCustomClaim('https://finarent/role', role);
  api.accessToken.setCustomClaim('https://finarent/role', role);
};
```

→ **Deploy** l'Action, puis vérifie qu'elle est bien attachée au flow **Login**.

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
