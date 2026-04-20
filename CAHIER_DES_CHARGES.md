# Finassur — Cahier des charges & État du projet

> **Version** : 4.0 (Phase 4 terminée)
> **Dernière mise à jour** : avril 2026

---

## 1. Présentation du projet

### 1.1 Contexte

**Finassur** est une plateforme SaaS de courtage en financement professionnel et assurance destinée aux TPE/PME françaises. Elle met en relation les entreprises avec des partenaires bancaires, assureurs et organismes de leasing pour obtenir des solutions de financement (crédit-bail, LOA, LLD, prêt pro) et d'assurance (RC Pro).

### 1.2 Objectifs métier

- **Simplifier** la demande de financement pour les professionnels (parcours en 48h)
- **Centraliser** les dossiers client/partenaire/assureur sur une plateforme unique
- **Automatiser** les échanges de documents, notifications, relances
- **Tracer** tout le cycle de vie d'un dossier (audit trail complet)

### 1.3 Cibles utilisateurs

| Rôle | Description | Accès |
|------|-------------|-------|
| **CLIENT** | Dirigeant TPE/PME recherchant un financement | `/espace` |
| **ADMIN** | Courtier Finassur qui instruit les dossiers | `/admin` |
| **PARTNER** | Banque / organisme de leasing partenaire | `/partner` |
| **INSURER** | Compagnie d'assurance | `/insurer` |

---

## 2. Stack technique

### 2.1 Frontend

- **Framework** : Next.js 15.5 (App Router)
- **Language** : JavaScript + TypeScript (mixte)
- **UI** : React 18.3, Tailwind CSS v4
- **Animations** : Framer Motion 12
- **Formulaires** : React Hook Form + Zod
- **Icons** : Font Awesome 6.4 (CDN)

### 2.2 Backend

- **Runtime** : Next.js API Routes (Node.js)
- **Base de données** : PostgreSQL
- **ORM** : Prisma 5.22
- **Auth** : Auth0 (`@auth0/nextjs-auth0` v3.5)
- **Emails** : Nodemailer (SMTP)
- **Storage** : Local `/private/uploads` (migration Supabase Storage prévue)
- **Sécurité** : reCAPTCHA v3, rate-limiting (in-memory)

### 2.3 Intégrations externes

- **Auth0** — Authentification + custom claim `https://finassur/role`
- **Supabase** — Storage fichiers (configuré, non actif)
- **Google reCAPTCHA v3** — Protection formulaires
- **SMTP** — Envoi emails transactionnels
- **Vercel Cron** — Tâches planifiées (relances automatiques)

### 2.4 Déploiement

- **Plateforme** : Clever Cloud (mode standalone Next.js)
- **Build** : `scripts/build.js` personnalisé
- **Start** : `scripts/start.js` personnalisé
- **Healthcheck** : `/api/health`

---

## 3. Charte graphique

### 3.1 Palette de couleurs

| Nom | Hex | Usage |
|-----|-----|-------|
| **Primary** | `#0A2540` | Titres, texte principal, backgrounds sombres |
| **Secondary** | `#6366F1` | Actions principales, liens, accents (indigo) |
| **Accent** | `#10B981` | Succès, CTA positifs (emerald) |
| **Slate** | 50–900 | Gris neutres, textes secondaires |
| **Red** | - | Erreurs, statuts refusés |
| **Emerald** | - | Validations, statuts complétés |

**Règle stricte** : aucune autre couleur Tailwind (amber, orange, purple, cyan, teal, sky, blue, violet, pink, rose, yellow, indigo-*) n'est autorisée dans le code. ✅ 0 violation actuellement.

### 3.2 Typographie

- **Font** : Inter (400, 500, 600, 700, 800, 900)
- **Hiérarchie** : font-black pour titres, font-bold pour sous-titres, font-medium pour corps

### 3.3 Composants utilitaires

Définis dans `app/globals.css` :
- `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.input-field`
- `.premium-card`, `.glass`
- `.gradient-text`, `.gradient-bg`
- `.section-padding`, `.container-custom`

