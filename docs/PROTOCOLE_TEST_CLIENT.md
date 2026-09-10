# Protocole de test — Finarent

**Date** 10 septembre 2026 · **Version** 1.0 · **Périmètre** toutes les fonctionnalités de la plateforme, écran par écran, pour les sept profils d'utilisateurs · **Public** le client et ses testeurs, sans aucune compétence technique

Ce document vous permet de **vérifier vous-même** que la plateforme Finarent fait ce qu'elle doit faire. Il remplace les anciens guides de recette. Chaque test est numéroté, et tient en cinq lignes :

- **Objectif** — ce que le test prouve, en une phrase.
- **Ce que vous faites** — les étapes, dans l'ordre.
- **Ce que vous devez voir** — le résultat attendu.
- **C'est un problème si** — le signal qui doit vous faire ouvrir un signalement. C'est la rubrique la plus importante : elle vous permet de trancher sans nous appeler.
- **Résultat** — trois cases à cocher : OK, KO, Non testé.

Vous n'êtes pas obligé de tout faire d'un coup. Commencez par les **douze tests prioritaires**, puis avancez profil par profil, à votre rythme. Comptez environ une demi-journée par profil.

> **Une convention pour tout le document.** Quand nous écrivons une adresse comme `finarent.com/espace`, cela signifie : tapez cette adresse dans la barre du haut de votre navigateur, puis Entrée. Rien d'autre.

---

## Sommaire

1. Avant de commencer
2. Les douze tests prioritaires
3. Partie 1 — Le site public, sans être connecté (tests 1 à 29)
4. Partie 2 — L'espace client (tests 30 à 54)
5. Partie 3 — Le back-office administrateur (tests 55 à 84)
6. Partie 4 — L'apporteur d'affaires (tests 85 à 88)
7. Partie 5 — Le centre d'appel (tests 89 à 93)
8. Partie 6 — L'espace partenaire (tests 94 à 96)
9. Partie 7 — L'espace assureur (tests 97 à 99)
10. Les emails que la plateforme envoie
11. Ce qui ne peut pas encore être testé, et pourquoi
12. Les défauts déjà connus à la date de ce protocole
13. Fiche de relevé

---

## Avant de commencer

### 1. Ce dont vous avez besoin

**Un ordinateur.** Plusieurs écrans (le menu latéral de l'espace client, les intitulés des onglets d'un dossier) sont masqués sur les petits écrans. Faites la procédure sur un ordinateur, et réservez le téléphone au test 29, qui lui est consacré.

**Une boîte email que vous consultez**, pour vérifier les messages que la plateforme envoie. Elle servira d'adresse de test à plusieurs endroits.

**Des comptes de démonstration.** Il en faut un par profil. Ils ne peuvent pas être créés depuis le site : **demandez-les à l'équipe technique**, et notez-les ici.

| Profil | À quoi sert ce compte | Email du compte | Mot de passe |
|---|---|---|---|
| Client | Déposer et suivre une demande de financement | | |
| Administrateur | Traiter les dossiers, facturer, gérer les comptes | | |
| Partenaire (banque, société de leasing) | Consulter les dossiers transmis | | |
| Assureur | Traiter les demandes de RC Professionnelle | | |
| Centre d'appel (responsable) | Piloter une équipe de prospection | | |
| Centre d'appel (agent) | Travailler ses prospects assignés | | |
| Apporteur d'affaires | Aucun compte : une adresse web personnelle suffit (test 75) | code : | |

