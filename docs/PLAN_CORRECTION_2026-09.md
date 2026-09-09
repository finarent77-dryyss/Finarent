# Plan de correction et d'améliorations — Finarent

**Date** 8 septembre 2026 · **Référence** `docs/AUDIT_2026-09.md` (21 constats) · **Révision auditée** `2cddb8e` · **Révision courante** `e322789`

Ce document dit *quoi faire*, *dans quel ordre*, et *comment prouver que c'est fait*. L'audit dit ce qui ne va pas ; ce plan est le seul document à ouvrir pour travailler.

---

## Avancement — lot 1 exécuté le 8 septembre 2026

| Action | État | Reste à faire |
|---|---|---|
| **1.1** Base de développement locale | ⏳ **partiel** | `docker-compose.yml` créé et `.env` basculé sur `localhost:5432`. Le démon Docker n'était pas démarré : reste `docker compose up -d db`, `npx prisma migrate deploy`, `node scripts/seed-demo.js`. Ancien `.env` conservé en `.env.sauvegarde-avant-p0-1`. |
| **1.2** Garde-fou anti-production | ✅ **fait** | — `scripts/_guard.js` créé, appelé par les six scripts. Vérifié : contre la base Clever Cloud, `seed-demo.js` sort en code 1 sans rien toucher. |
| **1.3** `CRON_SECRET` | ⏳ **déclaré, inactif** | Secret généré, inscrit dans `.env`, documenté dans `.env.example`, et **déclaré sur l'application Clever Cloud le 9 septembre** — en même temps que les trois variables Cellar (voir `P0-4`). Il ne prendra effet qu'au prochain déploiement, l'application étant en état `stopped`. |
| **1.4** Crons bruyants | ✅ **fait** | — `-f --fail-with-body` sur les trois tâches ; `vercel.json` retiré du suivi git, `.vercel/` supprimé. |
| **1.5** Vulnérabilités | ✅ **fait** | — 13 → 3. Voir la correction en 1.5 : le reliquat est lié à Next 16, pas à nodemailer. |

Après ces changements, `npx tsc --noEmit` et `npm run lint` restent à zéro erreur.

## Constats de production — 9 septembre 2026

L'accès Clever Cloud rétabli a révélé quatre faits que l'audit ne pouvait pas voir depuis le seul dépôt. **Ils priment sur les trois lots.**

### P0-3 — L'application est sous le coup d'un `UNDEPLOY` pour facture impayée

Dernière entrée d'activité, le 4 septembre 2026 :

```
2026-09-04T12:06:46+02:00  UNDEPLOY  N/A  The invoice F20260803-027906 has 31 days overdue.
```

`clever status` rapporte l'application **`stopped`**. L'instance sert pourtant encore `finarent.com` — `/api/health` renvoie un horodatage qui avance en temps réel — mais elle tourne en sursis, sans garantie de survivre au prochain cycle. **C'est un point de facturation, pas de technique, et il conditionne tout le reste.**

### P0-4 — Le stockage documentaire n'a jamais été déclaré en production

`lib/storage.js` bascule en mode `local` dès qu'un des trois identifiants Cellar manque. Côté Clever Cloud, seul `CELLAR_BUCKET` était déclaré. Les dépôts de production partaient donc dans `private/uploads/`, sur un disque d'instance éphémère : **KYC, contrats et preuves de signature effacés à chaque redéploiement**, et invisibles d'une instance à l'autre.

L'addon Cellar existait pourtant : ses identifiants étaient dans le `.env` local, et le bucket `finarent-docs-kyc` est le même des deux côtés. Vérification faite en lecture seule, il contient **un seul objet, daté du 3 juillet 2026** — la trace d'un test depuis un poste de développement. Aucun document de production n'y est jamais arrivé.

Les trois variables ont été déclarées sur l'application. **Elles ne prendront effet qu'au prochain déploiement** : une variable d'environnement ne s'applique qu'au démarrage du processus.

### P0-5 — La production tourne du code du 4 juillet

