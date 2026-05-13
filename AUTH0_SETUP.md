# Configuration Auth0 pour Finarent (Next.js)

## Domaines à autoriser

L'app tourne sur :

- **Local** : `http://localhost:3000`
- **Vercel (prod)** : `https://finarrent.vercel.app`
- **Domaine custom (futur)** : `https://finarent.fr` (à ajouter quand le DNS sera prêt)

> ⚠️ Le slug Vercel s'écrit `finarrent` (deux `r`), pas `finarent`. Ne pas confondre.

## Dashboard Auth0 → Applications → Finarent → Settings

Application Type : **Regular Web Application**

Coller **tel quel** (une URL par ligne, virgule entre chaque dans Auth0) :

### Allowed Callback URLs

```
http://localhost:3000/api/auth/callback,
https://finarrent.vercel.app/api/auth/callback,
https://*.vercel.app/api/auth/callback
```

> La 3ᵉ ligne (wildcard `*.vercel.app`) autorise les URLs de preview que Vercel génère à chaque PR / branche. Optionnelle mais bien pratique.

### Allowed Logout URLs

```
http://localhost:3000,
https://finarrent.vercel.app,
https://*.vercel.app
```

### Allowed Web Origins

```
http://localhost:3000,
https://finarrent.vercel.app,
https://*.vercel.app
```

### Allowed Origins (CORS)

```
http://localhost:3000,
https://finarrent.vercel.app,
https://*.vercel.app
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

## Variables d'env côté Vercel

Dans Vercel → Project Settings → Environment Variables (les 3 environnements) :

```
AUTH0_DOMAIN=dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_ISSUER_BASE_URL=https://dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_CLIENT_ID=f7oXNEBj5D0r1OR65ORLYuaxLgDbGgpk
AUTH0_CLIENT_SECRET=<depuis le dashboard Auth0>
AUTH0_SECRET=<openssl rand -hex 32>
AUTH0_BASE_URL=https://finarrent.vercel.app
```

> `AUTH0_BASE_URL` **doit** matcher exactement une URL des "Allowed Callback URLs" (sans le `/api/auth/callback`).

## Vérification rapide après deploy

1. Aller sur `https://finarrent.vercel.app/api/auth/login` → doit rediriger vers le tenant Auth0.
2. Se connecter → retour sur `https://finarrent.vercel.app/api/auth/callback?...` → puis sur la home en session.
3. Si erreur `Callback URL mismatch` → l'URL listée dans le message d'erreur Auth0 doit être ajoutée à **Allowed Callback URLs** (souvent un oubli de wildcard preview).

## .env (local)

```
AUTH0_DOMAIN=dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_ISSUER_BASE_URL=https://dev-44jsict2grc7s0jn.eu.auth0.com
AUTH0_CLIENT_ID=f7oXNEBj5D0r1OR65ORLYuaxLgDbGgpk
AUTH0_CLIENT_SECRET=<...>
AUTH0_SECRET=<openssl rand -hex 32>
AUTH0_BASE_URL=http://localhost:3000
```
