# 📘 Finarent — Project Handoff

> **Document historique, rédigé en avril 2026 et corrigé le 9 septembre 2026.**
>
> Pour démarrer sur le projet, lire **`README.md`** : c'est lui qui fait foi sur
> la pile, l'installation locale, les rôles, les scripts et l'hébergement.
> Ce document-ci garde son intérêt sur ce que le README ne couvre pas : le
> détail du modèle de données, l'inventaire des endpoints, les conventions de
> code et l'historique des choix. Les parties qui décrivaient un déploiement
> Vercel, un stockage Supabase ou un rebrand en cours ont été corrigées —
> plusieurs sont désormais redondantes avec le README.
>
> L'état réel de la dette et des chantiers en cours se lit dans
> `docs/AUDIT_2026-09.md` et `docs/PLAN_CORRECTION_2026-09.md`.

---

## 1. Identité du projet

**Finarent** est une plateforme web de courtage en financement et assurance professionnels.

- **Mission** : permettre aux entreprises (TPE/PME) de simuler, déposer, et suivre leurs demandes de financement (crédit-bail, LOA, LLD, prêt pro, leasing opérationnel) ou d'assurance RC Pro.
- **Rôle** : courtier intermédiaire entre clients et partenaires bancaires/assureurs (réseau de 30+ partenaires visé).
- **Régulation** : COBSP (Courtier en Opérations de Banque) + COA (Courtier en Assurance), immatriculation ORIAS requise.
- **Owner** : `andrys972@gmail.com` (compte admin).
- **Statut (septembre 2026)** : en production sur **Clever Cloud**, domaine `finarent.com`. Le rebrand est terminé côté code ; il ne subsiste que le claim de rôle historique `https://finassur/role`, accepté en repli le temps que l'Action Auth0 soit migrée.

---

## 2. Stack technique

| Couche | Techno | Version | Notes |
|--------|--------|---------|-------|
| Framework | Next.js | 15.5.12 (App Router) | RSC, server actions |
| React | React | 18.3.1 | + react-dom 18.3.1 |
| Styling | Tailwind CSS | v4 | `@tailwindcss/postcss` ; classes legacy `bg-gradient-to-*` toujours valides |
| Animations | Framer Motion | 12.23 | Utilisé partout pour les entrées/scroll reveal |
| Auth | Auth0 | `@auth0/nextjs-auth0` 3.5 | Custom claim `https://finarent/role` ; l'ancien `https://finassur/role` reste accepté en repli |
| ORM | Prisma | 5.22 | Postgres |
| BDD | PostgreSQL | 15 — local `localhost:5433` via `docker-compose.yml` | Addon Clever Cloud en production |
| Storage fichiers | **Cellar (S3, Clever Cloud)** | `@aws-sdk/client-s3`, repli local `/private/uploads` | `lib/storage.js`. Supabase a été abandonné, plus aucune référence dans le code |
| Email | **API Brevo**, repli SMTP (nodemailer 10) | — | Gabarits dans `lib/email/` ; `scripts/preview-emails.mjs` pour le rendu sans envoi |
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

> L'arborescence ci-dessous date d'avril 2026 : elle donne la logique de rangement,
> pas l'inventaire exact. Le dépôt a beaucoup grossi depuis (centre d'appels,
> affiliation, devis et factures, documents générés). Version à jour : `README.md` § 4.