---

## 4. Modèle de données (Prisma)

### 4.1 Enums

```prisma
enum Role { CLIENT, ADMIN, PARTNER, INSURER }
enum ProductType { PRET_PRO, CREDIT_BAIL, LOA, LLD, LEASING_OPS, RC_PRO }
enum PartnerType { BANK, INSURANCE, LEASING }
enum ApplicationStatus {
  PENDING, REVIEWING, DOCUMENTS_NEEDED, QUOTE_SENT, QUOTE_ACCEPTED,
  PENDING_SIGNATURE, SIGNED, TRANSMITTED, APPROVED, REJECTED, COMPLETED
}
enum DocumentType { KBIS, RIB, CNI, BILAN, CONTRAT, AUTRE }
```

### 4.2 Modèles principaux

| Modèle | Description |
|--------|-------------|
| `User` | Utilisateur (lié à Auth0 via auth0Id) avec rôle et éventuellement partnerId |
| `Partner` | Banque / Assureur / Leaseur avec type, contactEmail, isActive |
| `Application` | Dossier de financement avec statut, montant, durée, documents, historique |
| `Document` | Fichier uploadé lié à une application (KBIS, RIB, etc.) |
| `Message` | Message dans le fil de discussion d'un dossier |
| `StatusHistory` | Audit trail des changements de statut |
| `Commission` | Commission partenaire liée à un dossier |
| `Newsletter` | Abonnés newsletter |
| `FAQ` | Questions/réponses gérées dynamiquement par l'admin |
| `Referral` | Parrainage (referrer, refereeEmail, status, code unique) |

### 4.3 Relations

- `User` ↔ `Application` (1:N, un user a plusieurs dossiers)
- `User` ↔ `Partner` (N:1, un user PARTNER est lié à un partenaire)
- `Application` ↔ `Document` (1:N, cascade delete)
- `Application` ↔ `Message` (1:N, cascade delete)
- `Application` ↔ `StatusHistory` (1:N, cascade delete)
- `Application` ↔ `Commission` (1:N, cascade delete)
- `User` ↔ `Referral` (1:N, via `referrer`)

---

## 5. Fonctionnalités implémentées

### 5.1 Pages publiques (15)

| Route | Description | Statut |
|-------|-------------|--------|
| `/` | Accueil (hero, stats, secteurs, témoignages, process) | ✅ |
| `/about` | Présentation de Finassur | ✅ |
| `/assurance` | Solutions d'assurance RC Pro | ✅ |
| `/blog` + `/blog/[id]` | Articles de conseil (6 articles) | ✅ |
| `/comparateur` | Comparateur de solutions (slider, tableau, recommandation) | ✅ |
| `/contact` | Formulaire de demande (financement / assurance) | ✅ |
| `/faq` | FAQ dynamique (fetch API avec fallback i18n) | ✅ |
| `/legal`, `/privacy`, `/terms` | Mentions légales, CGU, confidentialité | ✅ |
| `/process` | Processus de financement | ⚠️ Stub |
| `/sectors` + `/sectors/[id]` | 8 secteurs (BTP, médical, IT, transport, industrie, agriculture, retail, restauration) | ✅ |
| `/simulator` | Simulateur de mensualités | ✅ |
| `/solutions` + `/solutions/[id]` | 6 solutions (crédit-bail, LOA, LLD, prêt pro, leasing ops, sur-mesure) | ✅ |
| `/testimonials` | Avis clients (6 témoignages) | ✅ |
| `/why-leasing` | Avantages du leasing | ⚠️ Stub |

### 5.2 Espace Client (`/espace`)

