# Dossier de tests & de prise en main — Plateforme Finarent

> **Public visé** : équipe interne (commerciaux, gestionnaires, support).
> **Double objectif** :
>
> 1. **Tester** la plateforme avec un protocole reproductible.
> 2. **Apprendre** à maîtriser l'outil au quotidien.
>
> **Durée estimée** : 2 h 30 par testeur (peut être fait en plusieurs sessions de 30 min).

---

## Sommaire

1. [Mode d'emploi du dossier](#1-mode-demploi-du-dossier)
2. [Cartographie de la plateforme](#2-cartographie-de-la-plateforme)
3. [Glossaire essentiel](#3-glossaire-essentiel)
4. [Comptes de test & accès](#4-comptes-de-test--accès)
5. [Partie A — Tests Client](#partie-a--tests-client) (8 scénarios)
6. [Partie B — Tests Admin](#partie-b--tests-admin) (7 scénarios)
7. [Partie C — Tests Partenaire](#partie-c--tests-partenaire) (3 scénarios)
8. [Partie D — Parcours bout-en-bout](#partie-d--parcours-bout-en-bout) (1 scénario long)
9. [Partie E — Cas limites & erreurs](#partie-e--cas-limites--erreurs) (5 scénarios)
10. [Grille d'observations & bug-report](#10-grille-dobservations--bug-report)
11. [Check-list de maîtrise](#11-check-list-de-maîtrise)

---

## 1. Mode d'emploi du dossier

### 1.1 Comment lire un scénario

Chaque scénario est présenté en **4 blocs** :

| Bloc | Contenu | Objectif |
|---|---|---|
| 🎯 **Objectif métier** | Pourquoi ce scénario existe (côté business) | Comprendre le sens, pas juste le clic |
| 🔧 **Préparation** | Compte à utiliser, données pré-requises | Démarrer dans le bon état |
| 📋 **Étapes** | Actions exactes à effectuer | Reproduire sans ambiguïté |
| ✅ **Résultat attendu** | Ce que tu dois constater | Valider ou détecter un écart |

### 1.2 Comment remplir le dossier

Pour chaque scénario, en bas, une case :

```
☐ OK   ☐ KO   ☐ Bloqué      Observations : ____________________
```

- **OK** → tout s'est passé comme attendu.
- **KO** → un écart visible (UI, message, comportement).
- **Bloqué** → impossible d'avancer (404, crash, login refusé…).
- **Observations** → tout ce qui sort de l'ordinaire, même mineur (lenteur, faute de frappe, lien mort).

### 1.3 Bonnes pratiques

- Tester en **navigation privée** ou avec un profil dédié pour éviter les caches.
- Tester **un rôle à la fois** : ouvrir un onglet privé par compte.
- Reporter les bugs en **screenshot + URL + navigateur** dans la grille §10.
- **Ne pas sauter les blocs « Objectif métier »** : ils permettent de comprendre la logique avant de cliquer.

---

## 2. Cartographie de la plateforme

### 2.1 Les 4 rôles utilisateurs

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   CLIENT     │──────▶│    ADMIN     │──────▶│   PARTNER    │
│              │       │              │       │              │
│ Soumet une   │       │ Qualifie,    │       │ Étudie,      │
│ demande      │       │ chiffre,     │       │ valide ou    │
│              │       │ transmet     │       │ refuse       │
└──────────────┘       └──────────────┘       └──────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │   INSURER    │
                                              │  (Assureur)  │
                                              │  optionnel   │
                                              └──────────────┘
```

| Rôle | Vue principale | Permissions clés |
|---|---|---|
| **CLIENT** | `/espace` | Soumettre un dossier, suivre, téléverser docs, signer offres |
| **ADMIN** | `/admin` | Tout voir, qualifier, créer devis, transmettre aux partenaires, gérer commissions |
| **PARTNER** | `/partner` | Voir uniquement les dossiers qui lui sont transmis, accepter/refuser, suivre commissions |
| **INSURER** | `/insurer` | Variante PARTNER pour la branche assurance |

### 2.2 Cycle de vie d'un dossier (statuts)

```
PENDING ─▶ REVIEWING ─▶ DOCUMENTS_NEEDED ─▶ QUOTE_SENT
                                                │
                          ┌─────────────────────┘
                          ▼
                  QUOTE_ACCEPTED ─▶ PENDING_SIGNATURE ─▶ SIGNED
                                                              │
                          ┌───────────────────────────────────┘
                          ▼
                   TRANSMITTED ─▶ APPROVED ─▶ COMPLETED
                                      │
                                      └─▶ REJECTED  (chemin alternatif)
```

| Statut | Qui agit ? | Sens |
|---|---|---|
| `PENDING` | — | Demande soumise, en attente de prise en charge |
| `REVIEWING` | Admin | Admin analyse le dossier |
| `DOCUMENTS_NEEDED` | Client | Le client doit fournir des pièces complémentaires |
| `QUOTE_SENT` | — | Un devis a été envoyé au client |
| `QUOTE_ACCEPTED` | Client | Le client a validé le devis |
| `PENDING_SIGNATURE` | Client | YouSign en attente |
| `SIGNED` | — | Le contrat est signé |
| `TRANSMITTED` | Admin | Dossier passé au partenaire |
| `APPROVED` | Partenaire | Partenaire a accepté le dossier |
| `REJECTED` | Partenaire / Admin | Refus (motif obligatoire) |
| `COMPLETED` | — | Fonds débloqués / couverture active |

### 2.3 Les 6 produits financiers / assurances

| Code | Libellé | Pour qui ? |
|---|---|---|
| `PRET_PRO` | Prêt professionnel | TPE/PME ayant besoin de trésorerie |
| `CREDIT_BAIL` | Crédit-bail mobilier | Achat équipement avec option d'achat |
| `LOA` | Location avec Option d'Achat | Véhicule pro |
| `LLD` | Location Longue Durée | Flotte automobile sans rachat |
| `LEASING_OPS` | Leasing opérationnel | Matériel renouvelé fréquemment |
| `RC_PRO` | RC Professionnelle | Assurance obligatoire activité libérale |

---

## 3. Glossaire essentiel

| Terme | Définition courte |
|---|---|
| **Dossier / Demande / Application** | Un projet de financement ou d'assurance soumis par un client. Tous ces mots désignent la même entité (`Application` côté code). |
| **Offre** | Proposition chiffrée envoyée par Finarent au client pour un dossier (taux, durée, mensualité). |
| **Devis** | Document PDF formalisant une offre, généré depuis `/admin/devis`. |
| **Contrat** | Document signé électroniquement via YouSign après acceptation du devis. |
| **Commission** | Rétro-commission versée par le partenaire à Finarent (ou Finarent à un apporteur d'affaires) une fois le dossier `SIGNED`. |
| **Affilié / Apporteur** | Personne ou structure qui ramène des clients en échange d'une commission. Géré dans `/admin/affiliates`. |
| **Prospect** | Visiteur ayant rempli un simulateur sans aller au bout, suivi cookie-based. |
| **ORIAS** | Registre des intermédiaires en assurance et finance. Numéro obligatoire en footer de tous documents. |
| **ACPR** | Autorité de contrôle prudentiel et de résolution. Régulateur de Finarent. |
| **RGPD** | Le client peut exporter (`/api/profile/export`) et supprimer (`/api/profile/delete`) ses données. |

---

## 4. Comptes de test & accès

### 4.1 URLs

| Environnement | URL |
|---|---|
| **Pré-production** | _à fournir par l'équipe technique_ |
| **Production** | https://finarent.fr |
| **Local (dev)** | http://localhost:3000 |

### 4.2 Comptes

| Rôle | Email | Vue après login |
|---|---|---|
| Client | `andrys972@gmail.com` | `/espace` |
| Admin | `andrys.magar@hotmail.fr` | `/admin` |
| Partenaire | `andrys.developper@gmail.com` | `/partner` |

> **Mot de passe** : transmis hors-bande (canal sécurisé).
> Pour réinitialiser : page de connexion → « Mot de passe oublié ».

---

## Partie A — Tests Client

> **Rôle à utiliser** : `CLIENT` (`andrys972@gmail.com`)
> **Temps estimé** : 45 min
> **Pré-requis** : navigateur en mode privé

---

### A.1 — Découverte du site public (sans connexion)

🎯 **Objectif métier**
Un visiteur arrive sur le site : il doit comprendre l'offre en moins de 10 secondes et trouver un point d'entrée (simulateur, contact, ou demande directe).

🔧 **Préparation**
Onglet privé. Aucun compte connecté.

📋 **Étapes**
1. Aller sur la page d'accueil.
2. Scroller jusqu'au footer.
3. Cliquer sur le menu `Solutions`.
4. Cliquer sur `Crédit-bail`.

✅ **Résultat attendu**
- Le hero présente clairement « Financement & assurance pro ».
- Le menu contient `Solutions · Assurance · Simulateurs · FAQ · Contact`.
- Le footer affiche **SIRET, ORIAS, ACPR, RCS, adresse**.
- La fiche `/solutions/credit-bail` montre **avantages, durée, montants, bouton "Démarrer ma demande"**.
- Aucun écart visuel ; fond iridescent visible sur les zones blanches.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### A.2 — Simulation rapide (sans compte)

🎯 **Objectif métier**
Le simulateur est l'aimant principal pour capter un lead. Il doit fonctionner sans friction et sans demander de compte pour les versions de base.

🔧 **Préparation**
Menu → `Simulateurs` → catégorie `Crédit immobilier` → `Mensualité`.

📋 **Étapes**
1. Saisir montant : **150 000 €**
2. Saisir taux : **3,5 %**
3. Saisir durée : **20 ans**
4. Cliquer « Calculer ».

✅ **Résultat attendu**
- Mensualité calculée affichée immédiatement.
- Tableau d'amortissement consultable.
- CTA « Faire ma demande » présent en bas.
- Aucune erreur console (F12 → Console).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### A.3 — Inscription / Connexion

🎯 **Objectif métier**
La friction d'inscription doit être minimale (Auth0 magic link / social).

🔧 **Préparation**
Page d'accueil → `Mon espace`.

📋 **Étapes**
1. Cliquer `Mon espace`.
2. Sur la page Auth0 : saisir l'email du compte CLIENT.
3. Saisir le mot de passe.
4. Valider.

✅ **Résultat attendu**
- Redirection vers `/espace`.
- Le nom de l'utilisateur apparaît en haut à droite.
- Aucun cookie tiers non consenti chargé (vérifier dans F12 → Application → Cookies).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### A.4 — Soumission d'une demande (parcours guidé)

🎯 **Objectif métier**
C'est **LE** parcours critique. Si un client ne peut pas soumettre, le business s'arrête.

🔧 **Préparation**
Connecté en CLIENT, dans `/espace`.

📋 **Étapes**
1. Cliquer `+ Nouvelle demande` (ou `/espace/demande`).
2. **Étape 1 — Type** : sélectionner `Crédit-bail`.
3. **Étape 2 — Projet** : saisir équipement = `Machine industrielle`, montant = `45 000 €`, durée = `48 mois`.
4. **Étape 3 — Entreprise** : SIREN test = `552120222` (Renault — autocomplétion attendue), forme = `SAS`, secteur = `Industrie`.
5. **Étape 4 — Contact** : pré-rempli avec le profil ; ne rien changer.
6. **Étape 5 — Récap** : vérifier les infos, cocher la case de consentement RGPD, cliquer `Envoyer ma demande`.

✅ **Résultat attendu**
- À l'étape 3, après saisie SIREN, l'icône `fa-circle-check` apparaît et le nom de l'entreprise s'affiche en dessous.
- À l'étape 5, une animation overlay (logo Finarent qui pulse) apparaît pendant l'envoi.
- Redirection vers `/espace` avec la nouvelle demande en tête de liste, statut `PENDING`.
- Le client reçoit un email de confirmation avec **logo + couleurs charte** (Marine + Menthe) et un bouton vert « Suivre mon dossier ».
- L'admin reçoit une alerte email.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### A.5 — Téléversement de documents

🎯 **Objectif métier**
Le client doit pouvoir compléter son dossier (Kbis, bilans, RIB) de façon sécurisée.

🔧 **Préparation**
Cliquer sur la demande créée en A.4 → onglet `Documents`.

📋 **Étapes**
1. Glisser-déposer (ou cliquer pour parcourir) un PDF de moins de 10 Mo.
2. Sélectionner le type : `KBIS`.
3. Valider.

✅ **Résultat attendu**
- Le fichier apparaît dans la liste avec son nom, sa taille (en Mo), et la date.
- Email de confirmation reçu avec **logo + couleurs charte** : « Document bien reçu — Dossier [REF] ».
- Tentative de téléverser un `.exe` ou un fichier > 10 Mo → message d'erreur clair.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### A.6 — Récap de dossier (PDF)

🎯 **Objectif métier**
Le client doit pouvoir télécharger un récap imprimable de son dossier à tout moment.

🔧 **Préparation**
Sur la fiche dossier.

📋 **Étapes**
1. Cliquer `Télécharger le récapitulatif` (ou bouton équivalent).
2. Le PDF (ou page imprimable) s'ouvre dans un nouvel onglet.

✅ **Résultat attendu**
- En-tête avec **pastille Finarent + nom + tagline**.
- Badge statut en vert Menthe.
- Police **Plus Jakarta Sans** sur tout le document.
- Footer avec SIRET, ORIAS, adresse `12 rue de la République, 75011 Paris`.
- Bouton `Imprimer / Télécharger PDF` au-dessus du contenu (caché à l'impression).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### A.7 — Parrainage / affiliation

🎯 **Objectif métier**
Le client peut devenir apporteur d'affaires et gagner une commission par filleul qui souscrit.

🔧 **Préparation**
`/espace/parrainage`.

📋 **Étapes**
1. Copier son lien personnel.
2. (Optionnel) Inviter un contact par email via le formulaire intégré.

✅ **Résultat attendu**
- Lien unique du type `https://finarent.fr/?ref=XXXX`.
- Compteur d'invitations envoyées / acceptées.
- L'invitation envoyée arrive avec l'objet `Andrys vous recommande Finarent` et le bouton vert Menthe `Découvrir Finarent`.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### A.8 — RGPD : export & suppression

🎯 **Objectif métier**
Droit légal du client. Doit fonctionner end-to-end.

🔧 **Préparation**
`/espace/profile` ou `/espace/security`.

📋 **Étapes**
1. Cliquer `Exporter mes données` → un JSON est téléchargé.
2. Cliquer `Supprimer mon compte` (uniquement si on veut vraiment supprimer le compte de test — ⚠️ irréversible).

✅ **Résultat attendu**
- L'export contient User + Application + Document + Message + Invoice + Prospect.
- Toutes les données sont lisibles (pas chiffrées dans le JSON).
- La suppression purge effectivement le compte (re-login impossible).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

## Partie B — Tests Admin

> **Rôle à utiliser** : `ADMIN` (`andrys.magar@hotmail.fr`)
> **Temps estimé** : 40 min
> **Pré-requis** : la demande créée en A.4 doit exister.

---

### B.1 — Tableau de bord admin

🎯 **Objectif métier**
L'admin doit voir d'un coup d'œil ce qu'il doit traiter aujourd'hui.

🔧 **Préparation** : `/admin`.

📋 **Étapes** : observer la page d'accueil admin.

✅ **Résultat attendu**
- Bandeau « À traiter aujourd'hui » si actions en attente.
- Cartes statistiques : demandes du mois, taux de conversion, commissions générées.
- Sidebar avec : `Demandes · Devis · Factures · Offres · Partenaires · Apporteurs · Centre d'appel · Prospects · Utilisateurs · FAQ · Témoignages · Logs · Paramètres`.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### B.2 — Prise en charge d'une demande

🎯 **Objectif métier**
Faire passer un dossier de `PENDING` à `REVIEWING` et y associer un conseiller.

🔧 **Préparation** : `/admin/demandes`.

📋 **Étapes**
1. Ouvrir la demande créée en A.4.
2. Changer le statut → `REVIEWING`.
3. Saisir un commentaire interne (non visible client).
4. Sauvegarder.

✅ **Résultat attendu**
- Le statut change instantanément.
- L'historique du dossier affiche la transition `PENDING → REVIEWING` avec la date, l'auteur et le commentaire.
- Le client ne reçoit **pas** d'email (les commentaires internes restent privés).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### B.3 — Demande de pièces complémentaires

🎯 **Objectif métier**
Relancer le client pour obtenir un document manquant.

🔧 **Préparation** : sur la même demande.

📋 **Étapes**
1. Changer le statut → `DOCUMENTS_NEEDED`.
2. Cocher les pièces manquantes : `Bilans 2 derniers exercices`, `RIB`.
3. Cliquer `Notifier le client`.

✅ **Résultat attendu**
- Le client reçoit un email aux couleurs charte avec la liste des pièces et le bouton menthe « Téléverser mes documents ».
- L'objet de l'email : `Action requise — Documents manquants — Dossier [REF]`.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### B.4 — Création d'un devis

🎯 **Objectif métier**
Produire un PDF chiffré à envoyer au client.

🔧 **Préparation** : `/admin/devis` ou depuis la demande.

📋 **Étapes**
1. Cliquer `Nouveau devis`.
2. Sélectionner la demande.
3. Saisir : ligne `Crédit-bail Machine`, montant HT = `45 000 €`, TVA = `20 %`.
4. Définir validité = `30 jours`.
5. Cliquer `Générer le PDF`.

✅ **Résultat attendu**
- Le PDF s'ouvre dans un nouvel onglet.
- **Bandeau supérieur Marine** avec pastille du logo Finarent (et non plus juste du texte).
- **Table des lignes** avec en-tête Marine et total TTC mis en avant.
- **Mention « Bon pour accord »** + zones de signature.
- **Footer légal complet** : SIRET, RCS, ORIAS, TVA, adresse, téléphone, email.
- Filet menthe en bas (touche charte).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### B.5 — Génération d'une facture & gestion d'un paiement

🎯 **Objectif métier**
Émettre une facture et tracker son encaissement.

🔧 **Préparation** : `/admin/factures`.

📋 **Étapes**
1. Créer une facture liée à la demande A.4.
2. Émettre la facture (statut `ISSUED`).
3. Enregistrer un paiement partiel = 50 % du total.
4. Enregistrer un second paiement = solde.

✅ **Résultat attendu**
- À chaque paiement, la barre de progression admin se met à jour.
- Quand la facture passe à `PAID`, le **tampon « VALIDÉ »** apparaît automatiquement en haut à droite de l'écran, légèrement incliné.
- Le PDF de la facture montre « Déjà réglé : X € » en vert Menthe.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### B.6 — Gestion des apporteurs d'affaires

🎯 **Objectif métier**
Ajouter un apporteur externe et lui envoyer des invitations massives.

🔧 **Préparation** : `/admin/affiliates`.

📋 **Étapes**
1. Cliquer `Nouvel apporteur`, saisir nom + email + commission %.
2. Sauvegarder.
3. Sur la fiche apporteur, cliquer `Envoyer en masse`.
4. Coller un CSV avec 3 emails au format `email,nom`.
5. Lancer l'envoi.

✅ **Résultat attendu**
- Le rapport d'envoi indique : 3 envoyés, 0 échec.
- Chaque destinataire reçoit l'email d'invitation aux couleurs Finarent.
- L'historique d'invitations de l'apporteur liste les 3 envois (date + statut).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### B.7 — Transmission au partenaire

🎯 **Objectif métier**
Refiler le dossier qualifié à la banque/assureur partenaire.

🔧 **Préparation** : demande en statut `SIGNED`.

📋 **Étapes**
1. Sur la demande, sélectionner le partenaire dans la liste déroulante.
2. Cliquer `Transmettre`.
3. Changer le statut → `TRANSMITTED`.

✅ **Résultat attendu**
- La demande disparaît du dashboard admin « à traiter ».
- Elle apparaît dans `/partner/applications` côté partenaire (vérifié en partie C).
- Notification email envoyée au partenaire (template Finarent).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

## Partie C — Tests Partenaire

> **Rôle à utiliser** : `PARTNER` (`andrys.developper@gmail.com`)
> **Temps estimé** : 20 min

---

### C.1 — Vue partenaire

🎯 **Objectif métier**
Un partenaire ne voit **que** les dossiers qui lui sont transmis, jamais les autres.

🔧 **Préparation** : `/partner`.

📋 **Étapes** : naviguer dans `/partner/applications`.

✅ **Résultat attendu**
- Liste limitée aux dossiers transmis (ex : celui transmis en B.7).
- Aucune mention d'autres clients / autres partenaires.
- Commissions générées visibles dans `/partner/commissions`.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### C.2 — Décision sur un dossier

🎯 **Objectif métier**
Le partenaire accepte ou refuse, avec motif obligatoire en cas de refus.

📋 **Étapes**
1. Ouvrir un dossier `TRANSMITTED`.
2. Cliquer `Approuver` → confirmer.
3. (Variante) Cliquer `Refuser` → saisir un motif → confirmer.

✅ **Résultat attendu**
- Statut bascule à `APPROVED` ou `REJECTED`.
- L'admin reçoit une notification.
- Le client peut voir le résultat dans son espace.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

### C.3 — Suivi des commissions

🎯 **Objectif métier**
Le partenaire suit ce qu'il doit à Finarent (ou inversement selon le contrat).

📋 **Étapes** : `/partner/commissions`.

✅ **Résultat attendu**
- Tableau : date · dossier · montant financé · commission · statut paiement.
- Filtres : statut, période.
- Export CSV fonctionnel.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

## Partie D — Parcours bout-en-bout

> **Objectif** : reproduire le cycle complet d'un dossier en jouant les 3 rôles successivement.
> **Temps estimé** : 30 min.
> **Pré-requis** : 3 onglets privés ouverts, un par rôle.

### D.1 — Du visiteur au financement débloqué

| # | Rôle | Action |
|---|---|---|
| 1 | Visiteur | Arriver sur la page d'accueil, parcourir 2 simulateurs |
| 2 | Visiteur | Cliquer `Démarrer ma demande` → bascule sur l'inscription Auth0 |
| 3 | **CLIENT** | Créer un compte → atterrit dans `/espace` |
| 4 | **CLIENT** | Soumettre une demande (Crédit-bail, 30 000 €, 36 mois) |
| 5 | — | Recevoir l'email de confirmation client + l'alerte admin |
| 6 | **ADMIN** | Voir la demande dans `/admin/demandes`, passer à `REVIEWING` |
| 7 | **ADMIN** | Passer à `DOCUMENTS_NEEDED` → Kbis demandé |
| 8 | **CLIENT** | Recevoir l'email, téléverser un PDF |
| 9 | **ADMIN** | Passer à `QUOTE_SENT` après création d'un devis PDF |
| 10 | **CLIENT** | Accepter le devis (statut → `QUOTE_ACCEPTED`) |
| 11 | **CLIENT** | Signer le contrat YouSign (statut → `SIGNED`) |
| 12 | **ADMIN** | Transmettre au partenaire (statut → `TRANSMITTED`) |
| 13 | **PARTNER** | Voir le dossier, l'approuver (statut → `APPROVED`) |
| 14 | **ADMIN** | Marquer `COMPLETED` quand les fonds sont débloqués |

✅ **Résultat global attendu**
- Aucune erreur 500 sur le parcours.
- Chaque rôle ne voit que ce qu'il doit voir.
- Tous les emails reçus respectent la charte Finarent (logo, marine, menthe, Plus Jakarta Sans).
- Le dossier final affiche un historique complet de toutes les transitions.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

## Partie E — Cas limites & erreurs

> **Objectif** : tester ce qui devrait NE PAS marcher.
> **Temps estimé** : 15 min.

### E.1 — Accès interdit
- En CLIENT, ouvrir `/admin` → doit rediriger ou afficher `403`.
- En PARTNER, ouvrir un dossier qui ne lui est **pas** transmis (modifier l'URL) → doit afficher `404` ou `403`.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

### E.2 — Validation formulaire
- Soumettre une demande sans cocher le consentement RGPD → bouton désactivé ou message d'erreur clair.
- Saisir un SIREN invalide (`12345`) → message d'erreur.
- Saisir un email malformé → erreur.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

### E.3 — Upload incorrect
- Téléverser un fichier `.exe` → refusé.
- Téléverser un PDF > 10 Mo → refusé.
- Téléverser un fichier `.txt` vide → refusé ou avertissement.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

### E.4 — Session expirée
- Se connecter, attendre plus de 30 min sans activité, cliquer sur une action → renvoi vers la page de login.

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

### E.5 — Mode hors ligne
- Couper la connexion réseau pendant qu'on remplit une étape du wizard demande.
- Cliquer `Continuer` → message d'erreur clair, **pas** de perte de données saisies (idéalement).

☐ OK   ☐ KO   ☐ Bloqué — Observations : __________________________________________

---

## 10. Grille d'observations & bug-report

À remplir pour chaque écart constaté pendant les tests :

| # | Scénario | Sévérité | Description | Reproductible ? | Capture d'écran |
|---|---|---|---|---|---|
| 1 |   | ☐ Bloquant ☐ Majeur ☐ Mineur ☐ Cosmétique |   | ☐ Oui ☐ Non | ☐ Joint |
| 2 |   | ☐ Bloquant ☐ Majeur ☐ Mineur ☐ Cosmétique |   | ☐ Oui ☐ Non | ☐ Joint |
| 3 |   | ☐ Bloquant ☐ Majeur ☐ Mineur ☐ Cosmétique |   | ☐ Oui ☐ Non | ☐ Joint |
| 4 |   | ☐ Bloquant ☐ Majeur ☐ Mineur ☐ Cosmétique |   | ☐ Oui ☐ Non | ☐ Joint |
| 5 |   | ☐ Bloquant ☐ Majeur ☐ Mineur ☐ Cosmétique |   | ☐ Oui ☐ Non | ☐ Joint |

### Échelle de sévérité
- **Bloquant** : empêche d'avancer (login KO, soumission impossible, crash).
- **Majeur** : fonctionnalité dégradée mais contournable.
- **Mineur** : comportement surprenant sans impact business.
- **Cosmétique** : faute de frappe, alignement, couleur, taille de police.

### Modèle de bug-report (à envoyer à l'équipe technique)

```
TITRE : [Sévérité] Résumé en 1 ligne
URL : https://finarent.fr/...
NAVIGATEUR : Chrome 120 / Mac
COMPTE : CLIENT andrys972@gmail.com

ÉTAPES POUR REPRODUIRE :
1.
2.
3.

ATTENDU :
CONSTATÉ :

CAPTURE : [fichier joint]
CONSOLE (F12) : [copier les erreurs rouges]
```

---

## 11. Check-list de maîtrise

À cocher quand tu es à l'aise sur chaque point. Quand toutes les cases sont cochées, tu maîtrises la plateforme.

### Concepts fondamentaux
- ☐ Je sais nommer les 4 rôles utilisateur.
- ☐ Je connais les 11 statuts d'un dossier et l'ordre dans lequel ils s'enchaînent.
- ☐ Je connais les 6 codes produits (PRET_PRO, CREDIT_BAIL, LOA, LLD, LEASING_OPS, RC_PRO).
- ☐ Je sais expliquer la différence entre offre, devis et contrat.
- ☐ Je connais la signification d'ORIAS et d'ACPR.

### Navigation
- ☐ Je sais retrouver une demande à partir de son numéro.
- ☐ Je sais filtrer la liste des demandes admin.
- ☐ Je sais accéder à l'historique complet d'un dossier.
- ☐ Je sais télécharger le récap PDF d'un dossier.
- ☐ Je sais où trouver les commissions d'un apporteur.

### Actions courantes
- ☐ Je sais soumettre une demande de A à Z en moins de 5 min.
- ☐ Je sais changer le statut d'une demande côté admin.
- ☐ Je sais demander des pièces complémentaires à un client.
- ☐ Je sais créer un devis et l'envoyer.
- ☐ Je sais transmettre un dossier à un partenaire.
- ☐ Je sais enregistrer un paiement partiel sur une facture.
- ☐ Je sais inviter en masse via un CSV d'apporteurs.

### Charte & qualité
- ☐ Je reconnais instantanément les couleurs charte (Marine, Acier, Menthe, Vert profond).
- ☐ Je sais que les emails doivent toujours utiliser la pastille + Plus Jakarta Sans + bouton menthe.
- ☐ Je sais que les PDF doivent toujours afficher SIRET / ORIAS / RCS en footer.
- ☐ Je sais que le tampon « VALIDÉ » apparaît automatiquement quand une facture est `PAID`.

### Sécurité & conformité
- ☐ Je sais qu'un PARTENAIRE ne voit jamais d'autres dossiers que les siens.
- ☐ Je sais expliquer ce qu'un client peut exporter / supprimer côté RGPD.
- ☐ Je sais qu'un commentaire interne admin n'est jamais envoyé au client.

---

## Annexe — Aide-mémoire URLs internes

| Section | URL |
|---|---|
| Liste des dossiers (admin) | `/admin/demandes` |
| Détail d'un dossier | `/admin/demandes/[id]` |
| Liste des devis | `/admin/devis` |
| Liste des factures | `/admin/factures` |
| Détail facture (avec tampon) | `/admin/factures/[id]` |
| Liste des apporteurs | `/admin/affiliates` |
| Centre d'appel | `/admin/centre-appel` |
| Liste partenaires | `/admin/partners` |
| Liste utilisateurs | `/admin/users` |
| FAQ (admin) | `/admin/faq` |
| Témoignages | `/admin/testimonials` |
| Logs / audit | `/admin/logs` |
| Espace client | `/espace` |
| Nouvelle demande | `/espace/demande` |
| Parrainage | `/espace/parrainage` |
| Sécurité / RGPD | `/espace/security` |
| Espace partenaire | `/partner` |
| Demandes partenaire | `/partner/applications` |
| Commissions partenaire | `/partner/commissions` |

---

**Fin du dossier de tests.** Pour toute question : équipe technique Finarent · contact@finarent.fr.
