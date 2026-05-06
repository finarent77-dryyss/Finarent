# 📘 Finarent — Project Handoff (pour Claude Code Desktop)

> **Document complet pour reprendre le projet de zéro.** Lecture intégrale recommandée avant toute modification.
> Dernière mise à jour : avril 2026.

---

## 1. Identité du projet

**Finarent** (anciennement **Finassur**) est une plateforme web de courtage en financement et assurance professionnels.

- **Mission** : permettre aux entreprises (TPE/PME) de simuler, déposer, et suivre leurs demandes de financement (crédit-bail, LOA, LLD, prêt pro, leasing opérationnel) ou d'assurance RC Pro.
- **Rôle** : courtier intermédiaire entre clients et partenaires bancaires/assureurs (réseau de 30+ partenaires visé).
- **Régulation** : COBSP (Courtier en Opérations de Banque) + COA (Courtier en Assurance), immatriculation ORIAS requise.
- **Owner** : `andrys972@gmail.com` (compte admin).
- **Statut** : MVP fonctionnel à 95% de la spec v1.0, en cours de rebrand `Finassur → Finarent` (mi-finalisé) et de préparation au déploiement Vercel.

---

## 2. Stack technique

| Couche | Techno | Version | Notes |
|--------|--------|---------|-------|
| Framework | Next.js | 15.5.12 (App Router) | RSC, server actions |
| React | React | 18.3.1 | + react-dom 18.3.1 |
| Styling | Tailwind CSS | v4 | `@tailwindcss/postcss` ; classes legacy `bg-gradient-to-*` toujours valides |
| Animations | Framer Motion | 12.23 | Utilisé partout pour les entrées/scroll reveal |
| Auth | Auth0 | `@auth0/nextjs-auth0` 3.5 | Custom claim `https://finassur/role` (à migrer vers `https://finarent/role`) |
| ORM | Prisma | 5.22 | Postgres |
| BDD | PostgreSQL | local 5432 (`finassur` DB) | Schema v3.0 |
| Storage fichiers | Supabase Storage | adapter avec fallback local `/private/uploads` | `lib/storage.js` |
| Email | Nodemailer SMTP | 6.9 | 2 templates : confirmation client + alerte admin |
| SMS | Twilio | 5.13 | 6 triggers (fallback console si pas de credentials) |
| Signature | YouSign API v3 | — | `lib/yousign.js` |
| Monitoring | Sentry | 10.49 (`@sentry/nextjs`) | Client + server + edge |
| Analytics | PostHog | 1.369 | Provider + pageview tracking |
| Forms | react-hook-form + Zod | 7.53 / 3.23 | Validation côté client |
| Drag & drop | @dnd-kit | 6.3 | Pour le Kanban admin |
| Charts | Recharts | 3.8 | Présent mais peu utilisé (les dashboards utilisent des barres Tailwind custom) |
| Icons | FontAwesome | 7.1 | Solid + brands |
| reCAPTCHA | v3 | — | `react-google-recaptcha-v3` |
| i18n | Custom (`lib/i18n.jsx`) | — | **Verrouillé sur `fr`** depuis le rebrand. Le LanguageSwitcher a été retiré. |

---

## 3. Structure des dossiers