| Route | Fonctionnalité | Statut |
|-------|----------------|--------|
| `/espace` | Dashboard avec stats (total, en attente, en cours, finalisés), onglets filtres, actions rapides, complétude profil | ✅ |
| `/espace/demande` | **Wizard 5 étapes** (type → projet → entreprise → contact → récap) | ✅ |
| `/espace/[id]` | Détail dossier : infos, documents, amortissement, messagerie, signature, checklist docs, export PDF | ✅ |
| `/espace/profile` | Édition profil (nom, téléphone, entreprise, forme juridique) | ✅ |
| `/espace/notifications` | Timeline des changements de statut + messages non lus | ✅ |
| `/espace/parrainage` | Système de parrainage (invite, lien partageable, suivi, stats) | ✅ |
| `/espace/security` | Sécurité compte (dernière connexion, conseils 2FA) | ✅ |

### 5.3 Espace Admin (`/admin`)

| Route | Fonctionnalité | Statut |
|-------|----------------|--------|
| `/admin` | Dashboard analytics (stats gradient, tendance mensuelle, top secteurs, KPIs) | ✅ |
| `/admin/demandes` | Liste + gestion des dossiers (changement de statut, notes, documents) | ✅ |
| `/admin/users` | Gestion utilisateurs (search, filtre par rôle, changement rôle) | ✅ |
| `/admin/partners` | CRUD partenaires (nom, type, email, notes, isActive) | ✅ |
| `/admin/logs` | Logs d'activité (StatusHistory) avec filtres date/recherche | ✅ |
| `/admin/faq` | **FAQ CRUD dynamique** (catégories, ordre, activation) | ✅ |
| `/admin/settings` | Paramètres (infos, toggles notifications, info système) | ✅ |
| Export CSV | `/api/admin/export?format=csv` téléchargeable | ✅ |

### 5.4 Espace Partenaire (`/partner`)

| Route | Fonctionnalité | Statut |
|-------|----------------|--------|
| `/partner` | Dashboard KPI (stats, commissions, performance, graphiques 6 mois) | ✅ |
| `/partner/applications` | Liste des dossiers transmis | ✅ |
| `/partner/commissions` | Détail commissions avec filtres (PENDING / PAID) | ✅ |
| Webhooks | Système de webhooks configurable par admin | ✅ |

### 5.5 Espace Assureur (`/insurer`)

| Route | Fonctionnalité | Statut |
|-------|----------------|--------|
| `/insurer` | Dashboard (demandes RC Pro, stats) | ✅ |
| `/insurer/applications` | Gestion des demandes d'assurance (REVIEWING → QUOTE_SENT → APPROVED/REJECTED) | ✅ |

### 5.6 Authentification & Sécurité

- ✅ Auth0 login/logout (Next.js 15 async params compatible)
- ✅ Custom claim `https://finassur/role` → mapping rôle Prisma
- ✅ Middleware de protection par rôle (`/admin`, `/partner`, `/insurer`, `/espace`)
- ✅ Helpers `requireAuth`, `requireAdmin`, `requirePartner`, `requireInsurer`
- ✅ Rate limiting sur `/api/financement` (5 requêtes/heure/IP, in-memory)
- ✅ reCAPTCHA v3 sur formulaires publics
- ✅ Validation SIREN, email, téléphone
- ✅ Cache headers private sur documents servis
- ✅ Ownership check sur dossiers/documents

### 5.7 Notifications & Emails

- ✅ Email de confirmation à la soumission d'une demande
- ✅ Email d'alerte admin à la nouvelle demande
- ✅ Templates HTML Nodemailer
- ✅ Cron de relances automatiques :
  - Documents manquants > 7 jours → relance
  - Dossiers PENDING > 3 jours → relance
- ⚠️ Email à chaque changement de statut : **à implémenter**
- ⚠️ Notifications push / in-app : **à implémenter**

### 5.8 Internationalisation

- ✅ Système i18n maison (`lib/i18n.jsx` avec LanguageProvider)
- ✅ Persistance localStorage (`finassur_lang`)
- ✅ FR (620+ clés) et EN (620+ clés)
- ✅ LanguageSwitcher dans le Header
- ⚠️ Espaces admin/partner/insurer : partiellement en FR hardcodé

### 5.9 Infrastructure