```
finarent/                         # le dossier local porte encore l'ancien nom
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
│   └── api/                      # une centaine de Route Handlers
│       ├── admin/                # CRUD admin (demandes, users, partners, stats, etc.)
│       ├── applications/         # CRUD demandes côté client
│       ├── auth/[...auth0]/      # Auth0 handler
│       ├── cron/                 # reminders + sla-check + affiliate-purge
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
│   ├── storage.js                # Adapter Cellar S3 + fallback local
│   ├── crypto.js                 # Chiffrement AES-256-GCM (IBAN, pièces d'identité)
│   ├── auth0-management.js       # Management API : propagation du rôle vers Auth0
│   ├── scoring.js                # Pré-scoring 0-100
│   ├── webhooks.js               # Webhooks partenaires
│   └── statusMap.js              # Mapping enum Prisma ↔ statuts français legacy
├── messages/
│   ├── fr.json                   # 1600+ clés (source de vérité, locale par défaut)
│   └── en.json                   # Ne sera plus servi (lang locked fr) mais conservé
├── prisma/
│   ├── schema.prisma             # modèles (le § 4 ci-dessous n'en liste que les 13 d'avril 2026)
│   ├── migrations/               # 13 migrations, de 20260226120000_init_v2 à
│   │                             #   20260909160000_rate_limit_cron_run
│   └── dev.db                    # SQLite legacy — vestige, plus utilisé (voir docker-compose.yml)
├── public/
│   ├── finarent-logo.jpg         # Logo officiel (URL-safe)
│   ├── finarent-logo.svg         # Logo vectoriel
│   ├── finarent logo.jpg         # Original avec espace dans le nom (à supprimer)
│   ├── hero_business_team_premium_v2_*.png
│   └── solutions_leasing_concepts_*.png
├── private/uploads/              # Fichiers utilisateurs — repli local quand Cellar est absent
├── scripts/                      # Voir README.md § 5 pour la liste complète
│   ├── _guard.js                 # Garde anti-production, appelée par tous les scripts d'écriture
│   ├── build.js / start.js       # Build et démarrage Clever Cloud (standalone)
│   ├── seed-demo.js              # Jeu de démonstration
│   └── promote-admin.js          # Promote un user en ADMIN (ESM-compat)
├── tests/unit/                   # Tests Vitest (chiffrement, scoring, simulateurs, SEPA…)
├── clevercloud/                  # build.sh, cron.json, README de déploiement
├── assets/data/                  # Données statiques (sectors, solutions, testimonials, blog, assurance)
├── docker-compose.yml            # PostgreSQL 15 local, publié sur le port 5433
├── middleware.ts                 # Auth0 middleware
├── next.config.js                # `output: 'standalone'` pour Clever Cloud
├── package.json                  # build = prisma generate + next build ; build:standalone pour la prod
└── .env / .env.example           # Variables d'environnement
```

---

## 4. Modèle de données (Prisma v3.0)

> État d'avril 2026 : **13 modèles décrits, 40 dans le schéma actuel.** Les 27 autres
> couvrent la facturation (devis, factures, lignes, versements, avoirs), l'affiliation
> (affiliés, invitations, commissions, statut fiscal), les centres d'appels (centres,
> membres, interactions, prospects), le journal des emails, les documents générés,
> les demandes de signature et le registre RGPD. **`prisma/schema.prisma` fait foi.**

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

> Trois profils se sont ajoutés depuis : **manager** et **agent** de centre
> d'appels (`/call-center`, rôle porté par `CallCenterMember`, pas par
> `User.role`) et **apporteur d'affaires** (`/affiliate/[code]`, accès par code,
> sans compte Auth0). Tableau complet des sept profils : `README.md` § 3.

| Rôle | Route racine | Layout protégé | Sidebar | Fonctionnalités |
|------|--------------|----------------|---------|----------------|
| **CLIENT** (défaut) | `/espace` | Auth0 + `syncUser` | — (header global) | Dashboard avec timeline dossier actif, stat cards, dossiers list (tabs), upload docs, parrainage, profil, sécurité, messagerie. Sidebar : profile completion + advisor card + recent activity + savings card. |
| **ADMIN** | `/admin` | Auth0 + `isAdmin()` (basé sur custom claim Auth0) | `AdminSidebar` (8 entrées + Mobile nav) | Dashboard funnel + KPI + SLA + opérateurs + "À traiter aujourd'hui". Pages : demandes (liste + Kanban), users, partners, offers, faq, testimonials, logs, settings. |
| **PARTNER** | `/partner` | `requirePartner()` | Pas de sidebar dédiée | Dashboard avec stats, funnel partenaire, top secteurs reçus, mix produits, commissions timeline, applications transmises, commissions à recevoir. |
| **INSURER** | `/insurer` | `requireInsurer()` | Pas de sidebar dédiée | Dashboard RC Pro : stats, funnel souscription, top secteurs (segmentation risque), tendance mensuelle, applications, prime moyenne. |