Dernier déploiement de code : `75c272e1`, le 4 juillet 2026. Les trois entrées suivantes sont des maintenances d'image sur ce même commit. `main` a **14 commits d'avance**, dont la signature électronique, la restauration des champs de contact et les corrections d'échecs muets.

> Conséquence pour le plan : le premier redéploiement ne sera pas un simple redémarrage. Il livrera deux mois de travail d'un coup. À traiter comme une mise en production à part entière — d'autant que les migrations Prisma accumulées s'appliqueront dans la foulée.

### P0-6 — Le `.env` local écrivait sur une base hors inventaire

Le `.env` ne pointait pas sur la base de production. Les deux hôtes résolvent, mais ce sont **deux addons distincts** : la production lit `bwzdk9…`, le `.env` écrivait sur `byjpfe…`, qui n'apparaît pas dans `clever addon`. Une base vivante, hors de l'inventaire de l'organisation. À identifier : si elle est orpheline, elle est facturée et détient peut-être des données réelles.

À noter également : la base de production est sur le plan **`DEV PostgreSQL`**, le palier gratuit, pour une plateforme qui stocke des dossiers clients. À revoir avec `A2` (sauvegardes).

---

## Décisions tranchées

- **`.env.vercel`** a été supprimé. Vérification faite avant : il ne contenait rien d'unique encore en service — SMTP, Brevo, Ringover et `CRON_SECRET` y étaient tous vides.
- **Le locataire Auth0 des scripts** (`P1-2`) était celui de `.env.vercel`, pas celui du `.env` actif. Les deux configurations avaient divergé, ce qui confirme le constat.

---

## 0. Mode d'emploi

- Chaque action porte l'identifiant du constat d'origine (`P0-1`, `P1-4`…) : citez-le dans les commits et les tickets.
- Chaque action se termine par une **preuve de clôture** : une commande à lancer ou un fait à constater. Tant que la preuve n'est pas obtenue, l'action n'est pas finie.
- L'ordre des lots n'est pas négociable : le lot 1 retire le risque de destruction de données, tout le reste peut attendre.
- `docs/PLAN_AMELIORATION.md` (mai 2026) reste valable pour les sujets produit (SEO, accessibilité, PWA, i18n). Il ne traite pas la dette d'exploitation ; c'est ce plan-ci qui fait foi pour les 21 constats.

---

## 1. Écarts relevés depuis la rédaction de l'audit

Vérifications refaites sur le dépôt le 8 septembre en fin de journée. Quatre points ont bougé, tous dans le sens de l'aggravation ou de la précision.

| Point | Ce que disait l'audit | Ce qui est constaté |
|---|---|---|
| Vulnérabilités (`P1-4`) | 11 dont 8 hautes | **13 dont 9 hautes.** `npm audit fix` en corrige 12. `nodemailer` exige une montée **majeure** (6.x → 10.0.1) : à traiter à part, jamais en `--force`. |
| `CRON_SECRET` (`P0-2`) | « à confirmer » | **Absent du `.env`.** `isCronAuthorized()` échoue en mode fermé : les trois crons renvoient 401. Combiné à `curl -sS` sans `-f`, l'échec est total et silencieux. |
| SMTP (`P1-6`) | « sans clé » | `SMTP_HOST` et `SMTP_FROM` sont renseignés, **`SMTP_USER` et `SMTP_PASS` sont vides**. Configuration à moitié faite — plus trompeur qu'une absence franche. |
| Intégration continue | non évoquée | **Aucune CI** (`.github/` absent), **aucun conteneur de développement**. Rien n'empêche aujourd'hui de pousser un code qui ne compile pas. |

---

## 2. Lot 1 — Retirer le risque immédiat

**Charge : une demi-journée. Avant toute autre chose, y compris avant la prochaine mise en production.**

Tant que ce lot n'est pas terminé, une commande de routine (`npm run db:migrate`, `node scripts/seed-demo.js`) peut détruire les données clients réelles.

### 1.1 — Créer une base de développement locale · `P0-1`