- ✅ Loading skeletons (`/espace`, `/admin`, `/partner`, `/insurer`)
- ✅ Error boundaries (root + admin)
- ✅ Not-found page 404
- ✅ Healthcheck `/api/health`
- ✅ Cron Vercel configuré (`/api/cron/reminders`)
- ✅ Standalone mode Next.js (Clever Cloud)

---

## 6. API REST (38 endpoints)

### 6.1 Publics

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/health` | GET | Healthcheck |
| `/api/financement` | POST | Soumettre une demande (rate-limited, reCAPTCHA) |
| `/api/newsletter` | POST | Inscription newsletter (DB save) |
| `/api/faq` | GET | FAQ publique (active uniquement) |

### 6.2 Auth

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/[...auth0]` | GET/POST | Handler Auth0 |
| `/api/auth/sync-user` | POST | Sync user Auth0 → DB |

### 6.3 Client (auth required)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/applications` | GET | Liste des dossiers du user |
| `/api/applications/[id]` | GET | Détail dossier |
| `/api/applications/[id]/pdf` | GET | HTML imprimable du récap |
| `/api/applications/[id]/sign` | POST | Signature électronique |
| `/api/documents/upload` | POST | Upload document |
| `/api/documents/file/[id]` | GET | Servir document (auth + ownership) |
| `/api/messages` | GET/POST | Messagerie dossier |
| `/api/profile` | GET/PATCH | Profil utilisateur |
| `/api/referrals` | GET/POST | Parrainage |

### 6.4 Admin (requireAdmin)

| Endpoint | Méthodes | Description |
|----------|----------|-------------|
| `/api/admin/demandes` | GET | Liste tous les dossiers |
| `/api/admin/demandes/[id]` | PATCH | Update statut + notes (+ statusHistory) |
| `/api/admin/users` | GET | Liste utilisateurs |
| `/api/admin/users/[id]` | PATCH | Update rôle / partnerId |
| `/api/admin/partners` | GET/POST | Liste / créer partenaire |
| `/api/admin/partners/[id]` | PATCH/DELETE | Update / supprimer partenaire |
| `/api/admin/stats` | GET | KPIs (stats, tendances, top secteurs) |
| `/api/admin/logs` | GET | StatusHistory avec filtres |
| `/api/admin/export` | GET | Export CSV |
| `/api/admin/newsletter` | GET | Liste abonnés |
| `/api/admin/webhooks` | GET/POST | Config webhooks partenaires |
| `/api/admin/faq` | GET/POST | FAQ CRUD |
| `/api/admin/faq/[id]` | PATCH/DELETE | FAQ update / delete |

### 6.5 Partenaire (requirePartner)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/partner/applications` | GET | Dossiers transmis au partenaire |
| `/api/partner/stats` | GET | KPIs partenaire |
| `/api/partner/commissions` | GET | Commissions détaillées |

### 6.6 Assureur (requireInsurer)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/insurer/applications` | GET/PATCH | Dossiers RC_PRO + update statut |
| `/api/insurer/stats` | GET | KPIs assureur |

### 6.7 Cron

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/cron/reminders` | GET | Relances automatiques (docs 7j, pending 3j) |

---

## 7. Parcours utilisateur type

### 7.1 Nouveau client

```
Homepage → Splash (choix Financement/Assurance) → /contact (formulaire simple)
   OU
Homepage → /simulator → CTA → /contact
   OU
Homepage → /comparateur → Choisir solution → /contact
   ↓
Soumission → email confirmation → création anonyme en DB (si non connecté)
   ↓
(Plus tard) Auth0 signup/login → sync user → auto-link demandes anonymes par email
   ↓
/espace → Dashboard → gestion dossier + upload documents + messagerie
```

### 7.2 Client existant

```
Login → /espace → "Nouvelle demande" → /espace/demande (wizard 5 étapes)
   ↓
Soumission → statut PENDING → notification admin
   ↓
Upload documents manquants si nécessaire
   ↓
Réception devis → signature électronique (/espace/[id])
   ↓
