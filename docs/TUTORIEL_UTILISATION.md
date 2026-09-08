# Tutoriel d'utilisation — Plateforme Finarent

**Public visé** : toute personne qui utilise la plateforme — client, conseiller, administrateur, agent de centre d'appels, partenaire, assureur, apporteur d'affaires.
**Prérequis** : aucun. Ce document ne suppose aucune compétence technique.
**Durée de lecture** : 15 minutes pour votre rôle, 45 minutes pour l'ensemble.

---

## Sommaire

1. [Comprendre la plateforme en 3 minutes](#1-comprendre-la-plateforme-en-3-minutes)
2. [Les rôles et ce qu'ils permettent](#2-les-rôles-et-ce-quils-permettent)
3. [Le vocabulaire indispensable](#3-le-vocabulaire-indispensable)
4. [Se connecter](#4-se-connecter)
5. [Tutoriel Client](#5-tutoriel-client)
6. [Tutoriel Administrateur](#6-tutoriel-administrateur)
7. [Tutoriel Centre d'appels](#7-tutoriel-centre-dappels)
8. [Tutoriel Partenaire](#8-tutoriel-partenaire)
9. [Tutoriel Assureur](#9-tutoriel-assureur)
10. [Tutoriel Apporteur d'affaires (affilié)](#10-tutoriel-apporteur-daffaires-affilié)
11. [Questions fréquentes](#11-questions-fréquentes)

---

## 1. Comprendre la plateforme en 3 minutes

Finarent met en relation des **entreprises qui cherchent un financement** (ou une assurance professionnelle) avec des **organismes financeurs** — banques, sociétés de leasing, assureurs.

Le parcours type, du premier clic au déblocage des fonds :

```
   VISITEUR                CLIENT                  ADMINISTRATEUR           PARTENAIRE
      │                      │                            │                     │
  simule un              crée son                    reçoit le                 reçoit
  financement    ───►    dossier      ───►          dossier         ───►      le dossier
      │                      │                            │                     │
      │                 envoie ses                    analyse,                accepte
      │                 documents                    score, relance          ou refuse
      │                      │                            │                     │
      │                 reçoit une                    envoie un                  │
      │                 offre        ◄───            devis / offre               │
      │                      │                            │                     │
      │                  signe                        transmet         ───►   fonds
      │                      │                            │                  débloqués
```

En parallèle, deux circuits d'acquisition alimentent la plateforme :

- **Le centre d'appels** appelle des prospects, les qualifie, et les convertit en dossiers.
- **Les apporteurs d'affaires (affiliés)** partagent un lien personnalisé et touchent une commission sur les dossiers signés.

---

## 2. Les rôles et ce qu'ils permettent

| Rôle | Adresse d'entrée | Ce qu'il peut faire |
|---|---|---|
| **Visiteur** | `finarent.com` | Consulter, simuler, déposer une demande |
| **Client** | `/espace` | Suivre ses dossiers, envoyer des documents, échanger, signer |
| **Administrateur** | `/admin` | Tout : dossiers, devis, factures, utilisateurs, prospection, paramètres |
| **Agent de centre d'appels** | `/call-center` | Appeler et qualifier **ses** prospects |
| **Manager de centre d'appels** | `/call-center` | Idem + pilotage de **son** équipe |
| **Partenaire** | `/partner` | Instruire les dossiers **qui lui sont transmis**, suivre ses commissions |
| **Assureur** | `/insurer` | Traiter les demandes d'assurance |
| **Apporteur d'affaires** | `/affiliate/[son-code]` | Suivre ses apports et ses commissions |

> **Règle de cloisonnement** : chacun ne voit que ce qui le concerne. Un client ne voit jamais le dossier d'un autre client. Un agent ne voit que les prospects qui lui sont affectés. Un partenaire ne voit que les dossiers qu'on lui a transmis. Cette règle est appliquée **côté serveur** — elle ne dépend pas de ce que l'écran affiche.

---

## 3. Le vocabulaire indispensable

| Terme | Signification |
|---|---|
| **Demande** (ou dossier) | Le besoin de financement d'une entreprise, de son dépôt à sa conclusion |
| **Référence** | L'identifiant unique du dossier, attribué automatiquement. À citer dans tout échange |
| **Statut** | L'étape où en est le dossier (11 valeurs possibles, voir ci-dessous) |
| **Score de pré-qualification** | Note automatique de 0 à 100 estimant la solidité du dossier |
| **Offre** | La proposition chiffrée envoyée au client |
| **Devis** | Le document commercial détaillé, avec lignes et TVA |
| **Prospect** | Un contact non encore client, travaillé par le centre d'appels |
| **Affilié / apporteur** | Un partenaire d'apport rémunéré à la commission |
| **SLA** | Le délai maximal de traitement à respecter à chaque étape |

### Les 11 statuts d'un dossier

| Statut | Ce qu'il signifie | Qui doit agir |
|---|---|---|
| `PENDING` | Déposé, pas encore ouvert | Administrateur |
| `REVIEWING` | En cours d'analyse | Administrateur |
| `DOCUMENTS_NEEDED` | Il manque des pièces | **Client** |
| `QUOTE_SENT` | Devis envoyé | **Client** |
| `QUOTE_ACCEPTED` | Devis accepté | Administrateur |
| `PENDING_SIGNATURE` | En attente de signature | **Client** |
| `SIGNED` | Contrat signé | Administrateur |
| `TRANSMITTED` | Transmis au financeur | **Partenaire** |
| `APPROVED` | Accord du financeur | Administrateur |
| `REJECTED` | Refusé | — (fin) |
| `COMPLETED` | Fonds débloqués | — (fin) |

---

## 4. Se connecter

L'authentification passe par **Auth0**, un service externe. La plateforme ne stocke jamais votre mot de passe.

### Première connexion

1. Rendez-vous sur `finarent.com`.
2. Cliquez sur **Connexion** en haut à droite.
3. Vous êtes redirigé vers la page Auth0.
4. Créez votre compte (email + mot de passe) ou connectez-vous.
5. Vous revenez automatiquement sur la plateforme, sur la page que vous vouliez atteindre.

### Votre rôle

Votre rôle est attribué par un administrateur ; vous ne pouvez pas le changer vous-même. Par défaut, tout nouveau compte est **Client**.

> ⚠️ **Après un changement de rôle, déconnectez-vous et reconnectez-vous.** Le rôle est inscrit dans votre jeton de session : tant que vous ne rouvrez pas de session, l'ancien rôle reste actif.

### Se déconnecter

Menu utilisateur en haut à droite → **Déconnexion**. La session est détruite immédiatement.

### En cas de problème

| Symptôme | Cause probable | Solution |
|---|---|---|
| Renvoyé sur l'accueil après connexion | Votre rôle ne donne pas accès à cette section | Demandez à un administrateur de vérifier votre rôle |
| Boucle de redirection sans fin | Cookies bloqués | Autorisez les cookies pour `finarent.com` |
| « Utilisateur introuvable » | Compte Auth0 existant mais pas encore synchronisé | Déconnectez-vous puis reconnectez-vous |

---

## 5. Tutoriel Client

### 5.1 Déposer une demande sans compte

C'est le chemin le plus court : depuis `finarent.com`, le formulaire de demande de financement est accessible sans inscription.

1. Renseignez le **type de besoin**, la **société** (nom + SIREN), le **secteur** et le **montant**.
2. Renseignez vos **coordonnées** : nom, prénom, email, téléphone.
3. Cochez la case de **consentement** — elle est obligatoire.
4. Validez.

**Ce qui se passe ensuite :** une référence est générée, le dossier apparaît au statut `PENDING` côté administrateur, et vous recevez un email de confirmation.

> ℹ️ Si vous ne recevez pas l'email, vérifiez vos indésirables. Signalez-le : l'envoi d'emails dépend d'une configuration serveur qui peut être temporairement inactive.

### 5.2 Créer votre espace

Cliquez sur **Connexion**, créez votre compte avec **la même adresse email** que celle de votre demande — vos dossiers y seront rattachés automatiquement.

### 5.3 Suivre vos dossiers

Sur `/espace`, vous voyez tous vos dossiers avec leur statut. Cliquez sur l'un d'eux pour ouvrir sa fiche : chronologie, documents, messages, offres.

### 5.4 Déposer une demande depuis votre espace

`/espace/demande` ouvre un assistant en **5 étapes** :

| Étape | Ce qu'on vous demande |
|---|---|
| 1 · Type | Le type de financement recherché |
| 2 · Projet | Montant, durée, objet du financement |
| 3 · Société | Raison sociale, SIREN, secteur |
| 4 · Contact | Vos coordonnées |
| 5 · Récapitulatif | Relecture avant validation |

Vous pouvez revenir en arrière à tout moment : vos saisies sont conservées.

### 5.5 Envoyer vos documents

C'est **l'étape la plus déterminante** : un dossier sans pièces n'avance pas.

1. Ouvrez le dossier concerné.
2. Repérez la **liste de contrôle des documents** — elle indique ce qui est fourni et ce qui manque.
3. Envoyez les pièces demandées : **KBIS**, **RIB**, **pièce d'identité**, **bilan**, **contrat**, ou **autre**.

**Règles à connaître :**

| Règle | Détail |
|---|---|
| Formats acceptés | PDF, JPG/JPEG, PNG, WEBP, HEIC/HEIF (photos iPhone) |
| Taille maximale | 10 Mo par fichier |
| Contrôle de sécurité | Les premiers octets du fichier sont analysés pour confirmer son vrai format — renommer un `.exe` en `.pdf` ne fonctionne pas |
| Confidentialité | Chaque consultation d'un document est journalisée |
| Suppression | Vous pouvez retirer une pièce envoyée par erreur |

**Conseil** : photographiez vos documents à plat, en pleine lumière, sans coupure de bord. Un KBIS illisible est un aller-retour perdu.

### 5.6 Échanger avec votre conseiller

La messagerie du dossier est le canal officiel : chaque message y est horodaté et conservé. Préférez-la à l'email pour tout ce qui concerne le dossier.

### 5.7 Recevoir et accepter une offre

Quand une offre vous est adressée, elle apparaît dans le dossier et vous êtes notifié.

1. Ouvrez l'offre et lisez les conditions : montant, durée, mensualité, coût total.
2. **Acceptez** ou **refusez**.
3. Si vous acceptez, le dossier passe en attente de signature.

### 5.8 Signer

La signature est **électronique**, avec valeur légale. Suivez le parcours proposé ; à l'issue, le dossier passe en `SIGNED` et la preuve de signature est archivée.

### 5.9 Gérer votre compte

| Page | Usage |
|---|---|
| `/espace/profile` | Modifier vos coordonnées |
| `/espace/notifications` | Consulter et marquer vos notifications |
| `/espace/security` | Voir vos sessions, exporter vos données, supprimer votre compte |
| `/espace/parrainage` | Récupérer votre lien de parrainage et suivre vos filleuls |

### 5.10 Exercer vos droits RGPD

Depuis `/espace/security` :

- **Exporter mes données** — vous obtenez un fichier contenant l'intégralité de ce que la plateforme détient sur vous.
- **Supprimer mon compte** — action définitive. Les obligations légales de conservation comptable s'appliquent néanmoins à certaines pièces.

---

## 6. Tutoriel Administrateur

L'administrateur a accès à tout. Le menu latéral de `/admin` compte 16 entrées.

### 6.1 Le tableau de bord

`/admin` affiche les indicateurs clés : volume de dossiers, répartition par statut, activité récente. C'est votre point d'entrée quotidien.

### 6.2 Traiter un dossier — la routine du matin

C'est le cœur du métier. Voici la séquence recommandée.

**Étape 1 — Repérer ce qui attend.** Ouvrez `/admin/demandes` et filtrez sur `PENDING`. Ce sont les dossiers que personne n'a encore ouverts.

**Étape 2 — Ouvrir et qualifier.** Cliquez sur un dossier. Vous voyez :
- les informations société (raison sociale, SIREN, secteur) ;
- le besoin (montant, durée, produit) ;
- le **score de pré-qualification** ;
- les documents fournis ;
- l'historique complet des statuts.

**Étape 3 — Passer en `REVIEWING`.** Signale à l'équipe que le dossier est pris en charge et arrête le compteur de SLA de niveau 1.

**Étape 4 — Demander les pièces manquantes.** S'il manque des documents, passez le dossier en `DOCUMENTS_NEEDED` et précisez par message ce qui est attendu. Le client est notifié.

**Étape 5 — Établir la proposition.** Une fois le dossier complet, créez un devis (`/admin/devis`) ou une offre de prêt (`/admin/offers`), puis envoyez-le. Le dossier passe en `QUOTE_SENT`.

**Étape 6 — Suivre.** Acceptation → signature → transmission au partenaire (`TRANSMITTED`) → accord (`APPROVED`) → déblocage (`COMPLETED`).

### 6.3 La vue Kanban

`/admin/demandes/kanban` présente les dossiers en colonnes, une par statut. **Faites glisser une carte d'une colonne à l'autre pour changer son statut** — c'est la façon la plus rapide de faire avancer plusieurs dossiers.

### 6.4 Devis et facturation

| Page | Ce que vous y faites |
|---|---|
| `/admin/devis` | Créer un devis multi-lignes, générer le PDF, l'envoyer au client |
| `/admin/factures` | Créer une facture, générer le PDF, enregistrer les règlements, émettre un avoir |
| `/admin/factures/[id]` | Détail d'une facture : lignes, règlements, lien de paiement |

**Numérotation** : elle est automatique et séquentielle. Ne la forcez jamais manuellement — un trou dans la séquence est un problème comptable.

**Encaissement** : depuis le détail d'une facture, générez un **lien de paiement Stripe** et transmettez-le au client. Quand il paie, la facture est soldée automatiquement.

**Règlement hors Stripe** (virement, chèque) : saisissez-le manuellement. Le solde restant se recalcule ; les règlements partiels sont acceptés.

### 6.5 Gérer les utilisateurs

`/admin/users` liste tous les comptes. Depuis la fiche d'un utilisateur, vous consultez ses dossiers, ses documents, son historique, et vous pouvez **changer son rôle**.

> 🔴 **Le sélecteur de rôle ne suffit pas.** Le rôle réellement appliqué vient d'Auth0 : il est réécrit automatiquement à chaque fois que la personne utilise la plateforme. Modifié uniquement ici, il **retombe à « Client » silencieusement** dès sa prochaine action.
>
> **Un changement de rôle se fait en deux temps :** d'abord dans la console Auth0 (`app_metadata` de la personne), ensuite ici pour aligner l'affichage. La procédure exacte est décrite dans `PROCEDURES_EXPLOITATION.md`, § 10.2. Sans l'étape Auth0, la promotion ne tiendra pas.
>
> ⚠️ Dans tous les cas, le changement ne prend effet qu'à la **prochaine connexion**. Prévenez la personne de se déconnecter puis de se reconnecter.

### 6.6 Prospection

| Page | Usage |
|---|---|
| `/admin/prospects` | Base de prospects : consultation, filtres, modification de statut |
| `/admin/centre-appel` | File d'appels du jour |
| `/admin/call-centers` | Administration des centres d'appel |

**Importer des prospects** : depuis `/admin/prospects`, importez un fichier CSV. Les doublons sont détectés et signalés. En cas de fichier malformé, l'import est refusé **en totalité** — il n'y a jamais d'import partiel.

**Cycle de vie d'un prospect** : `NEW` → `CONTACTED` → `QUALIFIED` → `CONVERTED` (devenu client) ou `LOST`.

### 6.7 Administrer un centre d'appels

Depuis `/admin/call-centers` :

1. **Créer un centre** : code unique, nom, type (`INTERNAL` pour une équipe interne, `EXTERNAL` pour un prestataire), et barème de commission — montant fixe ou pourcentage.
2. **Ajouter des membres** : chacun avec le rôle `MANAGER` ou `AGENT`.
3. **Suivre les commissions** : elles sont calculées automatiquement à la signature d'un dossier apporté, et exportables.

> ℹ️ **Un seul manager par centre.** Si vous ajoutez un nouveau `MANAGER`, le précédent est automatiquement rétrogradé en `AGENT`. C'est voulu.

### 6.8 Partenaires

`/admin/partners` : créez les organismes financeurs (`BANK`, `INSURANCE`, `LEASING`). Une fois un partenaire créé, vous pouvez lui **transmettre un dossier** — il apparaît alors dans son espace, et lui seul y a accès.

### 6.9 Affiliation

| Page | Usage |
|---|---|
| `/admin/affiliates` | Liste des apporteurs, création, invitations |
| `/admin/affiliates/[id]` | Fiche détaillée : clics, prospects, dossiers, commissions |
| `/admin/affiliates/payouts` | Versements : génération du fichier SEPA, déclaration DAS2 |

**Cycle d'une commission** : `PENDING` (créée à la signature) → `VALIDATED` (validée par vous, après le délai de rétractation) → `PAID` (versée). Ou `CANCELLED` si le dossier tombe.

**Payer les apporteurs** : depuis `/admin/affiliates/payouts`, générez le **fichier SEPA** et déposez-le dans votre banque. La **DAS2** (déclaration annuelle des honoraires) est générée depuis la même page.

### 6.10 Contenu du site

| Page | Ce que vous éditez | Où ça s'affiche |
|---|---|---|
| `/admin/faq` | Questions/réponses | `/faq` |
| `/admin/testimonials` | Témoignages clients | `/testimonials` |

Les témoignages ne sont visibles publiquement qu'une fois **publiés**.

### 6.11 Surveillance

| Page | Usage |
|---|---|
| `/admin/logs` | Journal d'activité horodaté, filtrable par utilisateur et par action |
| `/admin/settings` | Paramètres de la plateforme |

**Alertes SLA** : la plateforme surveille trois seuils — `PENDING` au-delà de 4 h, `REVIEWING` au-delà de 24 h, `DOCUMENTS_NEEDED` au-delà de 48 h. Les dossiers en dépassement sont remontés.

> ⚠️ **À savoir** : la vérification automatique des SLA et les relances clients reposent sur des tâches planifiées dont l'exécution réelle **reste à confirmer** (voir `AUDIT_2026-09.md`, constat P0-2 — un échec y est silencieux). Tant que ce point n'est pas vérifié, contrôlez manuellement les dossiers anciens depuis `/admin/demandes` en triant par date.

---

## 7. Tutoriel Centre d'appels

### 7.1 Votre espace

`/call-center` est votre poste de travail. Cinq entrées dans le menu :

| Entrée | Usage |
|---|---|
| Tableau de bord | Votre activité du jour |
| Prospects | Les contacts à travailler |
| Appels & SMS | Historique de vos interactions |
| Emails Brevo | Prospection par email |
| Équipe *(managers)* | Pilotage de l'équipe |

### 7.2 Ce que vous voyez

| Vous êtes | Vous voyez |
|---|---|
| **Agent** | Uniquement les prospects **qui vous sont affectés** |
| **Manager** | Tous les prospects **de votre centre** |
| **Administrateur** | Tous les prospects, tous centres confondus |

Ce cloisonnement est appliqué côté serveur. Il n'est pas contournable.

### 7.3 Traiter un prospect — la séquence d'appel

1. Ouvrez `/call-center/prospects` et sélectionnez un prospect.
2. **Lisez l'historique avant d'appeler.** Un prospect déjà appelé trois fois ne se traite pas comme un contact neuf.
3. Déclenchez le **rappel automatique** : la plateforme appelle votre poste, puis met en relation. Vous ne composez pas le numéro.
4. Menez l'entretien.
5. **Immédiatement après l'appel**, saisissez le résultat :

| Résultat | Quand l'utiliser |
|---|---|
| `ANSWERED` | Conversation aboutie |
| `NO_ANSWER` | Pas de réponse |
| `VOICEMAIL` | Messagerie |
| `CALLBACK` | Rappel demandé — précisez la date en note |
| `INTERESTED` | Intéressé, à qualifier |
| `NOT_INTERESTED` | Refus explicite |

6. Mettez à jour le **statut** du prospect et ajoutez une **note** de contexte.

> **La note est le point le plus important de votre travail.** C'est ce que lira la personne qui rappellera. « Rappeler jeudi 14 h, dirigeant absent jusqu'à mercredi » vaut infiniment mieux que « à rappeler ».

### 7.4 Envoyer un SMS

Depuis la fiche prospect, envoyez un SMS. Il est journalisé comme interaction et rattaché au prospect.

### 7.5 Prospection par email

`/call-center/emails` permet l'envoi **unitaire** ou **groupé** via Brevo.

Chaque email est suivi : `SENT` → `DELIVERED` → `OPENED`, ou `BOUNCED` / `FAILED` / `COMPLAINED`.

> **Un `BOUNCED` doit être traité.** Corrigez ou invalidez l'adresse : accumuler les rebonds dégrade la délivrabilité de tout le domaine, pour tout le monde.

### 7.6 Piloter l'équipe (managers)

`/call-center/team` affiche les membres du centre et leurs performances. Cette page est **inaccessible aux agents**.

---

## 8. Tutoriel Partenaire

Vous êtes un organisme financeur. Votre espace est `/partner`.

### 8.1 Ce que vous voyez

**Uniquement les dossiers qui vous ont été transmis.** Aucun autre dossier de la plateforme ne vous est accessible.

### 8.2 Instruire un dossier

1. Ouvrez `/partner/applications`.
2. Sélectionnez un dossier transmis.
3. Consultez la fiche complète : société, besoin, documents, score de pré-qualification.
4. **Acceptez** — le dossier passe en `APPROVED` — ou **refusez** en indiquant le motif.

Le motif de refus est important : il alimente la qualification des dossiers suivants.

### 8.3 Suivre vos commissions

`/partner/commissions` liste vos commissions et leur état d'avancement.

---

## 9. Tutoriel Assureur

Votre espace est `/insurer`.

1. `/insurer/applications` liste les demandes d'assurance qui vous concernent.
2. Ouvrez une demande, instruisez-la, mettez à jour son statut.
3. Le tableau de bord `/insurer` affiche vos statistiques.

Le principe de cloisonnement est identique à celui des partenaires : vous ne voyez que ce qui vous est adressé.

---

## 10. Tutoriel Apporteur d'affaires (affilié)

### 10.1 Votre code et votre lien

Un administrateur vous crée un compte apporteur et vous attribue un **code unique**. Votre page publique est `finarent.com/affiliate/VOTRE-CODE`.

Votre lien de parrainage est : `finarent.com/?ref=VOTRE-CODE`

### 10.2 Comment vous êtes rémunéré

1. Vous partagez votre lien.
2. Une personne clique : le clic est enregistré et un cookie est déposé sur son navigateur.
3. Cette personne dépose une demande : **le dossier vous est rattaché automatiquement**.
4. Le dossier est signé : une commission est créée au statut `PENDING`.
5. L'administrateur la valide après le délai de rétractation : `VALIDATED`.
6. Elle est versée par virement SEPA : `PAID`.

Votre commission est soit un **montant fixe** par dossier, soit un **pourcentage** du montant financé, selon votre contrat.

### 10.3 Compléter votre inscription

`/affiliate/VOTRE-CODE/onboarding` recueille vos informations et vos coordonnées bancaires. **Votre IBAN est chiffré en base** — il n'est jamais stocké en clair.

Renseignez également votre **statut fiscal** : `PARTICULIER`, `MICRO` (micro-entreprise) ou `SOCIETE`. Il détermine le traitement fiscal de vos commissions et votre présence dans la déclaration DAS2.

### 10.4 Inviter par email

Depuis votre page affilié, envoyez des invitations nominatives avec un message personnalisé (300 caractères maximum). Chaque invitation est suivie : `SENT` → `CLICKED` → `CONVERTED`.

> ℹ️ Le nombre d'invitations par heure est limité, pour préserver la réputation d'envoi du domaine. Si vous êtes bloqué, réessayez plus tard.

### 10.5 Suivre vos résultats

Votre page publique affiche vos compteurs : clics, prospects générés, dossiers, commissions. **Aucune donnée nominative sur les personnes que vous apportez n'y figure** — c'est une exigence RGPD.

---

## 11. Questions fréquentes

**Je ne reçois aucun email de la plateforme.**
Vérifiez d'abord vos indésirables. Si le problème persiste pour tout le monde, c'est côté serveur : la configuration d'envoi (SMTP) peut être inactive. Signalez-le à l'équipe technique — c'est un point identifié dans l'audit.

**Mon changement de rôle n'a rien changé.**
Déconnectez-vous et reconnectez-vous. Le rôle est porté par le jeton de session.

**Je ne vois pas un dossier dont on me parle.**
Soit il ne vous a pas été transmis, soit il appartient à un autre espace. Le cloisonnement est strict. Demandez à un administrateur.

**Un client dit avoir envoyé un document que je ne vois pas.**
Vérifiez la liste de contrôle du dossier. Si le fichier dépassait 10 Mo ou n'était pas d'un format accepté, l'envoi a été refusé — le client a dû voir un message d'erreur.

**Les relances automatiques ne partent pas.**
C'est un point identifié : les tâches planifiées sont bien programmées, mais leur exécution réelle dépend d'un secret serveur dont la présence reste à confirmer, et un échec y passe inaperçu (constat P0-2 de l'audit). Signalez-le à l'équipe technique ; en attendant, relancez manuellement.

**Comment retrouver un dossier à partir d'une référence ?**
Depuis `/admin/demandes`, la recherche accepte la référence, le nom et le SIREN.

**Puis-je supprimer une facture ?**
Une facture émise ne se supprime pas — c'est une contrainte comptable. Émettez un **avoir**.

**Un prospect me demande de ne plus être contacté.**
Passez-le en `LOST` avec une note explicite, et désinscrivez son adresse de la prospection. C'est une obligation légale, pas une option.

---

## Documents liés

| Document | Contenu |
|---|---|
| `docs/PROCEDURES_EXPLOITATION.md` | Installation, déploiement, exploitation, incidents |
| `docs/TESTS_LISTE_COMPLETE.md` | Tous les tests de la plateforme |
| `docs/AUDIT_2026-09.md` | État technique et plan de remédiation |
| `docs/DOSSIER_TESTS_EQUIPE.md` | Scénarios de prise en main pour l'équipe interne |
