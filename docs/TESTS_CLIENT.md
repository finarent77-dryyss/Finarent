# Tutoriel de recette — Finarent

Guide pas-à-pas pour tester la plateforme. Pour chaque scénario :

1. **Action** — exactement quoi cliquer / saisir
2. **Vous devriez voir** — résultat visuel attendu
3. ☐ Cocher si OK, noter l'écart sinon

> **Date du test** : ___ / ___ / 2026
> **Testeur** : ____________________
> **Navigateur** : ☐ Chrome   ☐ Safari   ☐ Firefox   ☐ Edge   ☐ Mobile

---

## 0. Préparation

### 0.1 Identifiants de connexion

Vous avez 3 comptes de démonstration. Chaque compte permet de tester un rôle différent.

| Rôle | Email | URL après connexion |
|---|---|---|
| **Client** | andrys972@gmail.com | `/espace` |
| **Admin** | andrys.magar@hotmail.fr | `/admin` |
| **Partenaire** | andrys.developper@gmail.com | `/partner` |

Mot de passe : *fourni dans un message séparé*.

### 0.2 Comment se connecter

1. Ouvrir [https://finarent.fr](https://finarent.fr) (ou l'URL de pré-prod fournie)
2. Cliquer sur **"Se connecter"** en haut à droite du site
3. Saisir l'email correspondant au rôle à tester
4. Saisir le mot de passe communiqué

✅ **Vous devriez voir** : redirection vers votre espace personnel (URL ci-dessus selon le rôle).

### 0.3 Changer de compte en cours de test

Pour tester un autre rôle :
1. Cliquer sur votre nom en haut à droite → **"Se déconnecter"**
2. Reconnectez-vous avec l'autre email

> 💡 **Astuce** : utilisez un onglet en navigation privée par compte pour les tester en parallèle.

---

## 1. Site public (sans connexion)

### Test 1.1 — Page d'accueil

**Action** : Aller sur [https://finarent.fr](https://finarent.fr) (ne pas être connecté).

**Vous devriez voir** :
- ☐ Un titre principal contenant le mot **"Finarent"** ou un slogan financement/assurance
- ☐ Le logo Finarent en haut à gauche
- ☐ Un menu avec au moins : `Solutions · Assurance · Simulateurs · FAQ · Contact`
- ☐ Une photo équipe avec une carte glassmorphique affichant des chiffres (ex. **"1200+ entreprises"**, **"98 % d'accords"**, **"48 h"**)
- ☐ Deux boutons : **"Faire ma demande"** (rempli, indigo) et **"Voir les simulateurs"** (contour)
- ☐ En descendant : alternance de sections blanches et de sections fond beige/iridescent
- ☐ Le site se charge en **moins de 3 secondes**

### Test 1.2 — Bandeau cookies

**Action** : Première visite en navigation privée.

**Vous devriez voir** :
- ☐ Un bandeau cookies apparaît en bas
- ☐ Boutons **"Accepter"** / **"Refuser"** / **"Personnaliser"**
- ☐ Cliquer "Accepter" → le bandeau disparaît et ne réapparaît plus à la prochaine navigation

### Test 1.3 — Page Solutions

**Action** : Menu → **Solutions**.

**Vous devriez voir** :
- ☐ Une grille avec 5 produits : **Prêt pro · Crédit-bail · LOA · LLD · RC Pro**
- ☐ Chaque carte a une icône, un titre, une description courte
- ☐ Cliquer sur "Crédit-bail" → page détaillée `/solutions/credit-bail` avec un visuel et un bouton "Simuler"

### Test 1.4 — Page Assurance (22 produits)

**Action** : Menu → **Assurance**.

**Vous devriez voir** :
- ☐ Une section **"Particuliers"** avec des cartes (auto, moto, habitation, santé…)
- ☐ Une section **"Professionnels"** avec d'autres cartes (RC Pro, multirisque, flotte…)
- ☐ Chaque carte particulière a un statut **"obligatoire"** ou **"recommandée"**
- ☐ Cliquer sur **"Assurance auto"** → ouvre `/assurance/auto` avec un tunnel devis

### Test 1.5 — Page Simulateurs

**Action** : Menu → **Simulateurs**.

**Vous devriez voir** :
- ☐ En haut : badge **"43 simulateurs"** ou similaire
- ☐ Le titre **"Tous nos simulateurs financiers"** (le dernier mot en dégradé arc-en-ciel)
- ☐ 5 catégories alignées verticalement : Crédit immobilier · Crédit conso/auto · Crédit pro · Assurance emprunteur · Assurances IARD
- ☐ Sous chaque catégorie : grille de cartes simulateurs
- ☐ Certains simulateurs ont un **badge violet "🔒 Compte"** en haut à droite (ex. capacité d'emprunt, scoring bancaire)
- ☐ Cliquer sur **"Mensualité"** (pas de badge) → ouvre directement le simulateur

### Test 1.6 — Page Glossaire

**Action** : Aller sur `/glossaire`.

**Vous devriez voir** :
- ☐ Titre **"Glossaire financier"** + badge **"33 définitions"**
- ☐ Une barre de recherche
- ☐ 4 filtres par catégorie : Crédit · Assurance · Professionnel · Fiscalité
- ☐ Un index alphabétique (A, B, C, D…) avec pastille dégradée
- ☐ Cliquer sur un terme (ex. **"TAEG"**) → la définition complète se déplie avec animation
- ☐ Sous la définition, des liens vers les termes liés (chips vert)

### Test 1.7 — Recherche dans le glossaire

**Action** : Dans la recherche, taper **"lemoine"**.

**Vous devriez voir** :
- ☐ Filtre automatique → seul le terme **"Loi Lemoine"** reste visible
- ☐ Cliquer dessus → la définition mentionne **"juin 2022"** et **"résiliation à tout moment"**

### Test 1.8 — Page Guides

**Action** : Aller sur `/guides`.

**Vous devriez voir** :
- ☐ 5 cartes guides : crédit-bail, prêt professionnel, assurance emprunteur, LOA/LLD/crédit, RC Pro
- ☐ Chaque carte affiche : icône colorée + titre + tagline + **"X chapitres · Y min"**
- ☐ Cliquer sur **"Crédit-bail"** → page `/guides/credit-bail` avec sommaire + 5 chapitres + CTA "Estimer mon crédit-bail"

### Test 1.9 — Quiz interactif

**Action** : Aller sur `/quiz/quelle-solution`.

**Vous devriez voir** :
- ☐ Question 1 : **"Qu'est-ce que vous souhaitez financer ?"** avec 4 options
- ☐ Cliquer une option → passage automatique à la question 2
- ☐ Une barre de progression en haut avance à chaque réponse
- ☐ Après les 5 questions, écran de résultat avec **un produit recommandé** + un **pourcentage de compatibilité** + une **alternative**

**Test concret** : répondre dans l'ordre :
1. "Un véhicule" → 2. "Peu importe, c'est l'usage" → 3. "Préserver la trésorerie" → 4. "Maximiser les déductions" → 5. "Moyen terme (4-7 ans)"
→ ☐ Résultat attendu : **Crédit-bail** (compatibilité ~30-40 %)

### Test 1.10 — Page Blog

**Action** : Aller sur `/blog`.

**Vous devriez voir** :
- ☐ 6 articles affichés en grille avec image + catégorie + titre + date + temps de lecture
- ☐ Cliquer sur **"Taux 2026 : ce qui change pour les emprunteurs"** → article complet (chapitres H2, paragraphes, tags en bas)
- ☐ En bas de l'article : carte dégradée **"Besoin d'aide sur votre projet ?"** avec bouton "Parler à un conseiller"

### Test 1.11 — FAQ

**Action** : Menu → **FAQ**.

**Vous devriez voir** :
- ☐ Catégories de questions
- ☐ Cliquer sur une question → la réponse se déplie

### Test 1.12 — Pages légales

**Action** : Footer en bas → cliquer dans l'ordre sur :
1. **Mentions légales** → `/legal`
2. **CGV** → `/cgv` (vérifier qu'il y a bien 19 articles numérotés)
3. **Politique de confidentialité** → `/privacy`
4. **CGU** → `/terms`

✅ ☐ Toutes ces pages s'ouvrent sans erreur 404.

**Remarques section 1** :
_______________________________________________________________
_______________________________________________________________

---

## 2. Simulateurs — tests concrets avec valeurs

### Test 2.1 — Simulateur Mensualité (libre)

**Action** :
1. Aller sur `/simulateurs/credit-immobilier/mensualite`
2. Au-dessus du simulateur, vérifier la présence du toggle **"Mode guidé / Mode expert"**
3. Cliquer sur **"Mode guidé"** s'il n'est pas déjà actif

**Saisir dans le mode guidé** :
- Étape 1 : choisir **"immobilier"**
- Étape 2 : saisir **200 000 €**
- Étape 3 : saisir **20 ans**
- Étape 4 : taux **3.8 %**, assurance **0.30 %**

**Vous devriez voir en résultat** :
- ☐ Mensualité totale **~1 240 €** (1 190 € prêt + 50 € assurance, écart ±10 €)
- ☐ Coût total **~287 500 €**
- ☐ Intérêts **~87 500 €**
- ☐ 3 cartes blanches avec libellés en mono uppercase + montant en grand
- ☐ Bouton **"Obtenir le meilleur taux"** en bas (vert)

### Test 2.2 — Toggle Mode expert

**Action** : Sur la même page, cliquer **"Mode expert"** en haut.

**Vous devriez voir** :
- ☐ L'écran change : sliders + champs nombre, tout sur une seule page
- ☐ Tableau d'amortissement en bas
- ☐ Les mêmes chiffres apparaissent quand on saisit les mêmes valeurs

### Test 2.3 — Simulateur Frais de notaire

**Action** :
1. Aller sur `/simulateurs/credit-immobilier/frais-notaire`
2. Choisir **"un logement ancien"**
3. Prix d'achat : **250 000 €**
4. Apport : **50 000 €**

**Vous devriez voir** :
- ☐ Frais de notaire **~19 500 €** (soit ~7,8 %)
- ☐ Prix + frais **~269 500 €**
- ☐ Emprunt nécessaire **~219 500 €**
- ☐ Détail des frais : Droits d'enregistrement (le plus gros), Émoluments du notaire, Débours

**Action de contrôle** : changer pour **"un logement neuf"**.

**Vous devriez voir** :
- ☐ Les frais chutent à **~7 500 € (~3 %)** — c'est normal, le neuf est moins taxé

### Test 2.4 — Capacité d'emprunt (gaté ≠ compte requis)

**Action** :
1. Sans être connecté, aller sur `/simulateurs/credit-immobilier/capacite-emprunt`

**Vous devriez voir** :
- ☐ Vous êtes **redirigé vers la page de connexion Auth0** (ou un écran "Compte requis")

**Action** : se connecter avec `andrys972@gmail.com` (rôle CLIENT) → revenir sur la même URL.

**Vous devriez voir** :
- ☐ Le wizard Pretto s'affiche : barre de progression + stepper vertical à gauche avec **8 étapes** :
  1. Projet · 2. Situation perso (âge) · 3. Situation familiale · 4. Situation pro · 5. Revenus · 6. Charges · 7. Apport · 8. Taux

**Test pas à pas** :
- Étape 1 : choisir **"un logement ancien"** → cliquer Suivant
- Étape 2 : saisir **35** ans
- Étape 3 : **"en couple"**
- Étape 4 : **"CDI"**
- Étape 5 : revenus **4 500 €**
- Étape 6 : charges **300 €**
- Étape 7 : apport **30 000 €**
- Étape 8 : **20 ans** à **3.8 %**

**Vous devriez voir en résultat** :
- ☐ Titre **"Vous pouvez emprunter jusqu'à ~226 500 €"** (±5 k€)
- ☐ Mensualité maximale **~1 275 €**
- ☐ Reste pour vivre **~2 925 €**
- ☐ Récap de profil en bas avec toutes les saisies
- ☐ Bouton **"Être recontacté par un expert"**

### Test 2.5 — Scoring bancaire (gaté)

**Action** : `/simulateurs/credit-professionnel/scoring-bancaire` (rôle CLIENT connecté).

**Saisir** : revenu **4 500 €**, endettement **25 %**, ancienneté **5 ans**, apport **15 %**, **CDI**, pas d'incidents.

**Vous devriez voir** :
- ☐ Score affiché en très gros chiffre coloré
- ☐ Score attendu **~88-93** (zone verte "B — Bon")
- ☐ Taux d'acceptation **~88 %**
- ☐ Barre de progression verte remplie à 88-93 %

**Test contraste** : Cocher la case **"Incidents bancaires"** → recalcul.

**Vous devriez voir** :
- ☐ Le score chute à **~63-68** (zone amber "C — Correct")
- ☐ Taux d'acceptation tombe à **~65 %**

### Test 2.6 — Assurance emprunteur (gaté)

**Action** : `/simulateurs/assurance-emprunteur/assurance-emprunteur`, mode guidé.

**Saisir** : capital **200 000 €**, **20 ans**, base **capital initial**, taux **0.30 %**, quotité **100 %**, seul.

**Vous devriez voir** :
- ☐ Coût total **~12 000 €**
- ☐ Prime initiale/mois **~50 €**
- ☐ Économies estimées délégation **~6 800 €**
- ☐ Encart **"Loi Lemoine"** rappelant le droit de changer à tout moment

**Remarques section 2** :
_______________________________________________________________
_______________________________________________________________

---

## 3. Parcours CLIENT — `andrys972@gmail.com`

### Test 3.1 — Première connexion

**Action** : Se connecter avec le compte CLIENT.

**Vous devriez voir** :
- ☐ Page Auth0 (interface bleue / blanche)
- ☐ Après login, redirection automatique vers `/espace`
- ☐ Dashboard avec : carte "Mes dossiers", carte "Économies estimées", liste des derniers messages, raccourcis simulateurs
- ☐ Aucun **"NaN€"** ou texte cassé dans les cartes

### Test 3.2 — Créer une nouvelle demande

**Action** :
1. Cliquer **"Nouvelle demande"** (bouton vert)
2. Suivre le wizard

**Wizard de demande — saisir** :
- Produit : **Crédit-bail**
- Société : **SARL TEST CLIENT**
- SIREN : **552120222** (LVMH — pour valider l'autocomplete)
- Montant : **35 000 €**
- Durée : **48 mois**
- Description : "Achat utilitaire de livraison"

**Vous devriez voir** :
- ☐ Le SIREN se valide (info entreprise affichée automatiquement)
- ☐ Bouton "Soumettre" à la fin du wizard
- ☐ Redirection vers le détail du dossier avec **statut "PENDING"** (badge orange)
- ☐ Email de confirmation reçu sur **andrys972@gmail.com** (objet : "Votre demande Finarent")

### Test 3.3 — Upload de document

**Action** :
1. Sur le détail du dossier → section **"Documents"**
2. Cliquer **"Envoyer un fichier"**
3. Choisir un PDF (ex. votre RIB de test ou n'importe quel PDF < 5 Mo)
4. Type de document : **"RIB"**

**Vous devriez voir** :
- ☐ Barre de progression d'upload
- ☐ Une fois fini : le fichier apparaît dans la liste avec son nom + taille + date + bouton télécharger
- ☐ Aucun message d'erreur

**Test négatif** : essayer d'uploader un fichier .exe ou .sh.

**Vous devriez voir** :
- ☐ Message d'erreur clair (type "format non autorisé")
- ☐ Le fichier n'est pas uploadé

### Test 3.4 — Messagerie dossier

**Action** :
1. Détail du dossier → section **"Messages"**
2. Saisir : "Bonjour, je souhaite ajouter une information sur le véhicule"
3. Envoyer

**Vous devriez voir** :
- ☐ Le message apparaît dans le fil de discussion à droite (bulle utilisateur)
- ☐ L'heure d'envoi est affichée
- ☐ Notification visible côté admin (vérifier au test 4.X)

### Test 3.5 — Modifier le profil

**Action** : `/espace/profile`.

**Vous devriez voir** :
- ☐ Champs nom / téléphone / société / forme juridique pré-remplis
- ☐ Modifier le téléphone en **+33 6 12 34 56 78** → cliquer "Sauvegarder"
- ☐ Confirmation "Profil mis à jour" en toast en haut à droite
- ☐ Rafraîchir la page → la nouvelle valeur reste

### Test 3.6 — Export RGPD

**Action** : `/espace/security` → bouton **"Exporter mes données"**.

**Vous devriez voir** :
- ☐ Un fichier `.json` ou `.zip` se télécharge dans votre navigateur
- ☐ Contenu : profil + dossiers + documents + messages + prospect events
- ☐ Email de confirmation envoyé (audit RGPD)

### Test 3.7 — Notifications

**Action** : `/espace/notifications`.

**Vous devriez voir** :
- ☐ Liste des évènements récents (création de dossier, message reçu…)
- ☐ Les non-lus en gras
- ☐ Clic sur une notif → redirection vers l'élément concerné

### Test 3.8 — Parrainage

**Action** : `/espace/parrainage`.

**Vous devriez voir** :
- ☐ Un **code personnel** type `FIN-XXXX` ou un lien unique `https://finarent.fr/?ref=XXXX`
- ☐ Bouton "Copier le lien"
- ☐ Compteur de filleuls et commissions générées

**Remarques section 3** :
_______________________________________________________________
_______________________________________________________________

---

## 4. Back-office ADMIN — `andrys.magar@hotmail.fr`

### Test 4.1 — Connexion + dashboard

**Action** : Déconnecter le CLIENT, se reconnecter avec **andrys.magar@hotmail.fr**.

**Vous devriez voir** :
- ☐ Redirection automatique vers `/admin`
- ☐ Sidebar gauche avec : Dashboard, Demandes, Devis, Factures, Offres, Utilisateurs, **Prospection** (nouveau), Partenaires, Logs, FAQ, Témoignages, Paramètres
- ☐ Carte KPI en haut : nombre de dossiers, montant cumulé, taux conversion
- ☐ Graphique d'évolution mensuelle
- ☐ Carte **"Centre d'appel"** avec actions rapides

### Test 4.2 — Trouver le dossier créé par le CLIENT

**Action** :
1. Menu → **Demandes**
2. Rechercher **"SARL TEST CLIENT"** dans la barre de recherche

**Vous devriez voir** :
- ☐ Une ligne avec : montant **35 000 €** · produit **Crédit-bail** · statut **PENDING**
- ☐ Cliquer dessus → page détail avec onglets (Infos, Documents, Messages, Historique)
- ☐ Le document RIB uploadé au 3.3 est visible
- ☐ Le message du 3.4 est visible dans l'onglet Messages

### Test 4.3 — Changer le statut d'un dossier

**Action** :
1. Sur le dossier → bouton **"Changer le statut"**
2. Passer de **PENDING** à **REVIEWING**

**Vous devriez voir** :
- ☐ Le badge couleur change (orange → bleu)
- ☐ Un événement est ajouté à l'historique avec votre nom + horodatage
- ☐ Notification envoyée au CLIENT (vérifier sur l'autre compte)

### Test 4.4 — Vue Kanban

**Action** : Menu → **Demandes → Kanban** (ou `/admin/demandes/kanban`).

**Vous devriez voir** :
- ☐ Colonnes par statut : PENDING · REVIEWING · DOCUMENTS_NEEDED · QUOTE_SENT · APPROVED · COMPLETED
- ☐ Cartes draggable d'une colonne à l'autre
- ☐ Le compteur de cartes par colonne se met à jour

### Test 4.5 — Créer un devis

**Action** :
1. Détail du dossier → onglet **"Devis"** → **"Nouveau devis"**
2. Ajouter une ligne : "Frais de mise en place" · 500 € HT · TVA 20 %
3. Sauvegarder

**Vous devriez voir** :
- ☐ Le devis apparaît avec numéro auto (ex. `DEV-2026-0001`)
- ☐ Total HT/TVA/TTC calculé automatiquement
- ☐ Bouton **"Envoyer au client"**
- ☐ Bouton **"Télécharger PDF"** → PDF lisible avec logo Finarent

**Action suite** : cliquer **"Envoyer"**.

**Vous devriez voir** :
- ☐ Statut passe à **SENT**
- ☐ Email reçu côté CLIENT avec lien + PDF
- ☐ Le CLIENT voit le devis dans son espace

### Test 4.6 — Page Utilisateurs

**Action** : Menu → **Utilisateurs**.

**Vous devriez voir** :
- ☐ Liste des utilisateurs en table
- ☐ 4 badges en haut à droite avec compteur par rôle (CLIENT, ADMIN, PARTNER, INSURER)
- ☐ Recherche + filtre par rôle
- ☐ Cliquer sur une ligne → ouvre la page profil détaillée

### Test 4.7 — Profil utilisateur détaillé

**Action** : Cliquer sur **"Andrys Client Test"**.

**Vous devriez voir** :
- ☐ Header avec avatar (initiales colorées) + nom + email + badge de rôle
- ☐ 5 cartes stats : Dossiers · Factures · Devis · Messages · Parrainages
- ☐ 5 onglets : Vue d'ensemble · Dossiers · Factures · Devis · Messages
- ☐ L'onglet "Dossiers" liste le dossier "SARL TEST CLIENT" avec lien "Voir →"

### Test 4.8 — Prospection (nouveau)

**Action** : Menu → **Prospection** (`/admin/prospects`).

**Vous devriez voir** :
- ☐ Bandeau avec 5 stats : Total · Nouveau · Contacté · Qualifié · Converti
- ☐ Toggle de tri **"Récents"** / **"Chauds"**
- ☐ Tableau avec colonnes : **Score** (emoji + chip), Prospect, Contact, **Source** (UTM ou referrer), Dernier simulateur, Activité, Statut, Vu
- ☐ Chaque ligne cliquable → drawer latéral avec détails

**Test "drawer prospect"** : cliquer sur une ligne.

**Vous devriez voir** :
- ☐ Drawer s'ouvre depuis la droite
- ☐ Identité (email, téléphone, société, source, IP, cookie ID)
- ☐ Boutons de changement de statut : Nouveau / Contacté / Qualifié / Converti / Perdu
- ☐ Onglets : Évènements (timeline des simulations) · Notes
- ☐ Bouton **"Contacter par email"** si l'email est connu

### Test 4.9 — Affiliation

**Action** : Menu → **Affiliation** (si présent) → **"Créer un apporteur"**.

**Saisir** :
- Nom : "Apporteur Test"
- Email : votre email perso
- Type de commission : **FIXED** · 200 €/dossier signé

**Vous devriez voir** :
- ☐ Code apporteur généré (type `AP-XXXX`)
- ☐ Lien de tracking : `https://finarent.fr/?ref=AP-XXXX`
- ☐ Bouton **"Envoyer l'email d'invitation"** → si vous avez SMTP configuré, mail reçu

### Test 4.10 — Logs d'activité

**Action** : Menu → **Logs**.

**Vous devriez voir** :
- ☐ Liste des actions récentes : qui · quoi · quand
- ☐ Filtres par action / utilisateur / période
- ☐ Vos propres actions admin du jour (changement statut, création devis…) sont visibles

### Test 4.11 — Sécurité RGPD

**Action** : Détail d'un document uploadé → cliquer "Télécharger".

**Vous devriez voir** :
- ☐ Le fichier se télécharge
- ☐ Dans les logs : un évènement `DOCUMENT_DOWNLOAD` est tracé (audit RGPD)

**Remarques section 4** :
_______________________________________________________________
_______________________________________________________________

---

## 5. Espace PARTNER — `andrys.developper@gmail.com`

### Test 5.1 — Connexion partenaire

**Action** : Déconnecter l'ADMIN, se reconnecter avec le compte PARTNER.

**Vous devriez voir** :
- ☐ Redirection vers `/partner`
- ☐ Dashboard avec KPI : dossiers reçus, taux acceptation, commissions perçues
- ☐ Vous ne devez **pas** voir les éléments admin (menu différent)

### Test 5.2 — Vérifier l'isolation

**Action** :
1. Dans la barre d'URL, essayer manuellement `/admin/users`

**Vous devriez voir** :
- ☐ **Redirection automatique** vers `/espace` ou page d'erreur (403/404)
- ☐ Aucune fuite de données admin

### Test 5.3 — Liste des dossiers reçus

**Action** : Menu → **Applications**.

**Vous devriez voir** :
- ☐ Liste des dossiers transmis à ce partenaire (probablement 0 ou 1 à ce stade des tests)
- ☐ Pour chaque dossier : nom de l'entreprise + montant + produit + statut

### Test 5.4 — Commissions

**Action** : Menu → **Commissions**.

**Vous devriez voir** :
- ☐ Tableau des commissions par dossier signé
- ☐ Total cumulé en haut

**Remarques section 5** :
_______________________________________________________________
_______________________________________________________________

---

## 6. Tunnels de devis assurance

### Test 6.1 — Tunnel Assurance auto

**Action** : `/assurance/auto`.

**Vous devriez voir** :
- ☐ Hero "Assurance auto" + chip "obligatoire"
- ☐ Bouton **"Démarrer mon devis"** → tunnel à étapes

**Saisir dans le tunnel** :
1. Type de véhicule : voiture · usage personnel
2. Marque/modèle : **Peugeot 208**
3. Année : **2022**
4. Profil conducteur : permis depuis **2010**, 0 sinistre 5 ans
5. Coordonnées : votre nom + andrys972@gmail.com

**Vous devriez voir en résultat** :
- ☐ Estimation tarif en € **par mois** (ex. 35-55 €/mois)
- ☐ 3 formules proposées : Tiers · Tiers étendu · Tous risques
- ☐ Bouton **"Être rappelé"** ou **"Recevoir mon devis détaillé"**

### Tests 6.2 à 6.5 — Autres tunnels

Refaire le même type de test pour :
- ☐ **Moto** : `/assurance/moto`
- ☐ **Habitation** : `/assurance/habitation` (appartement T3, 65 m², Paris)
- ☐ **Santé** : `/assurance/sante` (1 adulte, 1 enfant)
- ☐ **RC Pro** : `/assurance/rc-pro` (consultant, CA 80 k€)

Pour chacun : ☐ tunnel s'enchaîne sans bug · ☐ retour arrière conserve les valeurs · ☐ devis final cohérent.

**Remarques section 6** :
_______________________________________________________________
_______________________________________________________________

---

## 7. Affichage mobile

### Test 7.1 — Smartphone

**Action** : Scanner cette URL avec votre téléphone OU ouvrir https://finarent.fr en mobile.

**Vous devriez voir** :
- ☐ Menu burger (3 traits) en haut à droite
- ☐ Cliquer → menu plein écran avec tous les liens
- ☐ Le contenu s'adapte (pas de scroll horizontal)
- ☐ Textes lisibles sans zoomer
- ☐ Boutons assez gros pour être touchés au doigt (min 44 × 44 px)

### Test 7.2 — Simulateur en mobile

**Action** : Ouvrir `/simulateurs/credit-immobilier/mensualite` en mobile.

**Vous devriez voir** :
- ☐ Le toggle Mode guidé/expert est accessible
- ☐ Les pills d'input en mode guidé sont touchables
- ☐ Le clavier numérique s'ouvre pour les champs nombre
- ☐ Le résultat final tient sur l'écran (pas de débordement)

### Test 7.3 — Espace client en mobile

**Action** : Se connecter en mobile avec **andrys972@gmail.com**.

**Vous devriez voir** :
- ☐ Dashboard lisible verticalement (cartes empilées)
- ☐ Upload de document fonctionne (sélecteur de fichier mobile)
- ☐ Messagerie utilisable

**Remarques section 7** :
_______________________________________________________________
_______________________________________________________________

---

## 8. Performance & ressenti général

### Test 8.1 — Temps de chargement

Mesurer le temps avant que la page soit utilisable (à l'œil) :

| Page | Temps mesuré | Attendu |
|---|---|---|
| `/` (accueil) | ____ s | < 3 s |
| `/simulateurs` | ____ s | < 2 s |
| `/simulateurs/credit-immobilier/mensualite` | ____ s | < 3 s |
| `/espace` (connecté) | ____ s | < 3 s |
| `/admin` (connecté) | ____ s | < 4 s |

### Test 8.2 — Animations

- ☐ Les transitions de page sont fluides (pas saccadées)
- ☐ Les hover des cartes (élévation, ombre) fonctionnent au survol souris
- ☐ Le dégradé "vibrant-shift" sur les titres anime doucement (cycle 6 s)

### Test 8.3 — Console développeur

**Action** : Ouvrir **F12** → onglet **Console**, naviguer sur 5 pages.

**Vous devriez voir** :
- ☐ Aucune erreur rouge (4xx, 5xx, exceptions)
- ☐ Warnings éventuels (jaune) → noter ci-dessous

### Test 8.4 — Note globale

**Note de l'expérience sur 10** : ___ / 10

**Trois points forts** :
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

**Trois points à améliorer en priorité** :
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

---

## 9. Signalements d'anomalies

| # | Page | Action | Résultat attendu | Résultat constaté | Bloquant ? |
|---|---|---|---|---|---|
| 1 |  |  |  |  | ☐ |
| 2 |  |  |  |  | ☐ |
| 3 |  |  |  |  | ☐ |
| 4 |  |  |  |  | ☐ |
| 5 |  |  |  |  | ☐ |
| 6 |  |  |  |  | ☐ |
| 7 |  |  |  |  | ☐ |
| 8 |  |  |  |  | ☐ |

> 💡 Joindre les **captures d'écran** par email à l'équipe dev en référençant le n° d'anomalie.

---

## 10. Validation finale

- ☐ J'ai parcouru les 9 sections ci-dessus
- ☐ Aucun bug bloquant identifié (ou bien : les bloquants ont été signalés)
- ☐ Les retours non bloquants sont listés ci-dessus
- ☐ Je **valide** la mise en ligne, sous réserve des corrections listées

**Signature du testeur** : ____________________   **Date** : ___ / ___ / 2026

---

## Annexe — Comment retourner ce document

Deux options pour transmettre vos retours :

1. **Imprimer ce PDF**, annoter au stylo, scanner ou photographier → envoyer par email à : dev@finarent.fr
2. **Remplir directement dans le PDF** (formulaire actif) → enregistrer → email

Référence du document : `TESTS_CLIENT_v2_2026-05`