```
c:/Users/andry/Bureau/finassur/
├── app/                          # Next.js App Router
│   ├── (public pages)            # /, /about, /solutions, /sectors, /blog, /faq, etc.
│   ├── admin/                    # Espace admin (layout protégé Auth0)
│   │   ├── demandes/, kanban/    # Gestion dossiers (liste + drag&drop)
│   │   ├── users/, partners/
│   │   ├── offers/, faq/
│   │   ├── testimonials/         # NEW — modération témoignages
│   │   ├── logs/, settings/
│   │   └── layout.jsx, page.jsx  # Dashboard avec funnel + KPI + "À traiter"
│   ├── espace/                   # Espace client
│   │   ├── [id]/                 # Détail dossier (timeline, messages, docs, signature, PDF)
│   │   ├── demande/              # Wizard 5 étapes
│   │   ├── notifications/, parrainage/, profile/, security/
│   │   └── page.jsx              # Dashboard avec ActiveFileTimeline + savings
│   ├── partner/                  # Espace partenaire (banque/leasing)
│   ├── insurer/                  # Espace assureur (RC Pro)
│   └── api/                      # 50+ endpoints Next.js Route Handlers
│       ├── admin/                # CRUD admin (demandes, users, partners, stats, etc.)
│       ├── applications/         # CRUD demandes côté client
│       ├── auth/[...auth0]/      # Auth0 handler
│       ├── cron/                 # reminders + sla-check
│       ├── notifications/        # NEW — feed pour cloche header
│       ├── testimonials/         # NEW — public + modération
│       └── ... (offers, documents, messages, profile, siret, faq, etc.)
├── components/
│   ├── admin/                    # AdminSidebar, AdminMobileNav, AdminDashboardClient (535+ lignes)
│   ├── espace/                   # DashboardClient, ActiveFileTimeline (NEW), NotificationsBell (NEW), DocumentChecklist
│   ├── insurer/                  # InsurerDashboardClient (243 → ~340 lignes)
│   ├── partner/                  # PartnerDashboardClient (342 → ~470 lignes)
│   ├── layout/                   # Header, Footer, Hero
│   ├── pages/                    # Pages clients
│   ├── ui/                       # Composants UI génériques (TestimonialCard, CookieBanner, etc.)
│   ├── animations/               # PageTransition, ScrollReveal
│   └── providers/                # Auth, i18n, etc.
├── lib/
│   ├── prisma.ts                 # Client Prisma singleton
│   ├── auth.ts                   # requireAdmin, requirePartner, requireInsurer, isAuthError
│   ├── i18n.jsx                  # LanguageProvider (verrouillé fr)
│   ├── users.js                  # syncUser, isAdmin (basé sur Auth0 claim)
│   ├── email.js                  # sendConfirmationDemande, sendAlerteAdmin
│   ├── sms.js                    # 6 triggers Twilio
│   ├── yousign.js                # API signature eIDAS
│   ├── storage.js                # Adapter Supabase + fallback local
│   ├── scoring.js                # Pré-scoring 0-100
│   ├── webhooks.js               # Webhooks partenaires
│   └── statusMap.js              # Mapping enum Prisma ↔ statuts français legacy
├── messages/
│   ├── fr.json                   # 1600+ clés (source de vérité, locale par défaut)
│   └── en.json                   # Ne sera plus servi (lang locked fr) mais conservé
├── prisma/
│   ├── schema.prisma             # 13 modèles (User, Application, Offer, Testimonial, etc.)
│   ├── migrations/               # 3 migrations
│   │   ├── 20260226120000_init_v2/
│   │   ├── 20260418120000_offers_scoring_sla/
│   │   └── 20260425120000_testimonials/   # NEW
│   └── dev.db                    # SQLite legacy (non utilisé — pg sur localhost:5432)
├── public/
│   ├── finarent-logo.jpg         # Logo officiel (URL-safe)
│   ├── finarent logo.jpg         # Original avec espace dans le nom (à supprimer)
│   ├── Finassurs_logo.jpeg       # Ancien logo (à supprimer après vérification)
│   ├── hero_business_team_premium_v2_*.png
│   ├── solutions_leasing_concepts_*.png
│   └── uploads/                  # Fichiers utilisateurs (fallback local quand Supabase off)
├── scripts/
│   ├── build.js                  # Build legacy Clever Cloud (standalone + assets copy)
│   ├── start.js                  # Start legacy Clever Cloud
│   └── promote-admin.js          # Promote un user en ADMIN (ESM-compat)
├── assets/data/                  # Données statiques (sectors, solutions, testimonials, blog, assurance)
├── templates/                    # Pages HTML legacy (issues de la maquette initiale)
├── middleware.ts                 # Auth0 middleware
├── next.config.js                # `output: 'standalone'` retiré pour Vercel
├── package.json                  # Scripts adaptés Vercel (build = prisma generate + migrate deploy + next build)
├── vercel.json                   # 2 crons compatibles Hobby plan
└── .env / .env.example           # Variables d'environnement
```

---

## 4. Modèle de données (Prisma v3.0)

### Enums

- **Role** : `CLIENT | ADMIN | PARTNER | INSURER`
- **ProductType** : `PRET_PRO | CREDIT_BAIL | LOA | LLD | LEASING_OPS | RC_PRO`
- **PartnerType** : `BANK | INSURANCE | LEASING`
- **ApplicationStatus** (11 valeurs) : `PENDING | REVIEWING | DOCUMENTS_NEEDED | QUOTE_SENT | QUOTE_ACCEPTED | PENDING_SIGNATURE | SIGNED | TRANSMITTED | APPROVED | REJECTED | COMPLETED`
- **DocumentType** : `KBIS | RIB | CNI | BILAN | CONTRAT | AUTRE`
- **OfferStatus** : `DRAFT | SENT | VIEWED | ACCEPTED | REFUSED | EXPIRED | SIGNED`