Transmission au partenaire → approbation → COMPLETED
```

### 7.3 Admin

```
Login admin → /admin → Dashboard KPIs
   ↓
/admin/demandes → instruire dossier (changement statut + notes)
   ↓
Transmettre au partenaire (status TRANSMITTED + partnerId)
   ↓
Webhook déclenché → partenaire notifié
   ↓
Attente retour partenaire → statut final
```

---

## 8. État actuel du projet

### 8.1 Phases terminées

| Phase | Date | Contenu |
|-------|------|---------|
| **Phase 1** | Fév 2026 | Schema Prisma v1, auth Auth0, pages publiques |
| **Phase 2** | Fév 2026 | Schema v2, API applications, espace client, emails Nodemailer |
| **Phase 3** | Mars 2026 | Dashboards complets (4 rôles), i18n, pages enrichies, charte graphique |
| **Phase 4** | Avril 2026 | Wizard, amortissement, messagerie, signature, PDF, comparateur, parrainage, FAQ dynamique, webhooks, cron, analytics |

### 8.2 Dernier commit

```
81c8528 feat: Phase 4 - Features complètes inspirées banque/assurance
```

### 8.3 Statistiques code

- **53 routes** (pages + API)
- **38 endpoints API**
- **60+ composants React**
- **1600+ clés i18n** (FR + EN)
- **10 modèles Prisma**
- **0 couleur hors charte**

---

## 9. Ce qui reste à faire

### 9.1 Bloquants avant production

| Priorité | Tâche | Effort |
|----------|-------|--------|
| 🔴 **P0** | Migration Prisma en production (`prisma migrate deploy`) pour tous les modèles (FAQ, Referral, Newsletter, lastLoginAt) | 1h |
| 🔴 **P0** | Brancher Supabase Storage pour les uploads (actuellement local, incompatible Vercel/multi-instance) | 4h |
| 🔴 **P0** | Rate limiting Redis/Upstash (actuellement in-memory, non partagé entre instances) | 2h |
| 🔴 **P0** | Configurer Auth0 en production (tenant + Rules/Actions pour custom claim) | 2h |
| 🔴 **P0** | Variables d'environnement production (`.env`) | 1h |
| 🔴 **P0** | Push Git remote (actuellement échec) | 15 min |
| 🔴 **P0** | Domaine + SSL (Clever Cloud ou Vercel) | 2h |

### 9.2 Features importantes

| Priorité | Tâche | Effort |
|----------|-------|--------|
| 🟡 **P1** | Emails transactionnels sur changement de statut (notifier le client) | 3h |
| 🟡 **P1** | Page `/process` complète (actuellement stub) | 2h |
| 🟡 **P1** | Page `/why-leasing` complète (actuellement stub) | 2h |
| 🟡 **P1** | Contenu blog enrichi (6 → 15+ articles) | 1 jour |
| 🟡 **P1** | Témoignages plus variés (réalistes, notes 4/5 pas que 5/5) | 2h |
| 🟡 **P1** | Vérification SIREN via API INSEE / Pappers | 4h |
| 🟡 **P1** | Signature électronique avancée (YouSign intégration réelle) | 1 jour |
| 🟡 **P1** | i18n admin/partner/insurer (actuellement FR hardcodé) | 1 jour |

### 9.3 Améliorations UX

| Priorité | Tâche | Effort |
|----------|-------|--------|
| 🟢 **P2** | Notifications in-app (cloche avec compteur) | 3h |
| 🟢 **P2** | Preview documents (PDF viewer inline) | 4h |
| 🟢 **P2** | Drag & drop pour l'upload de documents | 2h |
| 🟢 **P2** | Mode sombre (dark mode) | 1 jour |
| 🟢 **P2** | PWA (manifest + service worker) | 1 jour |
| 🟢 **P2** | Page erreur 500 personnalisée | 1h |

### 9.4 Features business supplémentaires

| Priorité | Tâche | Effort |
|----------|-------|--------|
| 🔵 **P3** | Tableau de bord KPI admin avec graphiques avancés (Recharts) | 1 jour |
| 🔵 **P3** | Export PDF avancé (librairie comme pdfkit / Puppeteer) | 1 jour |
| 🔵 **P3** | Système de rendez-vous (Calendly-like) | 2 jours |
| 🔵 **P3** | Chat en direct (support) | 2 jours |
| 🔵 **P3** | Module CRM (tags, segmentation clients) | 3 jours |
| 🔵 **P3** | Application mobile (React Native) | 2 semaines |

### 9.5 Technique / DevOps

| Priorité | Tâche | Effort |
|----------|-------|--------|
| 🟡 **P1** | Tests unitaires (Vitest/Jest) - **actuellement 0 test** | 1 semaine |
| 🟡 **P1** | Tests E2E (Playwright) | 1 semaine |
| 🟡 **P1** | CI/CD GitHub Actions | 1 jour |
| 🟡 **P1** | Monitoring (Sentry pour erreurs, Plausible pour analytics) | 4h |
| 🟡 **P1** | Logs structurés (Pino/Winston) | 2h |
| 🟡 **P1** | Backup automatique DB | 2h |
| 🟡 **P1** | Documentation API (Swagger/OpenAPI) | 1 jour |

### 9.6 Conformité & Légal

| Priorité | Tâche | Effort |
|----------|-------|--------|
| 🔴 **P0** | Conformité RGPD (bannière cookies, politique confidentialité vérifiée par juriste) | 2 jours |
| 🔴 **P0** | Mentions légales à jour (SIRET Finassur, hébergeur, DPO) | 1h |
| 🔴 **P0** | Immatriculation ORIAS (courtier en financement + assurance) | Externe |
| 🟡 **P1** | Droit à l'oubli (suppression compte utilisateur) | 4h |
| 🟡 **P1** | Export données utilisateur (portabilité) | 4h |

---

## 10. Variables d'environnement requises

```env
# Auth0
AUTH0_DOMAIN=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
AUTH0_BASE_URL=