### Auth0 claim
- Custom claim attendu : `https://finarent/role`. L'ancien namespace `https://finassur/role` reste accepté en repli dans `middleware.ts`, `lib/auth.ts` et `lib/users.js` : à retirer une fois l'Action Auth0 migrée, et **pas avant** — sinon les sessions actives portant l'ancien claim perdent leurs droits (constat `P2-4`).
- Promotion admin manuelle : `node scripts/promote-admin.js <email>`.
- **Le claim est la source de vérité du rôle**, pas la base : `syncUser()` réécrit `User.role` depuis le claim à chaque appel (constat `P1-8`).

---

## 6. API endpoints

> Inventaire d'avril 2026. Le dépôt en compte aujourd'hui **une centaine** : s'y ajoutent
> notamment `/api/admin/quotes`, `/api/admin/invoices`, `/api/admin/affiliates`,
> `/api/admin/call-centers`, `/api/admin/prospects`, `/api/webhooks/*`
> (Brevo, Stripe, Ringover) et `/api/cron/affiliate-purge`. La liste exhaustive
> se lit dans `app/api/`.

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
- `GET /api/cron/affiliate-purge` — Purge RGPD des clics d'affiliation de plus de 13 mois

---

## 7. Pages publiques (UI)

| Route | État | Notes |
|-------|------|-------|
| `/` | ✅ Complet | Hero, stats, secteurs, témoignages, CTA |
| `/contact` | ✅ Complet | Formulaire 5 étapes connecté à `/api/financement` |
| `/simulateurs/[category]` | ✅ Remplace `/simulator`, redirigé en 301 dans `next.config.js` | L'ancien composant a été supprimé (constat `P2-2`) |
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
- Vectoriels : `public/finarent-logo.svg` et `public/finarent-pastille.svg`

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

## 9. Rebrand — état au 9 septembre 2026

> Cette section décrivait un rebrand vers `Finarent` en cours. **Il est terminé côté code.**

### Fait

- Plus aucune occurrence de l'ancien nom dans `app/`, `components/`, `lib/`, `messages/`,
  `scripts/`, `public/` ni dans le schéma Prisma — hors le claim historique ci-dessous.
- Logo `public/finarent-logo.jpg` (et `finarent-logo.svg`) utilisé partout ; l'ancien logo a été supprimé.
- Interface verrouillée sur `fr` (`lib/i18n.jsx`), LanguageSwitcher retiré.
- Domaine canonique de production : **`finarent.com`**.

### Ce qui reste, volontairement

- **Le claim de rôle `https://finassur/role`**, accepté en repli dans `middleware.ts`,
  `lib/auth.ts` et `lib/users.js`. Il ne se retire qu'après migration de l'Action Auth0 ET
  vérification qu'aucun jeton actif ne le porte encore : retiré trop tôt, il déconnecte les
  sessions en cours (constat `P2-4`, action 3.5 du plan de correction).
- **Le dossier local du dépôt porte encore l'ancien nom** (`Bureau/finassur`). C'est sans
  conséquence : ne pas le renommer, plusieurs chemins absolus y font référence.

### Pièges à éviter

- **NE PAS** toucher aux migrations Prisma déjà appliquées : leur contenu est figé, commentaires compris.
- **NE PAS** relancer un remplacement global sur le nom : il ne resterait que le claim historique à casser.

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
- Routes cron `/api/cron/reminders` et `/api/cron/sla-check` sécurisées avec `Authorization: Bearer ${CRON_SECRET}` — l'en-tête est porté par les commandes `curl` de `clevercloud/cron.json` (voir § 11)

---

## 11. Configuration & déploiement

> Le projet **n'est pas déployé sur Vercel**. Il tourne sur **Clever Cloud**, et
> `vercel.json` comme `.env.vercel` ont été retirés du dépôt en septembre 2026.
> Procédure détaillée : `clevercloud/README.md` et `docs/PROCEDURES_EXPLOITATION.md`.