### Modèles (13)

| Modèle | Rôle | Champs notables |
|--------|------|-----------------|
| `User` | Utilisateur Auth0 synchronisé | `auth0Id`, `email`, `role`, `partnerId?`, `referralCode?`, `lastLoginAt`, `phone`, `company`, `legalForm` |
| `Partner` | Banque / leasing / assurance | `name`, `type`, `contactEmail`, `isActive` |
| `Application` | Demande de financement | `status`, `amount`, `duration`, `productType`, `siren`, `companyName`, `sector`, `scorePreQual`, `scoreLabel`, `adminNotes`, `transmittedAt` |
| `Offer` | Offre commerciale structurée | `amount`, `monthlyPayment`, `rate`, `totalCost`, `expiresAt`, `signatureUrl`, status enum |
| `Document` | Pièces justificatives | `type` (DocumentType), `fileName`, `fileUrl`, `fileSize`, `mimeType` |
| `Message` | Messagerie client/admin | `content`, `isAdminOnly`, `readAt` |
| `StatusHistory` | Audit trail des changements | `fromStatus`, `toStatus`, `changedById`, `comment` (utilisé pour stocker les alertes SLA `SLA_ALERT_L1/L2/L3` et les `REMINDER_SENT`) |
| `Commission` | Commissions partenaires | `amount`, `rate`, `status` (PENDING/PAID), `paidAt` |
| `Newsletter` | Inscriptions newsletter | `email` |
| `FAQ` | CMS FAQ admin | `question`, `answer`, `category`, `order`, `isActive` |
| `Referral` | Parrainage | `referrerId`, `refereeEmail`, `code`, `status`, `convertedAt` |
| `Testimonial` | **NEW** Témoignages avec modération | `authorName`, `initials`, `rating`, `text`, `isPublished`, `isApproved`, `rejectedAt`, `approvedAt` |

> **Particularités** : pas de table `Note` séparée (les notes admin sont sur `Application.adminNotes` en TEXT). Le pré-scoring est sur `Application.scorePreQual` (0-100) + `scoreLabel`.

---

## 5. Rôles & espaces

| Rôle | Route racine | Layout protégé | Sidebar | Fonctionnalités |
|------|--------------|----------------|---------|----------------|
| **CLIENT** (défaut) | `/espace` | Auth0 + `syncUser` | — (header global) | Dashboard avec timeline dossier actif, stat cards, dossiers list (tabs), upload docs, parrainage, profil, sécurité, messagerie. Sidebar : profile completion + advisor card + recent activity + savings card. |
| **ADMIN** | `/admin` | Auth0 + `isAdmin()` (basé sur custom claim Auth0) | `AdminSidebar` (8 entrées + Mobile nav) | Dashboard funnel + KPI + SLA + opérateurs + "À traiter aujourd'hui". Pages : demandes (liste + Kanban), users, partners, offers, faq, testimonials, logs, settings. |
| **PARTNER** | `/partner` | `requirePartner()` | Pas de sidebar dédiée | Dashboard avec stats, funnel partenaire, top secteurs reçus, mix produits, commissions timeline, applications transmises, commissions à recevoir. |
| **INSURER** | `/insurer` | `requireInsurer()` | Pas de sidebar dédiée | Dashboard RC Pro : stats, funnel souscription, top secteurs (segmentation risque), tendance mensuelle, applications, prime moyenne. |

### Auth0 claim
- Custom claim attendu : `https://finassur/role` (à migrer vers `https://finarent/role` côté Auth0 dashboard ET dans `middleware.ts`, `lib/auth.ts`, `lib/users.js`).
- Promotion admin manuelle : `node scripts/promote-admin.js <email>`.

---

## 6. API endpoints (50+)

### Public
- `GET /api/faq` — FAQ active publique
- `GET /api/testimonials` — Témoignages approuvés + publiés
- `POST /api/testimonials` — Soumission témoignage public (anti-spam basique, modération admin requise)
- `POST /api/financement` — Réception demande depuis `/contact` (formulaire 5 étapes)
- `POST /api/newsletter` — Inscription
- `GET /api/siret/[siret]` — Autofill via `recherche-entreprises.api.gouv.fr` (accepte SIREN 9 ou SIRET 14)
- `GET /api/health` — Healthcheck

