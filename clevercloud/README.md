# Déploiement Clever Cloud — Finarent

> Inventaire complet des variables d'environnement : `docs/PROCEDURES_EXPLOITATION.md` § 9.
> Ce fichier ne couvre que la mise en route de l'application.

## 1. Créer l'application

Console [Clever Cloud](https://console.clever-cloud.com) → **Create** → **Node.js**

- **Instance** : Node.js 20 (recommandé)
- **Région** : Paris (EU)
- Lier le dépôt GitHub `andrysdevelopper-dot/finarrent` (branche `main`)

⚠️ **Taille de l'instance de build** : le build Next échoue en dépassement mémoire
sur une instance XS. Configurer une **instance de build dédiée en taille M**
(onglet *Scalability* → *Dedicated build instance*).

## 2. Addon PostgreSQL (si pas déjà Neon)

Option A — **Addon Clever Cloud PostgreSQL** (lié à l'app)
→ `POSTGRESQL_ADDON_URI` est injecté automatiquement au build ; `clevercloud/build.sh`
le recopie dans `DATABASE_URL` s'il n'est pas déjà défini.

Option B — **Neon externe** (actuel en dev)
→ Définir `DATABASE_URL` manuellement avec l'URL Neon (pooler recommandé).

## 3. Addon Cellar (stockage des documents)

Le stockage de fichiers passe par **Cellar**, l'objet S3 de Clever Cloud
(cf. `lib/storage.js`) — Supabase n'est plus utilisé.

1. Créer l'addon **Cellar** et le lier à l'application : `CELLAR_ADDON_HOST`,
   `CELLAR_ADDON_KEY_ID` et `CELLAR_ADDON_KEY_SECRET` sont alors injectés
   automatiquement.
2. **Créer le bucket** (il ne l'est pas par l'addon), puis renseigner `CELLAR_BUCKET`.

⚠️ Si l'une de ces trois variables manque, `lib/storage.js` bascule silencieusement
sur `private/uploads/`, c'est-à-dire le disque **éphémère** de l'instance : les pièces
KYC, contrats et preuves de signature seraient perdus à chaque redéploiement.

## 4. Variables d'environnement

Dans **Environment variables** de l'app :

| Variable | Valeur |
|---|---|
| `CC_BUILD_COMMAND` | `npm run build:standalone` |
| `CC_RUN_COMMAND` | `npm run start:standalone` |
| `CC_HEALTH_CHECK_PATH` | `/api/health` |
| `NODE_ENV` | `production` |
| `APP_BASE_URL` | `https://finarent.com` (ou URL Clever Cloud temporaire) |
| `NEXT_PUBLIC_APP_URL` | idem |
| `DATABASE_URL` | URL Postgres prod (si pas d'addon CC) |
| `AUTH0_DOMAIN` | tenant Auth0 |
| `AUTH0_ISSUER_BASE_URL` | `https://<tenant>.eu.auth0.com` |
| `AUTH0_BASE_URL` | idem `APP_BASE_URL` |
| `AUTH0_CLIENT_ID` | … |
| `AUTH0_CLIENT_SECRET` | … |
| `AUTH0_SECRET` | 32 bytes hex (`openssl rand -hex 32`) |
| `ENCRYPTION_KEY` | clé AES base64 32 octets |
| `CRON_SECRET` | secret Bearer pour `/api/cron/*` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | … |
| `RECAPTCHA_SECRET_KEY` | … |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | serveur mail prod |
| `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME` | e-mailing transactionnel et marketing |
| `CELLAR_BUCKET` | bucket créé à l'étape 3 |
| `CELLAR_REGION` | facultatif, défaut `us-east-1` |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity (optionnel) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | paiement factures (optionnel) |
| `RINGOVER_*` | téléphonie (optionnel) |

## 5. Auth0 — URLs de production

Dans le dashboard Auth0, ajouter pour l'URL prod :

- **Allowed Callback URLs** : `https://finarent.com/api/auth/callback`
- **Allowed Logout URLs** : `https://finarent.com`
- **Allowed Web Origins** : `https://finarent.com`

⚠️ Le tenant Auth0 de production n'est pas celui du `.env` local — vérifier le
domaine renvoyé par `/api/auth/login` avant de conclure à une erreur de configuration.

## 6. Crons

Les tâches planifiées sont déclarées dans `clevercloud/cron.json`, versionné avec
le dépôt — il n'y a rien à saisir dans la console.

| Route | Schedule | Rôle |
|---|---|---|
| `/api/cron/reminders` | `0 9 * * *` | Relances dossiers |
| `/api/cron/sla-check` | `0 */2 * * *` | Alertes SLA |
| `/api/cron/affiliate-purge` | `0 3 * * 0` | Purge des données d'affiliation |

Chaque ligne s'appelle en `http://localhost:8080` et est gardée par
`[ "$INSTANCE_NUMBER" = "0" ]` : sur plusieurs instances, une seule exécute la tâche.
L'authentification se fait par en-tête `Authorization: Bearer $CRON_SECRET`.

## 7. Domaines

**Domain names** → ajouter le domaine canonique `finarent.com` puis les domaines
secondaires servis par la même application : `www.finarent.com`, `finarent.fr`,
`www.finarent.fr`, `finarent.org`, `www.finarent.org`.

`next.config.js` redirige tous les domaines secondaires en 301 vers
`https://finarent.com` pour ne pas diviser le SEO.

Configurer les enregistrements DNS (CNAME vers l'app Clever Cloud).
⚠️ Supprimer les enregistrements `AAAA` de parking laissés par le registrar :
ils font échouer la résolution avant même d'atteindre Clever Cloud.

## 8. Baseline migrations (DB déjà synchronisée via db push)

Si la base existe déjà sans historique Prisma Migrate, marquer toutes les
migrations présentes comme appliquées :

```bash
for m in prisma/migrations/*/; do
  npx prisma migrate resolve --applied "$(basename "$m")"
done
```

Puis vérifier : `npx prisma migrate status` → « Database schema is up to date ».

## 9. Vérification post-déploiement

```bash
curl https://<app>.cleverapps.io/api/health
# → {"status":"ok","time":"2026-09-09T09:00:00.000Z"}
```

La sonde est publique : elle ne renvoie volontairement rien d'autre que l'état et
l'horodatage.

Connecter en admin → `/admin/call-centers`, `/admin/logs`, import CSV prospects.
Vérifier enfin qu'un document déposé depuis un dossier client survit à un
redéploiement (preuve que Cellar est bien actif, cf. étape 3).