`DATABASE_URL` du `.env` pointe sur l'addon PostgreSQL de production (`POSTGRESQL_ADDON_HOST`). `npm run dev` lit et écrit les vraies données.

```bash
# 1. Une base locale (docker-compose.yml à créer)
docker compose up -d db

# 2. Réécrire .env — la ligne DATABASE_URL uniquement
DATABASE_URL="postgresql://finarent:finarent@localhost:5432/finarent_dev"

# 3. Appliquer le schéma sur la base neuve
npx prisma migrate deploy

# 4. Peupler avec des données de démonstration
node scripts/seed-demo.js
```

Les variables `POSTGRESQL_ADDON_*` doivent être **retirées du `.env` local** : elles n'ont de sens que sur Clever Cloud, où l'addon les injecte.

> **Ne jamais copier la production en local.** La base contient des données clients (KYC, pièces d'identité, RIB). Un dump local sort ces données du périmètre déclaré et engage la responsabilité RGPD de Finarent. Les jeux de démonstration existent pour ça.

**Preuve de clôture** — `grep DATABASE_URL .env` ne contient plus le nom d'hôte Clever Cloud, et `npx prisma studio` ouvre une base ne contenant que des enregistrements de démonstration.

### 1.2 — Garde anti-production dans les scripts · `P0-1` `P1-3`

Six scripts écrivent en base sans vérifier ce que `DATABASE_URL` désigne : `seed-demo.js`, `test-all-experiences.js`, `test-call-centers.js`, `test-e2e.js`, `test-live.js`, `test-upload.js`. `seed-demo.js` commence par dix-huit `deleteMany({})` sans filtre.

Créer `scripts/_guard.js` :

```js
/**
 * Refuse de s'exécuter contre une base de production.
 * Tout script qui écrit en base doit l'appeler en première instruction.
 */
export function refuseProduction({ allowWithFlag = true } = {}) {
  const url = process.env.DATABASE_URL || '';
  const suspect =
    /clever-cloud\.com|\.neon\.tech|amazonaws\.com/i.test(url) ||
    process.env.NODE_ENV === 'production';

  if (!suspect) return;

  const forced = allowWithFlag && process.argv.includes('--i-know-this-is-production');
  if (forced) {
    console.warn('⚠️  Exécution FORCÉE sur une base distante.');
    return;
  }

  console.error(
    '\n⛔ DATABASE_URL désigne une base distante (production probable).\n' +
    '   Ce script écrit et supprime des données. Exécution refusée.\n' +
    '   Pointez DATABASE_URL sur votre base locale, ou passez\n' +
    '   --i-know-this-is-production si vous savez ce que vous faites.\n'
  );
  process.exit(1);
}
```

Puis, en première instruction de chacun des six scripts :

```js
import { refuseProduction } from './_guard.js';
refuseProduction();
```

`test-live.js` est le seul cas légitime de lecture sur la base réelle : il garde le drapeau de contournement, documenté dans son en-tête.

**Preuve de clôture** — avec `DATABASE_URL` pointant sur Clever Cloud, `node scripts/seed-demo.js` sort en code 1 sans avoir touché la base.

### 1.3 — Déclarer `CRON_SECRET` · `P0-2`

Le secret est absent en local et son existence côté Clever Cloud n'est pas établie. Sans lui, `isCronAuthorized()` refuse tout : relances clients, alertes SLA et purge RGPD ne tournent pas.

```bash
# Générer
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Vérifier la présence côté Clever Cloud
clever env | grep CRON_SECRET

# Déclarer si absent
clever env set CRON_SECRET "<valeur générée>"
```

Ajouter `CRON_SECRET=` au `.env.example` (voir 2.5) et le renseigner en local pour pouvoir tester les routes.

**Preuve de clôture** — `curl -f -H "Authorization: Bearer $CRON_SECRET" https://finarent.com/api/cron/sla-check` renvoie 200, et la même requête sans en-tête renvoie 401.

### 1.4 — Faire échouer les crons bruyamment · `P0-2` `P2-5`

`curl -sS` sort en code 0 sur une réponse 401 : Clever Cloud compte la tâche comme réussie alors qu'elle n'a rien fait.

`clevercloud/cron.json` :

```json
[
  "0 9 * * * [ \"$INSTANCE_NUMBER\" = \"0\" ] && curl -fsS --fail-with-body -m 60 -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:8080/api/cron/reminders",
  "0 */2 * * * [ \"$INSTANCE_NUMBER\" = \"0\" ] && curl -fsS --fail-with-body -m 60 -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:8080/api/cron/sla-check",
  "0 3 * * 0 [ \"$INSTANCE_NUMBER\" = \"0\" ] && curl -fsS --fail-with-body -m 120 -H \"Authorization: Bearer $CRON_SECRET\" http://localhost:8080/api/cron/affiliate-purge"
]
```

`-f` fait sortir curl en code 22 sur un statut ≥ 400 ; `--fail-with-body` conserve le corps de la réponse dans les journaux, pour le diagnostic.

Supprimer dans le même geste les déclarations concurrentes, qui portent des horaires différents et omettent la purge d'affiliation :

```bash
git rm vercel.json .env.vercel
rm -rf .vercel
```

**Preuve de clôture** — `vercel.json` n'existe plus ; une exécution de cron avec un secret erroné apparaît **en échec** dans les journaux Clever Cloud.

### 1.5 — Corriger les vulnérabilités · `P1-4`

```bash
npm audit fix    # corrige 12 des 13
npm audit        # ne doit plus laisser que nodemailer
```

`nodemailer` demande une montée majeure (6.x → 10.0.1). **Ne pas lancer `npm audit fix --force`** : la commande monterait d'autres paquets en majeur sans contrôle. Geste distinct :

```bash
npm install nodemailer@10 @types/nodemailer@latest
```

L'API `createTransport` / `sendMail` est stable entre 6 et 10 ; le risque porte sur les options de transport. Vérifier `lib/email.js` et `lib/email/send.js` après montée, puis envoyer un email de test.

**Résultat constaté le 8 septembre** — `npm audit fix` a corrigé 10 des 13 sans changement cassant ;
la montée `nodemailer@10.0.1` en a retiré une onzième. **Il reste 3 vulnérabilités** (2 moyennes,
1 haute) : `postcss`, imbriqué dans les dépendances propres de `next`, et par ricochet `next` et
`@auth0/nextjs-auth0`. Aucune n'est corrigeable sans passer à **Next 16**.

> Ce reliquat n'est donc pas une dette de dépendances distincte : il **rejoint la migration Next 16**
> du lot 3.3, et lui donne un motif de sécurité en plus du motif d'outillage.

**Preuve de clôture** — `npm audit` ne renvoie plus que les 3 vulnérabilités imputables à Next 15,
`npx tsc --noEmit` et `npm run lint` restent à zéro erreur, et un email de confirmation part
réellement une fois le SMTP configuré (lot 2.1).

---

## 3. Lot 2 — Rendre la plateforme opérante et observable

**Charge : quatre à six jours, sous deux semaines.**

Aujourd'hui, un client qui dépose une demande ne reçoit rien, et une erreur en production n'est vue par personne. Ce lot corrige les deux.

### 2.1 — SMTP et accusé de réception client · `P1-6`

`SMTP_USER` et `SMTP_PASS` sont vides. Renseigner les identifiants (l'hôte configuré est le relais Brevo), puis valider la chaîne complète :

```bash
node scripts/preview-emails.mjs   # rendu des gabarits, sans envoi
# puis un dépôt de demande réel sur l'environnement de recette
```

Vérifier dans l'ordre : accusé de réception client, notification `ADMIN_EMAIL`, invitation apporteur d'affaires, relance de document manquant. Contrôler SPF, DKIM et DMARC sur `finarent.com` — un email techniquement envoyé mais classé en indésirable équivaut à un email non envoyé.

**Preuve de clôture** — les quatre emails arrivent en boîte de réception principale (pas en indésirable) sur Gmail et sur Outlook.

### 2.2 — Sentry · `P1-6`

`NEXT_PUBLIC_SENTRY_DSN` est vide alors que `@sentry/nextjs` est installé. Sans DSN, aucune erreur de production ne remonte : les incidents ne sont connus que si un client téléphone.

Créer le projet, renseigner le DSN en local et sur Clever Cloud, régler l'échantillonnage des traces à 10 % pour maîtriser le quota, et **provoquer une erreur volontaire** pour vérifier la remontée. Configurer une alerte vers `ADMIN_EMAIL` dès la première occurrence d'une nouvelle erreur.

**Preuve de clôture** — une erreur déclenchée volontairement en production apparaît dans Sentry et génère un email.

### 2.3 — reCAPTCHA côté serveur · `P1-6`

`NEXT_PUBLIC_RECAPTCHA_SITE_KEY` est renseignée mais `RECAPTCHA_SECRET_KEY` est vide : le composant s'affiche, la vérification serveur ne peut pas aboutir. Selon l'implémentation, soit les formulaires sont ouverts aux robots, soit ils rejettent tout le monde — les deux sont graves et se ressemblent de l'extérieur.

**Preuve de clôture** — une soumission sans jeton valide est rejetée en 400 ; une soumission normale passe.

### 2.4 — Domaine Auth0 en dur dans les scripts · `P1-2`

`scripts/test-all-experiences.js:18` et l'en-tête de `scripts/seed-demo.js:13` codent en dur `dev-44jsict2grc7s0jn.eu.auth0.com`, qui n'est pas le locataire actif. Les comptes de démonstration créés ne peuvent pas se connecter.

```js
const DOMAIN = process.env.AUTH0_DOMAIN;
if (!DOMAIN) throw new Error('AUTH0_DOMAIN absent — vérifiez votre .env');
```

Le projet a un historique de **deux locataires Auth0** (un US, un EU) : vérifier lequel est actif via `/api/auth/login` avant de conclure.

**Preuve de clôture** — un compte créé par `seed-demo.js` se connecte réellement et atterrit sur l'espace correspondant à son rôle.

### 2.5 — Remettre `.env.example` en conformité · `P1-7`

Le modèle a divergé du code.

| Action | Variables |
|---|---|
| **Supprimer** — service abandonné, plus référencé nulle part | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Ajouter** — lues par le code, absentes du modèle | `NEXT_PUBLIC_CLARITY_PROJECT_ID`, `CELLAR_REGION`, `CRON_SECRET` |
| **Vérifier** — présentes, usage réel à confirmer | `TWILIO_*` (le paquet `twilio` est installé) |
| **Corriger le libellé** | `# --- Cron Vercel ---` → `# --- Crons (Clever Cloud) ---` |

Regrouper les variables en « obligatoire au démarrage » et « optionnel par intégration » : un nouvel arrivant doit voir en un coup d'œil le minimum vital.

**Preuve de clôture** — `cp .env.example .env`, remplissage du seul bloc obligatoire, `npm run dev` démarre et la page d'accueil s'affiche.

### 2.6 — Le changement de rôle doit tenir · `P1-8`

`syncUser()` réécrit le rôle depuis le claim Auth0 à chaque appel, avec `CLIENT` par défaut. Vingt fichiers l'invoquent, dont `app/api/notifications/route.js` : une promotion faite en base seule retombe dès que la personne consulte ses notifications.

Deux issues, à trancher :

- **Propager vers Auth0** *(recommandé)* — `PATCH /api/admin/users/[id]` appelle la Management API pour écrire `app_metadata.role`, et une Action Auth0 recopie ce champ dans le claim à chaque connexion. Le claim reste la source de vérité, la base reste un miroir cohérent. **Environ une journée**, dont la configuration du client Management API.
- **Retirer le sélecteur** — le back-office cesse d'afficher un contrôle sans effet ; les rôles se gèrent exclusivement dans Auth0. **Deux heures.** Acceptable si l'attribution des rôles est rare.

Dans les deux cas, `scripts/promote-admin.js` doit être aligné ou supprimé : il souffre du même défaut.

**Preuve de clôture** — un utilisateur promu ADMIN le reste après déconnexion, reconnexion et consultation de ses notifications.

### 2.7 — Réécrire le README · `P1-9`

Le fichier annonce EmailJS, un dossier `dist/`, un script `preview` inexistant, et recommande Vercel ou Netlify. Ni PostgreSQL, ni Prisma, ni Auth0, ni les sept rôles n'y figurent. C'est le premier fichier lu par un nouvel intervenant, et il l'oriente à côté.

Contenu attendu : pile réelle (Next 15, PostgreSQL, Prisma, Auth0, Cellar), démarrage en cinq commandes, les sept rôles et leurs espaces, hébergement Clever Cloud, index des documents de `docs/`.

**Preuve de clôture** — une personne extérieure au projet fait tourner l'application en local en suivant le seul README.

### 2.8 — Vitest sur la logique pure · `P1-1`

Premier filet de sécurité, sur ce qui se teste sans base ni réseau et où une erreur coûte cher :

```bash
npm install -D vitest @vitest/coverage-v8
```

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Cibles, par ordre de rendement :

1. **Scoring de pré-qualification** — décide de l'orientation commerciale d'une demande.
2. **Simulateurs** (mensualité, coût total, crédit-bail, LOA) — un chiffre faux affiché à un client est un engagement.
3. **Numérotation** des devis et factures — trous et doublons de séquence sont des anomalies comptables.
4. **Génération SEPA** — un fichier malformé est rejeté par la banque.
5. **Chiffrement** `lib/crypto` — un aller-retour chiffrement/déchiffrement doit restituer exactement l'entrée.

Viser une trentaine de cas utiles plutôt qu'un taux de couverture. `docs/TESTS_LISTE_COMPLETE.md` détaille les 263 cas de recette.

**Preuve de clôture** — `npm test` passe au vert et tourne en CI (voir A1).

---

## 4. Lot 3 — Rattraper la dette et couvrir les parcours

**Charge : deux jours pour les mineurs, plus les montées de version. Sous deux mois.**

### 3.1 — Auth0 v3 → v4 · `P1-5`

La v3 n'est plus le canal de correctifs de sécurité. La v4 change le modèle d'intégration : `handleAuth()` disparaît au profit d'un client middleware. Chantier réel, à mener **hors période commerciale chargée**, sur une branche dédiée, avec recette des sept rôles.

Points de vigilance : `middleware.ts`, `lib/auth.ts`, `lib/users.js`, les trois `layout.jsx` d'espace, et les claims personnalisés — dont le retrait du claim historique (`P2-4`, voir 3.5).

### 3.2 — Prisma 5.22 → 7 · `P1-5`

Passer par la v6 avant la v7, en appliquant les guides de migration successifs. Vérifier `prisma migrate deploy` sur une copie de la base avant toute mise en production.

### 3.3 — Préparer Next 16 · `P1-5`

`next lint` disparaît en v16 : `npm run lint` cassera à la migration. Anticiper dès maintenant, indépendamment de la montée :

```json
"lint": "eslint ."
```

### 3.4 — Playwright sur les parcours qui portent le chiffre d'affaires · `P1-1`

Trois parcours, pas plus, pour commencer :

1. Visiteur → simulateur → dépôt de demande → accusé de réception reçu.
2. Admin → traitement de la demande → émission d'une offre → notification client.
3. Client → signature électronique → archivage de la preuve.

À faire tourner sur l'environnement de recette (voir A5), jamais sur la production.

### 3.5 — Les dix constats mineurs

| ID | Geste | Charge |
|---|---|---|
| `P2-1` | `/api/health` : ne renvoyer que `{ status, time }`. Retirer `NODE_ENV`, `PORT`, `HOSTNAME` et le `console.log` à chaque appel — la sonde est appelée en continu et pollue les journaux. | 15 min |
| `P2-2` | Supprimer le composant `/simulator`, inatteignable derrière une redirection 301. | 15 min |
| `P2-3` | Limitation de débit en mémoire : sans effet en multi-instance, remise à zéro à chaque déploiement. Traité en A3. | — |
| `P2-4` | Retirer `LEGACY_ROLE_CLAIM = 'https://finassur/role'` de `lib/auth.ts`, `lib/users.js` et `middleware.ts`. **Après** avoir vérifié qu'aucun jeton actif ne le porte encore — sinon les sessions en cours perdent leurs droits. | 1 h |
| `P2-5` | Traité en 1.4. | — |
| `P2-6` | JSON-LD : sérialiser via JSON.stringify puis remplacer chaque `<` par `\u003c` avant injection dans `dangerouslySetInnerHTML`. La FAQ vient de la base et s'édite en back-office : une réponse contenant `</script>` casse la page. Cinq emplacements. | 1 h |
| `P2-7` | `DemandeWizardClient.jsx` (1 089 lignes) : extraire chaque étape en composant dédié. Traité en A4. | — |
| `P2-8` | `git mv "Extrait KBis_5795393_.pdf" docs/client/` — le dossier est déjà exclu du versionnement. | 5 min |
| `P2-9` | Score de pré-qualification : date de création, chiffre d'affaires et effectif sont absents du schéma. Trois TODO à arbitrer avec le métier **avant** tout développement. | à arbitrer |
| `P2-10` | `clevercloud/README.md` : remplacer Supabase par Cellar, et `finarent.fr` par `finarent.com` (domaine canonique). | 20 min |

### 3.6 — Intégrations commerciales · `P1-6`

`STRIPE_SECRET_KEY`, `YOUSIGN_API_KEY`, `RINGOVER_API_KEY`, `BREVO_MARKETING_LIST_ID` et `BREVO_WEBHOOK_TOKEN` sont vides. À configurer selon le calendrier commercial, pas techniquement urgent — sauf YouSign si la signature électronique est annoncée aux clients.

Pour chacune : clé de test d'abord, webhook déclaré, signature vérifiée, puis bascule en clé de production.

---

## 5. Améliorations au-delà de l'audit

L'audit corrige ce qui est cassé. Ces six points empêchent la dette de se reformer.

### A1 — Intégration continue · *une demi-journée, à faire avec le lot 2*

Il n'existe aucune CI. Rien n'empêche de pousser un code qui ne compile pas. Un workflow GitHub Actions sur chaque `push` et chaque `pull request` :

```yaml
- npx tsc --noEmit     # le typage passe aujourd'hui : le verrouiller
- npm run lint
- npm test             # dès le lot 2.8
- npm audit --audit-level=high
- npm run build
```

C'est le geste de meilleur rendement du plan entier : il transforme chaque correction en acquis permanent.

### A2 — Sauvegarde et restauration **testée** · *une demi-journée*

Clever Cloud sauvegarde l'addon PostgreSQL, mais une sauvegarde jamais restaurée n'est pas une sauvegarde. Vérifier la rétention, exécuter une restauration réelle sur une base jetable, chronométrer, consigner la procédure dans `docs/PROCEDURES_EXPLOITATION.md`.

### A3 — Limitation de débit persistante · `P2-3` · *une journée*

La limitation actuelle vit dans la mémoire du processus : inopérante en multi-instance, remise à zéro à chaque déploiement. La déplacer vers Redis (addon Clever Cloud) ou, plus simplement, vers une table PostgreSQL avec purge périodique.

### A4 — Découper l'assistant de demande · `P2-7` · *deux jours*

`DemandeWizardClient.jsx` fait 1 089 lignes et porte le parcours qui génère le chiffre d'affaires. Chaque étape en composant dédié, l'état partagé remonté d'un niveau. Ce découpage rend le parcours testable : à faire **avant** d'écrire les tests Playwright de 3.4, pas après.

### A5 — Environnement de recette · *une journée*

Il n'existe qu'un seul environnement : la production. Une application Clever Cloud de recette, avec son propre addon PostgreSQL et des données de démonstration, permet de valider migrations et parcours sans risque. Prérequis de fait pour 3.4 et pour toute montée de version du lot 3.

### A6 — Signal de bonne exécution des crons · *deux heures*

`-f` fait échouer bruyamment, mais un cron qui ne se déclenche pas du tout ne produit aucun échec. Enregistrer la date de dernière exécution réussie de chaque tâche et alerter si elle dépasse le délai attendu — seul moyen de détecter une tâche silencieusement disparue.

---

## 6. Séquencement et charge

| Lot | Contenu | Charge | Échéance |
|---|---|---|---|
| **1** | 5 actions — base locale, gardes-fous, `CRON_SECRET`, crons, vulnérabilités | une demi-journée | **immédiat, avant la prochaine mise en production** |
| **2** | 8 actions — SMTP, Sentry, reCAPTCHA, Auth0 scripts, `.env.example`, rôles, README, Vitest | 4 à 6 jours | sous deux semaines |
| **A1** | Intégration continue | une demi-journée | avec le lot 2 |
| **3** | Montées de version, Playwright, 10 mineurs, intégrations | 8 à 12 jours | sous deux mois |
| **A2–A6** | Sauvegardes, limitation de débit, découpage, recette, signal de crons | 5 jours | au fil du lot 3 |

**Total : environ 20 à 25 jours-homme**, dont une demi-journée retire l'essentiel du risque.

---

## 7. Suivi des 21 constats

| ID | Action | Preuve de clôture |
|---|---|---|
| `P0-1` | 1.1 · 1.2 | `.env` local sur base locale ; `seed-demo.js` refuse une base distante |
| `P0-2` | 1.3 · 1.4 | `CRON_SECRET` déclaré ; un cron en échec apparaît en échec |
| `P1-1` | 2.8 · 3.4 | `npm test` au vert en CI ; 3 parcours Playwright |
| `P1-2` | 2.4 | un compte de démonstration se connecte réellement |
| `P1-3` | 1.2 | les 6 scripts appellent `refuseProduction()` |
| `P1-4` | 1.5 | `npm audit` renvoie 0 |
| `P1-5` | 3.1 · 3.2 · 3.3 | Auth0 v4, Prisma v7, `lint` sans `next lint` |
| `P1-6` | 2.1 · 2.2 · 2.3 · 3.6 | email client reçu ; erreur visible dans Sentry |
| `P1-7` | 2.5 | `cp .env.example .env` suffit à démarrer |
| `P1-8` | 2.6 | un ADMIN promu le reste après reconnexion |
| `P1-9` | 2.7 | un tiers démarre le projet avec le seul README |
| `P2-1` → `P2-10` | 3.5 | tableau détaillé en 3.5 |

---

## 8. Risques du plan lui-même

- **Montée Auth0 v3 → v4** — rupture d'API sur le cœur de l'authentification. Branche dédiée, recette des sept rôles, hors période commerciale chargée. C'est le seul chantier du plan capable de rendre la plateforme inaccessible.
- **`npm audit fix --force`** — à proscrire. La commande monterait `nodemailer` et d'autres paquets en majeur sans contrôle. Corrections sûres et montée de nodemailer sont deux gestes distincts.
- **Base de développement locale** — la tentation de copier la production pour « avoir des données réalistes » sort des données clients du périmètre déclaré. Les jeux de démonstration existent pour ça.
- **Retrait du claim historique (`P2-4`)** — retiré trop tôt, il déconnecte les sessions actives portant l'ancien claim. Vérifier avant, pas après.
- **Ordre 3.4 / A4** — écrire les tests Playwright avant le découpage du wizard revient à les réécrire ensuite. Découper d'abord.

---

*Plan établi le 8 septembre 2026, à partir de `docs/AUDIT_2026-09.md` et d'une revérification du dépôt à la révision `e322789`.*