### Authentifié — Client
- `GET /api/profile` — Profil courant
- `PATCH /api/profile` — Mise à jour
- `GET /api/profile/export` — Export RGPD
- `DELETE /api/profile/delete` — Droit à l'oubli (anonymisation)
- `GET /api/applications` / `POST /api/applications` — Wizard
- `GET /api/applications/[id]` — Détail
- `GET /api/applications/[id]/pdf` — Récap PDF
- `POST /api/applications/[id]/sign` — Signature simple
- `POST /api/applications/[id]/rescore` — Recalcul pré-scoring
- `POST /api/documents/upload` — Upload doc
- `GET /api/documents/file/[id]` — Téléchargement
- `GET /api/messages?applicationId=` / `POST /api/messages` — Messagerie
- `POST /api/offers/[id]/accept` — Accepter offre
- `POST /api/offers/[id]/sign` — Signer offre (YouSign)
- `GET /api/notifications` — Feed pour cloche header (status events + unread messages)
- `GET /api/referrals` / `POST /api/referrals` — Parrainage

### Authentifié — Admin
- `GET /api/admin/stats` — KPI dashboard (funnel, monthly, top sectors, top operators, todayActions)
- `GET /api/admin/sla-alerts` — Alertes SLA niveau 1/2/3
- `GET /api/admin/demandes` / `PATCH /api/admin/demandes/[id]` — Gestion dossiers
- `GET/POST /api/admin/users` / `PATCH/DELETE /api/admin/users/[id]`
- `GET/POST /api/admin/partners` / `PATCH/DELETE /api/admin/partners/[id]`
- `GET/POST /api/admin/offers` / `PATCH /api/admin/offers/[id]`
- `GET/POST /api/admin/faq` / `PATCH/DELETE /api/admin/faq/[id]`
- `GET/POST /api/admin/testimonials` / `PATCH/DELETE /api/admin/testimonials/[id]` (actions : approve, reject, publish, unpublish)
- `GET /api/admin/logs` — Audit trail
- `GET /api/admin/newsletter` — Liste abonnés
- `GET /api/admin/export?format=csv` — Export CSV
- `GET/POST /api/admin/webhooks` — Webhooks partenaires

### Authentifié — Partner / Insurer
- `GET /api/partner/applications` `/stats` `/commissions`
- `GET /api/insurer/applications` `/stats`

### Cron (sécurisés via `CRON_SECRET` Bearer)
- `GET /api/cron/reminders` — Relances DOCUMENTS_NEEDED >7j et PENDING >3j (déduplication 7j/3j)
- `GET /api/cron/sla-check` — Alertes SLA L1 (4h), L2 (24h), L3 (48h) avec dédup 24h

---

## 7. Pages publiques (UI)

| Route | État | Notes |
|-------|------|-------|
| `/` | ✅ Complet | Hero, stats, secteurs, témoignages, CTA |
| `/contact` | ✅ Complet | Formulaire 5 étapes connecté à `/api/financement` |
| `/simulator` | ⚠️ Calcul client uniquement, pas de save BDD | À enrichir |
| `/comparateur` | ✅ Slider comparateur 4 produits | |
| `/solutions` + `/solutions/[id]` | ✅ 6 solutions détaillées | |
| `/sectors` + `/sectors/[id]` | ✅ 8 secteurs (BTP, Médical, IT, Transport, Industrie, Commerce, Restauration, Services) | |
| `/process` | ✅ **Enrichi cette session** : 4 étapes timeline, 4 engagements, FAQ accordéon, CTA |
| `/why-leasing` | ✅ **Enrichi cette session** : 6 avantages, table comparative leasing/achat/crédit, 4 cas d'usage |
| `/testimonials` | ✅ **Enrichi cette session** : Form public soumission + fallback static + fetch BDD |
| `/about`, `/assurance`, `/faq` | ✅ Complets | |
| `/blog` + `/blog/[id]` | ⚠️ 6 articles statiques, pas de CMS | |
| `/legal`, `/privacy`, `/terms` | ✅ Mentions légales | |

---

## 8. Identité visuelle

### Logo
- Officiel : `public/finarent-logo.jpg` (URL-safe, à utiliser partout)
- Fichier original : `public/finarent logo.jpg` (espace dans le nom — éviter)
- Ancien : `public/Finassurs_logo.jpeg` (à supprimer après vérification)

### Charte couleurs (Tailwind tokens, via `app/globals.css`)
- `primary` (bleu nuit)
- `secondary` (vert/teal Finarent)
- `accent` (vert clair)

### Typographie
- Default Next.js fonts (pas de font custom via `next/font`)

