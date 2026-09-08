# Liste complète des tests — Plateforme Finarent

**Date** : 8 septembre 2026
**Objet** : recensement exhaustif de tous les tests de la plateforme — ceux qui existent, ceux qui manquent, et le protocole de recette manuelle.

---

## Comment utiliser ce document

| Vous êtes… | Lisez |
|---|---|
| Développeur, avant une mise en ligne | Parties A, B et F |
| Testeur / recetteur métier | Parties C et G |
| Responsable qualité | Tout, en commençant par l'état des lieux |
| Exploitant / support | Parties D et E |

**Convention d'identifiant** : chaque test porte un code stable (`TPUB-01`, `TADM-12`…). Citez ce code dans les rapports de bug — il ne changera pas d'une campagne à l'autre.

**Convention de résultat** : `OK` / `KO` / `Bloqué` / `N/A` (fonction non configurée).

---

## État des lieux

| Type de test | Existe ? | Volume | Automatisé ? |
|---|---|---|---|
| Tests unitaires | ❌ Non | 0 | — |
| Tests d'intégration | ❌ Non | 0 | — |
| Tests end-to-end automatisés | ❌ Non | 0 | — |
| Scripts de vérification impératifs | ⚠️ Partiel | 5 scripts | Non (pas d'assertions ni de code de sortie) |
| Analyse statique | ✅ Oui | `tsc` + ESLint | Oui (manuel) |
| Recette manuelle documentée | ✅ Oui | 3 dossiers | Non |

> ⚠️ **Point d'attention majeur** : `package.json` ne déclare aucun script `test` et aucun framework (Jest, Vitest, Playwright). Sur ≈ 45 000 lignes de code, **aucune régression n'est détectée automatiquement**. Voir le constat P1-1 de l'audit.

---

# Partie A — Tests automatisés existants

Cinq scripts vivent dans `scripts/`. Ils s'exécutent hors serveur Next, en attaquant directement la base via Prisma.

> 🔴 **Avertissement critique** — Ces scripts s'exécutent sur la valeur de `DATABASE_URL`. Aujourd'hui, le fichier `.env` pointe sur la **base de production**. `seed-demo.js` commence par des suppressions massives : **lancé en l'état, il détruit des données réelles**. Basculez sur une base locale avant toute exécution (voir `PROCEDURES_EXPLOITATION.md`, § 3).

---

### A-1 · `scripts/test-e2e.js` — Intégrité base + fumée routes publiques

| | |
|---|---|
| **Commande** | `node scripts/test-e2e.js --base=http://localhost:3000` |
| **Prérequis** | Base accessible, serveur Next démarré |
| **Écrit en base** | ✅ Oui — crée/met à jour 3 comptes de test et un dossier |
| **Sortie** | `test-e2e-report.json` + résumé console + email récapitulatif si SMTP configuré |

**Ce qu'il vérifie :**

| # | Contrôle |
|---|---|
| A-1.1 | Création/mise à jour des 3 comptes de test (CLIENT, ADMIN, PARTNER) |
| A-1.2 | Intégrité de la base sur 28 modèles : comptages, clés étrangères, enregistrements orphelins |
| A-1.3 | Test de fumée sur `/api/health` |
| A-1.4 | Test de fumée sur `/api/faq` |
| A-1.5 | Test de fumée sur `/api/testimonials` |
| A-1.6 | Test de fumée sur `/api/prospects` |

**Limites connues :** aucune assertion formelle — le script affiche des compteurs, mais un compteur anormal ne fait pas échouer l'exécution. Il ne renvoie pas de code de sortie exploitable en intégration continue.

---

### A-2 · `scripts/test-all-experiences.js` — Parcours de bout en bout, tous rôles

| | |
|---|---|
| **Commande** | `node scripts/test-all-experiences.js` |
| **Prérequis** | Jeton Auth0 Management API dans un fichier temporaire local |
| **Écrit en base** | ✅ Oui — préfixe `Andrys Test 2026`, idempotent (nettoie avant de recréer) |

**Ce qu'il vérifie :** création d'enregistrements traçables pour chaque API métier, afin qu'un contrôle visuel en base soit possible.

> 🟠 **Défaut connu** : le domaine Auth0 est **codé en dur** sur `dev-44jsict2grc7s0jn.eu.auth0.com`, alors que la configuration active utilise un autre locataire. Les comptes créés ne peuvent pas se connecter. Voir constat P1-2.

---

### A-3 · `scripts/test-call-centers.js` — Système centres d'appel

| | |
|---|---|
| **Commande** | `node scripts/test-call-centers.js` |
| **Écrit en base** | ✅ Oui — nettoyage automatique en fin d'exécution |

**Ce qu'il vérifie :**

| # | Contrôle |
|---|---|
| A-3.1 | Création d'un centre (type `INTERNAL`, commission 5 %) |
| A-3.2 | Ajout de membres avec rôle (`MANAGER`, `AGENT`) |
| A-3.3 | Rétrogradation automatique du manager existant quand un nouveau `MANAGER` est ajouté |
| A-3.4 | Rattachement d'un `callCenterId` à une demande |
| A-3.5 | Calcul automatique de la commission à la signature (`FIXED` et `PERCENT`) |
| A-3.6 | Nettoyage complet après test |

---

### A-4 · `scripts/test-upload.js` — Chaîne d'envoi de documents

| | |
|---|---|
| **Commande** | `node scripts/test-upload.js` |
| **Prérequis** | `node scripts/seed-demo.js` exécuté au préalable (utilisateur `client@demo.fr` requis) |
| **Écrit en base** | ✅ Oui |

**Ce qu'il vérifie :** envoi d'un fichier via `lib/storage.js`, création de l'enregistrement `Document`, relecture du contenu (`readFileBuffer`), cohérence de l'octet à l'octet. Couvre les deux modes de stockage : Cellar (S3) et système de fichiers local.

---

### A-5 · `scripts/test-ringover-webhook.js` — Simulation d'un webhook Ringover

| | |
|---|---|
| **Commande** | `RINGOVER_WEBHOOK_KEY=votre-cle node scripts/test-ringover-webhook.js --phone=0612345678` |
| **Écrit en base** | Indirectement, via la route webhook |

**Ce qu'il vérifie :** émission d'un événement `hangup` signé vers `/api/webhooks/ringover`, vérification de la signature, rattachement de l'appel au prospect correspondant, création de l'interaction.

---

### Scripts utilitaires associés (non-tests)

| Script | Rôle |
|---|---|
| `scripts/seed-demo.js` | Jeu de données de démonstration réaliste. 🔴 **Destructif** : supprime avant de recréer |
| `scripts/promote-admin.js <email>` | Passe un utilisateur existant en rôle `ADMIN` |
| `scripts/build.js` | Build Clever Cloud : `prisma generate` + `migrate deploy` + `next build` + copie des assets |
| `scripts/start.js` | Démarrage du serveur standalone sur `0.0.0.0:$PORT` |

---

# Partie B — Suite automatisée cible (à créer)

Ce que l'audit recommande d'écrire, par ordre de rapport valeur/effort décroissant.

### B-1 · Tests unitaires — logique pure (priorité haute)

Ces modules sont des fonctions pures : ils se testent sans base, sans serveur, sans réseau. C'est le meilleur retour sur investissement.

| # | Module | Ce qu'il faut couvrir |
|---|---|---|
| B-1.1 | `lib/scoring.js` | Score de pré-qualification : bornes 0/100, effet de chaque document fourni, cohérence du libellé retourné |
| B-1.2 | `hooks/useFinancingCalculator.js` | Mensualité, coût total, tableau d'amortissement ; cas limites : taux 0 %, durée 1 mois, montant 0 |
| B-1.3 | `lib/simulators/*` | Les 45 simulateurs : valeurs de référence connues pour chacun |
| B-1.4 | `lib/invoicing/numbering.js` | Séquence de numérotation, absence de trou, absence de doublon, changement d'exercice |
| B-1.5 | `lib/affiliate-invoice-numbering.js` | Idem pour les factures d'affiliation |
| B-1.6 | `lib/sepa-xml.js` | Conformité du XML SEPA généré au schéma pain.001 |
| B-1.7 | `lib/rateLimit.js` | Cloisonnement par seau, expiration de fenêtre, purge au-delà de 5 000 entrées |
| B-1.8 | `lib/crypto.js` | Chiffrement/déchiffrement aller-retour, rejet d'un jeton altéré |
| B-1.9 | `lib/statusMap.js` | Bijection entre les 11 statuts base et leurs libellés |
| B-1.10 | `lib/siren.js` | Validation SIREN/SIRET (clé de Luhn), formats invalides rejetés |
| B-1.11 | `utils/validation.js` | Email, téléphone, SIREN : cas valides et invalides |
| B-1.12 | `lib/cron-auth.js` | Refus si secret absent, refus si secret erroné, acceptation si correct |
| B-1.13 | `lib/ssrf-guard.js` | Rejet des adresses privées, du loopback, des redirections vers l'interne |
| B-1.14 | `lib/storage.js` (`assertSafeId`) | Rejet de `../`, des séparateurs, des identifiants vides |
| B-1.15 | `lib/affiliate-fiscal.js` | Seuils fiscaux par statut (`PARTICULIER`, `MICRO`, `SOCIETE`) |

### B-2 · Tests d'intégration — routes API (priorité moyenne)

Sur une base de test jetable, une session simulée par rôle.

| # | Famille | Ce qu'il faut couvrir |
|---|---|---|
| B-2.1 | Habilitations | Pour chacune des 92 routes : `401` sans session, `403` avec le mauvais rôle |
| B-2.2 | Cloisonnement client | Un client ne peut lire ni le dossier, ni les documents, ni les messages d'un autre |
| B-2.3 | Cloisonnement centre d'appels | Un agent ne voit que ses prospects ; un manager, ceux de son centre |
| B-2.4 | Formulaires publics | `/api/financement` et `/api/quote-requests` : validation, limitation de débit, reCAPTCHA |
| B-2.5 | Webhooks | Rejet d'une signature invalide sur Stripe, Ringover et Brevo |
| B-2.6 | Crons | `401` sans en-tête `Authorization`, `401` avec un mauvais secret |
| B-2.7 | RGPD | L'export contient toutes les données ; la suppression journalise une `RgpdAction` |

### B-3 · Tests end-to-end (priorité à planifier)

Playwright, sur les trois parcours qui portent le chiffre d'affaires.

| # | Parcours |
|---|---|
| B-3.1 | Visiteur → dépôt d'une demande de financement → réception de l'email de confirmation |
| B-3.2 | Admin → traitement du dossier → envoi d'un devis → acceptation par le client |
| B-3.3 | Client → envoi de documents → signature → passage du dossier en `SIGNED` |

---

# Partie C — Recette fonctionnelle manuelle

**190 cas de test**, organisés par espace. Chacun est autonome et vérifiable sans connaissance technique.

---

## C1 · Site public — visiteur anonyme (`TPUB`)

| ID | Test | Résultat attendu |
|---|---|---|
| TPUB-01 | Ouvrir `/` | Page d'accueil complète, fond animé, aucune erreur console |
| TPUB-02 | Simulateur rapide de l'accueil : saisir 50 000 € sur 48 mois | Mensualité calculée en direct, sans rechargement |
| TPUB-03 | Naviguer vers `/solutions` | Liste des solutions de financement |
| TPUB-04 | Ouvrir une solution `/solutions/[id]` | Fiche détaillée cohérente avec la vignette |
| TPUB-05 | Naviguer vers `/sectors` puis une fiche secteur | Contenu spécifique au secteur |
| TPUB-06 | Ouvrir `/why-leasing` | Page d'arguments, fond **blanc** (pas iridescent) |
| TPUB-07 | Ouvrir `/process` | Processus en 4 étapes |
| TPUB-08 | Ouvrir `/testimonials` | Témoignages **publiés uniquement** |
| TPUB-09 | Ouvrir `/blog` puis un article | Article lisible, mise en forme correcte |
| TPUB-10 | Ouvrir `/faq` | FAQ dépliable, données issues du back-office |
| TPUB-11 | Ouvrir `/glossaire` | Termes triés, recherche opérationnelle |
| TPUB-12 | Ouvrir `/guides` puis un guide | Guide complet |
| TPUB-13 | Ouvrir `/comparateur` | Comparateur d'offres |
| TPUB-14 | Ouvrir `/partenaires` | Logos des partenaires, tous chargés |
| TPUB-15 | Ouvrir `/about` | Page de présentation |
| TPUB-16 | Ouvrir `/assurance` | Univers assurance |
| TPUB-17 | Parcourir les 5 tunnels de devis assurance (`auto`, `moto`, `habitation`, `sante`, `rc-pro`) | Chaque assistant va jusqu'au bout |
| TPUB-18 | Ouvrir `/simulateurs` | Index des 45 simulateurs |
| TPUB-19 | Tester 5 simulateurs au hasard | Résultats cohérents, tableau d'amortissement correct |
| TPUB-20 | Ouvrir `/quiz/quelle-solution` et répondre | Recommandation cohérente avec les réponses |
| TPUB-21 | Ouvrir `/contact` et envoyer le formulaire | Message de succès + enregistrement en base |
| TPUB-22 | Déposer une demande de financement | Référence générée, dossier créé, **email de confirmation reçu** |
| TPUB-23 | Renvoyer 6 fois le même formulaire | Blocage à la 6ᵉ tentative (limitation de débit) |
| TPUB-24 | Soumettre le formulaire avec un SIREN invalide | Erreur de validation explicite |
| TPUB-25 | Soumettre sans cocher le consentement | Envoi refusé |
| TPUB-26 | S'inscrire à la newsletter depuis le pied de page | Confirmation affichée, entrée en base |
| TPUB-27 | Ouvrir `/legal`, `/privacy`, `/terms`, `/cgv` | Pages légales complètes, ORIAS et RCS visibles |
| TPUB-28 | Ouvrir une URL inexistante | Page 404 personnalisée |
| TPUB-29 | Vérifier `/sitemap.xml` | XML valide, toutes les pages publiques listées |
| TPUB-30 | Vérifier `/robots.txt` | Directives correctes, sitemap référencé |
| TPUB-31 | Refuser puis accepter le bandeau cookies | Choix mémorisé, traceurs conditionnés au consentement |
| TPUB-32 | Naviguer sur mobile (375 px) | Aucun débordement horizontal, menu opérationnel |
| TPUB-33 | Accéder à `https://finarent.fr` et `https://finarent.org` | Redirection 301 vers `finarent.com` |
| TPUB-34 | Accéder à `/simulator` | Redirection 301 vers `/simulateurs/credit-immobilier/mensualite` |

---

## C2 · Espace client (`TCLI`)

| ID | Test | Résultat attendu |
|---|---|---|
| TCLI-01 | Accéder à `/espace` sans être connecté | Redirection vers la page de connexion |
| TCLI-02 | Se connecter via Auth0 | Retour sur `/espace`, utilisateur synchronisé en base |
| TCLI-03 | Consulter le tableau de bord | Liste des dossiers, statuts et jalons corrects |
| TCLI-04 | Ouvrir un dossier `/espace/[id]` | Détail complet, chronologie visible |
| TCLI-05 | Lancer une nouvelle demande `/espace/demande` | Assistant en 5 étapes : type, projet, société, contact, récapitulatif |
| TCLI-06 | Naviguer en avant/arrière dans l'assistant | Les saisies sont conservées |
| TCLI-07 | Valider l'assistant | Dossier créé au statut `PENDING`, référence attribuée |
| TCLI-08 | Envoyer un document (KBIS) | Fichier accepté, présent dans la liste de contrôle |
| TCLI-09 | Envoyer une photo prise depuis un iPhone (HEIC) | Fichier accepté |
| TCLI-10 | Tenter d'envoyer un fichier de plus de 10 Mo | Refus avec message explicite |
| TCLI-11 | Tenter d'envoyer un `.exe` | Refus (extension non autorisée) |
| TCLI-11b | Renommer un `.exe` en `.pdf` et l'envoyer | Refus — « le contenu ne correspond pas à son type déclaré » (analyse des premiers octets) |
| TCLI-11c | Envoyer un WEBP et un HEIF | Acceptés (formats autorisés au même titre que PDF, JPG, PNG, HEIC) |
| TCLI-12 | Supprimer un document envoyé | Suppression effective, trace conservée |
| TCLI-13 | Retélécharger un document | Fichier identique à l'original |
| TCLI-14 | Suivre la liste de contrôle des documents | Progression mise à jour à chaque envoi |
| TCLI-15 | Envoyer un message sur un dossier | Message visible côté admin |
| TCLI-16 | Recevoir la réponse de l'admin | Message affiché, notification déclenchée |
| TCLI-17 | Ouvrir `/espace/notifications` | Notifications listées, marquage « lu » opérationnel |
| TCLI-18 | Cloche de notification dans l'en-tête | Compteur cohérent |
| TCLI-19 | Consulter une offre reçue | Détail de l'offre, conditions lisibles |
| TCLI-20 | Accepter une offre | Statut → `ACCEPTED`, dossier mis à jour |
| TCLI-21 | Refuser une offre | Statut → `REFUSED` |
| TCLI-22 | Signer électroniquement | Statut → `SIGNED`, preuve horodatée |
| TCLI-23 | Télécharger le PDF du dossier | PDF complet et lisible |
| TCLI-24 | Ouvrir `/espace/profile` | Coordonnées correctes |
| TCLI-25 | Modifier le profil | Modification enregistrée |
| TCLI-26 | Ouvrir `/espace/parrainage` | Code de parrainage personnel affiché |
| TCLI-27 | Partager le lien de parrainage | Lien fonctionnel, clic tracé |
| TCLI-28 | Un filleul s'inscrit via le lien | Parrainage rattaché au parrain |
| TCLI-29 | Ouvrir `/espace/security` | Sessions et journal d'accès |
| TCLI-30 | Exporter ses données (RGPD) | JSON complet téléchargé |
| TCLI-31 | Demander la suppression du compte | Suppression logique + `RgpdAction` journalisée |
| TCLI-32 | Se déconnecter | Session détruite, `/espace` de nouveau protégé |
| TCLI-33 | Tenter d'ouvrir le dossier d'un autre client par son identifiant | **403 ou 404 — jamais le contenu** |

---

## C3 · Back-office administrateur (`TADM`)

| ID | Test | Résultat attendu |
|---|---|---|
| TADM-01 | Accéder à `/admin` avec un compte non-admin | Redirection vers l'accueil |
| TADM-02 | Accéder à `/admin` en tant qu'admin | Tableau de bord avec indicateurs |
| TADM-03 | Vérifier les chiffres du tableau de bord | Cohérents avec la base |
| TADM-04 | Ouvrir `/admin/demandes` | Toutes les demandes listées |
| TADM-05 | Filtrer par statut, par produit, par date | Filtres cumulables |
| TADM-06 | Rechercher par référence, nom, SIREN | Résultats pertinents |
| TADM-07 | Ouvrir le détail d'une demande | Fiche complète : société, contact, documents, historique |
| TADM-08 | Changer le statut d'une demande | Statut mis à jour + entrée dans `StatusHistory` |
| TADM-09 | Parcourir les 11 statuts du cycle de vie | Chaque transition acceptée et tracée |
| TADM-10 | Ouvrir `/admin/demandes/kanban` | Vue en colonnes par statut |
| TADM-11 | Déplacer une carte en glisser-déposer | Statut modifié en base |
| TADM-12 | Recalculer le score d'une demande | Score et libellé mis à jour |
| TADM-13 | Répondre à un message client | Message reçu côté client |
| TADM-14 | Consulter les documents d'un dossier | Accès journalisé dans `DocumentAccess` |
| TADM-15 | Exporter les demandes | CSV complet et exploitable |
| TADM-16 | Ouvrir `/admin/devis` | Liste des devis |
| TADM-17 | Créer un devis avec plusieurs lignes | Totaux HT, TVA et TTC corrects |
| TADM-18 | Générer le PDF du devis | PDF conforme, mentions légales présentes |
| TADM-19 | Envoyer le devis au client | Statut `QUOTE_SENT`, email parti |
| TADM-20 | Ouvrir `/admin/factures` | Liste des factures |
| TADM-21 | Créer une facture | Numérotation séquentielle, sans trou |
| TADM-22 | Générer le PDF de la facture | PDF conforme |
| TADM-23 | Enregistrer un règlement partiel | Solde restant recalculé |
| TADM-24 | Enregistrer le solde | Facture passée à « payée » |
| TADM-25 | Générer un lien de paiement Stripe | Lien valide, page de paiement accessible |
| TADM-26 | Payer via le lien Stripe (mode test) | Webhook reçu, facture soldée automatiquement |
| TADM-27 | Émettre un avoir | Avoir rattaché à la facture d'origine |
| TADM-28 | Ouvrir `/admin/offers` | Offres de prêt listées |
| TADM-29 | Créer une offre pour un dossier | Offre visible côté client |
| TADM-30 | Suivre le cycle de vie d'une offre | `DRAFT` → `SENT` → `VIEWED` → `ACCEPTED` / `REFUSED` → `SIGNED` |
| TADM-31 | Ouvrir `/admin/users` | Tous les utilisateurs |
| TADM-32 | Rechercher un utilisateur | Recherche sur nom, email, société |
| TADM-33 | Ouvrir la fiche d'un utilisateur | Dossiers, documents, historique |
| TADM-34 | Changer le rôle d'un utilisateur | Rôle appliqué à la reconnexion |
| TADM-34b | **Après un changement de rôle en base seule, faire naviguer la personne (notifications, dossier), puis relire son rôle** | 🔴 Le rôle **retombe à `CLIENT`** — c'est le constat P1-8. Le test ne passe que si l'`app_metadata` Auth0 a aussi été modifiée |
| TADM-35 | Ouvrir `/admin/prospects` | Prospects listés |
| TADM-36 | Importer un fichier CSV de prospects | Import réussi, doublons signalés |
| TADM-37 | Importer un CSV malformé | Erreur explicite, aucun import partiel |
| TADM-38 | Exporter les prospects | CSV complet |
| TADM-39 | Modifier le statut d'un prospect | `NEW` → `CONTACTED` → `QUALIFIED` → `CONVERTED` / `LOST` |
| TADM-40 | Affecter un prospect à un centre d'appels | Rattachement effectif |
| TADM-41 | Ouvrir `/admin/centre-appel` | File d'appels du jour |
| TADM-42 | Journaliser un appel | Interaction enregistrée |
| TADM-43 | Ouvrir `/admin/call-centers` | Centres listés |
| TADM-44 | Créer un centre | Code unique, type, taux de commission |
| TADM-45 | Ajouter un membre `MANAGER` | Le manager précédent est rétrogradé automatiquement |
| TADM-46 | Ajouter un membre `AGENT` | Agent rattaché |
| TADM-47 | Retirer un membre | Accès au centre révoqué immédiatement |
| TADM-48 | Consulter les commissions d'un centre | Montants conformes au taux paramétré |
| TADM-49 | Exporter les commissions d'un centre | CSV complet |
| TADM-50 | Synchroniser les utilisateurs Ringover | Correspondances établies |
| TADM-51 | Ouvrir `/admin/partners` | Partenaires listés |
| TADM-52 | Créer un partenaire (`BANK`, `INSURANCE`, `LEASING`) | Fiche créée |
| TADM-53 | Transmettre un dossier à un partenaire | Statut `TRANSMITTED`, dossier visible côté partenaire |
| TADM-54 | Ouvrir `/admin/affiliates` | Affiliés listés |
| TADM-55 | Créer un affilié | Code unique généré |
| TADM-56 | Envoyer une invitation à un affilié | Email parti, `AffiliateInvite` créée |
| TADM-57 | Générer un lien d'inscription affilié | Lien valide |
| TADM-58 | Consulter les statistiques d'un affilié | Clics, prospects, dossiers, commissions |
| TADM-59 | Valider une commission d'affiliation | `PENDING` → `VALIDATED` |
| TADM-60 | Ouvrir `/admin/affiliates/payouts` | Versements listés |
| TADM-61 | Générer le fichier SEPA | XML conforme au schéma pain.001 |
| TADM-62 | Générer la déclaration DAS2 | Fichier conforme |
| TADM-63 | Générer une facture d'affiliation | PDF conforme |
| TADM-64 | Ouvrir `/admin/faq` | Entrées FAQ listées |
| TADM-65 | Créer, modifier, supprimer une entrée FAQ | Répercuté sur `/faq` |
| TADM-66 | Créer une FAQ dont la réponse contient `</script>` | La page `/faq` **ne doit pas casser** (voir constat P2-6) |
| TADM-67 | Ouvrir `/admin/testimonials` | Témoignages listés |
| TADM-68 | Publier / dépublier un témoignage | Répercuté sur `/testimonials` |
| TADM-69 | Ouvrir `/admin/logs` | Journal d'activité horodaté |
| TADM-70 | Filtrer le journal par utilisateur et par action | Filtres opérationnels |
| TADM-71 | Ouvrir `/admin/settings` | Paramètres modifiables |
| TADM-72 | Consulter les alertes SLA | Dossiers hors délai remontés |
| TADM-73 | Consulter les inscrits à la newsletter | Liste complète |
| TADM-74 | Consulter les webhooks | Journal des appels entrants |
| TADM-75 | Export global | Archive complète générée |

---

## C4 · Espace centre d'appels (`TCC`)

| ID | Test | Résultat attendu |
|---|---|---|
| TCC-01 | Accéder à `/call-center` sans appartenir à un centre | Redirection vers `/espace` |
| TCC-02 | Accéder en tant qu'`AGENT` | Tableau de bord agent |
| TCC-03 | Accéder en tant que `MANAGER` | Tableau de bord + onglet Équipe |
| TCC-04 | Ouvrir `/call-center/prospects` en tant qu'agent | **Uniquement ses prospects affectés** |
| TCC-05 | Ouvrir `/call-center/prospects` en tant que manager | Tous les prospects de son centre |
| TCC-06 | Tenter d'ouvrir le prospect d'un autre centre | **403** |
| TCC-07 | Ouvrir la fiche d'un prospect | Historique des interactions |
| TCC-08 | Faire évoluer le statut d'un prospect | Enregistré, tracé |
| TCC-09 | Saisir le résultat d'un appel | `NO_ANSWER`, `CALLBACK`, `INTERESTED`, `NOT_INTERESTED`, `ANSWERED`, `VOICEMAIL` |
| TCC-10 | Ajouter une note | Note conservée |
| TCC-11 | Déclencher un rappel Ringover | Appel émis vers le poste de l'agent |
| TCC-12 | Envoyer un SMS Ringover | SMS reçu, interaction journalisée |
| TCC-13 | Ouvrir `/call-center/interactions` | Appels et SMS listés |
| TCC-14 | Ouvrir `/call-center/emails` | Statistiques Brevo |
| TCC-15 | Envoyer un email de prospection unitaire | Email parti, `EmailLog` créé |
| TCC-16 | Envoyer un envoi groupé | Tous les destinataires traités |
| TCC-17 | Vérifier le suivi d'un email | `SENT` → `DELIVERED` → `OPENED` via webhook Brevo |
| TCC-18 | Ouvrir `/call-center/team` en tant que manager | Membres et performances |
| TCC-19 | Ouvrir `/call-center/team` en tant qu'agent | **Accès refusé** |
| TCC-20 | Recevoir un appel entrant | Fiche prospect ouverte automatiquement (bandeau Ringover) |

---

## C5 · Espace partenaire (`TPAR`)

| ID | Test | Résultat attendu |
|---|---|---|
| TPAR-01 | Accéder à `/partner` avec un rôle `CLIENT` | Redirection vers l'accueil |
| TPAR-02 | Accéder avec le rôle `PARTNER` | Tableau de bord partenaire |
| TPAR-03 | Ouvrir `/partner/applications` | **Uniquement les dossiers qui lui ont été transmis** |
| TPAR-04 | Ouvrir le détail d'un dossier | Fiche complète |
| TPAR-05 | Accepter un dossier | Statut → `APPROVED` |
| TPAR-06 | Refuser un dossier | Statut → `REJECTED`, motif enregistré |
| TPAR-07 | Ouvrir `/partner/commissions` | Commissions du partenaire |
| TPAR-08 | Vérifier les montants | Conformes au barème |
| TPAR-09 | Tenter d'ouvrir un dossier non transmis | **403** |

---

## C6 · Espace assureur (`TASS`)

| ID | Test | Résultat attendu |
|---|---|---|
| TASS-01 | Accéder à `/insurer` avec un rôle `CLIENT` | Redirection vers l'accueil |
| TASS-02 | Accéder avec le rôle `INSURER` | Tableau de bord assureur |
| TASS-03 | Ouvrir `/insurer/applications` | Uniquement les demandes d'assurance |
| TASS-04 | Traiter une demande | Statut mis à jour |
| TASS-05 | Consulter les statistiques | Chiffres cohérents |

---

## C7 · Affiliation (`TAFF`)

| ID | Test | Résultat attendu |
|---|---|---|
| TAFF-01 | Ouvrir `/affiliate/[code]` avec un code valide | Page publique de l'affilié |
| TAFF-02 | Ouvrir avec un code inconnu | 404 |
| TAFF-03 | Arriver sur le site via `?ref=CODE` | Clic enregistré, cookie posé |
| TAFF-04 | Déposer une demande après un clic tracé | Dossier rattaché à l'affilié |
| TAFF-05 | Consulter les statistiques publiques | Compteurs agrégés — **aucune donnée nominative** |
| TAFF-06 | Consulter les statistiques d'un affilié qui les a désactivées | 404 |
| TAFF-07 | Ouvrir `/affiliate/[code]/onboarding` | Formulaire d'inscription |
| TAFF-08 | Compléter l'inscription | Coordonnées bancaires chiffrées en base |
| TAFF-09 | Envoyer une invitation depuis la page affilié | Email parti |
| TAFF-10 | Envoyer 6 invitations d'affilée | Blocage à la 6ᵉ (limitation de débit) |
| TAFF-11 | Signature d'un dossier apporté | Commission `PENDING` créée automatiquement |
| TAFF-12 | Vérifier le calcul de commission | `FIXED` et `PERCENT` corrects |

---

## C8 · Sécurité et habilitations (`TSEC`)

| ID | Test | Résultat attendu |
|---|---|---|
| TSEC-01 | Appeler `/api/admin/users` sans session | **401** |
| TSEC-02 | Appeler `/api/admin/users` avec une session `CLIENT` | **403** |
| TSEC-03 | Idem sur les 47 routes `/api/admin/*` | **403** systématique |
| TSEC-04 | Appeler `/api/partner/*` avec une session `CLIENT` | **403** |
| TSEC-05 | Appeler `/api/insurer/*` avec une session `CLIENT` | **403** |
| TSEC-06 | Appeler `/api/call-center/*` sans appartenir à un centre | **401** |
| TSEC-07 | Lire le dossier d'un autre client via son identifiant | **403 / 404** |
| TSEC-08 | Télécharger le document d'un autre client | **403** |
| TSEC-09 | Appeler `/api/cron/reminders` sans en-tête `Authorization` | **401** |
| TSEC-10 | Appeler un cron avec un mauvais secret | **401** |
| TSEC-11 | Envoyer un webhook Stripe non signé | **400** |
| TSEC-12 | Envoyer un webhook Ringover non signé | **401** |
| TSEC-13 | Envoyer un webhook Brevo sans jeton | **401** |
| TSEC-14 | Tenter une injection SQL dans un champ de recherche | Aucun effet (Prisma paramétré) |
| TSEC-15 | Tenter une injection XSS dans un message | Contenu échappé à l'affichage |
| TSEC-16 | Tenter une traversée de répertoire sur un identifiant de document | Rejet (`assertSafeId`) |
| TSEC-17 | Vérifier les en-têtes HTTP de réponse | HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy présents |
| TSEC-18 | Vérifier la redirection HTTP → HTTPS | 301 systématique |
| TSEC-19 | Réutiliser une session après déconnexion | Refusée |
| TSEC-20 | Vérifier le chiffrement des données sensibles en base | IBAN et pièces d'identité illisibles en clair |

---

## C9 · Conformité RGPD (`TRGPD`)

| ID | Test | Résultat attendu |
|---|---|---|
| TRGPD-01 | Exporter ses données depuis `/espace/security` | JSON exhaustif |
| TRGPD-02 | Vérifier le contenu de l'export | Dossiers, documents, messages, consentements — tout y est |
| TRGPD-03 | Demander la suppression du compte | Suppression effective |
| TRGPD-04 | Vérifier la trace de suppression | `RgpdAction` de type `DELETE_ACCOUNT` avec IP et user-agent |
| TRGPD-05 | Se désinscrire de la newsletter | Désinscription immédiate |
| TRGPD-06 | Refuser les cookies | Aucun traceur analytique chargé |
| TRGPD-07 | Retirer un consentement | `CONSENT_REVOKE` journalisé |
| TRGPD-08 | Vérifier la purge des clics d'affiliation | Clics de plus de 13 mois supprimés (dépend du cron — voir P0-2) |
| TRGPD-09 | Vérifier la journalisation des accès aux documents | `DocumentAccess` alimenté à chaque consultation |
| TRGPD-10 | Vérifier les mentions légales | ORIAS, RCS Melun, DPO, durées de conservation |

---

## C10 · Intégrations externes (`TINT`)

> Ces tests sont `N/A` tant que la clé correspondante n'est pas configurée (voir constat P1-6).

| ID | Intégration | Test | Variable requise |
|---|---|---|---|
| TINT-01 | SMTP | Email de confirmation de demande reçu | `SMTP_*` |
| TINT-02 | SMTP | Email d'alerte admin reçu | `SMTP_*`, `ADMIN_EMAIL` |
| TINT-03 | SMTP | Email d'invitation affilié reçu | `SMTP_*` |
| TINT-04 | reCAPTCHA | Soumission avec un jeton invalide refusée | `RECAPTCHA_SECRET_KEY` |
| TINT-05 | Stripe | Lien de paiement généré | `STRIPE_SECRET_KEY` |
| TINT-06 | Stripe | Webhook de paiement solde la facture | `STRIPE_WEBHOOK_SECRET` |
| TINT-07 | YouSign | Demande de signature créée | `YOUSIGN_API_KEY` |
| TINT-08 | YouSign | Signature aboutie, dossier en `SIGNED` | `YOUSIGN_API_KEY` |
| TINT-09 | Ringover | Rappel automatique déclenché | `RINGOVER_API_KEY` |
| TINT-10 | Ringover | SMS envoyé | `RINGOVER_SMS_FROM_NUMBER` |
| TINT-11 | Ringover | Webhook d'appel reçu et rattaché | `RINGOVER_WEBHOOK_KEY` |
| TINT-12 | Brevo | Email de prospection envoyé | `BREVO_API_KEY` |
| TINT-13 | Brevo | Webhook d'ouverture reçu | `BREVO_WEBHOOK_TOKEN` |
| TINT-14 | Cellar | Document stocké sur S3 | `CELLAR_*` |
| TINT-15 | Cellar | URL signée valide et expirante | `CELLAR_*` |
| TINT-16 | Sentry | Une erreur provoquée remonte dans Sentry | `NEXT_PUBLIC_SENTRY_DSN` |
| TINT-17 | PostHog | Les événements de navigation remontent | `NEXT_PUBLIC_POSTHOG_KEY` |
| TINT-18 | Auth0 | Connexion, déconnexion, claim de rôle | `AUTH0_*` |
| TINT-19 | API SIRET | Recherche d'entreprise par SIRET | — |

---

## C11 · Tâches planifiées (`TCRON`)

> ⚠️ Les trois tâches sont bien déclarées dans `clevercloud/cron.json`, mais leur exécution réelle dépend de `CRON_SECRET` côté Clever Cloud — et un échec y est **silencieux** (constat P0-2). Le test `TCRON-08` est donc le plus important de cette série.

| ID | Test | Résultat attendu |
|---|---|---|
| TCRON-01 | Appeler `/api/cron/reminders` avec le bon secret | 200, relances envoyées |
| TCRON-02 | Vérifier qu'un dossier `DOCUMENTS_NEEDED` de plus de 7 jours est relancé | Email parti |
| TCRON-03 | Appeler `/api/cron/sla-check` avec le bon secret | 200, alertes créées |
| TCRON-04 | Vérifier les 3 niveaux de SLA | `PENDING` > 4 h, `REVIEWING` > 24 h, `DOCUMENTS_NEEDED` > 48 h |
| TCRON-05 | Vérifier la déduplication des alertes | Pas de doublon dans une fenêtre de 24 h |
| TCRON-06 | Appeler `/api/cron/affiliate-purge` avec le bon secret | Clics de plus de 13 mois supprimés |
| TCRON-07 | Appeler un cron **sans** en-tête `Authorization` | 401 (fail-closed) |
| TCRON-08 | **Lire les journaux Clever Cloud après une exécution planifiée** | La réponse est `200` et non `{"error":"Non autorisé"}` — c'est le seul moyen de savoir si les crons tournent réellement |

---

## C12 · Tests non fonctionnels (`TNF`)

| ID | Test | Critère d'acceptation |
|---|---|---|
| TNF-01 | Affichage mobile 375 px | Aucun débordement horizontal sur les 75 pages |
| TNF-02 | Affichage tablette 768 px | Mise en page cohérente |
| TNF-03 | Affichage bureau 1920 px | Aucun contenu étiré |
| TNF-04 | Chrome, Firefox, Safari, Edge | Rendu et fonctionnement identiques |
| TNF-05 | Safari iOS | Envoi de photos HEIC opérationnel |
| TNF-06 | Lighthouse — Performance | ≥ 80 sur l'accueil |
| TNF-07 | Lighthouse — Accessibilité | ≥ 90 |
| TNF-08 | Lighthouse — SEO | ≥ 95 |
| TNF-09 | Navigation au clavier | Tous les parcours praticables sans souris |
| TNF-10 | Lecteur d'écran | Formulaires correctement étiquetés |
| TNF-11 | Contraste des couleurs | Conforme WCAG AA |
| TNF-12 | Temps de réponse API | < 500 ms sur les listes |
| TNF-13 | Charge : 50 utilisateurs simultanés | Aucune erreur 5xx |
| TNF-14 | Redémarrage de l'application | Reprise sans perte de session |
| TNF-15 | Base indisponible | Message d'erreur maîtrisé, pas de trace technique exposée |

---

# Partie D — Matrice des habilitations API

92 routes. Le rôle indiqué est celui exigé par le garde serveur.

| Famille | Routes | Garde attendu |
|---|---|---|
| `/api/admin/*` | 47 | `requireAdmin` → 403 sinon |
| `/api/partner/*` | 3 | `requirePartner` (ou `ADMIN`) |
| `/api/insurer/*` | 2 | `requireInsurer` (ou `ADMIN`) |
| `/api/call-center/*` | 3 | `loadCallCenterUser` + `hasCallCenterAccess` |
| `/api/applications/*`, `/api/documents/*`, `/api/messages`, `/api/notifications`, `/api/profile/*`, `/api/offers/*`, `/api/referrals` | 15 | `requireAuth` + cloisonnement par propriétaire |
| `/api/cron/*` | 3 | `isCronAuthorized` (fail-closed) |
| `/api/webhooks/*` | 3 | Signature ou jeton vérifié |
| `/api/financement`, `/api/quote-requests` | 2 | Public + limitation de débit + reCAPTCHA |
| `/api/prospects`, `/api/newsletter`, `/api/testimonials`, `/api/siret/[siret]`, `/api/affiliate/[code]/invite` | 5 | Public + limitation de débit |
| `/api/faq`, `/api/health`, `/api/affiliate/[code]/stats`, `/api/affiliate/track`, `/api/affiliate/[code]/onboarding` | 5 | Public par conception |
| `/api/auth/*` | 2 | Géré par Auth0 |

**Test systématique à passer sur chaque route protégée :** appel sans session → `401` ; appel avec le mauvais rôle → `403`. C'est le test `TSEC-03`, à exécuter en boucle sur la liste ci-dessus.

---

# Partie E — Contrôles avant chaque mise en ligne

À exécuter dans l'ordre. Si l'un échoue, la mise en ligne est suspendue.

| # | Contrôle | Commande | Critère |
|---|---|---|---|
| E-1 | Typage | `npx tsc --noEmit` | 0 erreur |
| E-2 | Lint | `npm run lint` | 0 avertissement |
| E-3 | Vulnérabilités | `npm audit --omit=dev` | Aucune vulnérabilité critique |
| E-4 | Build | `npm run build` | Build réussi |
| E-5 | Migrations | `npx prisma migrate status` | Aucune migration en attente |
| E-6 | Sonde de santé | `curl https://finarent.com/api/health` | `{"status":"ok"}` |
| E-7 | Fumée fonctionnelle | TPUB-01, TPUB-22, TCLI-02, TADM-02 | Tous OK |
| E-8 | Recette ciblée | Les cas liés au périmètre modifié | Tous OK |

---

# Partie F — Récapitulatif chiffré

| Catégorie | Cas de test |
|---|---|
| A — Automatisés existants | 5 scripts (≈ 20 contrôles) |
| B — Automatisés à créer | 15 unitaires + 7 familles d'intégration + 3 end-to-end |
| C1 — Public | 34 |
| C2 — Client | 35 |
| C3 — Admin | 76 |
| C4 — Centre d'appels | 20 |
| C5 — Partenaire | 9 |
| C6 — Assureur | 5 |
| C7 — Affiliation | 12 |
| C8 — Sécurité | 20 |
| C9 — RGPD | 10 |
| C10 — Intégrations | 19 |
| C11 — Crons | 8 |
| C12 — Non fonctionnel | 15 |
| **Total recette manuelle** | **263 cas** |

**Durée estimée d'une campagne complète** : 3 jours-homme, ou 5 testeurs sur une demi-journée en se répartissant les espaces.

---

# Partie G — Fiche de rapport de bug

À remplir pour chaque test en échec.

```
─────────────────────────────────────────
ID du test   : ................ (ex. TADM-23)
Testeur      : ................
Date/heure   : ................
Environnement: ☐ Local  ☐ Production
Navigateur   : ................ Version : ......
Appareil     : ☐ Bureau  ☐ Mobile  ☐ Tablette
Compte utilisé : ................ Rôle : ......

Résultat     : ☐ OK  ☐ KO  ☐ Bloqué  ☐ N/A
Gravité      : ☐ Bloquant  ☐ Majeur  ☐ Mineur  ☐ Cosmétique

Étapes exactes pour reproduire :
1. ..................................
2. ..................................
3. ..................................

Résultat attendu   : ..................................
Résultat observé   : ..................................

Message d'erreur (copie exacte) :
..................................

Capture d'écran jointe : ☐ Oui  ☐ Non
Reproductible          : ☐ Toujours  ☐ Parfois  ☐ Une seule fois
─────────────────────────────────────────
```

---

## Documents liés

| Document | Contenu |
|---|---|
| `docs/AUDIT_2026-09.md` | Constats techniques et plan de remédiation |
| `docs/TUTORIEL_UTILISATION.md` | Prise en main par rôle |
| `docs/PROCEDURES_EXPLOITATION.md` | Installation, déploiement, exploitation, incidents |
| `docs/DOSSIER_TESTS_EQUIPE.md` | Scénarios pédagogiques pour l'équipe interne |
| `docs/TESTS_CLIENT.md` | Protocole de recette côté client |
| `docs/TESTS_DEBUTANT.md` | Version pas-à-pas pour testeur non technique |