# Database
DATABASE_URL="postgresql://..."

# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Supabase Storage (à activer)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@finassur.fr
ADMIN_EMAIL=admin@finassur.fr

# Signature (à activer)
YOUSIGN_API_KEY=
YOUSIGN_BASE_URL=
```

---

## 11. Roadmap estimée

### Sprint 1 (1 semaine) — Mise en production

- [ ] Corriger remote Git + push Phase 4
- [ ] Appliquer migrations Prisma en prod
- [ ] Activer Supabase Storage
- [ ] Configurer Auth0 production
- [ ] Configurer cron Vercel
- [ ] DNS + SSL
- [ ] Emails SMTP production
- [ ] Test end-to-end en staging

### Sprint 2 (1 semaine) — Polish & Conformité

- [ ] Finaliser pages stubs (process, why-leasing)
- [ ] Enrichir contenu blog + témoignages
- [ ] Emails transactionnels sur changement statut
- [ ] Vérification SIREN API
- [ ] Bannière cookies + RGPD
- [ ] Mentions légales complètes

### Sprint 3 (1 semaine) — Tests & Monitoring

- [ ] Tests unitaires critiques (auth, API applications, messages)
- [ ] Tests E2E parcours principaux
- [ ] Sentry + monitoring
- [ ] CI/CD GitHub Actions
- [ ] Documentation API

### Sprint 4+ (selon priorités business)

- Mode sombre, PWA, CRM, application mobile, etc.

---

## 12. Contacts & ressources

| Ressource | Lien / Info |
|-----------|-------------|
| Repo Git | `slformation-dryyss/finassur` (à reconfigurer) |
| Email contact | contact@finassur.fr (placeholder) |
| Email admin | admin@finassur.fr (placeholder) |
| Domaine prod | finassur.fr (à configurer) |
| Plan de renommage | [RENAME_TO_FINARET.md](RENAME_TO_FINARET.md) |

---

**Document généré automatiquement à partir de l'état du code à la date du commit `81c8528`.**
