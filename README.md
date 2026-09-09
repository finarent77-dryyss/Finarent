# Finarent

Plateforme de courtage en financement et assurance professionnels : simulation,
dépôt et suivi de demandes (crédit-bail, LOA, LLD, prêt professionnel, leasing
opérationnel, RC Pro), transmission aux partenaires bancaires et assureurs,
facturation et apport d'affaires.

Application **Next.js 15 (App Router)** avec base **PostgreSQL**, identité
**Auth0**, stockage documentaire **Cellar (S3)**, hébergée sur **Clever Cloud**.

> Ce README est le point d'entrée du dépôt : il doit suffire à faire tourner
> l'application en local. Tout le reste est indexé en fin de page.

---

## 1. Pile technique

| Couche | Technologie | Où c'est branché |
|---|---|---|
| Framework | Next.js 15, App Router, React 18 | `app/`, `next.config.js` |
| Langages | JavaScript et TypeScript mêlés | `.js`/`.jsx` majoritaires, `.ts` sur l'auth et Prisma |
| Style | Tailwind CSS v4 (`@tailwindcss/postcss`) | `app/globals.css` |
| Base de données | PostgreSQL 15 | `docker-compose.yml` en local, addon Clever Cloud en production |
| ORM | Prisma 5.22 | `prisma/schema.prisma`, 13 migrations |
| Identité | Auth0 (`@auth0/nextjs-auth0` v3) | `middleware.ts`, `lib/auth.ts`, `lib/users.js` |
| Stockage fichiers | Cellar (S3, `@aws-sdk/client-s3`) | `lib/storage.js` — repli local `private/uploads/` |
| Emails | API Brevo, repli SMTP (nodemailer) | `lib/email/`, `lib/email.js` |
| Téléphonie / SMS | Ringover (nominal), Twilio (secours) | `lib/ringover/`, `lib/sms.js` |
| Signature | YouSign, repli signature interne horodatée | `lib/yousign.js` |
| Paiement | Stripe (règlement des factures) | `app/api/webhooks/stripe/` |
| Chiffrement | AES-256-GCM applicatif (IBAN, pièces) | `lib/crypto.js` |
| Observabilité | Sentry, PostHog, Microsoft Clarity | `instrumentation*.js`, `sentry.*.config.js`, `components/providers/` |
| Tests | Vitest (logique pure) | `tests/unit/` |
| Hébergement | Clever Cloud (build standalone + crons) | `clevercloud/` |

Une centaine de routes API (`app/api/**/route.js`).

---

## 2. Démarrage en cinq commandes

Prérequis : **Node.js ≥ 20** et **Docker** (pour la base locale).

```bash
npm install                    # installe et génère le client Prisma (postinstall)
cp .env.example .env           # puis renseigner la PARTIE 1 du fichier
docker compose up -d db        # PostgreSQL 15 local, publié sur le port 5433
npx prisma migrate deploy      # applique les 13 migrations sur la base neuve
npm run dev                    # http://localhost:3000
```

Facultatif, pour disposer de données à l'écran :

```bash
node scripts/seed-demo.js      # partenaires, dossiers, devis, factures, FAQ...
```

### Ce qu'il faut savoir avant la première commande

- **La PARTIE 1 de `.env.example` est le minimum vital** : URL de l'application,
  `DATABASE_URL`, les six variables Auth0 et `ENCRYPTION_KEY`. La PARTIE 2
  active une intégration par bloc ; sans elle, la fonctionnalité est inactive,
  l'application démarre quand même.
- **La base locale écoute sur le port 5433**, pas 5432 : un PostgreSQL natif
  occupe déjà 5432 sur le poste de développement de référence. C'est le port
  publié par `docker-compose.yml` et celui de `.env.example`.
- **Ne jamais pointer `DATABASE_URL` sur la base de production.** Elle contient
  des KYC, des pièces d'identité et des RIB réels ; un dump local sort ces
  données du périmètre déclaré. Les scripts d'écriture appellent
  `refuseProduction()` (`scripts/_guard.js`) et sortent en code 1 si l'URL
  ressemble à une base distante.
- **Auth0 : deux locataires historiques** (un US, un EU). Vérifier lequel
  répond en ouvrant `/api/auth/login` avant de créer des comptes. Procédure
  complète dans `AUTH0_SETUP.md`.
- Sans `CELLAR_*`, les fichiers déposés vont dans `private/uploads/`, sur le
  disque de l'instance. Acceptable en local, **jamais en production** : les
  documents y sont perdus à chaque redéploiement.

---

## 3. Rôles et espaces

Sept profils, issus de trois mécanismes distincts.