> **Un conseil qui fait gagner beaucoup de temps.** Ouvrez un navigateur différent par profil (par exemple Chrome pour le client, Edge pour l'administrateur, Firefox pour le partenaire). Vous n'aurez pas à vous déconnecter et reconnecter en permanence. Si vous n'avez qu'un navigateur, utilisez des fenêtres de « navigation privée » : chacune est indépendante des autres.

### 2. Comment ouvrir le site et se connecter

Tapez dans la barre d'adresse **finarent.com** (ou l'adresse que l'équipe vous a communiquée).

Le bouton **« Mon espace »**, en haut à droite de toutes les pages, ouvre la page de connexion. Vous y saisissez l'email et le mot de passe du compte que vous testez. Après connexion, la plateforme vous envoie automatiquement dans l'espace qui correspond à votre profil : espace client, back-office, espace partenaire ou espace assureur. **Exception** : un compte de centre d'appel arrive sur l'espace client, et doit taper l'adresse `finarent.com/call-center` (test 89).

Pour vous déconnecter : le bouton **« Se déconnecter »** (espace client) ou **« Déconnexion »** (autres espaces), en bas du menu latéral ou en haut à droite.

### 3. Comment signaler un problème utilement

Un signalement utile tient en cinq lignes. Ne cherchez pas à diagnostiquer : décrivez.

1. **Quelle page** — l'adresse dans la barre du haut, ou à défaut son nom (« la fiche de mon dossier », « la liste des factures »).
2. **Le numéro du test** que vous étiez en train de faire (« test 34 »).
3. **Ce que vous avez cliqué ou tapé** — une phrase. « J'ai cliqué sur Soumettre ma demande sans cocher la case. »
4. **Ce que vous attendiez, et ce que vous avez obtenu** — les deux, côte à côte. C'est l'écart entre les deux qui constitue le problème.
5. **Une photo de l'écran.** Sur PC Windows : **Windows + Maj + S** pour sélectionner une zone, puis collez dans votre email. Sur Mac : **Cmd + Maj + 4**. Sur téléphone : **Volume bas + bouton latéral** (Android) ou **Volume haut + bouton latéral** (iPhone).

**Indiquez aussi la gravité**, elle détermine l'ordre de traitement :

- **Bloquant** — je ne peux pas aller plus loin (impossible d'envoyer ma demande, impossible de me connecter).
- **Gênant** — ça marche, mais c'est laborieux ou très lent.
- **Étrange** — un affichage incohérent qui ne m'empêche pas de continuer.
- **Cosmétique** — faute de frappe, alignement, couleur.

### 4. Trois réserves à connaître avant de commencer

- **Certaines fonctions ne sont pas activables aujourd'hui** faute de comptes de service ouverts (paiement en ligne, téléphonie, emailing de masse, protection anti-robot). Elles sont regroupées en fin de document, dans la section **« Ce qui ne peut pas encore être testé »**. N'y perdez pas de temps.
- **Une vingtaine de défauts sont déjà connus.** Ils sont listés dans la section **« Les défauts déjà connus »**, et signalés dans les tests concernés par la mention *défaut connu*. Inutile de les signaler à nouveau : dites-nous seulement s'ils vous gênent au quotidien, cela nous aide à les prioriser.
- **Ce protocole décrit la version du 10 septembre 2026.** Demandez confirmation à l'équipe technique que le site que vous testez est bien à jour avant de signaler en masse.

---

## Les douze tests prioritaires

Si vous ne faites que douze tests, faites ceux-ci. Ils couvrent ce qui rapporte de l'argent ou ce qui engage juridiquement Finarent.

| Priorité | Test | Ce qui est en jeu |
|---|---|---|
| 1 | **Test 34** — Déposer une demande de financement | C'est le parcours qui produit le chiffre d'affaires. S'il casse, plus rien n'entre. |
| 2 | **Test 35** — Les conditions générales sont obligatoires | Une demande enregistrée sans consentement n'est pas opposable. |
| 3 | **Test 36** — Un brouillon repris redemande les conditions | C'était la faille : reprendre un brouillon permettait de sauter le consentement. |
| 4 | **Test 25** — Le formulaire de contact | Le principal point d'entrée des prospects non connectés. |
| 5 | **Test 46** — Signer un contrat | La signature et sa preuve horodatée engagent les deux parties. |
| 6 | **Test 61** — Envoyer un devis au client | Un devis part sur un bouton dédié, jamais en consultant le document. |
| 7 | **Test 63** — Émettre une facture et son numéro comptable | Le numéro définitif n'est attribué qu'à l'émission, sans trou dans la série. |
| 8 | **Test 64** — Envoyer une facture au client | Même principe que le devis : plus d'envoi involontaire. |
| 9 | **Test 10** — Exactitude du simulateur de mensualité | Un chiffre faux affiché à un prospect est une promesse commerciale fausse. |
| 10 | **Test 11** — Exactitude du taux TAEG | Un TAEG erroné est un sujet de conformité, pas de confort. |
| 11 | **Test 95** — Un partenaire ne voit que ses propres dossiers | Le cloisonnement des données entre partenaires concurrents. |
| 12 | **Test 99** — Le cloisonnement des accès | Personne ne doit atteindre un espace qui ne lui est pas destiné. |

---

# Partie 1 — Le site public, sans être connecté

**À quoi sert cet espace :** c'est la vitrine de Finarent. Elle explique les offres, laisse simuler un financement et permet à un prospect de laisser ses coordonnées.

Pour cette partie, vous n'avez besoin d'aucun compte.

## Test 1 — La page d'accueil s'affiche

**Objectif** — vérifier que le site répond et que sa page d'accueil est complète.

**Ce que vous faites**
1. Ouvrez `finarent.com`.
2. Faites défiler la page de haut en bas.

**Ce que vous devez voir**
- Le logo Finarent en haut à gauche, le bouton **« Mon espace »** en haut à droite.
- Un grand titre commençant par **« Financez vos équipements »**, avec la promesse d'une réponse en **« 48 heures »**.
- Un bouton **« Démarrer ma demande »** et un bouton **« Nos assurances »**.
- Trois arguments courts : **« Sans apport »**, **« Réponse 48h »**, **« 88% acceptés »**.
- Plus bas : des chiffres clés, des témoignages, quelques questions fréquentes, et tout en bas un bas de page bleu marine.

**C'est un problème si** — la page reste blanche, met plus de dix secondes à s'afficher, ou si des zones se chevauchent au point d'être illisibles.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 2 — Le menu du haut

**Objectif** — vérifier que toutes les rubriques du menu s'ouvrent.

**Ce que vous faites**
1. Passez la souris successivement sur chaque mot du menu, sans cliquer.
2. Cliquez sur une entrée de chaque rubrique.

**Ce que vous devez voir**
- Le menu comporte, de gauche à droite : **Accueil · Nos Solutions · Secteurs · Simulateurs · Assurance · Ressources · Contact**.
- **« Nos Solutions »** ouvre six entrées : Crédit-bail · Location avec option d'achat · Location longue durée (LLD) · Crédit professionnel · Assurance professionnelle · Comparateur, plus un lien **« Voir toutes les solutions »**.
- **« Secteurs »** ouvre quatre entrées : Transport & Logistique · BTP & Construction · Médical & Santé · Informatique & Tech.
- **« Simulateurs »** ouvre une grande fenêtre avec cinq familles et un lien **« Voir les 41 simulateurs »**.
- **« Ressources »** ouvre deux groupes : **À propos** (Pourquoi Finarent, Nos partenaires) et **Outils & contenus** (Diagnostic, FAQ, Glossaire, Guides, Actualités).

**C'est un problème si** — une rubrique ne s'ouvre pas, ou si un lien du menu mène à une page d'erreur.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 3 — Les pages Solutions

**Objectif** — vérifier que chaque solution de financement a sa page complète.

**Ce que vous faites**
1. Menu **« Nos Solutions »**, puis **« Crédit-bail »**.
2. Revenez en arrière et refaites l'opération pour **Location avec option d'achat**, **Location longue durée (LLD)** et **Crédit professionnel**.
3. Ouvrez enfin **« Voir toutes les solutions »**.

**Ce que vous devez voir** — pour chaque page : une grande image, un titre, une description, une liste d'avantages, les durées et montants possibles, et des questions fréquentes en bas. La page d'ensemble présente toutes les solutions sous forme de cartes.

**C'est un problème si** — deux pages différentes affichent exactement le même contenu, ou si une image ne se charge pas.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 4 — Les pages Secteurs

**Objectif** — vérifier la page listant les secteurs d'activité financés.

**Ce que vous faites**
1. Allez sur `finarent.com/sectors`.
2. Cliquez sur une carte, par exemple **BTP & Construction**.

**Ce que vous devez voir**
- **Huit secteurs** sur la page d'ensemble : BTP, Médical, Informatique, Transport, Industrie, Agriculture, Commerce, Restauration. Le menu du haut n'en propose que quatre : c'est volontaire, ce sont les principaux.
- La page d'un secteur affiche les équipements typiques finançables, les avantages propres au métier, et des questions fréquentes.

**C'est un problème si** — une carte ne mène nulle part, ou si le contenu affiché ne correspond pas au secteur cliqué.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 5 — Le catalogue Assurance

**Objectif** — vérifier le catalogue d'assurance et ses deux boutons par produit.

**Ce que vous faites**
1. Menu **« Assurance »**.
2. Cliquez sur l'onglet **« Particuliers »**, puis sur **« Pros & Entreprises »**.
3. Sur la carte **Auto**, cliquez **« Tarif rapide »** : revenez. Puis cliquez **« Devis »**.
4. Sur la carte **Cyber-risques** (côté Pros), cliquez **« Tarif rapide »**.

**Ce que vous devez voir**
- Le titre **« Besoin d'un devis d'assurance ? »** et la mention de **22 types d'assurance**.
- Deux onglets : **« Particuliers (11) »** et **« Pros & Entreprises (11) »**. Le nombre entre parenthèses doit correspondre au nombre de cartes réellement affichées.
- Côté Particuliers : Auto, Moto / Scooter, Habitation, Santé / Mutuelle, Prévoyance, Emprunteur, Chien & Chat, Accidents de la vie, Protection juridique, Scolaire & Extra-scolaire, Loyers impayés (GLI).
- Côté Pros : RC Professionnelle, Multirisque pro, Décennale BTP, Cyber-risques, Flotte automobile, Protection juridique pro, Homme-clé & associé, D&O — Mandataires sociaux, Mutuelle collective, Prévoyance & Madelin.
- Chaque carte porte un badge **« Obligatoire »**, **« Recommandée »** ou **« Optionnelle »**, et un bouton **« Devis »**. La plupart portent aussi un bouton **« Tarif rapide »**.
- **« Tarif rapide »** sur Auto, Moto, Habitation, Santé et RC Professionnelle ouvre un **questionnaire en plusieurs étapes** (tests 6 et 7). Sur Emprunteur, il ouvre le simulateur d'assurance emprunteur. Sur toutes les autres cartes, comme Cyber-risques, il ouvre le **formulaire de contact**, déjà réglé sur « Assurance ».
- **« Devis »**, sur toutes les cartes, ouvre le **formulaire de contact** réglé sur « Assurance ».

**C'est un problème si** — un compteur annonce un nombre différent de cartes réellement affichées, ou si un bouton ne mène nulle part.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 6 — Demander un tarif d'assurance auto

**Objectif** — vérifier le questionnaire en huit étapes qui produit des prospects.

**Ce que vous faites**
1. Sur la page Assurance, carte **Auto**, bouton **« Tarif rapide »**.
2. Répondez aux huit écrans : marque (choisissez un logo), date de mise en circulation, énergie, usage, lieu de stationnement (code postal + ville), profil conducteur (année du permis, bonus-malus, sinistres), formule.
3. Sur le dernier écran **« Recevoir votre devis »**, saisissez Prénom, Nom, votre email de test, Téléphone.
4. Avant d'envoyer, cliquez **« Retour »** deux fois, puis **« Continuer »** deux fois : vos réponses doivent être conservées.
5. Cliquez **« Envoyer ma demande »**.

**Ce que vous devez voir**
- Un en-tête simplifié (logo + **« Votre devis auto »**), une barre de progression, l'indicateur **« Étape N sur 8 »**.
- Le bouton **« Continuer »** reste grisé tant que l'écran n'est pas complet : c'est le seul signal, il n'y a pas de message d'erreur par champ.
- Pendant l'envoi : un voile **« Envoi de votre demande à nos partenaires… »**.
- À la fin : **« Demande envoyée ! »**, la phrase « Un conseiller Finarent vous contactera sous 48 h… », un encadré **« Récapitulatif »** reprenant vos réponses, et un bouton **« Retour à l'accueil »**.
- **Aucun prix n'est affiché** : ce questionnaire recueille une demande, il ne calcule pas de tarif. C'est voulu.

**C'est un problème si** — le bouton d'envoi ne fait rien, si le récapitulatif affiche des réponses différentes de celles saisies, ou si le retour en arrière efface vos réponses.

> Cette demande doit ensuite apparaître côté administrateur, dans **Prospection** (test 72), avec la mention « devis-auto ». C'est le meilleur moyen de vérifier qu'un prospect n'est pas perdu en route.

> *Défaut connu n° 12* — ce questionnaire ne comporte pas de case de consentement, et n'envoie aucun email de confirmation au prospect. Dites-nous si vous souhaitez l'un ou l'autre.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 7 — Les autres questionnaires d'assurance

**Objectif** — vérifier les quatre autres questionnaires sur le même principe.

**Ce que vous faites** — refaites le test 6 pour chacun :
- **Moto / Scooter** — 8 étapes, titre **« Votre devis moto »**.
- **Habitation** — 6 étapes, titre **« Votre devis habitation »** (type de logement, superficie, adresse, valeur des biens, formule, coordonnées).
- **Santé / Mutuelle** — 6 étapes, titre **« Votre devis santé »** (pour qui, âge, statut professionnel, besoins, ville, coordonnées).
- **RC Professionnelle** — 6 étapes, titre **« Votre devis RC Pro »** (secteur, forme juridique, entreprise, siège, garanties, coordonnées du dirigeant).

**Ce que vous devez voir** — pour chacun : le questionnaire s'enchaîne sans blocage, le retour en arrière conserve les valeurs, l'écran final **« Demande envoyée ! »** avec son récapitulatif, et le prospect apparaît ensuite dans **Prospection** (test 72).

**C'est un problème si** — un questionnaire reste bloqué sur une étape alors que tout est rempli.

**Résultat** : ☐ Moto ☐ Habitation ☐ Santé ☐ RC Pro — ☐ Non testé

## Test 8 — Le comparateur de financements

**Objectif** — vérifier que la comparaison des quatre modes de financement produit des chiffres cohérents.

**Ce que vous faites**
1. Allez sur `finarent.com/comparateur`.
2. Réglez le montant sur **50 000 €** et la durée sur **36 mois**.
3. Lisez les résultats, puis modifiez le montant et vérifiez que les chiffres bougent.

**Ce que vous devez voir**
- Le titre **« Comparez les solutions de financement »** et quatre solutions : **Prêt Professionnel**, **Crédit-bail**, **LOA**, **LLD**.
- Pour chacune : Mensualité estimée, Coût total du crédit, Taux annuel, Option d'achat, Propriété en fin de contrat, Déductibilité fiscale.
- Les taux annuels sont fixes : **3,5 %** pour le prêt professionnel, **4,2 %** pour le crédit-bail, **4,8 %** pour la LOA, **5,5 %** pour la LLD.
- Pour 50 000 € sur 36 mois : mensualité du **Prêt Professionnel** d'environ **1 465 €**, du **Crédit-bail** d'environ **1 481 €**.
- Une solution porte le badge **« Recommandé »**.

**C'est un problème si** — une mensualité s'écarte de plus de quelques euros de ces valeurs, si un coût total est inférieur au montant emprunté, ou si les chiffres ne changent pas quand vous modifiez le montant.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 9 — Le catalogue des simulateurs

**Objectif** — vérifier que les 41 simulateurs sont accessibles.

**Ce que vous faites**
1. Allez sur `finarent.com/simulateurs`.
2. Parcourez les cinq familles et ouvrez trois simulateurs **sans étiquette « Compte »**, dans des familles différentes.

**Ce que vous devez voir**
- Le titre **« Tous nos simulateurs financiers »** et le badge **« 41 simulateurs »**.
- Cinq familles avec leur nombre d'outils : **Crédit immobilier (20)**, **Crédit conso & auto (5)**, **Crédit professionnel (4)**, **Assurance emprunteur (6)**, **Assurances (6)**.
- Chaque simulateur ouvert affiche des curseurs ou des champs et **recalcule immédiatement**, sans bouton « Calculer ».
- Treize cartes portent une petite étiquette violette **« Compte »** avec un cadenas : ces simulateurs demandent d'être connecté (test 12).

**C'est un problème si** — un simulateur mène à une page d'erreur, ou reste figé sans jamais afficher de résultat.

> L'ancienne adresse `finarent.com/simulator` (au singulier) n'existe plus. Elle bascule vers le simulateur de mensualité, mais ne doit plus être diffusée.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 10 — Exactitude du simulateur « Mensualité de crédit » ★ *priorité*

**Objectif** — vérifier qu'un chiffre annoncé à un prospect est juste.

**Ce que vous faites**
1. Allez sur `finarent.com/simulateurs/credit-immobilier/mensualite`.
2. **Ne touchez à rien.** Les valeurs par défaut sont : montant **200 000 €**, durée **240 mois**, taux **4 %**. Notez la mensualité.
3. Réglez ensuite le montant sur **150 000 €** et le taux sur **3,5 %**, en gardant 240 mois.

**Ce que vous devez voir**
- Avec les valeurs par défaut : une mensualité de **1 212 €**.
- Avec 150 000 € à 3,5 % sur 240 mois : une mensualité de **870 €**.
- Le coût total du crédit est toujours supérieur au montant emprunté.

**C'est un problème si** — l'un de ces deux montants diffère de plus de 2 €, si le coût total est inférieur au capital, ou si un résultat affiche « NaN », « Infinity » ou une case vide.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 11 — Exactitude du taux TAEG ★ *priorité*

**Objectif** — vérifier la correction du taux qui s'affichait « 0,00 % » alors que le calcul était impossible.

**Ce que vous faites**
1. Allez sur `finarent.com/simulateurs/credit-immobilier/taeg`.
2. **Ne touchez à rien.** Les valeurs par défaut sont : capital **200 000 €**, durée **240 mois**, taux nominal **3,5 %**, taux assurance **0,30 %**, frais **2 000 €**. Notez le grand chiffre sous « TAEG estimé ».
3. Augmentez les frais, puis le taux d'assurance.

**Ce que vous devez voir**
- Avec les valeurs par défaut : **4,06 %**.
- Le TAEG **augmente** quand vous augmentez les frais ou l'assurance, et ne descend jamais sous le taux nominal.
- Quand le calcul n'a pas de sens, le simulateur affiche un simple tiret **« — »**, jamais « 0,00 % ».

**C'est un problème si** — le TAEG affiche **« 0,00 % »** alors que des frais sont saisis. Un financement à 0 % avec frais de dossier n'est pas un crédit gratuit.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 12 — Les simulateurs réservés aux comptes

**Objectif** — vérifier que la restriction d'accès fonctionne.

**Ce que vous faites**
1. Sur `finarent.com/simulateurs`, **sans être connecté**, cliquez une carte portant l'étiquette **« Compte »**, par exemple **Tableau d'amortissement**.
2. Connectez-vous (ou créez un compte) sur l'écran qui s'ouvre.

**Ce que vous devez voir**
- Vous êtes envoyé **directement** sur la page de création de compte / connexion, sans écran intermédiaire sur le site Finarent.
- Une fois connecté, vous **revenez automatiquement** sur le simulateur demandé, qui fonctionne normalement.

**C'est un problème si** — la page s'affiche vide, ou si après connexion vous n'êtes pas ramené sur le simulateur.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 13 — Le diagnostic en cinq questions

**Objectif** — vérifier l'outil d'orientation qui recommande un produit.

**Ce que vous faites**
1. Allez sur `finarent.com/quiz`.
2. Répondez : **« Du matériel ou équipement professionnel »**, puis **« Peu importe, ce qui compte c'est l'usage »**, puis **« Correcte mais je veux la préserver pour d'autres projets »**, puis **« Oui, je cherche à maximiser les déductions »**, puis **« Moyen terme (4-7 ans) »**.

**Ce que vous devez voir**
- Le titre **« Quelle solution de financement pour vous ? »** et la mention « 5 questions, 1 recommandation personnalisée ».
- Un compteur **« Question X / 5 »** et une barre de progression qui avance.
- À la fin : un badge **« Recommandation calculée »**, un produit recommandé, un pourcentage de compatibilité et une alternative. Avec ces réponses, le produit recommandé doit être le **Crédit-bail**.

**C'est un problème si** — la barre n'avance pas, si « Précédent » perd vos réponses, ou si la recommandation n'est pas cohérente avec des réponses aussi orientées.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 14 — Le glossaire

**Objectif** — vérifier la recherche et le filtrage des définitions.

**Ce que vous faites**
1. Allez sur `finarent.com/glossaire`.
2. Tapez **taeg** dans la barre de recherche, puis cliquez sur le terme.
3. Effacez, puis cliquez sur le filtre **« Assurance »**.

**Ce que vous devez voir**
- **33 définitions**, classées en quatre familles : **Crédit**, **Assurance**, **Professionnel**, **Fiscalité**.
- Avec « taeg » : seul le terme **TAEG** reste affiché ; en cliquant dessus, la définition se déplie.
- Avec le filtre « Assurance » : seules les définitions de cette famille restent.

**C'est un problème si** — la recherche ne filtre rien, ou si un filtre affiche des termes d'une autre famille.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 15 — Les guides

**Objectif** — vérifier les contenus pédagogiques longs.

**Ce que vous faites**
1. Allez sur `finarent.com/guides`.
2. Ouvrez le guide **« Tout comprendre sur le crédit-bail »**.

**Ce que vous devez voir**
- **Cinq guides** : crédit-bail · prêt professionnel · assurance emprunteur · LOA, LLD, crédit auto · RC Pro.
- Le guide crédit-bail comporte cinq chapitres, un sommaire, et un bouton d'action en bas.

**C'est un problème si** — un guide s'ouvre vide, ou si le sommaire annonce des chapitres qui n'existent pas.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 16 — La FAQ publique

**Objectif** — vérifier la base de questions-réponses publique.

**Ce que vous faites**
1. Allez sur `finarent.com/faq`.
2. Cliquez sur une question, puis re-cliquez dessus.
3. Tapez **orias** dans la barre de recherche.

**Ce que vous devez voir**
- **62 questions**, réparties en huit thèmes.
- Une question cliquée déplie sa réponse ; re-cliquée, elle se replie.
- Avec « orias » : la question **« Finarent est-il inscrit à l'ORIAS ? »** ressort, et le mot recherché apparaît **surligné en jaune**.

**C'est un problème si** — la recherche ne surligne rien, ou si une réponse s'affiche avec des symboles étranges au milieu du texte.

> *Défaut connu n° 5* — les questions gérées depuis le back-office (test 81) **n'apparaissent pas** sur cette page : elle affiche une liste fixe de 62 questions. Le lien entre les deux est à créer.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 17 — La page Partenaires

**Objectif** — vérifier l'annuaire des partenaires bancaires et assureurs.

**Ce que vous faites**
1. Menu **« Ressources »**, puis **« Nos partenaires »**.
2. Cliquez successivement sur les filtres, puis tapez un nom de banque dans la recherche.
3. Descendez tout en bas.

**Ce que vous devez voir**
- Le titre **« Nos partenaires bancaires & assureurs »** et une centaine de partenaires avec leur logo.
- Cinq filtres : **Tous les partenaires · Assurance · Banque · Leasing & CBI · LOA / LLD véhicules**.
- Une recherche affiche « N résultats pour "…" », et un terme introuvable affiche « Aucun partenaire ne correspond à "…" ».
- En bas, un lien **« Cartographie complète (PDF) »** qui télécharge un fichier.

**C'est un problème si** — le PDF ne se télécharge pas, ou si un filtre ramène des partenaires d'une autre famille.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 18 — Les actualités

**Objectif** — vérifier le blog.

**Ce que vous faites** — menu **« Ressources »**, puis **« Actualités »** ; ouvrez un article.

**Ce que vous devez voir** — une grille d'articles avec image, titre et date ; l'article ouvert affiche son contenu complet et un bloc d'appel à l'action en bas.

**C'est un problème si** — un article s'ouvre sans texte, ou si les images ne se chargent pas.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 19 — Les pages de présentation

**Objectif** — vérifier les pages institutionnelles.

**Ce que vous faites** — ouvrez successivement `finarent.com/why-leasing`, `finarent.com/about`, `finarent.com/process` et `finarent.com/testimonials`.

**Ce que vous devez voir** — quatre pages distinctes : Pourquoi choisir Finarent, À propos, Processus de demande en 4 étapes, et Témoignages clients.

**C'est un problème si** — l'une de ces pages affiche une erreur, ou si deux d'entre elles montrent le même contenu.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 20 — Déposer un témoignage

**Objectif** — vérifier que rien ne se publie sur votre site sans votre validation.

**Ce que vous faites**
1. Sur `finarent.com/testimonials`, cliquez **« Laisser un témoignage »**.
2. Remplissez **« Nom complet »**, choisissez une note avec les étoiles, et écrivez un témoignage d'au moins 30 caractères.
3. Cliquez **« Envoyer mon témoignage »**.
4. Rechargez la page et cherchez votre témoignage.
5. Recommencez avec un témoignage de **10 caractères** seulement.

**Ce que vous devez voir**
- Le formulaire **« Partagez votre expérience »**, avec la mention **« Votre témoignage sera publié après validation par notre équipe. »**
- Après envoi : **« Témoignage envoyé pour modération »**, et le formulaire se referme.
- Après rechargement : **votre témoignage n'apparaît pas** sur la page. Il attend votre validation (test 80).
- Avec 10 caractères : refus, **« Le témoignage doit faire entre 30 et 1000 caractères »**.

**C'est un problème si** — un témoignage apparaît sur le site public **sans** avoir été validé dans le back-office. Signalez-le comme bloquant.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 21 — Les pages légales

**Objectif** — vérifier que les mentions obligatoires sont en ligne, lisibles et exactes.

**Ce que vous faites**
1. Descendez tout en bas de n'importe quelle page.
2. Ouvrez successivement **« Mentions légales »**, **« CGU »**, **« CGV »** et **« Confidentialité »**.
3. Lisez-les **en tant que dirigeant**, pas en tant que testeur : c'est le seul contrôle que personne d'autre que vous ne peut faire.

**Ce que vous devez voir**
- Quatre pages structurées, en français, sans passage inachevé (« lorem ipsum », « à compléter », « XXX »).
- Les mentions légales indiquent : **Finarent SAS**, SAS au capital de 2 010 €, **39 Avenue de la République, 77340 Pontault-Combault**, **SIREN 931 295 836 — RCS Melun**, **TVA FR12 931 295 836**, l'inscription ORIAS, et le nom de l'hébergeur.
- La politique de confidentialité décrit vos droits d'accès, de rectification et d'effacement, cite les prestataires réellement utilisés (Clever Cloud, Auth0, Brevo, Google reCAPTCHA) et donne une adresse de contact.

**C'est un problème si** — une mention est fausse au regard de votre Kbis ou de votre inscription ORIAS, ou si un texte contredit ce que fait réellement la plateforme.

> *Défaut connu n° 13* — au 10 septembre, la page Mentions légales cite encore un ancien hébergeur (« Vercel Inc. ») alors que la plateforme est hébergée chez **Clever Cloud**, et les CGV contiennent deux cellules **« [À compléter] »** dans le tableau ORIAS. Ces deux points sont à corriger avant la mise en ligne.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 22 — Les informations légales du bas de page

**Objectif** — vérifier les mentions réglementaires affichées sur toutes les pages.

**Ce que vous faites** — descendez en bas de la page d'accueil et lisez le bas de page.

**Ce que vous devez voir**
- Le téléphone **01 60 28 59 41**, l'email **contact@finarent.com**.
- Quatre colonnes de liens : **Solutions**, **Secteurs**, **Finarent**, **Aide**, dont Mentions légales, CGV, CGU et Confidentialité.
- Le bandeau : **« SAS au capital de 2 010 € · SIREN : 931 295 836 RCS Melun · ORIAS n° 24005698 · Courtier en Opérations de Banque (COBSP) »**.

**C'est un problème si** — l'une de ces mentions est fausse. **Ce contrôle vous revient.**

> *Défaut connu n° 14* — les quatre icônes de réseaux sociaux ne mènent nulle part tant que vous ne nous avez pas communiqué vos adresses LinkedIn, Facebook, X et Instagram.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 23 — Le bandeau cookies

**Objectif** — vérifier le recueil du consentement lors d'une première visite.

**Ce que vous faites**
1. Ouvrez une fenêtre de **navigation privée** et allez sur `finarent.com`.
2. Cliquez **« Personnaliser »**.
3. Laissez « Analytics » et « Marketing » décochés, puis cliquez **« Enregistrer mes choix »**.
4. Rechargez la page.

**Ce que vous devez voir**
- Un bandeau en bas intitulé **« Cookies & confidentialité »**, avec trois boutons : **« Personnaliser »**, **« Essentiels uniquement »**, **« Tout accepter »**.
- Après « Personnaliser » : un écran **« Préférences cookies »** avec trois cases — **Essentiels — Toujours actifs** (cochée et grisée), **Analytics**, **Marketing** — et un bouton **« Enregistrer mes choix »**.
- Après enregistrement, le bandeau disparaît et **ne revient pas** au rechargement.

**C'est un problème si** — le bandeau réapparaît après un choix enregistré, ou si la case « Essentiels » peut être décochée.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 24 — Le formulaire de contact : refus des saisies incomplètes

**Objectif** — vérifier que le formulaire refuse ce qu'il doit refuser.

**Ce que vous faites**
1. Menu **« Contact »**.
2. Cliquez **« Envoyer ma demande »** sans rien remplir.
3. Remplissez tout, mais tapez **abc** dans « Email professionnel » et **123** dans « N° SIREN ». Cliquez ailleurs.
4. Corrigez, mais ne cochez pas la case de consentement. Cliquez **« Envoyer ma demande »**.

**Ce que vous devez voir**
- Sous chaque champ vide : **« Ce champ est requis »**.
- **« Adresse email invalide »**, **« SIREN invalide (9 chiffres requis) »**.
- Sans la case : **« Vous devez accepter la politique de confidentialité »**, et rien ne part.

**C'est un problème si** — une demande part avec un email faux ou sans consentement.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 25 — Le formulaire de contact : envoi ★ *priorité*

**Objectif** — vérifier le principal point d'entrée des prospects non connectés.

**Ce que vous faites**
1. Menu **« Contact »**.
2. Type de demande **« Financement »**. Remplissez : Raison sociale, N° SIREN (**552120222**), Secteur d'activité, Montant souhaité, Prénom, Nom, votre email de test, Téléphone.
3. Cochez **« J'accepte que mes données soient traitées conformément à la politique de confidentialité »**.
4. Cliquez **« Envoyer ma demande »**.
5. Ouvrez votre boîte email.

**Ce que vous devez voir**
- Pendant l'envoi, le bouton affiche **« Envoi en cours... »**, puis devient vert **« Demande envoyée »**.
- Un bandeau vert : **« Votre demande a bien été envoyée ! (FIN-2026-0XXXX) Nous vous recontacterons sous 48h. »** Notez la référence.
- Dans votre boîte : un email **« Demande FIN-2026-0XXXX enregistrée — Finarent »**.
- La demande apparaît ensuite côté administrateur, dans **Demandes** (test 56), avec cette référence.

**C'est un problème si** — le message **« Une erreur est survenue. Veuillez réessayer… »** s'affiche alors que tout est correctement rempli. Signalez-le immédiatement : c'est un canal d'acquisition qui se ferme. Si l'email n'arrive pas dans les dix minutes, vérifiez les indésirables, puis signalez-le.

> Une même adresse ne peut envoyer que **cinq demandes par heure** : au-delà, le message **« Trop de demandes. Réessayez dans 1 heure. »** est normal.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 26 — Le formulaire de contact : demande d'assurance

**Objectif** — vérifier la seconde variante du formulaire.

**Ce que vous faites** — refaites le test 25 en choisissant **« Assurance »** comme type de demande.

**Ce que vous devez voir** — les champs sont les mêmes ; la demande est enregistrée de la même façon, et apparaît dans **Demandes** avec le produit **RC Professionnelle**.

**C'est un problème si** — la demande est absente côté administrateur.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 27 — La newsletter

**Objectif** — vérifier l'inscription et le désabonnement.

**Ce que vous faites**
1. En bas de n'importe quelle page, bloc **« Newsletter »** : saisissez votre email de test dans **« Votre email professionnel »** et cliquez la flèche.
2. Recommencez avec la même adresse.
3. Ouvrez l'email reçu et cliquez le lien de désabonnement, tout en bas.

**Ce que vous devez voir**
- Un message vert **« Merci pour votre inscription ! »**, qui disparaît au bout de quelques secondes.
- Le second essai affiche **le même message** : c'est voulu, le site ne révèle pas si une adresse est déjà inscrite.
- Un email **« Bienvenue chez Finarent »**.
- Le lien de désabonnement ouvre une page **« Vous êtes désabonné »**, précisant que les messages liés à un dossier en cours continuent d'être envoyés, avec un bouton **« Retour sur finarent.com »**.

**C'est un problème si** — le message rouge **« Une erreur technique est survenue. »** s'affiche avec une adresse valide, ou si le lien de désabonnement mène à **« Lien invalide »**.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 28 — Une page qui n'existe pas

**Objectif** — vérifier qu'une adresse erronée est traitée proprement.

**Ce que vous faites** — tapez `finarent.com/une-page-qui-nexiste-pas`.

**Ce que vous devez voir** — un grand **« 404 »**, le titre **« Page introuvable »**, le texte « La page que vous recherchez n'existe pas ou a été déplacée. » et un bouton **« Retour à l'accueil »**.

**C'est un problème si** — une page blanche ou un message technique s'affiche.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 29 — Le site sur téléphone

**Objectif** — vérifier l'affichage mobile du site public.

**Ce que vous faites**
1. Ouvrez `finarent.com` sur votre smartphone.
2. Ouvrez le menu (icône à trois barres, en haut à droite).
3. Ouvrez un simulateur et déplacez un curseur.
4. Ouvrez le formulaire de contact et commencez à taper dans un champ.

**Ce que vous devez voir**
- Le menu déroule la liste verticale : Accueil, Nos Solutions, Secteurs, Simulateurs, Assurance, Pourquoi Finarent, Nos partenaires, FAQ, Actualités, Contact, Comparateur, et le bouton **« Accéder à mon espace »**.
- Aucun texte coupé, aucun bouton trop petit pour être touché au doigt.
- Le clavier s'ouvre normalement dans les champs.

**C'est un problème si** — la page déborde horizontalement, ou si un bouton est inaccessible.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

---

# Partie 2 — L'espace client

**À quoi sert cet espace :** c'est l'endroit où un dirigeant dépose sa demande de financement, envoie ses pièces justificatives, échange avec son conseiller et signe son contrat.

Connectez-vous avec le **compte client** de démonstration. Gardez votre boîte email ouverte : plusieurs tests vérifient qu'un message arrive.

## Test 30 — Se connecter

**Objectif** — vérifier l'entrée dans l'espace personnel.

**Ce que vous faites**
1. Sur `finarent.com`, cliquez **« Mon espace »** en haut à droite.
2. Saisissez l'email et le mot de passe du compte client.
3. Déconnectez-vous, puis tapez directement `finarent.com/espace`.

**Ce que vous devez voir**
- La page de connexion, puis votre tableau de bord avec une salutation selon l'heure (**« Bonjour »**, **« Bon après-midi »** ou **« Bonsoir »**) et la mention **« Espace client • ID #… »**.
- En tapant l'adresse sans être connecté : un écran **« Votre partenaire de croissance »** avec un bouton **« Se connecter »** et un lien **« Retour à l'accueil »**.

**C'est un problème si** — vous restez bloqué sur la page de connexion, ou si vous êtes renvoyé sur la page d'accueil sans explication.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 31 — Le tableau de bord client

**Objectif** — vérifier la vue d'ensemble des dossiers.

**Ce que vous faites** — restez sur la page d'arrivée et parcourez-la de haut en bas.

**Ce que vous devez voir**
- Quatre compteurs : **Total dossiers**, **En attente**, **En cours**, **Finalisés**.
- Trois raccourcis : **Nouvelle demande**, **Simuler**, **Parrainage**.
- Une section **« Mes dossiers en cours »** avec quatre onglets : **Tous**, **En attente**, **En cours**, **Terminés**, chacun suivi de son nombre.
- Si un dossier est en cours, un bandeau **« Mon dossier en cours »** avec cinq étapes : **Dépôt · Étude · Offre · Signature · Fonds**, et une phrase indiquant la prochaine action.
- À droite, un encart **« Profil & Sécurité »** avec **« Modifier mes informations »** et **« Sécurité du compte »**.
- Un menu latéral à gauche, sous le titre **« Mon espace »** : **Mes demandes · Mon profil · Notifications · Parrainage · Sécurité · Se déconnecter**.

**C'est un problème si** — un compteur affiche un nombre qui ne correspond pas au nombre de dossiers réellement listés.

> Le menu latéral n'apparaît pas sur un écran étroit. Si vous ne le voyez pas, élargissez la fenêtre.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 32 — La cloche de notifications

**Objectif** — vérifier l'alerte visible depuis toutes les pages.

**Ce que vous faites**
1. Connecté, regardez en haut à droite de n'importe quelle page du site : une cloche est affichée à gauche de votre nom.
2. Cliquez dessus. (Elle sera plus intéressante après le test 56, quand l'administrateur aura modifié un de vos dossiers.)

**Ce que vous devez voir**
- Une pastille rouge avec un nombre s'il y a des nouveautés (« 9+ » au-delà de neuf).
- Une petite fenêtre **« Notifications »**, avec un lien **« Tout voir »**, ou la mention **« Aucune notification récente »**.
- Chaque ligne indique le dossier et le changement, par exemple « En attente → En analyse », avec « il y a N min ».
- Après ouverture de la cloche, la pastille disparaît. Il n'y a pas de bouton « tout marquer comme lu » : l'ouverture suffit.

**C'est un problème si** — un changement de statut fait par l'administrateur n'apparaît jamais dans la cloche.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 33 — Le piège des deux boutons « Nouvelle demande »

**Objectif** — vérifier un point de navigation qui déroute les utilisateurs.

**Ce que vous faites**
1. Sur le tableau de bord, cliquez le bouton **« Nouvelle demande »** situé **en haut à droite**, à côté de la cloche.
2. Revenez en arrière.
3. Cliquez la **tuile « Nouvelle demande »** au milieu de la page.

**Ce que vous devez voir**
- Le bouton du haut vous emmène sur la **page de contact publique**.
- La tuile du milieu vous emmène sur le **formulaire de demande** (`finarent.com/espace/demande`).

**C'est un problème si** — vous ne parvenez pas à distinguer les deux. *Défaut connu n° 16* : dites-nous si cela vous gêne, nous unifierons.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 34 — Déposer une demande de financement ★ *priorité*

**Objectif** — vérifier le parcours qui produit le chiffre d'affaires.

**Ce que vous faites**
1. Ouvrez `finarent.com/espace/demande`.
2. **Étape 1 « Type »** — choisissez **« Crédit-bail »**, puis **« Suivant »**.
3. **Étape 2 « Projet »** — Type d'équipement : *Machine industrielle*. Montant souhaité : *45000*. Durée : *48 mois*. Puis **« Suivant »**.
4. **Étape 3 « Entreprise »** — Raison sociale : *Société de test*. Numéro SIREN : **552120222**, puis cliquez ailleurs et attendez deux secondes. Forme juridique : *SAS*. Secteur : *Industrie*. Puis **« Suivant »**.
5. **Étape 4 « Coordonnées »** — vérifiez que le nom, l'email et le téléphone sont préremplis. **Cochez la case des conditions générales.** Puis **« Suivant »**.
6. **Étape 5 « Récapitulatif »** — relisez, puis **« Soumettre ma demande »**.
7. Ouvrez votre boîte email.

**Ce que vous devez voir**
- Un en-tête **« Nouvelle demande de financement »** et une barre à cinq étapes : **Type · Projet · Entreprise · Coordonnées · Récapitulatif**.
- À l'étape 1, six choix : Prêt professionnel, Crédit-bail, LOA, LLD, Leasing opérationnel, RC Professionnelle.
- À l'étape 3, après le SIREN : **« Entreprise trouvée : … »** suivi du nom réel de la société.
- À l'étape 4, l'email est **grisé et non modifiable**, avec la mention « L'email est associé à votre compte et ne peut pas être modifié. »
- À l'étape 5, chaque bloc porte un bouton **« Modifier »** qui ramène à l'étape concernée, et un encart **« Prêt à soumettre ? »**.
- Pendant l'envoi : **« Envoi en cours... »** et un voile **« Envoi de votre demande à nos partenaires… »**.
- Vous êtes ramené au tableau de bord, où une nouvelle ligne apparaît au statut **« En attente »**, avec sa référence FIN-2026-0XXXX.
- Un email **« Demande FIN-2026-0XXXX enregistrée — Finarent »** dans votre boîte.

**C'est un problème si** — la demande ne réapparaît pas dans votre liste, si un champ obligatoire vide ne déclenche pas **« Ce champ est obligatoire »**, ou si un montant fantaisiste (lettres, négatif) est accepté sans **« Veuillez saisir un montant valide »**.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 35 — Les conditions générales sont obligatoires ★ *priorité*

**Objectif** — vérifier qu'aucune demande ne peut être enregistrée sans consentement. C'est le test qui a la portée juridique la plus directe.

**Ce que vous faites**
1. Recommencez une demande (test 34) jusqu'à l'**étape 4**.
2. **Ne cochez pas** la case. Cliquez **« Suivant »**.
3. Cochez, avancez jusqu'au récapitulatif, revenez à l'étape 4 avec **« Modifier »** et **décochez**.
4. Retournez au récapitulatif et cliquez **« Soumettre ma demande »**.

**Ce que vous devez voir**
- La case porte : **« J'accepte les conditions générales et la politique de confidentialité »**, avec deux liens cliquables.
- Sans la case : le passage à l'étape suivante est refusé, message rouge **« Vous devez accepter les conditions »**.
- Après avoir décoché puis tenté d'envoyer : vous êtes **ramené automatiquement à l'étape 4**, avec le même message.

**C'est un problème si** — une demande part sans que la case n'ait été cochée, par quelque chemin que ce soit. **Signalez-le comme bloquant, immédiatement.**

> Ce que vous ne voyez pas, et qui compte : le texte exact accepté et la date d'acceptation sont conservés avec le dossier. C'est ce qui rend le consentement opposable.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 36 — Un brouillon repris redemande les conditions ★ *priorité*

**Objectif** — vérifier la correction de la faille principale : un brouillon repris permettait de sauter le consentement.

**Ce que vous faites**
1. Commencez une demande et allez jusqu'à l'**étape 5** en cochant la case au passage.
2. **Fermez l'onglet** sans envoyer.
3. Rouvrez `finarent.com/espace/demande`.

**Ce que vous devez voir**
- Un bandeau **« Brouillon restauré depuis votre dernière visite »**, avec un bouton **« Recommencer »**.
- Vous êtes ramené **au maximum à l'étape 4 « Coordonnées »**, jamais directement au récapitulatif.
- **La case des conditions générales est décochée.**

**C'est un problème si** — vous rouvrez directement sur le récapitulatif, ou si la case est déjà cochée. **Signalez-le comme bloquant.**

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 37 — La reconnaissance de l'entreprise par le SIREN

**Objectif** — vérifier la recherche automatique de la raison sociale.

**Ce que vous faites**
1. Dans le formulaire de demande, étape 3, tapez **552120222** puis cliquez ailleurs.
2. Recommencez avec un numéro inventé : **999999999**.
3. Recommencez avec **12345** (trop court).

**Ce que vous devez voir**
- **« Recherche... »**, puis **« Entreprise trouvée : … »** ; la raison sociale et la forme juridique se remplissent.
- Avec un numéro inventé : **« Entreprise introuvable »** — la saisie manuelle reste possible.
- Avec un numéro trop court : **« Le SIREN doit contenir 9 chiffres »**. Un SIRET de 14 chiffres est également accepté.

**C'est un problème si** — la recherche reste bloquée sur « Recherche... », ou si un numéro invalide est accepté sans avertissement.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 38 — Déposer une demande d'assurance RC Professionnelle

**Objectif** — vérifier la variante assurance du formulaire.

**Ce que vous faites** — refaites le test 34 en choisissant **« RC Professionnelle »** à l'étape 1.

**Ce que vous devez voir**
- À l'étape 2, les champs changent : **« Secteur d'activité »**, **« Chiffre d'affaires annuel »**, **« Nombre de salariés »** (pas de montant ni de durée).
- Le dossier créé apparaît au tableau de bord avec l'étiquette RC Professionnelle. Sa fiche (test 39) n'a **pas** d'onglet « Tableau d'amortissement » : c'est normal.
- Ce dossier est visible par le compte **assureur** (test 97).

**C'est un problème si** — le formulaire réclame un montant de financement pour une assurance.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 39 — La fiche d'un dossier

**Objectif** — vérifier la page de suivi d'une demande.

**Ce que vous faites**
1. Sur le tableau de bord, cliquez **« Voir le détail »** sur le dossier du test 34.
2. Parcourez les onglets.

**Ce que vous devez voir**
- Le lien **« Retour à mes dossiers »**, la référence, un badge de statut, le nom de l'entreprise et le **« Montant demandé »**.
- Une barre de progression allant de **« Soumis »** à **« Finalisé »**.
- Les onglets : **Informations**, **Documents (n)**, **Tableau d'amortissement** (uniquement pour un financement avec montant et durée), **Messagerie (n)**.
- Dans **Informations** : Entreprise, Contact, Équipement, Message, et un **« Historique des statuts »**.
- En bas, un encart **« Documents requis »** listant les pièces attendues (Extrait KBIS, RIB professionnel, Bilan comptable, Pièce d'identité) avec un compteur du type « 0/4 ».

**C'est un problème si** — un onglet s'ouvre vide alors que son compteur annonce plusieurs éléments, ou si le montant affiché ne correspond pas à celui saisi.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 40 — Le récapitulatif du dossier

**Objectif** — vérifier le document de synthèse remis au client.

**Ce que vous faites** — sur la fiche du dossier, cliquez le bouton **« Récapitulatif »**.

**Ce que vous devez voir**
- Un **nouvel onglet s'ouvre**, avec une page intitulée « Récapitulatif dossier … » reprenant les informations du dossier, les documents joints et l'historique.
- En haut, un bouton **« Imprimer / Télécharger PDF »** qui ouvre la fenêtre d'impression de votre navigateur (choisissez « Enregistrer au format PDF »).

**C'est un problème si** — l'onglet s'ouvre vide, ou si les informations ne sont pas celles de votre dossier.

> *Défaut connu n° 17* — c'est une page imprimable, pas un fichier PDF téléchargé directement. Dites-nous si vous préférez un vrai téléchargement.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 41 — Ajouter un document

**Objectif** — vérifier le dépôt de pièces justificatives.

**Ce que vous faites**
1. Onglet **« Documents »**, bouton **« Ajouter un document »**.
2. Choisissez un fichier PDF ou une photo.
3. Essayez ensuite un fichier de plus de 10 Mo, puis un fichier d'un autre type (un fichier Word, par exemple).
4. Ouvrez votre boîte email.
5. Enfin, supprimez le document déposé (icône corbeille).

**Ce que vous devez voir**
- Pendant l'envoi : **« Envoi... »**, puis le fichier apparaît dans la liste ; le compteur **« Documents requis »** avance si le type correspond.
- La mention **« Formats acceptés : PDF, JPG, PNG · Taille max : 10 Mo »**.
- Un fichier trop gros est refusé : **« Fichier trop volumineux (max 10 Mo) »**. Un fichier Word est refusé : **« Format non autorisé… »**.
- Un email **« Document reçu — Dossier FIN-… — Finarent »**.
- À la suppression : **« Supprimer ce document ? Il sera conservé 30 jours puis définitivement effacé. »**

**C'est un problème si** — un fichier valide est refusé avec **« Erreur lors de l'envoi du document. »**, ou si un fichier de plus de 10 Mo passe.

> *Défaut connu n° 19* — les photos HEIC et WEBP sont en réalité acceptées, alors que la mention ne les cite pas.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 42 — Rouvrir un document déposé

**Objectif** — vérifier que l'on peut consulter une pièce déjà envoyée.

**Ce que vous faites**
1. Déposez un document (test 41), puis cliquez sur son nom dans la liste.
2. **Rechargez la page**, puis cliquez à nouveau sur son nom.

**Ce que vous devez voir** — dans les deux cas, le document s'ouvre dans un nouvel onglet.

**C'est un problème si** — après rechargement, le clic ouvre une page **« 404 »** ou une page vide.

> *Défaut connu n° 1* — au 10 septembre, c'est exactement ce qui se produit : après rechargement, le lien ne pointe plus vers le bon endroit. Le défaut touche aussi l'administrateur, le partenaire et l'assureur. Notez simplement KO avec la mention « défaut connu n° 1 ».

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 43 — Écrire à son conseiller

**Objectif** — vérifier la messagerie du dossier.

**Ce que vous faites**
1. Onglet **« Messagerie »**, tapez un message dans **« Tapez votre message... »**.
2. Cliquez l'icône d'envoi (avion en papier) ou appuyez sur Entrée.
3. Rechargez la page.

**Ce que vous devez voir** — votre message apparaît dans la conversation, signé **« Vous »**, avec l'heure. Il est toujours là après rechargement. Les réponses de l'équipe apparaissent signées **« Conseiller »** ou du nom du conseiller.

**C'est un problème si** — le message disparaît au rechargement, ou si le compteur de l'onglet ne s'incrémente pas.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 44 — Le tableau d'amortissement

**Objectif** — vérifier l'échéancier présenté au client.

**Ce que vous faites**
1. Onglet **« Tableau d'amortissement »** d'un dossier de financement.
2. Cliquez **« Voir tout (n mois) »**.

**Ce que vous devez voir**
- Trois cartes : **Mensualité**, **Coût total du crédit**, **Taux annuel**.
- Un tableau **Mois · Mensualité · Capital · Intérêts · Capital restant**, avec autant de lignes que de mois du dossier.
- Le **capital restant de la dernière ligne est nul ou proche de zéro**.

**C'est un problème si** — le capital restant n'atteint jamais zéro, ou si le nombre de lignes ne correspond pas à la durée.

> *Défaut connu n° 18* — ce tableau est une **estimation à un taux fixe de 4,5 %**. Il ne reflète pas l'offre réelle que votre conseiller vous transmettra. Dites-nous si cette mention doit apparaître à l'écran.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 45 — Recevoir une offre

**Objectif** — vérifier ce que voit le client quand une offre lui est adressée.

**Ce que vous faites**
1. Demandez à l'administrateur de créer une offre sur votre dossier et de passer le dossier au statut **« Devis envoyé »** (test 68).
2. Revenez sur votre tableau de bord et ouvrez votre boîte email.

**Ce que vous devez voir**
- Le dossier affiche le statut **« Devis envoyé »** ; le bandeau « Mon dossier en cours » indique « Action requise : examinez et acceptez votre offre. »
- Un email **« Dossier FIN-… — votre devis est disponible »** avec un bouton « Consulter mon devis ».
- La cloche (test 32) et la page Notifications (test 53) mentionnent le changement.

**C'est un problème si** — l'email n'arrive pas, ou si le statut ne change pas.

> *Nouveau depuis le 10 septembre 2026* — l'écran d'acceptation **existe désormais**. Enchaînez avec le test 45 bis ci-dessous.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 45 bis — Lire et accepter une offre ★ *priorité*

**Objectif** — vérifier que le client voit le détail de son offre et peut l'accepter lui-même. Cette fonction vient d'être construite : c'est le test le plus utile de cette partie.

**Ce que vous faites**
1. Sur le dossier qui a reçu une offre (test 45), ouvrez l'onglet **« Offres »** en haut de la fiche.
2. Lisez le détail affiché, puis cliquez **« Accepter cette offre »**.
3. Une fenêtre de confirmation apparaît, rappelant le montant et la durée. Lisez-la, puis confirmez.

**Ce que vous devez voir**
- Un onglet « Offres » avec le nombre d'offres entre parenthèses.
- Pour chaque offre : le **montant**, la **mensualité**, la **durée**, le **taux**, le **coût total**, le nom du **partenaire** s'il y en a un, et la **date limite d'acceptation**.
- La fenêtre de confirmation rappelle bien **le montant et la durée exacts**, et précise que l'acceptation vous engage.
- Après confirmation : l'offre passe en **« Acceptée »**, le message « Vous avez accepté cette offre » remplace le bouton, et le statut du dossier devient **« Devis accepté »**.

**C'est un problème si**
- l'onglet « Offres » n'apparaît pas alors qu'une offre vous a été envoyée ;
- une offre encore **en préparation** apparaît (l'administrateur ne l'a pas encore envoyée : vous ne devez pas la voir) ;
- la fenêtre de confirmation annonce un montant ou une durée qui ne correspondent pas à l'offre affichée ;
- le bouton reste cliquable sur une offre **expirée** ou **déjà acceptée** ;
- un refus s'affiche sans expliquer pourquoi. Les messages « Offre expirée » et « Offre déjà acceptée » doivent se distinguer.

> **À tester aussi, si votre administrateur peut vous aider** : demandez-lui de laisser expirer une offre (date limite dépassée), puis essayez de l'accepter. Vous devez voir « Offre expirée » — et non un message vague ni un plantage.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 46 — Signer un contrat ★ *priorité*

**Objectif** — vérifier la signature électronique et la preuve associée.

**Ce que vous faites**
1. Ce test exige que l'administrateur ait **créé une offre** sur votre dossier et l'ait passé au statut **« Devis accepté »** (test 68).
2. En bas de la fiche du dossier, encart **« Signature du contrat »** : cochez **« Je confirme avoir lu et accepté les conditions générales »**.
3. Cliquez **« Signer le contrat »**.
4. Sur la page qui s'ouvre, lisez les conditions, tracez votre signature dans le cadre (souris, ou doigt sur mobile), cochez la case de consentement, puis **« Signer le contrat »**.
5. Cliquez **« Télécharger le contrat signé »**, puis revenez sur la fiche du dossier et ouvrez l'onglet Documents. Ouvrez votre boîte email.

**Ce que vous devez voir**
- L'encart de signature n'apparaît **que** si le dossier est au statut « Devis accepté ».
- Sur la page de signature : un bloc **« Conditions du contrat »** (Montant, Durée, Mensualité, Taux), un lien **« Lire le contrat en entier »**, un cadre **« Signez ici »** avec **« Effacer et recommencer »**.
- Le bouton **« Signer le contrat »** reste **inactif** tant que le tracé n'est pas fait **et** que la case n'est pas cochée.
- La case de consentement cite l'**article 1367 du Code civil** et précise que la date, l'adresse IP et l'empreinte du document sont conservées.
- Après signature : **« Contrat signé »**, la date d'enregistrement, et les boutons **« Télécharger le contrat signé »** et **« Retour à mon espace »**.
- Le dossier passe au statut **« Signé »** ; l'onglet Documents contient **« Contrat signé — jj/mm/aaaa.pdf »**, qui ne peut pas être supprimé.
- Un email **« Votre contrat »** avec le PDF signé en pièce jointe.

**C'est un problème si** — le bouton devient actif sans tracé ni case cochée, si le contrat téléchargé ne porte pas votre signature, ou si le contrat signé peut être supprimé de l'onglet Documents.

> Il s'agit d'une signature électronique simple : tracé manuscrit, identification par connexion, horodatage, adresse IP et empreinte du document. **Ce n'est pas une signature qualifiée** au sens du règlement européen eIDAS. Le choix a été tranché le 10 septembre 2026 ; si votre offre commerciale promet une signature certifiée par un tiers, dites-le-nous.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 47 — Modifier son profil

**Objectif** — vérifier que les modifications sont conservées.

**Ce que vous faites**
1. Menu latéral, **« Mon profil »**.
2. Changez le téléphone et la forme juridique, puis **« Enregistrer les modifications »**.
3. **Rechargez la page.**

**Ce que vous devez voir**
- Les champs modifiables : **Nom complet**, **Téléphone**, **Entreprise**, **Forme juridique**. **L'adresse email est grisée.**
- Un bandeau vert **« Profil mis à jour avec succès »**, qui disparaît après quelques secondes.
- **Après rechargement, vos modifications sont toujours là.**

**C'est un problème si** — le message de succès s'affiche mais la modification disparaît au rechargement.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 48 — Exporter ses données personnelles

**Objectif** — vérifier le droit de portabilité prévu par le RGPD.

**Ce que vous faites**
1. Sur **« Mon profil »**, section **« Confidentialité et données personnelles »**, cliquez **« Exporter »**.
2. Ouvrez le fichier téléchargé avec le Bloc-notes.

**Ce que vous devez voir** — un fichier `finarent-data-….json` contenant vos informations **en clair et lisibles** : nom, dossiers, documents.

**C'est un problème si** — le fichier contient des suites de caractères illisibles commençant par **`v1:`** à la place d'une information attendue.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 49 — Supprimer son compte

**Objectif** — vérifier le droit à l'effacement.

> **À ne faire qu'en dernier, sur un compte de démonstration.** L'opération est irréversible : le compte ne servira plus aux autres tests.

**Ce que vous faites**
1. Sur **« Mon profil »**, bouton rouge **« Supprimer »** en face de « Supprimer mon compte ».
2. Cliquez **« Annuler »** : rien ne doit se passer. Recommencez et cliquez **« Confirmer »**.

**Ce que vous devez voir**
- Une fenêtre **« Confirmer la suppression »** : « Cette action est irréversible. Vos données personnelles seront anonymisées et vous serez déconnecté. Souhaitez-vous continuer ? », avec **« Annuler »** et **« Confirmer »**.
- Après confirmation : déconnexion automatique.

**C'est un problème si** — « Annuler » supprime quand même, ou si vous parvenez à vous reconnecter et à retrouver vos données intactes.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 50 — Sécurité du compte et mot de passe

**Objectif** — vérifier la page de sécurité et le changement de mot de passe.

**Ce que vous faites**
1. Menu latéral, **« Sécurité »**.
2. Cliquez **« Recevoir un lien de modification »**.
3. Ouvrez votre boîte email et suivez le lien.

**Ce que vous devez voir**
- La page **« Sécurité du compte »** : méthode d'authentification, email associé (avec la pastille **« Vérifié »**), date de création, dernière connexion, **Rôle : Client**.
- Après le clic : **« Email envoyé »**, puis « Le lien de modification du mot de passe vient d'être envoyé à … ».
- Un email permettant de définir un nouveau mot de passe.

**C'est un problème si** — aucun email n'arrive au bout de dix minutes, ou si le message **« Trop de demandes. Réessayez dans une heure. »** apparaît dès la première tentative.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 51 — Enregistrer ses coordonnées bancaires

**Objectif** — vérifier l'enregistrement et la protection d'un RIB.

**Ce que vous faites**
1. Sur **« Sécurité »**, section **« Coordonnées bancaires (RIB) »**, cliquez **« Ajouter mon RIB »**.
2. Titulaire : votre nom. IBAN : **FR76 3000 1007 9412 3456 7890 185** (IBAN de test valide). Cliquez **« Enregistrer »**.
3. Cliquez **« Modifier le RIB »** et saisissez **FR76 1234** puis **« Enregistrer »**.
4. Cliquez **« Supprimer »**, puis **« Oui, supprimer »**.

**Ce que vous devez voir**
- Après enregistrement : **« Coordonnées bancaires enregistrées »**, et l'IBAN affiché **partiellement masqué** (« FR76 **** **** 185 »), avec la date de mise à jour.
- En modification, l'encart : « Pour votre sécurité, l'IBAN n'est jamais réaffiché : saisissez-le en entier pour le remplacer. »
- L'IBAN faux est refusé : **« IBAN invalide : vérifiez le numéro saisi. »**
- Après suppression : **« Coordonnées bancaires supprimées »** puis **« Aucun RIB enregistré »**.

**C'est un problème si** — l'IBAN se réaffiche en entier, ou si un IBAN manifestement faux est accepté.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 52 — Le parrainage

**Objectif** — vérifier le mécanisme de recommandation.

**Ce que vous faites**
1. Menu latéral, **« Parrainage »**.
2. Cliquez **« Copier »**, puis collez le lien dans un nouvel onglet de navigation privée.
3. Dans **« Inviter par email »**, saisissez un nom et **une adresse email que vous consultez, différente de celle du compte**, puis **« Inviter »**.
4. Recommencez avec la même adresse. Puis avec l'adresse du compte lui-même.
5. Consultez la boîte email invitée.

**Ce que vous devez voir**
- Le titre **« Parrainez et gagnez »** et trois étapes : **Invitez · Il souscrit · Vous gagnez**.
- **« Copier »** devient **« Copié ! »** deux secondes ; le lien collé ouvre la page d'accueil Finarent.
- Deux boutons de partage : **« Email »** et **« WhatsApp »**.
- Après l'invitation : **« Invitation envoyée à … »**, et le compteur **« Invitations »** augmente de un ; la ligne apparaît dans **« Mes parrainages »** au statut **« En attente »**.
- Second essai : **« Vous avez déjà invité cette adresse. »** Avec votre propre adresse : **« Vous ne pouvez pas vous parrainer vous-même. »**
- Un email **« … vous invite à découvrir Finarent »** dans la boîte invitée.

**C'est un problème si** — **« Invitation enregistrée, mais l'email n'a pas pu être envoyé. »** s'affiche, ou si aucun email n'arrive au bout de dix minutes.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 53 — La page Notifications

**Objectif** — vérifier le journal des changements de statut.

**Ce que vous faites**
1. Demandez à l'administrateur de changer le statut d'un de vos dossiers (test 56).
2. Menu latéral, **« Notifications »**.

**Ce que vous devez voir** — une ligne par changement, indiquant le dossier, la date, **« Statut modifié »** et le passage d'un statut à l'autre (par exemple « En attente → En cours d'étude »), avec le commentaire éventuel du conseiller. S'il y a des messages non lus, une pastille **« N messages non lus »**.

**C'est un problème si** — un changement effectué par l'administrateur n'apparaît jamais.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 54 — Les emails reçus par le client

**Objectif** — vérifier, en une fois, que chaque email attendu est bien arrivé.

**Ce que vous faites** — à la fin de la partie 2, ouvrez votre boîte email et cochez.

| Déclencheur | Objet de l'email | Reçu ? |
|---|---|---|
| Dépôt de la demande (test 34) | « Demande FIN-… enregistrée — Finarent » | ☐ |
| Dépôt d'un document (test 41) | « Document reçu — Dossier FIN-… — Finarent » | ☐ |
| Passage en « En cours d'étude » (test 56) | « Dossier FIN-… — votre dossier est à l'étude » | ☐ |
| Passage en « Devis envoyé » (test 68) | « Dossier FIN-… — votre devis est disponible » | ☐ |
| Signature (test 46) | « Votre contrat » avec le PDF joint | ☐ |
| Passage en « Signé » (automatique) | « Dossier FIN-… — contrat signé » | ☐ |
| Devis envoyé par l'administrateur (test 61) | « Votre devis DEV-… » avec le PDF joint | ☐ |
| Facture envoyée par l'administrateur (test 64) | « Votre facture FAC-… » avec le PDF joint | ☐ |
| Lien de mot de passe (test 50) | Email de réinitialisation | ☐ |
| Invitation de parrainage (test 52), dans la boîte invitée | « … vous invite à découvrir Finarent » | ☐ |

**C'est un problème si** — un email attendu manque alors que l'action a réussi à l'écran. Vérifiez les indésirables avant de signaler.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

---

# Partie 3 — Le back-office administrateur

**À quoi sert cet espace :** c'est le poste de travail de l'équipe Finarent. On y traite les dossiers, on y produit devis et factures, on y suit les apporteurs d'affaires et les centres d'appel, et on y gère les comptes.

Connectez-vous avec le **compte administrateur**. Vous arrivez sur `finarent.com/admin`.

## Test 55 — Le tableau de bord

**Objectif** — vérifier la vue d'ensemble de l'activité.

**Ce que vous faites** — parcourez la page d'arrivée de haut en bas, puis cliquez une tuile du bandeau « À traiter aujourd'hui » s'il est affiché.

**Ce que vous devez voir**
- Le titre **« Tableau de bord »**, sous-titré « Vue d'ensemble de l'activité Finarent ».
- Un bandeau **« À traiter aujourd'hui »** (seulement s'il y a des actions en attente) avec quatre tuiles : *Dossiers PENDING > 4h*, *Docs en attente > 7j*, *Offres expirent < 24h*, *Offres sans réponse > 48h*.
- Éventuellement un bloc **« Alertes SLA »** (Niveau 1 : Non traité > 4h, Niveau 2 : Analyse > 24h, Niveau 3 : Documents > 48h).
- Six compteurs : **Total dossiers · En attente · En cours · Finalisés · Utilisateurs · Partenaires**.
- Six indicateurs, un **Funnel de conversion**, une **Performance par opérateur**, une **Tendance mensuelle**, les **Secteurs les plus demandés**, et un tableau **« Dernières demandes »**.
- Un menu latéral de dix-sept entrées, dans cet ordre : Tableau de bord · Demandes · File d'appels · Centres d'appel · Espace agents · Devis · Factures · Documents émis · Offres prêt · Utilisateurs · Prospection · Partenaires · Affiliation · Logs d'activité · FAQ · Témoignages · Paramètres. En bas : **« Exporter CSV »** et **« Déconnexion »**.

**C'est un problème si** — le nombre total de dossiers ne correspond pas au nombre de lignes de l'écran « Demandes ».

> *Défauts connus n° 6 et 8* — cliquer une tuile de « À traiter aujourd'hui » ouvre l'écran **sans appliquer de filtre** ; et la colonne Statut du tableau « Dernières demandes » affiche des libellés techniques (`en_attente`) au lieu du français.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 56 — Traiter une demande et changer son statut

**Objectif** — vérifier le cœur du travail quotidien de l'équipe, et l'email qui en découle.

**Ce que vous faites**
1. Menu **« Demandes »**. Dans **« Rechercher par nom, email, SIREN, référence... »**, tapez la référence de la demande du test 34.
2. Cliquez sur la demande pour la déplier.
3. Dans **« Changer le statut »**, choisissez **« En cours d'étude »**.
4. Cliquez **« Modifier »** en face de **« Notes »**, écrivez une note, puis **« Enregistrer »**.
5. Rechargez la page.
6. Vérifiez côté client (tests 32, 53 et 54) que la notification et l'email sont arrivés.

**Ce que vous devez voir**
- Le titre **« Demandes de financement »** et une bascule **« Liste » / « Kanban »**.
- Des onglets : **Tous · En attente · En cours · Transmis · Terminés**, avec leurs compteurs.
- Le menu de statut propose onze valeurs : **En attente · En cours d'étude · Documents manquants · Devis envoyé · Devis accepté · Signature en attente · Signé · Transmis au partenaire · Validée · Refusée · Finalisé**.
- Sur chaque dossier : un score de pré-qualification, une étiquette **Financement** ou **Assurance**, **Pièces jointes (N)**, et un sélecteur **« Centre d'appel attribué »**.
- Après rechargement : le statut et la note sont conservés.

**C'est un problème si** — le statut ne se met pas à jour, si la note disparaît, ou si le client ne reçoit pas l'email « votre dossier est à l'étude ».

> **Attention en vue Liste : le changement de statut part au premier clic, sans confirmation**, et déclenche l'email au client. Les statuts « En attente » et « Devis accepté » n'envoient pas d'email ; tous les autres, si.

> **« Transmis au partenaire » ne transmet rien** : c'est un simple statut. *Défaut connu n° 3* — il n'existe aucun moyen, depuis cet écran, de rattacher un dossier à un partenaire précis. Voir test 95.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 57 — Les notes internes sont lisibles

**Objectif** — vérifier la correction de l'affichage des données protégées.

**Ce que vous faites**
1. Sur **« Demandes »**, dépliez plusieurs dossiers, y compris d'anciens, et lisez la zone **« Notes »**.
2. Faites de même sur **« File d'appels »** (colonne des notes), sur **« Offres prêt »** (Conditions particulières), et dans le tableau **« Paiements »** d'une facture (colonne **« Réf. »**).

**Ce que vous devez voir** — du texte français lisible partout.

**C'est un problème si** — une zone affiche une suite de caractères commençant par **`v1:`**. Signalez-le en précisant l'écran exact.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 58 — Le pipeline en colonnes

**Objectif** — vérifier le suivi visuel des dossiers.

**Ce que vous faites**
1. Sur l'écran Demandes, cliquez **« Kanban »**.
2. Faites glisser une carte d'une colonne à l'autre, puis rechargez.

**Ce que vous devez voir**
- Cinq colonnes : **En attente · En étude · Docs manquants · Offre émise · Finalisés**.
- Au dépôt, une demande de confirmation avertit que **le client en sera informé par email**.
- Après confirmation, la carte reste dans sa nouvelle colonne, y compris après rechargement.

**C'est un problème si** — la carte revient à sa place après rechargement, ou si aucune confirmation n'apparaît.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 59 — Rattacher un dossier à un centre d'appel

**Objectif** — vérifier le seul rattachement pilotable depuis une demande.

**Ce que vous faites**
1. Créez d'abord un centre d'appel (test 79).
2. Sur **« Demandes »**, dépliez un dossier, et dans **« Centre d'appel attribué »**, choisissez ce centre. Rechargez.

**Ce que vous devez voir** — le centre reste sélectionné après rechargement, avec la mention « Une commission sera calculée automatiquement pour le centre à la signature du dossier. » Le dossier apparaît ensuite dans l'onglet **« Dossiers »** de la fiche du centre.

**C'est un problème si** — la sélection ne tient pas au rechargement.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 60 — Créer un devis

**Objectif** — vérifier la production d'un devis.

**Ce que vous faites**
1. Menu **« Devis »**, bouton **« Nouveau devis »**.
2. Remplissez le contact (Nom, votre email de test, Téléphone, Entreprise, Adresse, SIRET).
3. Ajoutez un poste : description, quantité, prix unitaire hors taxes, TVA.
4. Renseignez **« Valide jusqu'au »**, puis **« Créer le devis »**.
5. Dans la liste, cliquez **« PDF »** sur le devis créé.

**Ce que vous devez voir**
- Le devis apparaît au statut **« Brouillon »**, avec un numéro commençant par **DEV-**.
- Les totaux **Sous-total HT / TVA / Total TTC** se recalculent à chaque modification.
- Le PDF s'ouvre dans un nouvel onglet, avec le logo Finarent, le tableau des postes, les totaux et les mentions légales en bas.

**C'est un problème si** — un total est faux, ou si le PDF s'ouvre sans logo ni mentions légales.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 61 — Envoyer un devis au client ★ *priorité*

**Objectif** — vérifier que l'envoi est une action volontaire, sans envoi involontaire.

**Ce que vous faites**
1. Sur un devis en **Brouillon**, cliquez **« PDF »**. Regardez votre boîte email : rien ne doit arriver.
2. Cliquez **« Envoyer au client »** : le refus est attendu.
3. Cliquez **« Passer en envoyé »**. Regardez votre boîte : toujours rien.
4. Cliquez **« Envoyer au client »**. Puis une seconde fois.

**Ce que vous devez voir**
- **Consulter le PDF n'envoie rien.**
- Sur un brouillon, l'envoi est refusé : **« Un devis en brouillon n'engage pas Finarent : passez-le en SENT avant de l'envoyer. »**
- **« Passer en envoyé » ne fait que changer le statut** en « Envoyé », sans email.
- **« Envoyer au client »** expédie réellement : **« Envoi… »**, puis **« DEV-… envoyé à … »**. Le bouton devient **« Renvoyer au client »**. Un email **« Votre devis DEV-… »** arrive avec le PDF.
- Le second envoi est bloqué : **« DEV-… : document identique déjà transmis à … — aucun second envoi. »**
- Sur un devis envoyé, deux boutons apparaissent : **« Accepter »** et **« Refuser »**.

**C'est un problème si** — un email arrive alors que vous n'avez cliqué que sur « PDF » ou « Passer en envoyé ». **Signalez-le comme bloquant.**

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 62 — Créer une facture : le numéro provisoire ★ *priorité*

**Objectif** — vérifier qu'un brouillon ne consomme pas de numéro comptable.

**Ce que vous faites**
1. Menu **« Factures »**, bouton **« Nouvelle facture »**.
2. Choisissez **« Lier à une demande »** : le nom, l'email et le SIRET se remplissent seuls. Remplacez l'email par votre email de test.
3. Ajoutez une ligne, renseignez l'échéance, puis **« Créer la facture »**.
4. Ouvrez la facture et lisez son en-tête.
5. Créez une deuxième facture, puis **supprimez-la**.

**Ce que vous devez voir**
- La facture porte la mention **« Brouillon »**, et non un numéro comptable.
- Sous le titre : **« Référence de travail XXXXXXXX — le numéro comptable sera attribué à l'émission. »**
- Un brouillon se supprime **sans créer de trou** : la facture suivante émise reprend le numéro attendu.

**C'est un problème si** — un brouillon porte déjà un numéro `FAC-2026-0001`, ou si la suppression d'un brouillon fait sauter un numéro.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 63 — Émettre une facture : le numéro définitif ★ *priorité*

**Objectif** — vérifier l'attribution du numéro comptable et le contrôle des statuts.

**Ce que vous faites**
1. Sur une facture en Brouillon, cliquez **« Émettre »**. Notez le numéro.
2. Créez et émettez une deuxième facture. Comparez.
3. Essayez de passer une facture jamais encaissée directement au statut « Payée ».

**Ce que vous devez voir**
- Le titre passe de « Brouillon » à **`FAC-2026-0001`** (ou le suivant).
- La deuxième facture porte **le numéro immédiatement suivant**, sans saut ni doublon.
- Le statut devient **« Émise »**, la date d'émission apparaît, et le bouton **« Envoyer au client »** n'apparaît qu'à partir de ce moment.
- Une facture non encaissée **ne peut pas** être passée en « Payée » : message du type « Facture non soldée : … Enregistrez le versement plutôt que de forcer le statut. »

**C'est un problème si** — deux factures portent le même numéro, si un numéro est sauté, ou si une facture peut être marquée payée sans encaissement. **Bloquant : c'est un sujet comptable.**

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 64 — Envoyer une facture au client ★ *priorité*

**Objectif** — vérifier que l'envoi d'une facture est volontaire.

**Ce que vous faites**
1. Sur une facture émise, cliquez **« Voir PDF »**. Rien ne doit arriver par email.
2. Cliquez **« Envoyer au client »**, puis une seconde fois.

**Ce que vous devez voir**
- **Consulter le PDF n'envoie rien.**
- **« Envoi en cours… »**, puis **« Facture envoyée à … »** ; l'en-tête affiche « Transmise le … à … » et le bouton devient **« Renvoyer au client »**. Un email **« Votre facture FAC-… »** arrive avec le PDF.
- Au second envoi : **« Document identique déjà transmis à … — aucun second envoi (…) »**.

**C'est un problème si** — un email arrive alors que vous n'avez fait que consulter le PDF. **Bloquant.**

> Il n'y a pas de bouton d'envoi dans la liste des factures : il faut ouvrir la facture. C'est délibéré.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 65 — Enregistrer un paiement

**Objectif** — vérifier le suivi des encaissements.

**Ce que vous faites**
1. Sur une facture émise, dans **« Enregistrer un paiement »**, saisissez la moitié du montant, une méthode (Virement, Carte bancaire, Chèque, Espèces, Avoir), une référence, puis **« Enregistrer »**.
2. Recommencez avec le solde : le bouton **« Solder (…) »** remplit le montant restant.
3. Rechargez la page.

**Ce que vous devez voir**
- Après le premier paiement : statut **« Partielle »**, la carte **« Encaissé »** et la barre **« Avancement paiement »** mises à jour, **« Reste à payer »** affiche le solde.
- Après le second : statut **« Payée »**, reste à payer nul, tampon de validation.
- Chaque versement apparaît dans le tableau **« Paiements »** (Date, Méthode, Réf., Montant).

**C'est un problème si** — le total encaissé dépasse le total de la facture, ou si un versement apparaît deux fois.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 66 — Le registre des documents émis

**Objectif** — vérifier la traçabilité des documents produits et envoyés.

**Ce que vous faites**
1. Menu **« Documents émis »**.
2. Cherchez le devis et la facture envoyés aux tests 61 et 64, et le contrat signé au test 46.
3. Cliquez **« Télécharger »** sur l'un d'eux.

**Ce que vous devez voir**
- Le titre **« Documents émis »**, sous-titré « N pièce(s) archivée(s) · N non transmise(s) ».
- Des filtres : **Tous · Factures · Devis · Contrats · Commissions · Récapitulatifs · Autres**.
- Un tableau **Date · Type · Dossier · Fichier · Destinataire · Transmis**, où la colonne Transmis affiche la date d'envoi, **« en attente »** ou **« archivé seul »**.
- Le document téléchargé est bien celui envoyé.

**C'est un problème si** — un document envoyé n'apparaît pas ici, ou apparaît « en attente » alors que le client l'a reçu. **C'est l'écran de contrôle à utiliser après chaque test d'envoi.**

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 67 — Le lien de paiement en ligne

**Objectif** — savoir ce que fait ce bouton tant que le compte de paiement n'est pas ouvert.

**Ce que vous faites** — sur une facture émise, encart **« Lien de paiement Stripe »**, cliquez **« Générer le lien »**.

**Ce que vous devez voir** — un message d'erreur clair : **« Stripe non configuré (STRIPE_SECRET_KEY manquante) »**. C'est le comportement attendu tant que le compte Stripe n'est pas ouvert (voir la section « Ce qui ne peut pas encore être testé »).

**C'est un problème si** — le bouton annonce un succès, ou si aucun message n'apparaît.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 68 — Créer une offre de prêt et préparer la signature

**Objectif** — vérifier la production d'une offre chiffrée, et amener un dossier jusqu'à l'étape de signature (prérequis des tests 45 et 46).

**Ce que vous faites**
1. Menu **« Offres prêt »**, bouton **« Nouvelle offre »**.
2. Sélectionnez la demande du test 34, saisissez Montant, Durée, Taux, un partenaire et une durée de validité. Regardez les aperçus, puis **« Envoyer l'offre »**.
3. Menu **« Demandes »** : passez ce dossier au statut **« Devis envoyé »**. Le client reçoit l'email du test 45.
4. Une fois l'accord du client obtenu (dans la vraie vie, par téléphone ou par message), passez le dossier au statut **« Devis accepté »**.
5. Le client fait alors le test 46. Revenez ensuite sur **« Offres prêt »**.

**Ce que vous devez voir**
- Les aperçus **« Mensualité calculée »** et **« Coût total »** se recalculent à chaque modification.
- L'offre apparaît au statut **« Envoyée »**. Les statuts possibles : **Brouillon · Envoyée · Vue · Acceptée · Refusée · Expirée · Signée**.
- Après la signature du client, l'offre passe d'elle-même au statut **« Signée »**, et le dossier au statut « Signé ».

**C'est un problème si** — la mensualité calculée est incohérente avec le montant et la durée, ou si le client parvient à signer une offre en Brouillon, Refusée ou Expirée.

> *Défaut connu n° 23* — « Envoyer l'offre » enregistre l'offre mais **n'envoie aucun email** ; c'est le passage du dossier en « Devis envoyé » (étape 3) qui prévient le client.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 69 — La liste et la fiche des utilisateurs

**Objectif** — vérifier la consultation des comptes.

**Ce que vous faites**
1. Menu **« Utilisateurs »**.
2. Recherchez le compte client de démonstration et cliquez sur la ligne.
3. Parcourez les onglets de la fiche.

**Ce que vous devez voir**
- Une table des utilisateurs avec compteurs par rôle, recherche et filtre.
- La fiche : en-tête (nom, email, rôle), cinq compteurs (**Dossiers · Factures · Devis · Messages · Parrainages**), cinq onglets (**Vue d'ensemble · Dossiers · Factures · Devis · Messages**). L'onglet Dossiers liste la demande du test 34 avec un lien vers le dossier.

**C'est un problème si** — le compte client est introuvable, ou si sa fiche ne liste pas ses dossiers.

> *Défaut connu n° 11* — dans les onglets **Factures** et **Devis** de cette fiche, les colonnes Numéro, Total et Date s'affichent vides ou à « 0 € ». Les données existent (menu Factures et Devis), c'est l'affichage de cette fiche qui est défaillant.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 70 — Changer le rôle d'un utilisateur

**Objectif** — vérifier la correction du défaut le plus insidieux : un rôle modifié qui retombait silencieusement à « client ».

**Ce que vous faites**
1. Sur la fiche d'un compte de démonstration, sous **« Rôle »**, choisissez une autre valeur.
2. **Rechargez la page.**
3. **Déconnectez-vous du compte concerné, reconnectez-vous, et naviguez.**

**Ce que vous devez voir**
- Les quatre rôles : **CLIENT**, **ADMIN**, **PARTNER**, **INSURER**. Le changement s'applique sans bouton « Enregistrer ».
- **Après rechargement, et après déconnexion-reconnexion, le rôle est toujours le nouveau.** Le compte accède à son nouvel espace.

**C'est un problème si** — le rôle redevient CLIENT après reconnexion, ou si l'écran annonce un succès sans effet.

> **Un refus franc n'est pas un défaut.** Si un message commençant par **« Changement de rôle indisponible : … »** apparaît, le service de gestion des comptes n'est pas configuré sur cet environnement. Recopiez le message et transmettez-le à l'équipe technique.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 71 — Gérer les partenaires

**Objectif** — vérifier l'ajout d'une banque ou d'un assureur partenaire.

**Ce que vous faites**
1. Menu **« Partenaires »**. Créez un partenaire : Nom *Banque de test*, Type **Banque**, Email de contact, Notes.
2. Cherchez-le, puis supprimez-le.

**Ce que vous devez voir**
- Trois types : **Banque**, **Assurance**, **Leasing**.
- Le partenaire apparaît avec ses compteurs **Dossiers**, **Users**, **Commissions**.
- La suppression demande confirmation : « Supprimer le partenaire "…" ? Cette action est irréversible. »

**C'est un problème si** — un partenaire créé n'apparaît pas, ou si la suppression s'effectue sans confirmation.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 72 — La prospection

**Objectif** — vérifier que les prospects issus des questionnaires et des simulateurs arrivent bien.

**Ce que vous faites**
1. Menu **« Prospection »**.
2. Cherchez les demandes des tests 6 et 7 (votre email de test).
3. Ouvrez la fiche dans le panneau latéral, changez le statut, ajoutez une note.

**Ce que vous devez voir**
- Cinq compteurs : **Total · Nouveau · Contacté · Qualifié · Converti**.
- Un tableau : **Score · Prospect · Contact · Source · Dernier simulateur · Activité · Statut · Vu**. Les prospects des tests 6 et 7 portent la mention **devis-auto**, **devis-moto**, etc.
- Les statuts : **Nouveau · Contacté · Qualifié · Converti · Perdu**. Un prospect sans nom s'affiche **« Anonyme »**.
- Le panneau latéral affiche l'identité, un onglet **Évènements** (les questionnaires remplis, avec les réponses), un onglet **Notes**, et permet de rattacher le prospect à un centre d'appel et à un agent.

**C'est un problème si** — les prospects des tests 6 et 7 sont absents.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 73 — Importer des prospects depuis un fichier

**Objectif** — vérifier l'import d'un fichier Excel enregistré en CSV.

**Ce que vous faites**
1. Dans Excel ou le Bloc-notes, créez un fichier avec ces trois lignes, enregistré en `.csv` :
   ```
   nom,email,telephone,societe,statut
   Jean Martin,jean.martin@exemple.fr,0612345678,Martin SAS,NEW
   Marie Durand,marie.durand@exemple.fr,0698765432,Durand SARL,CONTACTED
   ```
2. Menu **« Prospection »**, bouton **« Importer CSV »**, choisissez le fichier, puis **« Importer »**.
3. Recommencez avec le même fichier.

**Ce que vous devez voir**
- Une fenêtre **« Importer des prospects »** rappelant les colonnes reconnues (nom, email, téléphone, société, statut, source, notes) et proposant d'affecter les prospects à un centre d'appel.
- Après import : **« Import terminé »**, **« Créés : 2 »**, **« Lignes traitées : 2 »**, et un bouton **« Voir les prospects »**.
- Au second import : **« Mis à jour : 2 »** et **« Créés : 0 »** — pas de doublon.

**C'est un problème si** — le second import crée deux doublons, ou si les accents sont abîmés dans les noms importés.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 74 — Les exports vers Excel

**Objectif** — vérifier les deux exports et leur innocuité.

**Ce que vous faites**
1. Sur **« Prospection »**, cliquez **« Exporter CSV »** et ouvrez le fichier dans Excel.
2. En bas du menu latéral, cliquez **« Exporter CSV »** (export de toutes les demandes) et ouvrez `finarent-export.csv`.

**Ce que vous devez voir**
- Les prospects, puis toutes les demandes (Référence, Entreprise, Contact, Email, Montant, Statut en français, Date, Type produit).
- Excel ouvre les fichiers **sans avertissement de sécurité**.

**C'est un problème si** — **Excel affiche un avertissement de sécurité à l'ouverture**. C'était un défaut corrigé : un visiteur anonyme pouvait glisser une formule dans un formulaire public. Si l'avertissement réapparaît, **signalez-le comme bloquant et n'ouvrez pas le fichier**.

> *Défaut connu n° 25* — dans l'export des demandes, les accents peuvent s'afficher mal sous Excel. Les données sont correctes ; c'est un réglage d'encodage à ajouter.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 75 — Créer un apporteur d'affaires

**Objectif** — vérifier la mise en place d'un commercial rémunéré à la commission.

**Ce que vous faites**
1. Menu **« Affiliation »**, bouton **« Nouvel affilié »**.
2. Renseignez Nom complet, Email, Téléphone, laissez le code vide, choisissez **Pourcentage (%)** et saisissez une valeur. Enregistrez.
3. Ouvrez la fiche de l'affilié et **notez son code d'affiliation** : il servira aux tests 85 à 88.

**Ce que vous devez voir**
- Cinq indicateurs : **Clics · Leads · Dossiers · À verser · Versé**.
- La liste : Nom / Code, Commission, Clics, Leads, Dossiers, À verser, Versé, État (**Actif** ou **Inactif**).
- La fiche : le **« Lien de tracking »** avec **« Copier »**, un bouton **« Export CSV »**, une bascule Actif / Inactif, et six onglets : **Vue d'ensemble · Commissions · Leads · Dossiers · Clics · Invitations**.

**C'est un problème si** — le code généré n'est pas unique, ou si les compteurs restent à zéro après un clic réel sur le lien (test 86).

> *Défaut connu n° 24* — dans l'onglet « Dossiers » de cette fiche, le lien « Voir → » mène à une page d'erreur.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 76 — Inviter au nom d'un apporteur, et valider une commission

**Objectif** — vérifier les deux actions que l'équipe fait pour un apporteur.

**Ce que vous faites**
1. Fiche de l'affilié, onglet **« Invitations »** : mode **« Un destinataire »**, saisissez votre email de test, puis **« Envoyer l'invitation »**. Recommencez.
2. Onglet **« Commissions »** : s'il existe une commission au statut PENDING (elle se crée quand un dossier apporté est signé), cliquez **« Valider »**.

**Ce que vous devez voir**
- **« Invitation envoyée »**, puis au second essai **« Invitation déjà envoyée cette semaine »**. L'historique liste l'envoi. Un email **« … vous recommande Finarent »** arrive.
- La commission validée passe au statut VALIDATED, et un lien **« Verser → »** apparaît.

**C'est un problème si** — l'invitation annonce un succès mais aucun email n'arrive.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 77 — Les versements aux apporteurs

**Objectif** — vérifier le circuit de paiement des commissions.

**Ce que vous faites**
1. Menu **« Affiliation »**, bouton **« Versements & SEPA »**.
2. Regardez le bloc **« Affiliés prêts à verser »**. Si un affilié est éligible, cliquez **« Verser »**.
3. Testez **« Export SEPA »** et **« Export DAS2 »**.

**Ce que vous devez voir**
- Le titre **« Versements & fiscal »**. Les affiliés non éligibles portent **« Sous seuil (N €) »**.
- Le versement demande confirmation (« Créer le versement et générer l'auto-facture ? ») et affiche **« Versement créé — facture … »**.
- L'historique liste Date, Affilié, Facture, Montant TTC, avec **« Télécharger »**.
- Le fichier SEPA se télécharge.

**C'est un problème si** — le total du fichier de virement ne correspond pas à la somme de ses lignes. **Faites-le vérifier par votre comptable avant le premier envoi réel à la banque.**

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 78 — La file d'appels

**Objectif** — vérifier l'outil de rappel des prospects et des demandes.

**Ce que vous faites**
1. Menu **« File d'appels »**.
2. Sur une ligne, cliquez **« Logger »**. Saisissez une durée, choisissez un résultat, écrivez une note, enregistrez.

**Ce que vous devez voir**
- Une file mêlant prospects et demandes, avec les filtres **Tout · Prospects · Demandes · Rappels**.
- Sept résultats d'appel : **Décroché · Répondeur · Pas de réponse · À rappeler · Qualifié · Converti · Refus**.
- L'appel enregistré apparaît dans l'historique du contact.

**C'est un problème si** — l'appel enregistré n'apparaît nulle part ensuite.

> Le bouton **« Appeler »** dépend de la téléphonie, non activée. Seul l'enregistrement manuel est testable.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 79 — Les centres d'appel

**Objectif** — vérifier la configuration des équipes commerciales.

**Ce que vous faites**
1. Menu **« Centres d'appel »**, bouton **« Nouveau centre »**. Créez un centre de type **Interne**, avec une commission en pourcentage.
2. Ouvrez sa fiche, onglet **« Membres »**, **« Ajouter un membre »** : ajoutez le compte « centre d'appel (responsable) » avec le rôle **Manager**, puis le compte « agent » avec le rôle **Agent**.
3. Ajoutez un troisième utilisateur avec le rôle **Manager**.
4. Onglet **« Vue d'ensemble »**, encart **« Sync contacts Ringover »**, cliquez **« Synchroniser les prospects »**.

**Ce que vous devez voir**
- Deux types : **Interne** et **Externe**. La fiche comporte cinq onglets : **Vue d'ensemble · Membres · Dossiers · Interactions · Commissions**.
- Le sélecteur de rôle indique **« Manager (1 seul / centre) »**.
- Après l'étape 3 : **le premier manager est redevenu Agent**, sans message. *Défaut connu n° 10* : c'est silencieux, dites-nous si un avertissement est nécessaire.
- Sans téléphonie : la ligne d'état porte **« · API non configurée »** et la synchronisation affiche **« 0 synchronisé(s), 0 échec(s). »** C'est attendu.
- Si un IBAN est renseigné, il s'affiche **partiellement masqué**.

**C'est un problème si** — l'IBAN s'affiche en entier, ou sous la forme d'une suite commençant par `v1:`.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 80 — Modérer les témoignages

**Objectif** — vérifier ce qui est publié au nom de vos clients.

**Ce que vous faites**
1. Menu **« Témoignages »**, filtre **« En attente »** : retrouvez le témoignage du test 20.
2. Cliquez l'icône **« Approuver et publier »**.
3. Ouvrez `finarent.com/testimonials` dans un autre navigateur.
4. Revenez et cliquez **« Dépublier »**. Rechargez la page publique.

**Ce que vous devez voir**
- Des filtres : **Tous · En attente · Approuvés · Refusés · Publiés**.
- Le témoignage publié apparaît sur la page publique ; dépublié, il en disparaît.

**C'est un problème si** — un témoignage apparaît sur le site **avant** d'avoir été approuvé.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 81 — Gérer la FAQ

**Objectif** — vérifier l'écran de gestion des questions, et connaître sa limite.

**Ce que vous faites**
1. Menu **« FAQ »**, bouton **« Ajouter une question »**. Saisissez une question, une réponse, un ordre, puis **« Ajouter »**.
2. Désactivez-la, puis supprimez-la.

**Ce que vous devez voir**
- Le titre **« Gestion FAQ »**, des filtres par catégorie, un badge **« Actif »** ou **« Inactif »** par question, et une confirmation avant suppression.

**C'est un problème si** — une question créée n'apparaît pas dans la liste, ou si la suppression se fait sans confirmation.

> *Défaut connu n° 5* — **cet écran n'alimente pas la page FAQ publique** (test 16), qui affiche une liste fixe. Tant que le lien n'est pas créé, les modifications faites ici ne sont visibles que dans le back-office.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 82 — Le journal d'activité

**Objectif** — vérifier la traçabilité des actions administratives.

**Ce que vous faites**
1. Menu **« Logs d'activité »**.
2. Retrouvez vos actions du jour (changement de statut, envoi de facture, changement de rôle, import de prospects).
3. Tapez un mot dans **« Rechercher par résumé, acteur... »** et appuyez sur **Entrée**.

**Ce que vous devez voir**
- Le titre **« Journal d'activité »**, des pastilles par module (Demandes, Finance & commissions, CRM & prospection…), des filtres de période **Aujourd'hui · 7 jours · 30 jours · Tout** (« 7 jours » par défaut), 50 lignes par page, chaque ligne dépliable.
- Vos actions récentes y figurent, à votre nom.

**C'est un problème si** — une action sensible (changement de rôle, envoi de facture, suppression) n'y laisse aucune trace.

> La recherche ne se lance qu'avec la touche **Entrée**, pas à la frappe.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 83 — L'écran Paramètres

**Objectif** — savoir ce que cet écran fait, et surtout ce qu'il ne fait pas.

**Ce que vous faites** — menu **« Paramètres »** ; basculez un interrupteur, cliquez **« Enregistrer les modifications »**, puis **rechargez**.

**Ce que vous devez voir** — les coordonnées de la société, trois interrupteurs de notification, le message « Paramètres sauvegardés », et **après rechargement, les interrupteurs revenus à leur position initiale**.

**C'est un problème si** — vous pensiez avoir réglé quelque chose. *Défaut connu n° 7* : **cet écran ne conserve rien**, c'est une maquette. Dites-nous s'il doit devenir fonctionnel.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 84 — Un client ne peut pas entrer dans le back-office

**Objectif** — vérifier la première barrière d'accès.

**Ce que vous faites** — connecté avec le **compte client**, tapez `finarent.com/admin`, puis `finarent.com/admin/factures`.

**Ce que vous devez voir** — vous êtes **renvoyé vers la page d'accueil publique**, sans voir le moindre contenu du back-office.

**C'est un problème si** — vous apercevez, même brièvement, une liste de dossiers ou de factures. **Bloquant.**

> *Défaut connu n° 15* — le renvoi se fait sans message d'explication. Dites-nous si un message « Cet espace ne vous est pas accessible » serait préférable.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

---

# Partie 4 — L'apporteur d'affaires

**À quoi sert cet espace :** une page personnelle, accessible sans mot de passe grâce à un code unique, où un commercial indépendant suit les clics sur son lien, les prospects qu'il a amenés et ses commissions.

Vous avez besoin du **code d'affiliation** noté au test 75.

## Test 85 — La page personnelle de l'apporteur

**Objectif** — vérifier la page de suivi d'un apporteur, et qu'elle ne fuit rien.

**Ce que vous faites**
1. Ouvrez `finarent.com/affiliate/VOTRECODE`.
2. Ouvrez ensuite `finarent.com/affiliate/CODEINVENTE`.

**Ce que vous devez voir**
- Un badge **« Espace apporteur d'affaires »**, le titre **« Bonjour … »**, l'encart **« Votre lien de tracking »** avec **« Copier »**.
- Quatre indicateurs : **Clics · Leads générés · Dossiers · Gains totaux**, un **« tunnel de conversion »** en trois barres, deux cartes **« À verser »** et **« Déjà versé »**.
- En bas, la mention que les statistiques sont anonymisées.
- Avec un code inventé : la page **« 404 — Page introuvable »**.

**C'est un problème si** — la page affiche des noms, emails ou téléphones de prospects. Elle est publique pour qui connaît le code : elle ne doit contenir que des compteurs.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 86 — Le lien de suivi

**Objectif** — vérifier que le suivi des clics fonctionne. C'est ce qui déclenche la rémunération des apporteurs.

**Ce que vous faites**
1. Sur la page de l'apporteur, cliquez **« Copier »**.
2. Ouvrez une fenêtre de **navigation privée**, collez le lien, puis **fermez cette fenêtre**.
3. Revenez sur la page de l'apporteur et rechargez.
4. Côté administrateur, fiche de l'affilié, onglet **« Clics »**.

**Ce que vous devez voir**
- Le lien est de la forme `finarent.com/?ref=VOTRECODE` et ouvre la page d'accueil normale.
- Le compteur **« Clics »** a augmenté de un, sur la page publique comme dans l'onglet Clics du back-office (Date, Page, Référent).

**C'est un problème si** — le compteur ne bouge pas.

> Recharger la même page dans la même fenêtre **ne compte pas un second clic** : c'est voulu. Fermez la fenêtre privée et recommencez pour un nouveau clic.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 87 — Inviter un prospect depuis la page de l'apporteur

**Objectif** — vérifier l'invitation par email et sa limite.

**Ce que vous faites**
1. En bas de la page, **« Inviter un prospect par email »** : saisissez votre email de test et un prénom, puis **« Envoyer l'invitation »**.
2. Recommencez avec cinq adresses différentes, puis une sixième.

**Ce que vous devez voir**
- Un compteur **« N / 5 envoyés cette session »**.
- **« Invitation envoyée avec succès. »**, et un email **« … vous recommande Finarent »** dans votre boîte. La même adresse une seconde fois : **« Cette personne a déjà été invitée cette semaine. »**
- Au sixième envoi : **« Limite de 5 invitations par session atteinte. Reconnectez-vous plus tard. »**

**C'est un problème si** — aucun email n'arrive.

> *Défaut connu n° 20* — la limite de cinq se remet à zéro en fermant l'onglet ; un plafond serveur de dix par heure et par adresse fait barrage derrière. Dites-nous si vous jugez le risque d'abus réel.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 88 — Le profil fiscal de l'apporteur

**Objectif** — vérifier le formulaire qui permet de payer un apporteur.

**Ce que vous faites**
1. **Demandez à l'équipe technique le lien d'onboarding sécurisé** de cet apporteur.
2. Ouvrez ce lien et remplissez : Statut fiscal, Nom légal, SIRET (si société ou micro-entrepreneur), IBAN, BIC, adresse fiscale.
3. Cochez **« J'accepte le mandat de facturation »**, puis **« Enregistrer mon profil fiscal »**.
4. Rouvrez le même lien.

**Ce que vous devez voir**
- Le titre **« Onboarding fiscal »**, trois statuts : **Particulier**, **Micro-entrepreneur**, **Société**, et le texte intégral du mandat.
- Après enregistrement : **« Profil fiscal complet »** et « Vos commissions pourront être versées une fois validées par Finarent. »
- En rouvrant le lien : **« Lien invalide ou expiré »** — il est à usage unique.

**C'est un problème si** — un IBAN faux est accepté, ou si le formulaire enregistre sans la case du mandat cochée.

> *Défaut connu n° 4* — le bouton **« Compléter mon profil fiscal »** de la page publique mène toujours à « Lien invalide ou expiré », et **aucun bouton du back-office ne génère le lien** : seule l'équipe technique peut le produire aujourd'hui. Un apporteur ne peut donc pas s'enrôler seul. C'est un point à traiter en priorité si vous ouvrez le programme d'apporteurs.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

---

# Partie 5 — Le centre d'appel

**À quoi sert cet espace :** le poste de travail des agents commerciaux, qui y consultent leur portefeuille de prospects et suivent leurs échanges.

Connectez-vous avec le **compte centre d'appel (responsable)**, ajouté au centre au test 79.

## Test 89 — Accéder à l'espace

**Objectif** — vérifier l'entrée dans l'espace agent.

**Ce que vous faites**
1. Connectez-vous : vous arrivez sur l'espace client ordinaire.
2. Tapez `finarent.com/call-center`.

**Ce que vous devez voir**
- Un bandeau **« Vue responsable — … »** (ou **« Vue agent — … »** pour un agent), avec **« Déconnexion »** à droite.
- Un menu latéral : **Tableau de bord · Prospects · Appels & SMS · Emails Brevo**, plus **Équipe** et **Admin centres** pour un responsable.
- Quatre compteurs : **Prospects · Contactés · Interactions · Ringover** (ce dernier à **« Non config. »** tant que la téléphonie n'est pas ouverte).

**C'est un problème si** — vous n'arrivez pas sur cet espace.

> *Défaut connu n° 22* — **rien ne mène à cet espace depuis l'espace client** : il faut taper l'adresse. Et le lien **« File d'appels admin »**, en bas du menu, renvoie un simple agent vers l'espace client. Dites-nous si cela gêne vos agents.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 90 — La liste des prospects et son cloisonnement

**Objectif** — vérifier le portefeuille et le cloisonnement entre agents.

**Ce que vous faites**
1. Côté administrateur, **Prospection** : rattachez deux prospects au centre, l'un assigné à l'agent, l'autre non.
2. Avec le compte **responsable**, menu **« Prospects »**. Puis avec le compte **agent**.

**Ce que vous devez voir**
- Un tableau **Contact · Statut · Dernier appel · Agent**, un champ **« Rechercher… »** et un bouton **« Filtrer »**, un lien **« Ouvrir »** par ligne.
- Des statuts en français : **Nouveau · Contacté · Qualifié · Converti · Perdu**.
- Le responsable voit les deux prospects. **L'agent ne voit que le sien.**

**C'est un problème si** — un agent voit des prospects assignés à un collègue, ou les prospects d'un autre centre. **Bloquant.**

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 91 — La fiche d'un prospect

**Objectif** — vérifier les informations dont dispose l'agent.

**Ce que vous faites** — ouvrez une fiche prospect et lisez-la.

**Ce que vous devez voir** — Téléphone, E-mail, Entreprise, Centre, Agent assigné, Statut, les notes, et un bloc **« Interactions récentes »**.

**C'est un problème si** — la fiche affiche un prospect d'un autre agent.

> *Défauts connus n° 8 et 9* — le statut s'affiche ici en code (`NEW`, `CONTACTED`) alors que la liste l'affiche en français ; et **la fiche est en lecture seule** : ni changement de statut, ni note, ni saisie d'appel. L'encart de téléphonie n'apparaît pas tant que le compte n'est pas ouvert. L'enregistrement manuel d'un appel se fait depuis la **File d'appels** du back-office (test 78).

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 92 — Appels, SMS et emails

**Objectif** — vérifier la traçabilité des contacts commerciaux.

**Ce que vous faites**
1. Menu **« Appels & SMS »**.
2. Menu **« Emails Brevo »**. Lisez le sous-titre. Si le service est actif, dans **« Envoi unitaire »**, envoyez-vous un email de test via **« Envoyer via Brevo »**.

**Ce que vous devez voir**
- **Appels & SMS** : la liste des interactions enregistrées, ou **« Aucune interaction. »**
- **Emails sortants** : le sous-titre indique **« Prospection via Brevo (actif) »** ou **« Prospection via Brevo (non configuré — ajoutez BREVO_API_KEY) »** ; trois compteurs (**Envoyés · Ouverts · Convertis**), un panneau **« Envoi groupé (max 25) »**, un formulaire **« Envoi unitaire »** et un tableau **« Historique »**.
- Si actif : **« Email envoyé via Brevo. »** et l'email dans votre boîte.

**C'est un problème si** — le service est annoncé actif mais l'envoi échoue.

> Si le sous-titre dit « non configuré », les formulaires restent cliquables et l'échec ne se voit qu'après le clic. Ce n'est pas un bug, c'est l'état attendu.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 93 — L'équipe

**Objectif** — vérifier la vue d'équipe du responsable.

**Ce que vous faites** — avec le compte responsable, menu **« Équipe »**. Puis avec le compte agent, tapez `finarent.com/call-center/team`.

**Ce que vous devez voir**
- Pour le responsable : un tableau **Membre · Rôle · Prospects assignés**, avec les badges **« Responsable »** et **« Agent »**, et la mention « Ajout / retrait de membres : Admin centres d'appel ».
- Pour l'agent : renvoi vers le tableau de bord du centre, sans accès à la page.

**C'est un problème si** — l'agent accède à la page Équipe.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

---

# Partie 6 — L'espace partenaire

**À quoi sert cet espace :** une consultation en lecture seule, où une banque ou une société de leasing partenaire suit les dossiers que Finarent lui a transmis et les commissions correspondantes.

Connectez-vous avec le **compte partenaire**. Vous êtes redirigé vers `finarent.com/partner`.

> **Prérequis important.** *Défaut connu n° 3* : aucun écran du back-office ne permet de rattacher un dossier à un partenaire. Sur une base réelle, cet espace est donc **vide**. Les tests 94 à 96 ne sont possibles qu'avec les **données de démonstration** installées par l'équipe technique, qui contiennent des dossiers déjà rattachés. Un compte partenaire sans société rattachée est renvoyé vers l'espace client.

## Test 94 — Le tableau de bord partenaire

**Objectif** — vérifier la vue d'ensemble du partenaire.

**Ce que vous faites** — parcourez la page d'arrivée.

**Ce que vous devez voir**
- Le titre **« Espace Partenaire »**, sous-titré « Suivez vos dossiers transmis par Finarent ».
- Quatre compteurs : **Total dossiers · Transmis · Validés · Finalisés**, un encart **Total commissions / Montant total traité / Taux de validation**, un **« Funnel partenaire »**, et un tableau **« Derniers dossiers »**.
- Un menu latéral : **Tableau de bord · Dossiers · Commissions**, et **« Déconnexion »**.

**C'est un problème si** — les compteurs ne correspondent pas au nombre de dossiers listés.

> *Défaut connu n° 21* — le lien « Voir les détails » de la carte « Suivi des commissions » ne mène nulle part.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 95 — Les dossiers reçus, et leur cloisonnement ★ *priorité*

**Objectif** — vérifier qu'un partenaire ne voit **que** ses propres dossiers.

**Ce que vous faites**
1. Menu **« Dossiers »**. Comptez les dossiers.
2. **Comparez avec la liste complète côté administrateur** : les dossiers non rattachés à ce partenaire, et ceux rattachés à un autre, ne doivent pas apparaître.
3. Utilisez la recherche pour tenter de faire remonter un dossier d'un autre partenaire.

**Ce que vous devez voir**
- Des cartes : statut, produit, entreprise, contact, montant, date, pièces jointes.
- **Uniquement les dossiers rattachés à ce partenaire.**

**C'est un problème si** — un seul dossier étranger apparaît. **Bloquant, immédiatement.**

> Cet espace est **volontairement en lecture seule** : pas de changement de statut, pas de messagerie. *Défaut connu n° 8* : les statuts s'affichent en codes techniques (`EN_ATTENTE`, `TRANSMIS`). *Défaut connu n° 1* : les pièces jointes ne s'ouvrent pas.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 96 — Les commissions du partenaire

**Objectif** — vérifier le suivi de rémunération du partenaire.

**Ce que vous faites** — menu **« Commissions »**, filtres **Toutes · En attente · Payées**.

**Ce que vous devez voir** — un tableau **Dossier · Montant dossier · Taux · Commission · Statut · Date**, avec les statuts **Payée** et **En attente**.

**C'est un problème si** — une commission apparaît pour un dossier que ce partenaire n'a jamais reçu, ou si son montant ne correspond pas au taux appliqué au montant du dossier.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

---

# Partie 7 — L'espace assureur

**À quoi sert cet espace :** le poste de l'assureur partenaire, qui y consulte les demandes de RC Professionnelle et fait avancer leur traitement.

Connectez-vous avec le **compte assureur**. Vous êtes redirigé vers `finarent.com/insurer`.

## Test 97 — Le périmètre assurance

**Objectif** — vérifier qu'un assureur ne voit que les demandes d'assurance.

**Ce que vous faites**
1. Menu **« Dossiers assurance »** : retrouvez la demande du test 38.
2. **Comparez avec la liste complète côté administrateur** : aucun dossier de crédit-bail, LOA, LLD ou prêt professionnel ne doit apparaître.

**Ce que vous devez voir**
- Le titre **« Espace Assureur »**, sous-titré « Gérez les demandes d'assurance RC Professionnelle ».
- Quatre compteurs : **Total demandes · En attente · Souscrites · Refusées**, un menu à deux entrées : **Tableau de bord · Dossiers assurance**.
- **Uniquement des demandes de RC Professionnelle**, dont celle du test 38.

**C'est un problème si** — un dossier de financement apparaît. **Bloquant.**

> Le cloisonnement porte sur le **type de produit**, pas sur la compagnie : deux assureurs concurrents verraient la même liste. Dites-nous si c'est acceptable dans votre modèle.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 98 — Faire avancer un dossier d'assurance

**Objectif** — vérifier la seule action d'écriture de cet espace.

**Ce que vous faites**
1. Sous un dossier, **« Changer le statut : »**, cliquez **« En étude »**, puis **« Devis envoyé »**, puis **« Approuvé »**.
2. Vérifiez côté administrateur que le changement est remonté, et côté client (test 53) que la notification est arrivée.

**Ce que vous devez voir**
- Quatre boutons : **En étude · Devis envoyé · Approuvé · Refusé**. Le bouton du statut courant est désactivé.
- Le changement est **immédiat au clic, sans confirmation**. Il n'y a pas de retour en arrière depuis cet écran.

**C'est un problème si** — le changement n'est pas visible côté administrateur.

> *Défaut connu n° 8* — après « Approuvé », le badge affiche `VALIDEE` : même dossier, deux vocabulaires.

**Résultat** : ☐ OK ☐ KO ☐ Non testé

## Test 99 — Le cloisonnement des accès ★ *priorité*

**Objectif** — vérifier qu'aucun compte ne peut atteindre un espace qui ne lui est pas destiné.

**Ce que vous faites** — avec chacun des comptes (client, partenaire, assureur, centre d'appel), tapez successivement :
1. `finarent.com/admin/demandes`
2. `finarent.com/admin/factures`
3. `finarent.com/partner`
4. `finarent.com/insurer`
5. `finarent.com/call-center` (avec le compte client)

**Ce que vous devez voir** — dans tous les cas, vous êtes **renvoyé vers la page d'accueil publique ou vers votre propre espace**. Aucun contenu réservé n'apparaît, même une fraction de seconde.

**C'est un problème si** — vous apercevez une liste de dossiers, de factures ou de comptes qui ne vous concerne pas. **Bloquant.**

**Résultat** : ☐ Client ☐ Partenaire ☐ Assureur ☐ Centre d'appel — ☐ Non testé

---

# Les emails que la plateforme envoie

Pour référence, la liste complète des messages automatiques. Chaque envoi réussi ou échoué laisse une trace dans le journal, mais **c'est la boîte du destinataire qui fait foi**.

| Quand | À qui | Objet |
|---|---|---|
| Demande déposée (contact ou espace client) | Le client | « Demande FIN-… enregistrée — Finarent » |
| Demande déposée | L'équipe Finarent | « [Finarent] Nouvelle demande FIN-… — {Entreprise} » |
| Document déposé | Le client | « Document reçu — Dossier FIN-… — Finarent » |
| Statut → En cours d'étude | Le client | « Dossier FIN-… — votre dossier est à l'étude » |
| Statut → Documents manquants | Le client | « Dossier FIN-… — des pièces sont attendues » |
| Statut → Devis envoyé | Le client | « Dossier FIN-… — votre devis est disponible » |
| Statut → Signature en attente | Le client | « Dossier FIN-… — votre contrat est prêt à signer » |
| Statut → Signé | Le client | « Dossier FIN-… — contrat signé » |
| Statut → Transmis au partenaire | Le client | « Dossier FIN-… — dossier transmis au partenaire » |
| Statut → Validée | Le client | « Dossier FIN-… — votre financement est accordé » |
| Statut → Refusée | Le client | « Dossier FIN-… — suite donnée à votre demande » |
| Statut → Finalisé | Le client | « Dossier FIN-… — dossier finalisé » |
| Statut → En attente ou Devis accepté | Personne | *(aucun email, volontairement)* |
| Contrat signé | Le signataire | « Votre contrat » + PDF joint |
| Devis envoyé depuis le back-office | Le contact du devis | « Votre devis DEV-… » + PDF joint |
| Facture envoyée depuis le back-office | Le contact de la facture | « Votre facture FAC-… » + PDF joint |
| Documents manquants depuis 7 jours | Le client | « Action requise — Documents manquants — Dossier FIN-… » (automatique, tous les jours à 9 h) |
| Inscription newsletter | L'inscrit | « Bienvenue chez Finarent » |
| Parrainage | Le filleul | « {Parrain} vous invite à découvrir Finarent » |
| Filleul devenu client | Le parrain / l'équipe | « Votre filleul est devenu client » / « [Finarent] Récompense de parrainage à traiter » |
| Invitation par un apporteur | Le prospect | « {Apporteur} vous recommande Finarent » |
| Lien de mot de passe | Le client | Email envoyé par le service de connexion |

---

# Ce qui ne peut pas encore être testé, et pourquoi

Ces fonctions sont écrites, mais elles dépendent de comptes de service que vous seul pouvez ouvrir. **Ne perdez pas de temps à les tester : elles échoueront, et c'est normal.**

| Fonction | Ce qu'il manque | Ce que vous verrez si vous essayez quand même |
|---|---|---|
| **Paiement en ligne d'une facture** | Un compte Stripe (le prestataire qui encaisse les cartes bancaires). | « Stripe non configuré (STRIPE_SECRET_KEY manquante) » au clic sur « Générer le lien » (test 67). |
| **Téléphonie : appel d'un clic, SMS, journal d'appels automatique** | Un compte Ringover. | Le compteur « Ringover » à « Non config. », l'encart d'appel des fiches prospect absent, la synchronisation à « 0 synchronisé(s) ». |
| **Emailing de prospection depuis le centre d'appel** | La clé Brevo en production, et le réglage anti-usurpation de votre nom de domaine (sans lui, vos emails partent en indésirables). | Le sous-titre « Prospection via Brevo (non configuré…) » ; l'échec ne se voit qu'après le clic. |
| **SMS de secours** | Un compte Twilio. Le canal principal étant la téléphonie, elle aussi inactive, aucun SMS ne peut partir aujourd'hui. | Rien ne part, sans message. |
| **Protection anti-robot des formulaires publics** | De vraies clés reCAPTCHA sur votre nom de domaine. Les clés actuelles sont des clés de démonstration qui laissent tout passer. | Les formulaires fonctionnent — y compris pour les robots. |
| **Remontée automatique des incidents et mesure d'audience** | Un compte Sentry et un compte PostHog. | Rien. Aujourd'hui, un incident en production n'est connu que si un utilisateur téléphone. |
| **Contrôle des tâches automatiques** (relances, alertes de délai, purge RGPD) | Un écran d'administration : les tâches tournent et s'enregistrent, mais aucun écran ne les affiche encore. | Rien à voir. L'équipe technique peut vous fournir l'état sur demande. |
| **Signature électronique qualifiée (eIDAS)** | Décision du 10 septembre 2026 : la signature reste interne, simple. Rien à ouvrir. | La signature du test 46, avec une valeur probante simple mais réelle. |

---

# Les défauts déjà connus à la date de ce protocole

Ils ont été relevés en relisant le code le 10 septembre 2026. **Inutile de les signaler à nouveau.** Cochez plutôt la colonne « Me gêne » si vous les rencontrez : cela nous aide à les prioriser. Les n° 1 à 5 sont ceux que nous vous recommandons de faire traiter avant l'ouverture aux clients réels.

| N° | Défaut | Où | Me gêne |
|---|---|---|---|
| 1 | Une pièce jointe déposée ne s'ouvre plus après rechargement de la page (lien vers un mauvais emplacement). Touche l'espace client, le back-office, le partenaire et l'assureur. | Tests 42, 95 | ☐ |
| ~~2~~ | ~~Aucun écran client pour lire et accepter une offre~~ — **corrigé le 10 septembre 2026** : l'onglet « Offres » et le bouton d'acceptation existent. À vérifier au test 45 bis. | Test 45 bis | ☑ |
| 3 | Aucun moyen de rattacher un dossier à un partenaire depuis le back-office : l'espace partenaire reste vide sur une base réelle. | Tests 56, 95 | ☐ |
| 4 | Le lien d'enrôlement fiscal d'un apporteur n'est générable que par l'équipe technique ; le bouton public mène à « Lien invalide ou expiré ». Le back-office n'indique pas non plus si un apporteur a fourni son IBAN. | Test 88 | ☐ |
| 5 | La gestion FAQ du back-office n'alimente pas la page FAQ publique, qui affiche une liste fixe. | Tests 16, 81 | ☐ |
| 6 | Les tuiles « À traiter aujourd'hui » du tableau de bord ouvrent l'écran sans appliquer de filtre. | Test 55 | ☐ |
| 7 | L'écran Paramètres ne conserve rien. | Test 83 | ☐ |
| 8 | Statuts affichés en codes techniques : tableau « Dernières demandes » de l'admin, espace partenaire, espace assureur, fiche prospect du centre d'appel. | Tests 55, 91, 95, 98 | ☐ |
| 9 | La fiche prospect du centre d'appel est en lecture seule (ni statut, ni note, ni appel manuel). | Test 91 | ☐ |
| 10 | Ajouter un second Manager à un centre d'appel rétrograde le premier en Agent, sans avertissement. | Test 79 | ☐ |
| 11 | Sur la fiche d'un utilisateur, les onglets Factures et Devis affichent des colonnes vides. | Test 69 | ☐ |
| 12 | Les cinq questionnaires d'assurance n'ont ni case de consentement, ni email de confirmation au prospect. | Tests 6, 7 | ☐ |
| 13 | Mentions légales : hébergeur « Vercel Inc. » à remplacer par Clever Cloud ; CGV : deux « [À compléter] » dans le tableau ORIAS ; vocabulaire ORIAS différent entre Confidentialité (IOBSP + IAS) et Mentions légales (COBSP + COA). | Test 21 | ☐ |
| 14 | Les icônes de réseaux sociaux du bas de page ne mènent nulle part. | Test 22 | ☐ |
| 15 | Un compte renvoyé hors d'un espace interdit ne reçoit aucun message d'explication. | Tests 84, 99 | ☐ |
| 16 | Deux boutons « Nouvelle demande » sur le tableau de bord client mènent à deux endroits différents. | Test 33 | ☐ |
| 17 | Le « Récapitulatif » du dossier est une page imprimable, pas un PDF téléchargé. | Test 40 | ☐ |
| 18 | Le tableau d'amortissement client est calculé à un taux fixe de 4,5 %, sans lien avec l'offre réelle. | Test 44 | ☐ |
| 19 | La fiche dossier annonce « PDF, JPG, PNG » alors que HEIC et WEBP sont aussi acceptés. | Test 41 | ☐ |
| 20 | La limite de cinq invitations par session de l'apporteur se remet à zéro en fermant l'onglet. | Test 87 | ☐ |
| 21 | Lien mort « Voir les détails » sur le tableau de bord partenaire. | Test 94 | ☐ |
| 22 | Rien ne mène un agent de centre d'appel à son espace ; le lien « File d'appels admin » de son menu le renvoie vers l'espace client. | Test 89 | ☐ |
| 23 | « Envoyer l'offre » n'envoie aucun email au client ; seul le passage du dossier en « Devis envoyé » le prévient. | Test 68 | ☐ |
| 24 | Fiche affilié, onglet Dossiers : le lien « Voir → » mène à une page d'erreur. | Test 75 | ☐ |
| 25 | L'export de toutes les demandes peut afficher des accents abîmés sous Excel. | Test 74 | ☐ |

---

# Fiche de relevé

Imprimez cette page, ou recopiez le tableau dans un tableur. Une ligne par test effectué.

**Résultat** : **OK** si tout s'est passé comme décrit, **KO** si la rubrique « c'est un problème si » s'est vérifiée, **NT** si vous n'avez pas pu faire le test.

**Gravité** (uniquement si KO) : **Bloquant**, **Gênant**, **Étrange** ou **Cosmétique**. Si le KO correspond à un défaut déjà connu, indiquez son numéro.

| N° du test | Date | Résultat | Gravité | Remarque (ce que vous avez vu) |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |
|  |  |  |  |  |

**Synthèse de la campagne**

| | Nombre |
|---|---|
| Tests effectués | |
| OK | |
| KO — bloquants | |
| KO — autres | |
| KO — correspondant à un défaut déjà connu | |
| Non testés | |

**Date de début :** ................ **Date de fin :** ................ **Testeur :** ................................

**Décision :** ☐ Je valide la mise en ligne, sous réserve des corrections listées ☐ Je ne valide pas (préciser les bloquants)

**Signature :** ................................

---

Une question pendant les tests ? N'attendez pas la fin de la campagne pour la poser. Un point de blocage levé tôt vous fait gagner une demi-journée.