### Commandes de build

- **Dev** : `npm run dev` (port 3000)
- **Build** : `npm run build` = `prisma generate && next build`
- **Build Clever Cloud** : `npm run build:standalone` = `node scripts/build.js`
  (recopie `POSTGRESQL_ADDON_URI` dans `DATABASE_URL`, applique les migrations,
  construit en mode standalone, copie les assets)
- **Start Clever Cloud** : `npm run start:standalone` = `node scripts/start.js`
- **`postinstall`** : `prisma generate`
- Il n'existe **pas** de script `preview`, et le build ne produit **pas** de dossier `dist/` :
  la sortie est `.next/`, et `.next/standalone/` en mode Clever Cloud.

### Clever Cloud

- `CC_BUILD_COMMAND="npm run build:standalone"`, `CC_RUN_COMMAND="npm run start:standalone"`,
  `CC_HEALTH_CHECK_PATH=/api/health`.
- Les variables se déclarent dans la console (`clever env set`) et **ne prennent effet
  qu'au déploiement suivant** : une variable ajoutée sur une application en cours
  d'exécution ne change rien tant que le processus n'a pas redémarré.
- Le build en instance XS tombe en dépassement mémoire : prévoir une **instance de
  build dédiée de taille M**.
- Addons : PostgreSQL (injecte `POSTGRESQL_ADDON_URI`) et Cellar (injecte les
  `CELLAR_ADDON_*`, bucket `finarent-docs-kyc`).

### Crons

Déclarés dans `clevercloud/cron.json`, exécutés par la plateforme, protégés par
`CRON_SECRET` (`Authorization: Bearer`) :

| Route | Fréquence |
|---|---|
| `/api/cron/reminders` | tous les jours à 9 h |
| `/api/cron/sla-check` | toutes les 2 h |
| `/api/cron/affiliate-purge` | dimanche à 3 h |

Chaque appel utilise `curl -fsS --fail-with-body` : sans `-f`, une réponse 401
serait comptée comme un succès et l'échec resterait invisible.

---

## 12. Variables d'environnement

**`.env.example` fait foi** — il est tenu à jour avec le code et commente chaque
variable. Il est organisé en deux parties :

- **PARTIE 1 — obligatoire au démarrage** : `APP_BASE_URL`, `NEXT_PUBLIC_APP_URL`,
  `DATABASE_URL`, les six variables Auth0, `ENCRYPTION_KEY`.
- **PARTIE 2 — optionnel par intégration**, un bloc par service : Management API
  Auth0, crons, emails (Brevo puis SMTP), stockage Cellar, reCAPTCHA, Stripe,
  YouSign, Ringover, Twilio, observabilité (Sentry, PostHog, Clarity). Les blocs
  crons, emails et Cellar sont **obligatoires en production**.

Trois points de vigilance :

- **Supabase a disparu** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  et `SUPABASE_SERVICE_ROLE_KEY` ne sont plus lues nulle part. Le stockage est Cellar.
- Les variables `NEXT_PUBLIC_*` sont **figées au build** : les définir avant de déployer.
- `ENCRYPTION_KEY` ne peut plus changer une fois des données chiffrées en base, sans
  opération de re-chiffrement — les IBAN deviendraient illisibles.

---

## 13. Conventions code