### Animations
- Framer Motion partout : `motion.div` avec `initial/animate`, `whileHover`, `whileInView` + `viewport: { once: true }`
- Variantes communes : `containerVariants` (stagger) + `itemVariants` (y/opacity)

---

## 9. État du rebrand Finassur → Finarent (CRITIQUE)

> **Le rebrand est mi-finalisé. Lire ATTENTIVEMENT avant toute modif sensible.**

### ✅ Déjà fait
- Logo `public/finarent-logo.jpg` créé
- Logo référencé dans : `Header.jsx`, `Footer.jsx`, `FirstVisitSplash.jsx`, `EspaceLoginClient.jsx`, `DashboardClient.jsx`, `ProfileClient.jsx`
- LanguageSwitcher retiré du Header
- `lib/i18n.jsx` verrouillé sur `'fr'` (locale ne change plus, EN n'est plus servi)
- "Made with ❤️ in Paris" supprimé du Footer
- **`messages/fr.json` et `messages/en.json`** : bulk replace `Finassur → Finarent` et `finassur → finarent` complété (0 occurrence restante). Email = `contact@finarent.fr`, copyright = `© 2026 Finarent`, etc.
- `vercel.json` corrigé pour plan Hobby (sla-check passé en `0 10 * * *`)

### ❌ Pas encore fait (90+ fichiers concernés)
- **Code source** : il reste des occurrences `Finassur` en dur dans plein de composants : `Header.jsx`, `Footer.jsx` (pas tout), `FirstVisitSplash.jsx`, `EspaceLoginClient.jsx`, `app/admin/*`, `app/partner/*`, `app/insurer/*`, `lib/email.js`, `lib/yousign.js`, etc. → un `grep -r "Finassur"` montre tout.
- **Auth0 claim** : `https://finassur/role` dans `middleware.ts`, `lib/auth.ts`, `lib/users.js` — à migrer vers `https://finarent/role`. **Nécessite aussi de modifier la Rule/Action sur le Auth0 Dashboard**, sinon les sessions seront cassées.
- **Emails / domaine** : SMTP_FROM est `noreply@finassur.fr` dans `.env` — à passer à `noreply@finarent.fr` côté infra.
- **GitHub repo** : actuellement `slformation-dryyss/finassur` — à renommer.
- **Domaine prod** : `finassur.fr` → `finarent.fr` (à acheter/migrer + DNS + 301 redirect).
- **Templates HTML legacy** dans `templates/` — pas critique, c'est de la spec d'origine.
- **Docs MD** : `RENAME_TO_FINARET.md`, `CAHIER_DES_CHARGES.md`, `COMPARATIF_SPEC_VS_REEL.md`, `PROJECT_STATUS.md` — historique, à nettoyer plus tard.
- **`.claude/settings*.json`** : contiennent `finassur` dans les permissions — pas critique.

### Stratégie recommandée pour finir le rebrand
```bash
# 1. Bulk replace dans le code source (préserver casses, exclure prudemment)
find . \
  -type d \( -name node_modules -o -name .next -o -name .git -o -name dist -o -name templates -o -name migrations \) -prune \
  -o -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" \) -not -name "package-lock.json" -print | xargs sed -i 's/Finassur/Finarent/g; s/finassur/finarent/g'

# 2. Vérifier qu'il ne reste rien
grep -rni "finassur" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude-dir=templates --exclude-dir=migrations

# 3. Auth0 claim — manuel : ajouter une nouvelle Action côté Dashboard qui mappe les deux claims pour ne pas casser les sessions existantes pendant la transition
```

### Pièges à éviter
- **NE PAS** renommer la base Postgres `finassur → finarent` sans synchroniser `DATABASE_URL`. C'est optionnel.
- **NE PAS** toucher aux migrations Prisma (`prisma/migrations/*.sql`) — elles contiennent `finassur` dans les commentaires mais c'est ininfluent.
- **NE PAS** supprimer `Finassurs_logo.jpeg` tant que tout le code ne le référence plus (vérifier : `grep -r "Finassurs_logo" .`).

---

## 10. Récents enrichissements (avril 2026)

### Pages publiques
- `/process` : 4 étapes timeline animée + 4 engagements + FAQ accordéon + double CTA
- `/why-leasing` : 6 avantages cards + table comparative (Achat/Crédit/Leasing) + 4 cas d'usage + CTA
- `/testimonials` : formulaire public de soumission avec modération + fetch BDD avec fallback static

### Dashboards
- **Admin** (`AdminDashboardClient.jsx`) :
  - Widget "À traiter aujourd'hui" (4 cartes urgentes : PENDING >4h, docs >7j, offres expirent <24h, offres sans réponse >48h)
  - Funnel conversion 6 étapes avec drop-off %
  - KPI : montant moyen, conversion, dossiers ce mois, délai traitement, délai signature, taux d'abandon
  - Top 5 opérateurs avec barres de perf
  - SLA alerts (déjà existant, conservé)
- **Client** (`DashboardClient.jsx`) :
  - **Composant `ActiveFileTimeline.jsx`** : 5 étapes (Dépôt → Étude → Offre → Signature → Fonds), avec dot animé sur étape courante, ligne de progression, callout next-action contextuel
  - Progress documents (KBIS/RIB/CNI/BILAN) sur chaque dossier avec bar
  - Carte "Économies fiscales estimées" (calcul ~33% IS sur dossiers signés/validés)
- **Partner** (`PartnerDashboardClient.jsx`) :
  - Funnel partner-side (Transmis → Analyse → Validés → Finalisés)
  - Top secteurs reçus + mix produits (Crédit-bail/LOA/etc. avec %)
  - Commission timeline 6 mois (stacked bars encaissé/en attente)
  - Bandeau "X dossiers à traiter"
- **Insurer** (`InsurerDashboardClient.jsx`) : passé de 5 stats brutes à un dashboard complet
  - 4 KPI (primes, prime moyenne, conversion, délai)
  - Funnel RC Pro 4 étapes
  - Top secteurs (segmentation risque)
  - Histogramme volume mensuel
  - Bandeau "X dossiers à traiter"

### Modèles + API
- **`Testimonial`** model + migration `20260425120000_testimonials/`
- API publique `/api/testimonials` (GET approved, POST submission anti-spam)
- API admin `/api/admin/testimonials` + `[id]` (CRUD + actions approve/reject/publish/unpublish)
- API `/api/notifications` pour la cloche header (status events + unread message count, header `x-last-read` pour filtrer les nouvelles)

### Composants
- **`NotificationsBell.jsx`** dans le Header global — visible uniquement quand user logged in. Badge rouge avec compteur, polling 60s, dropdown timeline, marquage lu via localStorage
- **`ActiveFileTimeline.jsx`** (espace client)

### Sécurité
- Routes cron `/api/cron/reminders` et `/api/cron/sla-check` désormais sécurisées avec `Authorization: Bearer ${CRON_SECRET}` (Vercel envoie automatiquement quand `CRON_SECRET` est en env var)

---

## 11. Configuration & déploiement

### Build commands
- **Dev** : `npm run dev` (port 3000 par défaut, on utilise 3002 dans cette session : `PORT=3002 npm run dev`)
- **Build prod (défaut, Vercel)** : `npm run build` = `prisma generate && prisma migrate deploy && next build`
- **Build prod (Clever Cloud, legacy)** : `npm run build:standalone` = `node scripts/build.js` (gère le mode standalone + copie assets)
- **Start (Vercel)** : `npm start` = `next start`
- **Start (Clever Cloud)** : `npm run start:standalone` = `node scripts/start.js`
- **`postinstall`** : `prisma generate` (auto-régénère le client après chaque `npm install`)

### Vercel (cible actuelle)
- `next.config.js` : `output: 'standalone'` retiré (Vercel n'en a pas besoin et ça ralentit le build)
- `vercel.json` : 2 crons compatibles plan Hobby
  - `/api/cron/reminders` : `0 9 * * *` (1x/jour à 9h UTC)
  - `/api/cron/sla-check` : `0 10 * * *` (1x/jour à 10h UTC)
- **Plan Hobby = 1 exécution/jour max par cron**. Si besoin d'horaire, passer Pro (~20€/mois).

### Clever Cloud (legacy)
- Variables : `CC_BUILD_COMMAND="npm run build:standalone"` + `CC_RUN_COMMAND="npm run start:standalone"`
- Endpoint healthcheck : `/api/health`

---

## 12. Variables d'environnement requises

```env
# Auth0 (REQUIS)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_SECRET=run_openssl_rand_hex_32        # 32 bytes hex
APP_BASE_URL=https://finarent.vercel.app    # ou https://finarent.fr en prod

# Database (REQUIS)
DATABASE_URL="postgresql://user:pass@host:5432/finarent"

# reCAPTCHA v3 (REQUIS pour /contact)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...

# Vercel Cron (REQUIS si crons activés)
CRON_SECRET=                                 # auto-généré par Vercel ou un secret hex 32 bytes

# Supabase Storage (optionnel — fallback local sinon)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Email SMTP (Nodemailer) (REQUIS prod)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@finarent.fr
ADMIN_EMAIL=admin@finarent.fr

# YouSign (optionnel — checkbox simple si absent)
YOUSIGN_API_KEY=...
YOUSIGN_BASE_URL=https://api.yousign.com

# Twilio SMS (optionnel — fallback console)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Sentry (optionnel)
NEXT_PUBLIC_SENTRY_DSN=

# PostHog (optionnel)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
```

---

## 13. Conventions code

- **Tous les composants client** : `'use client'` en première ligne (pas de Server Components dans les composants UI complexes pour éviter les erreurs d'hydratation framer-motion)
- **Imports** : alias `@/` configuré dans `jsconfig.json` (pointe sur racine projet)
- **Styling** : Tailwind v4. Les classes legacy `bg-gradient-to-*` sont conservées par cohérence (warnings IDE non-bloquants).
- **i18n** : tout texte UI passe par `t('clé')` depuis `useTranslation()` (`@/lib/i18n`). Verrouillé sur `fr`. Le getter supporte les clés à points (ex: `nav.solutions.creditBail`) ET la traversée d'objets imbriqués.
- **Animations** : pattern `motion.div initial="hidden" animate="visible" variants={containerVariants}` avec `staggerChildren`.
- **Auth gating** : pages admin via `app/admin/layout.jsx` (server-side `getSession()` + `isAdmin()`), pages partner/insurer via `requirePartner()/requireInsurer()` dans les API routes.
- **Pas de tests** : aucun framework de test installé. Les vérifs se font via `npm run build` (TS + lint Next).
- **Pas de Storybook**.
- **Commits** : style conventionnel (`feat:`, `fix:`, `refactor:`). Branches non utilisées — tout sur `main`.
- **Pas de comments inutiles** : seul le "WHY" non-obvie (workaround, contrainte cachée).

---

## 14. Pièges connus (gotchas)

1. **Prisma client lock sur Windows** : si tu veux régénérer le client (`npx prisma generate`) et que `next dev` tourne, ça échoue avec EPERM. **Solution** : tuer le process `next dev` avant (`taskkill //F //PID <pid>`), puis regenerate, puis relancer.
2. **Cookies async** : warning Next.js 15 sur `cookies().getAll()` dans le auth Auth0 lib — c'est dans la lib externe, ininfluent.
3. **Migrations Prisma sur build Vercel** : `prisma migrate deploy` dans le build nécessite que `DATABASE_URL` pointe vers la prod ET que la base soit accessible depuis Vercel. Si preview deploy sur PR, prévoir une env var preview-only.
4. **Cron Vercel Hobby** : limité à 1 exécution/jour par cron. Pas de schedule horaire ou hebdo multi-jours.
5. **Locale verrouillée FR** : si tu veux réactiver l'EN, il faut éditer `lib/i18n.jsx` (revenir à la version avec `setLocaleState`) ET réimporter le `LanguageSwitcher` dans `Header.jsx`. Les fichiers `messages/en.json` ne sont actuellement plus servis.
6. **Fichier `public/finarent logo.jpg`** (avec espace) : ne marche pas dans toutes les URL — utiliser uniquement `finarent-logo.jpg`.
7. **Un fichier `bash.exe.stackdump`** traîne à la racine (untracked) — restant d'un crash bash, peut être supprimé.

---

## 15. TODO restant (priorité)

### 🔴 P0 — Critiques avant prod
1. **Finir le rebrand `Finassur → Finarent`** dans le code source (~90 fichiers, voir §9)
2. **Migrer le claim Auth0** côté Dashboard + code
3. **Remplacer le logo Finassurs_logo.jpeg** partout puis le supprimer
4. **Acheter/configurer le domaine `finarent.fr`** + DNS + 301 redirect depuis `finassur.fr`
5. **Configurer Auth0 production** (callback URL, allowed logout URL pointing vers `finarent.fr`)
6. **Activer Sentry production** (DSN)
7. **Tester un parcours complet end-to-end** sur un Vercel preview avant prod

### 🟡 P1 — Importants mais non bloquants
1. **Photos réalistes** sur les pages secteurs / blog / témoignages / about (Unsplash CDN URLs ou téléchargement dans `/public`)
2. **Réenrichir le `/simulator`** avec save BDD + comparateur de taux dynamique
3. **CMS blog** (Strapi / Sanity) ou enrichir manuellement les 6 articles statiques
4. **Resend + React Email** en remplacement de Nodemailer (templates plus modulaires)
5. **Inngest** pour jobs async (vs Vercel cron) — retry natif
6. **Rate limiting Redis/Upstash** (actuellement in-memory, casse en multi-instance)
7. **Scan antivirus ClamAV** sur uploads documents

### 🟢 P2 — Polish
1. **Page `/about`** à enrichir (équipe, histoire, valeurs)
2. **Refonte visuelle du Footer** (utilisateur a demandé optimisation, j'ai fait l'i18n mais pas la restructuration — voir capture)
3. **Pages erreur** (`error.jsx`, `not-found.jsx`) à styliser
4. **Mode sombre** (variables CSS déjà présentes mais pas de toggle)
5. **PWA** (manifest + service worker)
6. **Cohorts retention** dans dashboard admin
7. **Top rejection reasons** widget (nécessite un nouveau champ `Application.rejectionReason`)

---

## 16. Commandes utiles

```bash
# Dev
PORT=3002 npm run dev                                  # Lance sur 3002
tail -f /tmp/finassur-dev.log                          # Suivre le log

# Database
npx prisma generate                                    # Régen client
npx prisma migrate dev --name <nom>                    # Nouvelle migration locale
npx prisma migrate deploy                              # Apply migrations sur prod
npx prisma studio                                      # GUI BDD

# Promote admin
node scripts/promote-admin.js andrys972@gmail.com

# Build & test
npm run build                                          # Build prod (avec migrate deploy)
npm run build:next                                     # Build prod sans migration
npm run lint                                           # ESLint Next

# Smoke tests
curl -sL -o /dev/null -w "%{http_code} %{time_total}s\n" http://localhost:3002/

# Tuer un process Next dev orphelin (Windows)
wmic process where "name='node.exe'" get ProcessId,CommandLine | grep finassur
taskkill //F //PID <pid>

# Find leftover Finassur references
grep -rni "finassur" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
```

---

## 17. Ressources externes

- **Auth0 dashboard** : tenant à confirmer, custom claim à migrer
- **Vercel project** : `slformation-dryyss/finassur` (à renommer)
- **GitHub repo** : `slformation-dryyss/finassur` (à renommer)
- **API SIRET publique** : `https://recherche-entreprises.api.gouv.fr/search` (aucune clé requise)
- **YouSign API** : v3, sandbox + prod
- **Supabase** : à provisionner pour storage prod
- **ORIAS** : immatriculation à finaliser pour activité courtage légale

---

## 18. Quick wins pour démarrer (sprint d'1 jour si reprise)

Si on reprend en 1 journée, voici l'ordre conseillé pour avancer concrètement sans casser :

1. **30 min — Cleanup rebrand** : bulk sed `Finassur → Finarent` + `finassur → finarent` dans tout le code source. Build pour valider. (Voir §9 pour la commande exacte.)
2. **20 min — Auth0 claim migration** : update `middleware.ts`, `lib/auth.ts`, `lib/users.js` pour accepter les DEUX claims temporairement (rétrocompat). Plus tard, supprimer l'ancien.
3. **30 min — Photos** : choisir une approche (Unsplash CDN URLs vs download local) et wirer les pages secteurs (5 pages = highest impact).
4. **30 min — Footer optimisation** : restructurer en 4 colonnes équilibrées, brand condensé, newsletter inline.
5. **30 min — Vercel deploy** : push, vérifier le deploy preview, ajouter les env vars.

Le reste = le P1/P2 de §15.

---

## 19. Pour l'agent qui reprend

**Ton mission, si tu l'acceptes :**
- Lis ce doc en entier avant de toucher quoi que ce soit
- Le projet est **fonctionnel à 95%** mais en plein rebrand. Vérifie toujours `git status` avant de commiter
- L'utilisateur (`andrys972@gmail.com`) communique en français, préfère les réponses concises et le tutoiement
- Il aime quand tu proposes 2-3 options ordonnées par valeur plutôt que de lui demander toujours quoi faire
- Build prod = source de vérité (vs lint qui a quelques warnings non-bloquants Tailwind v4)
- **Toujours vérifier `npm run build:next` réussi avant de dire "c'est bon"**
- Pour les modifs UI, mentionne que le hard-refresh (Ctrl+Shift+R) est nécessaire à cause du cache navigateur

**Bonne chance.**

---

*Document généré pour handoff Claude Code Desktop — avril 2026.*
