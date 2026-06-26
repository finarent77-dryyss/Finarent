# Déploiement Clever Cloud — Finarent

## 1. Créer l'application

Console [Clever Cloud](https://console.clever-cloud.com) → **Create** → **Node.js**

- **Instance** : Node.js 20 (recommandé)
- **Région** : Paris (EU)
- Lier le dépôt GitHub `andrysdevelopper-dot/finarrent` (branche `main`)

## 2. Addon PostgreSQL (si pas déjà Neon)

Option A — **Addon Clever Cloud PostgreSQL** (lié à l'app)  
→ `POSTGRESQL_ADDON_URI` est injecté automatiquement au build.

Option B — **Neon externe** (actuel en dev)  
→ Définir `DATABASE_URL` manuellement avec l'URL Neon (pooler recommandé).

## 3. Variables d'environnement

Dans **Environment variables** de l'app :

| Variable | Valeur |
|---|---|
| `CC_BUILD_COMMAND` | `npm run build:standalone` |
| `CC_RUN_COMMAND` | `npm run start:standalone` |
| `CC_HEALTH_CHECK_PATH` | `/api/health` |
| `NODE_ENV` | `production` |
| `APP_BASE_URL` | `https://finarent.fr` (ou URL Clever Cloud temporaire) |
| `NEXT_PUBLIC_APP_URL` | idem |
| `DATABASE_URL` | URL Postgres prod (si pas d'addon CC) |
| `AUTH0_DOMAIN` | tenant Auth0 |
| `AUTH0_CLIENT_ID` | … |
| `AUTH0_CLIENT_SECRET` | … |
| `AUTH0_SECRET` | 32 bytes hex (`openssl rand -hex 32`) |
| `ENCRYPTION_KEY` | clé AES base64 32 octets |
| `CRON_SECRET` | secret Bearer pour `/api/cron/*` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | … |
| `RECAPTCHA_SECRET_KEY` | … |
| `SMTP_*` | serveur mail prod |
| `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY` | storage docs |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | paiement factures (optionnel) |
| `RINGOVER_*` | téléphonie (optionnel) |

## 4. Auth0 — URLs de production

Dans le dashboard Auth0, ajouter pour l'URL prod :

- **Allowed Callback URLs** : `https://finarent.fr/api/auth/callback`
- **Allowed Logout URLs** : `https://finarent.fr`
- **Allowed Web Origins** : `https://finarent.fr`

## 5. Crons (Scheduled tasks)

Console Clever Cloud → app → **Scheduled tasks** :

| Commande | Schedule | Rôle |
|---|---|---|
| `curl -sf -H "Authorization: Bearer $CRON_SECRET" "$APP_BASE_URL/api/cron/reminders"` | `0 8 * * *` | Relances dossiers |
| `curl -sf -H "Authorization: Bearer $CRON_SECRET" "$APP_BASE_URL/api/cron/sla-check"` | `0 9 * * *` | Alertes SLA |

## 6. Domaine

**Domain names** → ajouter `finarent.fr` + `www.finarent.fr`  
Configurer les enregistrements DNS (CNAME vers l'app Clever Cloud).

## 7. Baseline migrations (DB déjà synchronisée via db push)

Si la base existe déjà sans historique Prisma Migrate :

```bash
npx prisma migrate resolve --applied 20260226120000_init_v2
npx prisma migrate resolve --applied 20260418120000_offers_scoring_sla
npx prisma migrate resolve --applied 20260425120000_testimonials
npx prisma migrate resolve --applied 20260513120000_dashboard_perf_indexes
npx prisma migrate resolve --applied 20260623220000_call_center_ringover_fields
npx prisma migrate resolve --applied 20260626230000_admin_activity_log_prospect_center
```

Puis vérifier : `npx prisma migrate status` → « Database schema is up to date ».

## 8. Vérification post-déploiement

```bash
curl https://<app>.cleverapps.io/api/health
# → {"status":"ok",...}
```

Connecter en admin → `/admin/call-centers`, `/admin/logs`, import CSV prospects.