| Profil | Espace | Contrôle d'accès |
|---|---|---|
| **CLIENT** (défaut) | `/espace` — dossiers, dépôt de demande, documents, messagerie, signature, parrainage, profil | Session Auth0 |
| **ADMIN** | `/admin` — demandes, devis, factures, offres, partenaires, utilisateurs, affiliés, centres d'appels, FAQ, témoignages, journaux, réglages | Claim `admin` (middleware) + `requireAdmin()` (routes API) |
| **PARTNER** (banque, leasing) | `/partner` — dossiers transmis, commissions | Claim `partner` + `requirePartner()` |
| **INSURER** (assureur) | `/insurer` — dossiers RC Pro | Claim `insurer` + `requireInsurer()` |
| **Centre d'appels — MANAGER** | `/call-center` — pilotage du centre, équipe, statistiques | `requireCallCenterAccess()`, rôle porté par `CallCenterMember` |
| **Centre d'appels — AGENT** | `/call-center` — prospects assignés, interactions, emails | Idem, cloisonné : un agent ne voit que ses prospects |
| **Apporteur d'affaires** | `/affiliate/[code]` — statistiques publiques et onboarding fiscal | Code d'affiliation dans l'URL, **sans compte Auth0** |

Les quatre premiers sont l'énumération `Role` de Prisma
(`CLIENT | ADMIN | PARTNER | INSURER`) ; les deux rôles de centre d'appels sont
l'énumération `CallCenterMemberRole` (`MANAGER | AGENT`), portée par
l'appartenance à un centre ; l'apporteur d'affaires est le modèle `Affiliate`,
sans utilisateur associé.

**Source de vérité des rôles : le claim Auth0** `https://finarent/role`
(valeurs `admin`, `partner`, `insurer`, `client`). La colonne `User.role` en
base n'en est qu'un miroir, réécrit à chaque appel de `syncUser()`. Le claim
historique `https://finassur/role` — l'ancien nom du produit — est encore
accepté en repli dans `middleware.ts`, `lib/auth.ts` et `lib/users.js`.

Promotion d'un compte en administrateur : `node scripts/promote-admin.js <email>`.

---

## 4. Structure du dépôt

```
app/               App Router : pages publiques, espaces par rôle, api/ (une centaine de routes)
components/        Composants React, regroupés par espace (admin/, espace/, call-center/…)
lib/               Logique métier : auth, prisma, email, storage, crypto, scoring,
                   facturation, affiliation, ringover, pdf…
prisma/            schema.prisma + 13 migrations
scripts/           Outils Node : build/start Clever Cloud, seed, tests manuels
tests/unit/        Tests Vitest (chiffrement, scoring, simulateurs, SEPA, JSON-LD…)
clevercloud/       Déploiement : build.sh, cron.json, README de la plateforme
docs/              Documentation projet (index au § 8)
messages/          Textes de l'interface (fr servi, en conservé mais inutilisé)
private/uploads/   Stockage local de repli, hors dépôt
```

---

## 5. Scripts

### npm (`package.json`)

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement, port 3000 |
| `npm run build` | `prisma generate` puis `next build` |
| `npm run build:next` | Build sans régénérer le client Prisma |
| `npm run build:standalone` | Build Clever Cloud (`scripts/build.js`) |
| `npm start` | Serveur de production Next |
| `npm run start:standalone` | Démarrage Clever Cloud (`scripts/start.js`) |
| `npm test` | Tests Vitest, une passe |
| `npm run test:watch` | Tests en surveillance |
| `npm run test:coverage` | Tests avec couverture |
| `npm run lint` | ESLint (`eslint .`) |
| `npm run db:migrate` | `prisma migrate dev` — crée une migration en local |
| `npm run db:generate` | Régénère le client Prisma |

Il n'existe **pas** de script `preview`, et le build ne produit **pas** de
dossier `dist/` : la sortie est `.next/` (`.next/standalone/` en mode Clever Cloud).

### Utilitaires (`scripts/`)

