# Tests de recette — Finarent

Document à remplir au fur et à mesure de votre découverte de la plateforme.
Cocher chaque case validée. Noter en bas de section toute remarque, anomalie ou suggestion.

**Date du test** : ___ / ___ / 2026
**Testeur** : ____________________
**Navigateur utilisé** : ☐ Chrome   ☐ Safari   ☐ Firefox   ☐ Edge   ☐ Mobile

---

## 0. Comptes de test fournis

Trois comptes de démonstration ont été créés pour vous permettre de tester tous les rôles.

| Rôle | Identifiant | Mot de passe initial |
|---|---|---|
| **Client** (espace particulier/pro) | andrys972@gmail.com | *transmis séparément* |
| **Admin** (back-office Finarent) | andrys.magar@hotmail.fr | *transmis séparément* |
| **Partenaire** (banque/assureur) | andrys.developper@gmail.com | *transmis séparément* |

**Connexion** : cliquez sur "Se connecter" en haut à droite, choisissez l'email correspondant au rôle à tester.

---

## 1. Site public (visiteur sans compte)

### 1.1 Page d'accueil
- ☐ Le site se charge en moins de 3 secondes
- ☐ Le logo et la charte graphique correspondent à Finarent
- ☐ Les chiffres clés (1200+ entreprises, 98 % d'accords, etc.) s'affichent
- ☐ Les boutons "Faire ma demande" et "Simuler" sont visibles
- ☐ Le formulaire de contact rapide en bas de page fonctionne

### 1.2 Navigation
- ☐ Le menu en haut est lisible et accessible
- ☐ Tous les liens du footer mènent à une page valide
- ☐ Le site s'affiche correctement sur mobile (à tester sur smartphone)
- ☐ Le bandeau cookies apparaît à la première visite et se ferme

### 1.3 Pages produits
- ☐ Page "Solutions" : les 5 produits (Prêt pro, Crédit-bail, LOA, LLD, RC Pro) sont présentés
- ☐ Page "Assurance" : les 22 produits assurance sont listés et navigables
- ☐ Page "Secteurs" : les secteurs d'activité (médical, BTP, transport…) ont leur page dédiée

### 1.4 Contenu éditorial
- ☐ Page "Glossaire" : 33 termes définis, recherche fonctionnelle, filtres par catégorie
- ☐ Page "Guides" : 5 guides pédagogiques accessibles (crédit-bail, prêt pro, assurance emprunteur…)
- ☐ Page "Quiz — Quelle solution ?" : les 5 questions s'enchaînent et donnent une recommandation
- ☐ Page "Blog" : les 6 articles sont accessibles et lisibles intégralement
- ☐ Page "FAQ" : les questions/réponses s'affichent par catégorie

### 1.5 Pages légales
- ☐ Mentions légales (`/legal`) accessible
- ☐ CGV (`/cgv`) accessible et complète (19 articles)
- ☐ Politique de confidentialité (`/privacy`) accessible
- ☐ Termes d'utilisation (`/terms`) accessible

**Remarques section 1** :
_______________________________________________________________
_______________________________________________________________

---

## 2. Simulateurs

### 2.1 Hub simulateurs (`/simulateurs`)
- ☐ Les 43 simulateurs sont visibles, classés par catégorie (immo, conso, pro, assurance emprunteur, IARD)
- ☐ Les simulateurs nécessitant un compte ont un badge "Compte" violet
- ☐ La recherche / navigation par catégorie fonctionne

### 2.2 Simulateurs en accès libre (sans compte)
- ☐ **Mensualité** : test en mode guidé puis en mode expert — résultat cohérent
- ☐ **Frais de notaire** : choix Ancien/Neuf + prix → frais affichés avec barème
- ☐ **TAEG** : ajout de plusieurs frais → TAEG calculé
- ☐ **Assurance auto** : tunnel devis complet, devis affiché en fin
- ☐ **Comparateur bancaire** : 3+ offres ajoutées → comparaison visible

### 2.3 Simulateurs réservés aux comptes (avec connexion CLIENT)
- ☐ **Capacité d'emprunt** : mode guidé Pretto fonctionne sur 8 étapes
- ☐ **Tableau d'amortissement** : tableau mois par mois généré
- ☐ **Scoring bancaire** : 5 questions → score sur 100 + recommandations
- ☐ **Analyse revenus / charges (pro)** : diagnostic affiché

### 2.4 Mode guidé ↔ Mode expert (5 simulateurs phares)
- ☐ Toggle visible en haut de chaque simulateur concerné
- ☐ Le passage d'un mode à l'autre conserve les valeurs saisies (ou les réinitialise proprement)

**Remarques section 2** :
_______________________________________________________________
_______________________________________________________________

---

## 3. Parcours de demande (rôle CLIENT)

Connectez-vous avec `andrys972@gmail.com`.

### 3.1 Inscription / connexion
- ☐ L'écran Auth0 s'ouvre et l'authentification réussit
- ☐ Première connexion : redirigé vers l'espace client
- ☐ Le nom et l'email sont corrects dans le profil

### 3.2 Demande de financement
- ☐ Cliquer sur "Faire ma demande" depuis l'espace
- ☐ Le wizard à étapes fonctionne (produit → société → projet → documents)
- ☐ Validation finale : un dossier apparaît dans la liste avec statut "En cours"
- ☐ Confirmation par email reçue (vérifier la boîte andrys972@gmail.com)

### 3.3 Upload de documents
- ☐ Uploader un PDF de moins de 10 Mo → succès
- ☐ Le document apparaît dans le détail du dossier
- ☐ Le document peut être téléchargé à nouveau
- ☐ Tester avec un fichier > 10 Mo → message d'erreur clair
- ☐ Tester avec un .exe ou format non autorisé → refusé

### 3.4 Messagerie
- ☐ Envoyer un message depuis le détail du dossier
- ☐ Le message apparaît dans la conversation
- ☐ Notification reçue côté admin (à vérifier en se connectant ensuite avec andrys.magar@…)

### 3.5 Signature électronique
- ☐ Quand une offre est envoyée, le bouton "Signer" apparaît
- ☐ Le processus de signature s'enchaîne sans erreur
- ☐ Document signé téléchargeable

### 3.6 Profil & RGPD
- ☐ Modifier nom / téléphone / société → sauvegarde OK
- ☐ Page "Sécurité" accessible
- ☐ Bouton "Exporter mes données" → fichier ZIP téléchargé
- ☐ Bouton "Supprimer mon compte" → demande de confirmation
- ☐ Page "Notifications" liste les évènements récents
- ☐ Page "Parrainage" affiche le code de parrainage personnel

**Remarques section 3** :
_______________________________________________________________
_______________________________________________________________

---

## 4. Back-office (rôle ADMIN)

Connectez-vous avec `andrys.magar@hotmail.fr`.

### 4.1 Tableau de bord
- ☐ KPI affichés : nombre de dossiers, montant total, taux de conversion
- ☐ Graphiques chargés sans erreur
- ☐ Centre d'appel : le bouton WhatsApp / téléphone fonctionne

### 4.2 Demandes
- ☐ Liste des demandes accessible (`/admin/demandes`)
- ☐ Vue Kanban accessible (`/admin/demandes/kanban`)
- ☐ Filtres par statut / produit / partenaire fonctionnels
- ☐ Détail d'une demande : informations complètes
- ☐ Modification du statut → historique mis à jour
- ☐ Attribution à un partenaire → confirmation OK

### 4.3 Devis & Factures
- ☐ Création d'un devis depuis un dossier
- ☐ Envoi du devis par email au client → reçu côté client
- ☐ Création d'une facture
- ☐ Enregistrement d'un paiement
- ☐ Export PDF facture lisible et conforme

### 4.4 Utilisateurs
- ☐ Liste des utilisateurs (`/admin/users`) accessible
- ☐ Clic sur un utilisateur → page profil complète (dossiers, factures, messages)
- ☐ Modification du rôle d'un utilisateur fonctionne
- ☐ Statistiques par rôle visibles

### 4.5 Prospection
- ☐ Liste des prospects (`/admin/prospects`) accessible
- ☐ Score d'engagement affiché (chaud / tiède / engagé / froid)
- ☐ Tri "Récents" / "Chauds" fonctionne
- ☐ Détail d'un prospect : voir les évènements de simulation
- ☐ Modifier le statut (Nouveau → Contacté → Qualifié → Converti)
- ☐ Source UTM ou referrer visible quand disponible

### 4.6 Partenaires
- ☐ Liste des partenaires (`/admin/partners`) accessible
- ☐ Création d'un nouveau partenaire (banque ou assureur)
- ☐ Affectation des dossiers aux partenaires

### 4.7 Affiliation
- ☐ Création d'un code apporteur
- ☐ Génération d'un lien d'invitation
- ☐ Import CSV bulk (à tester avec un petit fichier de 3 lignes)
- ☐ Suivi des commissions par apporteur

### 4.8 Logs & paramètres
- ☐ Logs d'activité (`/admin/logs`) accessibles
- ☐ FAQ : ajout / modification / suppression d'une question
- ☐ Témoignages : modération possible
- ☐ Paramètres généraux modifiables

**Remarques section 4** :
_______________________________________________________________
_______________________________________________________________

---

## 5. Espace partenaire (rôle PARTNER)

Connectez-vous avec `andrys.developper@gmail.com`.

- ☐ Tableau de bord partenaire avec KPI personnels
- ☐ Liste des dossiers reçus (`/partner/applications`)
- ☐ Détail d'un dossier
- ☐ Liste des commissions perçues (`/partner/commissions`)
- ☐ Aucune fuite : impossible de voir les dossiers d'autres partenaires

**Remarques section 5** :
_______________________________________________________________
_______________________________________________________________

---

## 6. Tunnels de devis assurance

Depuis la page Assurance, tester les 5 tunnels :

- ☐ **Assurance auto** : 5 étapes, devis affiché en fin
- ☐ **Assurance moto** : idem
- ☐ **Assurance habitation** : idem
- ☐ **Assurance santé** : idem
- ☐ **RC Pro** : idem

Pour chaque tunnel :
- ☐ Les étapes s'enchaînent sans bug
- ☐ Le retour en arrière conserve les valeurs
- ☐ Le devis final est cohérent
- ☐ Le formulaire de demande de rappel fonctionne

**Remarques section 6** :
_______________________________________________________________
_______________________________________________________________

---

## 7. Affichage mobile

Tester depuis un smartphone (iPhone et/ou Android) :

- ☐ Le menu burger s'ouvre correctement
- ☐ Les simulateurs sont utilisables (pas de zoom forcé, boutons assez grands)
- ☐ L'espace client est lisible
- ☐ Les formulaires sont remplissables sans difficulté
- ☐ Le CTA contact flottant ne masque pas le contenu important

**Remarques section 7** :
_______________________________________________________________
_______________________________________________________________

---

## 8. Performance & ressenti général

- ☐ Aucune page n'a mis plus de 5 secondes à se charger
- ☐ Pas de "flash" de page blanche entre les navigations
- ☐ Les animations sont fluides, pas saccadées
- ☐ Aucune erreur visible en navigation classique
- ☐ Le ton du site (textes, exemples) correspond à votre cible

**Note globale sur 10** : ___ / 10

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

Pour chaque anomalie rencontrée, remplir :

| # | Page / écran | Action effectuée | Comportement constaté | Comportement attendu | Capture ? |
|---|---|---|---|---|---|
| 1 |  |  |  |  | ☐ |
| 2 |  |  |  |  | ☐ |
| 3 |  |  |  |  | ☐ |
| 4 |  |  |  |  | ☐ |
| 5 |  |  |  |  | ☐ |

---

## 10. Validation finale

- ☐ Toutes les sections ci-dessus ont été testées
- ☐ Aucun bloquant n'a été identifié
- ☐ Les retours non bloquants sont listés ci-dessus
- ☐ Je valide la mise en ligne (sous réserve des corrections demandées)

**Signature du testeur** : ____________________   **Date** : ___ / ___ / 2026

---

*Document de recette Finarent — à retourner par email à l'équipe développement.*