- **Tous les composants client** : `'use client'` en première ligne (pas de Server Components dans les composants UI complexes pour éviter les erreurs d'hydratation framer-motion)
- **Imports** : alias `@/` configuré dans `jsconfig.json` (pointe sur racine projet)
- **Styling** : Tailwind v4. Les classes legacy `bg-gradient-to-*` sont conservées par cohérence (warnings IDE non-bloquants).
- **i18n** : tout texte UI passe par `t('clé')` depuis `useTranslation()` (`@/lib/i18n`). Verrouillé sur `fr`. Le getter supporte les clés à points (ex: `nav.solutions.creditBail`) ET la traversée d'objets imbriqués.
- **Animations** : pattern `motion.div initial="hidden" animate="visible" variants={containerVariants}` avec `staggerChildren`.
- **Auth gating** : pages admin via `app/admin/layout.jsx` (server-side `getSession()` + `isAdmin()`), pages partner/insurer via `requirePartner()/requireInsurer()` dans les API routes.
- **Tests** : Vitest est installé (`npm test`), avec des tests unitaires sur la logique pure dans `tests/unit/` (chiffrement, scoring, simulateurs, SEPA, JSON-LD). Avant de pousser : `npx tsc --noEmit`, `npm run lint` et `npm test` à zéro erreur. **Il n'y a pas encore d'intégration continue** : la vérification est manuelle.
- **Pas de Storybook**.
- **Commits** : style conventionnel (`feat:`, `fix:`, `refactor:`). Branches non utilisées — tout sur `main`.
- **Pas de comments inutiles** : seul le "WHY" non-obvie (workaround, contrainte cachée).

---

## 14. Pièges connus (gotchas)

1. **Prisma client lock sur Windows** : si tu veux régénérer le client (`npx prisma generate`) et que `next dev` tourne, ça échoue avec EPERM. **Solution** : tuer le process `next dev` avant (`taskkill //F //PID <pid>`), puis regenerate, puis relancer.
2. **Cookies async** : warning Next.js 15 sur `cookies().getAll()` dans le auth Auth0 lib — c'est dans la lib externe, ininfluent.
3. **Migrations Prisma au build Clever Cloud** : `scripts/build.js` applique `prisma migrate deploy`. Le premier déploiement après une longue interruption applique donc **toutes** les migrations accumulées : à traiter comme une mise en production, pas comme un redémarrage.
4. **Base locale sur le port 5433**, pas 5432 : un PostgreSQL natif occupe déjà 5432 sur le poste de référence. Deux bases interchangeables sur le même port sont exactement ce qui a mené à écrire sur la production depuis un poste de travail (constat `P0-1`).
5. **`DATABASE_URL` et la production** : les scripts d'écriture appellent `refuseProduction()` (`scripts/_guard.js`) et sortent en code 1 si l'URL ressemble à une base distante. Ne jamais contourner la garde pour « avoir des données réalistes » : la base contient des KYC, des pièces d'identité et des RIB réels.
6. **Limitation de débit en mémoire** (`lib/rateLimit.js`) : sans effet en multi-instance, remise à zéro à chaque déploiement.
7. **Locale verrouillée FR** : si tu veux réactiver l'EN, il faut éditer `lib/i18n.jsx` (revenir à la version avec `setLocaleState`) ET réimporter le `LanguageSwitcher` dans `Header.jsx`. Les fichiers `messages/en.json` ne sont actuellement plus servis.
8. **Fichier `public/finarent logo.jpg`** (avec espace) : ne marche pas dans toutes les URL — utiliser uniquement `finarent-logo.jpg`.

---

## 15. TODO restant (priorité)

> **La liste qui fait foi est `docs/PLAN_CORRECTION_2026-09.md`** : 21 constats d'audit,
> classés en trois lots, chacun avec sa preuve de clôture. Ce qui suit n'en garde que
> les sujets produit, que l'audit ne couvre pas.

### Réglé depuis avril 2026

Rebrand terminé, domaine `finarent.com` en service, Sentry installé (le DSN reste à
renseigner), stockage bascule sur Cellar, garde anti-production sur les scripts,
crons Clever Cloud avec échec bruyant, Vitest en place.

### Sujets produit encore ouverts

1. **Photos réalistes** sur les pages secteurs / blog / témoignages / about.
2. **Enrichir les simulateurs** (`/simulateurs/[category]`) : sauvegarde en base et
   comparateur de taux dynamique.
3. **CMS blog** (Strapi / Sanity) ou enrichissement manuel des 6 articles statiques.
4. **Scan antivirus** sur les documents déposés.
5. **Page `/about`** à enrichir (équipe, histoire, valeurs).
6. **Pages d'erreur** (`error.jsx`, `not-found.jsx`) à styliser.
7. **Mode sombre** (variables CSS présentes, pas de bascule).
8. **PWA** (manifest + service worker).
9. **Cohortes de rétention** dans le tableau de bord admin.
10. **Motifs de refus** en widget (nécessite un champ `Application.rejectionReason`).

Les sujets d'infrastructure qui figuraient ici — limitation de débit persistante,
sauvegardes testées, environnement de recette, intégration continue — sont repris
en section 5 du plan de correction, avec une charge estimée.

---

## 16. Commandes utiles

```bash
# Dev
npm run dev                                            # port 3000
docker compose up -d db                                # base locale (port 5433)
docker compose down                                    # arrêt ; -v efface aussi les données

# Base de données
npx prisma generate                                    # régénère le client
npx prisma migrate dev --name <nom>                    # nouvelle migration locale
npx prisma migrate deploy                              # applique les migrations en attente
npx prisma studio                                      # interface graphique
node scripts/seed-demo.js                              # jeu de démonstration

# Comptes
node scripts/promote-admin.js <email>                  # passe un compte en ADMIN

# Build & qualité
npm run build                                          # prisma generate + next build
npm run build:next                                     # build sans régénérer Prisma
npx tsc --noEmit                                       # typage
npm run lint                                           # ESLint
npm test                                               # Vitest

# Emails
node scripts/preview-emails.mjs                        # rendu des gabarits, sans envoi

# Sonde
curl -sL -o /dev/null -w "%{http_code} %{time_total}s\n" http://localhost:3000/api/health

# Production (Clever Cloud)
clever status                                          # état de l'application
clever env                                             # variables déclarées
clever logs --since 1h
```

---

## 17. Ressources externes

- **Auth0** : deux locataires historiques (un US, un EU) — vérifier lequel répond via `/api/auth/login` avant toute manipulation de comptes. Procédure : `AUTH0_SETUP.md`.
- **Clever Cloud** : application `finarent`, addons PostgreSQL et Cellar (bucket `finarent-docs-kyc`). Voir `clevercloud/README.md`.
- **Domaines** : `finarent.com` (canonique), `.fr` et `.org` en redirection.
- **Brevo** : emails transactionnels et marketing, plus le webhook de suivi.
- **Ringover** : téléphonie du centre d'appels (`docs/SETUP_RINGOVER.md`).
- **Stripe** : règlement des factures ; **YouSign** : signature électronique (v3, bac à sable puis production).
- **API SIRET publique** : `https://recherche-entreprises.api.gouv.fr/search` (aucune clé requise).
- **ORIAS** : immatriculation à finaliser pour l'activité de courtage.

---

## 18. Par où commencer une reprise

1. Faire tourner le projet en local en suivant **`README.md` § 2** (cinq commandes).
2. Lire **`docs/PLAN_CORRECTION_2026-09.md`** : il dit quoi faire, dans quel ordre, et
   comment prouver que c'est fait. Les lots sont séquencés, l'ordre n'est pas négociable.
3. Lire l'audit `docs/AUDIT_2026-09.md` seulement si le motif d'une action n'est pas clair.
4. Pour un geste d'exploitation (déploiement, incident, RGPD) : `docs/PROCEDURES_EXPLOITATION.md`.

---

## 19. Pour l'agent qui reprend

- **Commencer par `README.md`**, puis ce document pour le détail du modèle de données et des endpoints.
- Vérifier `git status` avant tout commit ; le dépôt travaille directement sur `main`.
- L'utilisateur communique en **français**, préfère les réponses concises et le tutoiement.
- Il attend 2-3 options ordonnées par valeur plutôt qu'une question ouverte.
- Avant d'annoncer qu'une modification est terminée : `npx tsc --noEmit`, `npm run lint`,
  `npm test`, et `npm run build:next` si le rendu est en jeu.
- Pour les modifications d'interface, signaler qu'un rechargement forcé (Ctrl+Shift+R)
  peut être nécessaire à cause du cache navigateur.

---

*Document de reprise — rédigé en avril 2026, corrigé le 9 septembre 2026 (actions 2.5 et 2.7 du plan de correction).*