| Fichier | Usage |
|---|---|
| `_guard.js` | Garde anti-production, appelée par tous les scripts qui écrivent |
| `seed-demo.js` | Jeu de démonstration complet (efface d'abord les données de démo) |
| `promote-admin.js` | Passe un compte en ADMIN |
| `preview-emails.mjs` | Rendu des gabarits d'emails, sans envoi |
| `build-livraison.mjs` | Génère les documents client HTML depuis `docs/` |
| `test-*.js` | Vérifications manuelles : E2E, upload, centres d'appels, webhook Ringover |

`test-live.js` est le seul script autorisé à lire la base réelle ; il conserve
le drapeau de contournement `--i-know-this-is-production`.

---

## 6. Tâches planifiées

Trois crons, déclarés dans `clevercloud/cron.json` et exécutés par la
plateforme. Chacun appelle une route protégée par `CRON_SECRET`
(`Authorization: Bearer`) — sans ce secret, les routes répondent 401 et
**aucune tâche ne s'exécute** (refus volontaire).

| Route | Fréquence | Objet |
|---|---|---|
| `/api/cron/reminders` | tous les jours à 9 h | relances des dossiers en attente de pièces |
| `/api/cron/sla-check` | toutes les 2 h | alertes SLA niveaux 1 à 3 |
| `/api/cron/affiliate-purge` | dimanche à 3 h | purge RGPD des clics d'affiliation (13 mois) |

---

## 7. Hébergement

**Clever Cloud** — application Node, addons PostgreSQL et Cellar.

- Build : `CC_BUILD_COMMAND=npm run build:standalone`
- Démarrage : `CC_RUN_COMMAND=npm run start:standalone`
- Sonde : `CC_HEALTH_CHECK_PATH=/api/health`
- Les variables d'environnement se déclarent dans la console (`clever env set`),
  jamais dans le dépôt. Une variable ne prend effet qu'au **déploiement suivant**.
- L'addon PostgreSQL injecte `POSTGRESQL_ADDON_URI`, que `scripts/build.js` et
  `scripts/start.js` recopient dans `DATABASE_URL`.

Le projet **n'est pas déployé sur Vercel ni Netlify** ; `vercel.json` a été
retiré du dépôt. Détail de la procédure : `clevercloud/README.md`.

---

## 8. Documentation

### Exploitation et état du projet

| Document | Contenu |
|---|---|
| `docs/PLAN_CORRECTION_2026-09.md` | **Document de travail de référence** : quoi corriger, dans quel ordre, avec la preuve de clôture |
| `docs/AUDIT_2026-09.md` | Audit technique, 21 constats |
| `docs/AUDIT_2026-09_CLIENT.md` | Le même audit, synthèse pour la direction |
| `docs/PROCEDURES_EXPLOITATION.md` | Le détail des gestes : installation, base, déploiement, exploitation courante, incidents, RGPD, git |
| `docs/PLAN_AMELIORATION.md` | Sujets produit antérieurs (SEO, accessibilité, PWA, i18n) |
| `PROJECT_HANDOFF.md` | Reprise de projet (avril 2026, corrigé) : détail du modèle de données, inventaire des endpoints, conventions de code |
| `CAHIER_DES_CHARGES.md` | Cahier des charges et état fonctionnel |

### Configuration et intégrations

| Document | Contenu |
|---|---|
| `AUTH0_SETUP.md` | Configuration Auth0 : application, Action, claim de rôle, M2M |
| `INTEGRATIONS_SETUP.md` | Brevo, reCAPTCHA, Stripe |
| `docs/SETUP_RINGOVER.md` | Téléphonie Ringover |
| `docs/INTEGRATION_CALL_CENTER_SL_FORMATIONS.md` | Raccordement du centre d'appels externe |
| `clevercloud/README.md` | Déploiement Clever Cloud |
| `docs/CHARTE_EMAIL.md` | Charte des emails transactionnels |
| `docs/PROPOSITION_EMAIL_IA.md` | Proposition d'une plateforme email centralisée |

### Recette et usage

| Document | Contenu |
|---|---|
| `docs/PLAN_TEST.md` | Plan de test |
| `docs/TESTS_LISTE_COMPLETE.md` | Les 263 cas de recette |
| `docs/DOSSIER_TESTS_EQUIPE.md` | Prise en main et tests pour l'équipe |
| `docs/TESTS_CLIENT.md` · `docs/TESTS_DEBUTANT.md` | Recette côté client, dont une version pour débutants |
| `docs/TUTORIEL_UTILISATION.md` | Utilisation de la plateforme |
| `DEMANDES_FINANCEMENT.md` | Le parcours de demande, pas à pas |
| `docs/QUESTIONS_CLIENT.md` | Points en attente d'arbitrage client |
| `CLAUDE_DESIGN_BRIEF.md` | Brief de design |

`docs/client/` et `docs/livraison-client/` sont exclus du versionnement.

---

## 9. Conventions

- **Français** partout : interface, documentation, commentaires. Le produit
  s'appelle **Finarent** ; « Finassur » est l'ancien nom, conservé uniquement
  dans le claim de rôle historique, le temps de la transition.
- Interface verrouillée sur la locale `fr` (`lib/i18n.jsx`).
- Composants interactifs en `'use client'` ; alias d'import `@/` vers la racine.
- Style de commit conventionnel (`feat:`, `fix:`, `docs:`…), tout sur `main`.
- Avant de pousser : `npx tsc --noEmit`, `npm run lint` et `npm test` doivent
  rester à zéro erreur. Il n'y a **pas encore d'intégration continue** — cette
  vérification est manuelle.

---

*Projet privé et propriétaire.*
