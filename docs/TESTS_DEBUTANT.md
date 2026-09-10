# Vérifier la plateforme Finarent — procédure pas à pas

Ce document vous permet de **vérifier vous-même** que la plateforme Finarent fonctionne, sans aucune connaissance technique. Si vous savez utiliser un navigateur internet, vous savez suivre cette procédure.

Chaque test tient en quatre lignes :

- **Objectif** — ce que le test prouve, en une phrase.
- **Ce que vous faites** — les étapes, dans l'ordre.
- **Ce que vous devez voir** — le résultat attendu.
- **C'est un problème si** — le signal qui doit vous faire ouvrir un signalement. C'est la rubrique la plus importante : c'est elle qui vous permet de trancher sans nous appeler.

Vous n'êtes pas obligé de tout faire d'un coup. Commencez par la section **« Les points à vérifier en priorité »**, puis avancez profil par profil, à votre rythme.

> **Une convention pour tout le document.** Quand nous écrivons une adresse comme `finarent.com/espace`, cela signifie : tapez cette adresse dans la barre du haut de votre navigateur, puis Entrée. Rien d'autre.

---

## Avant de commencer

### 1. Ce dont vous avez besoin

**Un ordinateur.** Plusieurs écrans de la plateforme (le menu latéral de l'espace client, les intitulés des onglets d'un dossier) sont volontairement masqués sur les petits écrans. Faites la procédure sur un ordinateur, et réservez le téléphone au test 23, qui lui est consacré.

**Des comptes de démonstration.** Il en faut un par profil à tester. Ils ne sont pas publics et ne peuvent pas être créés depuis le site : **demandez-les à l'équipe technique**, qui vous transmettra les adresses email et le mot de passe associé.

| Profil | À quoi sert ce compte | Comment l'obtenir |
|---|---|---|
| Client | Déposer et suivre une demande de financement | À demander |
| Administrateur | Traiter les dossiers, facturer, gérer les comptes | À demander |
| Apporteur d'affaires | Aucun compte nécessaire : une adresse web personnelle suffit | Fournie par l'administrateur (test 66) |
| Centre d'appel | Travailler un portefeuille de prospects | À demander |
| Partenaire (banque, société de leasing) | Consulter les dossiers transmis | À demander |
| Assureur | Traiter les demandes de RC Professionnelle | À demander |

> **Un conseil qui fait gagner beaucoup de temps.** Ouvrez un navigateur différent par profil (par exemple Chrome pour le client, Edge pour l'administrateur, Firefox pour le partenaire). Vous n'aurez pas à vous déconnecter et reconnecter en permanence. Si vous n'avez qu'un navigateur, utilisez des fenêtres de « navigation privée » (parfois appelées « InPrivate ») : chacune est indépendante des autres.

### 2. Comment ouvrir le site

Tapez dans la barre d'adresse **finarent.com** (ou l'adresse que l'équipe vous a communiquée).

Pour vous connecter : le bouton **« Mon espace »**, en haut à droite de toutes les pages. Il ouvre la page de connexion, où vous saisissez l'email et le mot de passe du compte que vous testez.

### 3. Comment signaler un problème utilement

Un signalement utile tient en cinq lignes. Ne cherchez pas à diagnostiquer : décrivez.

1. **Quelle page** — l'adresse dans la barre du haut, ou à défaut son nom (« la fiche de mon dossier », « la liste des factures »).
2. **Le numéro du test** que vous étiez en train de faire (« test 28 »).
3. **Ce que vous avez cliqué ou tapé** — une phrase. « J'ai cliqué sur Soumettre ma demande sans cocher la case. »
4. **Ce que vous attendiez, et ce que vous avez obtenu** — les deux, côte à côte. « J'attendais un message d'erreur, la demande est partie quand même. » C'est l'écart entre les deux qui constitue le problème, pas le résultat seul.
5. **Une photo de l'écran.**
   - Sur PC Windows : touche **Impr. écran** (ou **Windows + Maj + S** pour sélectionner une zone), puis collez dans votre email.
   - Sur Mac : **Cmd + Maj + 4**, l'image se dépose sur le bureau.
   - Sur téléphone : **Volume bas + bouton latéral** (Android) ou **Volume haut + bouton latéral** (iPhone).

**Indiquez aussi la gravité**, elle détermine l'ordre de traitement :

- **Bloquant** — je ne peux pas aller plus loin (impossible d'envoyer ma demande, impossible de me connecter).
- **Gênant** — ça marche, mais c'est laborieux ou très lent.
- **Étrange** — un affichage incohérent qui ne m'empêche pas de continuer.
- **Cosmétique** — faute de frappe, alignement, couleur.

### 4. Deux réserves à connaître avant de commencer

- **Certaines fonctions ne sont pas activables aujourd'hui** faute de comptes de service ouverts (paiement en ligne, téléphonie, signature à valeur renforcée, protection anti-robot). Elles sont regroupées en fin de document, dans la section **« Ce qui ne peut pas encore être testé, et pourquoi »**. N'y perdez pas de temps.
- **Cette procédure décrit la version corrigée de la plateforme.** Si le site en ligne n'a pas encore reçu la dernière mise à jour, plusieurs tests échoueront normalement. Demandez confirmation à l'équipe technique que la version que vous testez est bien la dernière avant de signaler en masse.

---

## Les points à vérifier en priorité

Si vous ne faites que dix tests, faites ceux-ci. Ils couvrent ce qui rapporte de l'argent ou ce qui engage juridiquement Finarent.

| Priorité | Test | Ce qui est en jeu |
|---|---|---|
| 1 | **Test 27** — Déposer une demande de financement | C'est le parcours qui produit le chiffre d'affaires. S'il casse, plus rien n'entre. |
| 2 | **Test 28** — Les conditions générales sont obligatoires | Une demande enregistrée sans consentement n'est pas opposable. |
| 3 | **Test 29** — Un brouillon repris redemande les conditions | C'était exactement la faille : reprendre un brouillon permettait de sauter l'étape. |
| 4 | **Test 36** — Signer un contrat | La signature et sa preuve horodatée engagent les deux parties. |
| 5 | **Test 48** — Envoyer un devis au client | Un devis part désormais sur un bouton dédié, et non plus en consultant le document. |
| 6 | **Test 50** — Émettre une facture et son numéro comptable | Le numéro définitif ne doit être attribué qu'à l'émission, sans trou dans la série. |
| 7 | **Test 51** — Envoyer une facture au client | Même principe que le devis : plus d'envoi involontaire. |
| 8 | **Test 9** — Exactitude du simulateur de mensualité | Un chiffre faux affiché à un prospect est une promesse commerciale fausse. |
| 9 | **Test 10** — Exactitude du taux TAEG | Un TAEG erroné est un sujet de conformité, pas de confort. |
| 10 | **Test 75** — Un partenaire ne voit que ses propres dossiers | Le cloisonnement des données entre partenaires concurrents. |

---

# Partie 1 — Le site public, sans être connecté

**À quoi sert cet espace :** c'est la vitrine de Finarent. Elle explique les offres, laisse simuler un financement et permet à un prospect de laisser ses coordonnées.

Pour cette partie, vous n'avez besoin d'aucun compte.

## Test 1 — La page d'accueil s'affiche

**Objectif** — vérifier que le site répond et que sa page d'accueil est complète.

**Ce que vous faites**
1. Ouvrez `finarent.com`.
2. Faites défiler la page de haut en bas avec la molette.

**Ce que vous devez voir**
- Le logo Finarent en haut à gauche.
- Un grand titre **« Financez vos équipements professionnels »**, sous-titré **« Obtenez votre financement en 48 heures »**.
- Un bouton **« Démarrer ma demande »** et un bouton **« Nos assurances »**.
- Trois arguments courts : **« Sans apport »**, **« Réponse 48h »**, **« 88% acceptés »**.
- Plus bas, des chiffres clés, des témoignages, des questions fréquentes, et tout en bas un bas de page bleu marine.

**C'est un problème si** — la page reste blanche, met plus de dix secondes à s'afficher, ou si des zones se chevauchent au point d'être illisibles.

## Test 2 — Le menu du haut

**Objectif** — vérifier que toutes les rubriques du menu s'ouvrent.

**Ce que vous faites**
1. Passez la souris successivement sur chaque mot du menu, sans cliquer.

**Ce que vous devez voir**
- Le menu comporte exactement, de gauche à droite : **Accueil · Nos Solutions · Secteurs · Simulateurs · Assurance · Ressources · Contact**.
- **« Nos Solutions »** ouvre une liste de six entrées : Crédit-bail · Location avec option d'achat · Location longue durée (LLD) · Crédit professionnel · Assurance professionnelle · Comparateur, plus un lien **« Voir toutes les solutions »**.
- **« Secteurs »** ouvre quatre entrées : Transport & Logistique · BTP & Construction · Médical & Santé · Informatique & Tech.
- **« Simulateurs »** ouvre une grande fenêtre avec cinq familles (Crédit immobilier, Crédit conso & auto, Crédit professionnel, Assurance emprunteur, Assurances) et un lien **« Voir les 41 simulateurs »**.
- **« Ressources »** ouvre deux groupes : **À propos** (Pourquoi Finarent, Nos partenaires) et **Outils & contenus** (Diagnostic, FAQ, Glossaire, Guides, Actualités).

**C'est un problème si** — une rubrique ne s'ouvre pas, ou si un lien du menu mène à une page d'erreur.

## Test 3 — Les six pages Solutions

**Objectif** — vérifier que chaque solution de financement a sa page complète.

**Ce que vous faites**
1. Menu **« Nos Solutions »**, puis **« Crédit-bail »**.
2. Revenez en arrière et refaites l'opération pour **Location avec option d'achat**, **Location longue durée (LLD)** et **Crédit professionnel**.

**Ce que vous devez voir** — pour chaque page : une grande image, un titre, une description, une liste d'avantages, les durées et montants possibles, et des questions fréquentes en bas.

**C'est un problème si** — deux pages différentes affichent exactement le même contenu, ou si une image ne se charge pas.

## Test 4 — Les pages Secteurs

**Objectif** — vérifier la page listant les secteurs d'activité financés.

**Ce que vous faites**
1. Allez sur `finarent.com/sectors`.
2. Cliquez sur une carte, par exemple **BTP & Construction**.

**Ce que vous devez voir**
- **Huit secteurs** sont présentés sur la page d'ensemble : BTP, Médical, Informatique, Transport, Industrie, Agriculture, Commerce, Restauration. (Le menu du haut n'en propose que quatre : c'est volontaire, ce sont les principaux.)
- La page d'un secteur affiche les équipements typiques finançables, les avantages propres au métier, et des questions fréquentes.

**C'est un problème si** — une carte de secteur ne mène nulle part, ou si le contenu affiché ne correspond pas au secteur cliqué.

## Test 5 — La page Assurance et ses 21 produits

**Objectif** — vérifier le catalogue d'assurance et sa bascule particuliers / professionnels.

**Ce que vous faites**
1. Menu **« Assurance »**.
2. Cliquez sur l'onglet **« Particuliers »**, puis sur **« Pros & Entreprises »**.

**Ce que vous devez voir**
- Deux boutons de bascule : **« Particuliers (11) »** et **« Pros & Entreprises (10) »**.
- Côté Particuliers : Auto, Moto / Scooter, Habitation, Santé / Mutuelle, Prévoyance, Emprunteur, Chien & Chat, Accidents de la vie, Protection juridique, Scolaire & Extra-scolaire, Loyers impayés (GLI).
- Côté Pros & Entreprises : RC Professionnelle, Multirisque pro, Décennale BTP, Cyber-risques, Flotte automobile, Protection juridique pro, Homme-clé & associé, D&O — Mandataires sociaux, Mutuelle collective, Prévoyance & Madelin.
- Chaque carte porte un bouton **« Devis »**. Cinq d'entre elles (Auto, Moto, Habitation, Santé, RC Professionnelle) portent en plus un bouton **« Tarif rapide »**.

**C'est un problème si** — un compteur annonce un nombre différent de cartes réellement affichées, ou si un bouton « Devis » ne mène nulle part.

## Test 6 — Demander un devis RC Professionnelle

**Objectif** — vérifier le formulaire public qui produit des prospects.

**Ce que vous faites**
1. Sur la page Assurance, onglet **« Pros & Entreprises »**, carte **RC Professionnelle**, bouton **« Tarif rapide »**.
2. Répondez aux six écrans successifs : secteur d'activité, forme juridique, entreprise (raison sociale, chiffre d'affaires, salariés), siège, garanties souhaitées, puis vos coordonnées.
3. Sur le dernier écran, **« Recevoir votre devis »**, remplissez Prénom du dirigeant, Nom du dirigeant, Email pro, Téléphone.
4. Cliquez **« Envoyer ma demande »**.

**Ce que vous devez voir**
- Une barre de progression avance à chaque écran, et un bouton permet de revenir en arrière.
- À la fin : un écran **« Demande envoyée ! »**, avec la phrase « Un conseiller Finarent vous contactera sous 48 h… » et un encadré **« Récapitulatif »** reprenant vos réponses.

**C'est un problème si** — le bouton « Envoyer ma demande » ne fait rien, ou si le récapitulatif final affiche des réponses différentes de celles que vous avez saisies.

> Cette demande doit ensuite apparaître côté administrateur, dans **Prospection** (test 58). C'est le meilleur moyen de vérifier qu'un prospect n'est pas perdu en route.

## Test 7 — Le comparateur de financements

**Objectif** — vérifier que la comparaison des quatre modes de financement produit des chiffres cohérents.

**Ce que vous faites**
1. Allez sur `finarent.com/comparateur`.
2. Réglez le montant sur **50 000 €** et la durée sur **36 mois** (curseurs).
3. Regardez les résultats, puis basculez entre les affichages **« Cartes »** et **« Tableau »**.

**Ce que vous devez voir**
- Quatre solutions comparées : **Prêt Professionnel**, **Crédit-bail**, **LOA**, **LLD**.
- Pour chacune : Mensualité estimée, Coût total du crédit, Taux annuel, Option d'achat, Propriété en fin de contrat, Déductibilité fiscale, Comptabilisation, Durée min-max, Apport requis.
- Les taux annuels affichés sont fixes et servent de base au calcul : **3,5 %** pour le prêt professionnel, **4,2 %** pour le crédit-bail, **4,8 %** pour la LOA, **5,5 %** pour la LLD.
- Pour 50 000 € sur 36 mois, la mensualité du **Prêt Professionnel** doit être d'environ **1 465 €** et celle du **Crédit-bail** d'environ **1 481 €**.
- Une solution porte le badge **« Recommandé »**.

**C'est un problème si** — une mensualité s'écarte de plus de quelques euros des valeurs ci-dessus, si un coût total est inférieur au montant emprunté, ou si les chiffres ne changent pas quand vous bougez les curseurs.

## Test 8 — Le catalogue des simulateurs

**Objectif** — vérifier que les 41 simulateurs sont accessibles.

**Ce que vous faites**
1. Allez sur `finarent.com/simulateurs`.
2. Parcourez les cinq familles et ouvrez trois simulateurs au hasard dans des familles différentes.

**Ce que vous devez voir**
- Cinq familles : **Crédit immobilier**, **Crédit conso & auto**, **Crédit professionnel**, **Assurance emprunteur**, **Assurances**.
- Chaque simulateur ouvert affiche des curseurs ou des champs et **recalcule immédiatement**, sans bouton « Calculer ».
- Certaines cartes portent une petite étiquette **« Compte »** avec un cadenas : ces simulateurs demandent d'être connecté (voir test 11).

**C'est un problème si** — un simulateur mène à une page d'erreur, ou reste figé sans jamais afficher de résultat.

> **Attention à l'ancienne adresse.** L'adresse `finarent.com/simulator` (au singulier) **n'existe plus**. Si vous l'avez en favori, dans un document ou dans une signature d'email, remplacez-la par `finarent.com/simulateurs`. Elle bascule automatiquement vers le simulateur de mensualité, mais ne doit plus être diffusée.

## Test 9 — Exactitude du simulateur « Mensualité de crédit » ★ *priorité*

**Objectif** — vérifier qu'un chiffre annoncé à un prospect est juste.

**Ce que vous faites**
1. Allez sur `finarent.com/simulateurs/credit-immobilier/mensualite`.
2. **Ne touchez à rien.** Les valeurs par défaut sont : montant emprunté **200 000 €**, durée **240 mois**, taux **4 %**.
3. Notez la mensualité affichée.
4. Ensuite, réglez le montant sur **150 000 €** et le taux sur **3,5 %**, en gardant 240 mois.

**Ce que vous devez voir**
- Avec les valeurs par défaut : une mensualité de **1 212 €**.
- Avec 150 000 € à 3,5 % sur 240 mois : une mensualité de **870 €**.
- Le coût total du crédit est toujours supérieur au montant emprunté.

**C'est un problème si** — l'un de ces deux montants diffère de plus de 2 €, si le coût total est inférieur au capital, ou si un résultat affiche « NaN », « Infinity » ou une case vide.

## Test 10 — Exactitude du taux TAEG ★ *priorité*

**Objectif** — vérifier la correction du taux qui s'affichait « 0,00 % » alors que le calcul était impossible.

**Ce que vous faites**
1. Allez sur `finarent.com/simulateurs/credit-immobilier/taeg`.
2. **Ne touchez à rien.** Les valeurs par défaut sont : capital **200 000 €**, durée **240 mois**, taux nominal **3,5 %**, taux assurance **0,30 %**, frais **2 000 €**.
3. Notez le grand chiffre affiché sous « TAEG estimé ».
4. Faites ensuite varier les frais et le taux d'assurance vers le haut.

**Ce que vous devez voir**
- Avec les valeurs par défaut : **4,06 %**.
- Le TAEG **augmente** quand vous augmentez les frais ou le taux d'assurance, et ne descend jamais en dessous du taux nominal.
- Lorsque le calcul n'a pas de sens, le simulateur affiche un simple tiret **« — »**, jamais « 0,00 % ».

**C'est un problème si** — le TAEG affiche **« 0,00 % »** dans une situation où des frais sont pourtant saisis. C'était précisément le défaut corrigé : un financement à 0 % avec frais de dossier n'est pas un crédit gratuit, et l'annoncer comme tel est un sujet de conformité.

## Test 11 — Les simulateurs réservés aux comptes

**Objectif** — vérifier que la restriction d'accès fonctionne, et qu'elle est comprehensible.

**Ce que vous faites**
1. Sur `finarent.com/simulateurs`, repérez une carte portant l'étiquette **« Compte »** avec un cadenas — par exemple **Tableau d'amortissement** ou **Prêt professionnel**.
2. Cliquez dessus **sans être connecté**.

**Ce que vous devez voir** — le site vous demande de vous connecter ou de créer un compte, avec un message compréhensible.

**C'est un problème si** — la page s'affiche vide, ou si un message purement technique s'affiche sans explication. *À confirmer :* le libellé exact de l'invitation à se connecter n'a pas pu être relevé avec certitude ; notez-le tel qu'il apparaît.

## Test 12 — Le diagnostic en cinq questions

**Objectif** — vérifier l'outil d'orientation qui recommande un produit.

**Ce que vous faites**
1. Allez sur `finarent.com/quiz`.
2. Répondez aux cinq questions. Pour obtenir un résultat prévisible, choisissez : **« Du matériel ou équipement professionnel »**, puis **« Peu importe, ce qui compte c'est l'usage »**, puis **« Correcte mais je veux la préserver pour d'autres projets »**, puis **« Oui, je cherche à maximiser les déductions »**, puis **« Moyen terme (4-7 ans) »**.

**Ce que vous devez voir**
- L'en-tête **« Quelle solution de financement pour vous ? »** et la mention « 5 questions, 1 recommandation personnalisée ».
- Un compteur **« Question X / 5 »** et une barre de progression colorée qui avance.
- À la fin, un badge **« Recommandation calculée »**, un produit recommandé, un pourcentage de compatibilité et une alternative.
- Avec les réponses ci-dessus, le produit recommandé doit être le **Crédit-bail**.

**C'est un problème si** — la barre de progression n'avance pas, si le bouton « Précédent » perd vos réponses, ou si le produit recommandé n'est pas cohérent avec des réponses aussi orientées.

## Test 13 — Le glossaire

**Objectif** — vérifier la recherche et le filtrage des définitions.

**Ce que vous faites**
1. Allez sur `finarent.com/glossaire`.
2. Tapez **taeg** dans la barre de recherche.
3. Effacez, puis cliquez sur le filtre **« Assurance »**.

**Ce que vous devez voir**
- **33 définitions** au total, classées en quatre familles : **Crédit**, **Assurance**, **Professionnel**, **Fiscalité**.
- Avec « taeg » : seul le terme **TAEG** reste affiché. En cliquant dessus, la définition se déplie.
- Avec le filtre « Assurance » : seules les définitions de cette famille restent.

**C'est un problème si** — la recherche ne filtre rien, ou si un filtre affiche des termes d'une autre famille.

## Test 14 — Les guides

**Objectif** — vérifier les contenus pédagogiques longs.

**Ce que vous faites**
1. Allez sur `finarent.com/guides`.
2. Ouvrez le guide **« Tout comprendre sur le crédit-bail »**.

**Ce que vous devez voir**
- **Cinq guides** : Tout comprendre sur le crédit-bail · Le prêt professionnel de A à Z · Assurance emprunteur : économiser jusqu'à 60 % · LOA, LLD, crédit auto : quelle formule pour vous ? · RC Pro : pourquoi et comment bien se couvrir.
- Le guide crédit-bail comporte cinq chapitres : « Qu'est-ce que le crédit-bail ? », « Les 4 avantages clés », « Crédit-bail vs LOA vs LLD : choisir », « Combien ça coûte ? », « Quels biens financer ? ».

**C'est un problème si** — un guide s'ouvre vide, ou si le sommaire annonce des chapitres qui n'existent pas.

## Test 15 — La FAQ

**Objectif** — vérifier la base de questions-réponses publique.

**Ce que vous faites**
1. Allez sur `finarent.com/faq`.
2. Cliquez sur une question, puis re-cliquez dessus.
3. Tapez **orias** dans la barre de recherche.

**Ce que vous devez voir**
- **62 questions**, réparties en huit thèmes : Finarent & son rôle de courtier · Crédit-bail & leasing professionnel · LOA · LLD · Assurance professionnelle · Financement bancaire professionnel · Procédure & délais · Fiscalité, comptabilité & juridique.
- Une question cliquée déplie sa réponse ; re-cliquée, elle se replie.
- Avec « orias » : la question **« Finarent est-il inscrit à l'ORIAS ? »** ressort, et le mot recherché apparaît **surligné en jaune** dans le texte.

**C'est un problème si** — la recherche ne surligne rien, ou si une réponse s'affiche avec des symboles étranges au milieu du texte (c'était un défaut corrigé sur les réponses contenant certains caractères).

## Test 16 — La page Partenaires

**Objectif** — vérifier l'annuaire des partenaires bancaires et assureurs.

**Ce que vous faites**
1. Menu **« Ressources »**, puis **« Nos partenaires »**.
2. Cliquez successivement sur les filtres, puis tapez un nom de banque dans la recherche.
3. Descendez tout en bas.

**Ce que vous devez voir**
- Le titre **« Nos partenaires bancaires & assureurs »** et environ **103 partenaires** avec leur logo.
- Cinq filtres : **Tous les partenaires · Assurance · Banque · Leasing & CBI · LOA / LLD véhicules**.
- Les partenaires sont regroupés par famille (Grands assureurs généralistes, Spécialistes pros & indépendants, Assurtechs & néo-courtiers, Courtiers grossistes, Banques de réseau nationales, Captives constructeurs, etc.).
- Une recherche affiche « N résultats pour "…" », et un terme introuvable affiche « Aucun partenaire ne correspond à "…" ».
- En bas, un lien **« Cartographie complète (PDF) »**.

**C'est un problème si** — le PDF ne se télécharge pas, ou si un filtre ramène des partenaires d'une autre famille.

## Test 17 — Les actualités

**Objectif** — vérifier le blog.

**Ce que vous faites**
1. Menu **« Ressources »**, puis **« Actualités »**.
2. Ouvrez un article.

**Ce que vous devez voir** — une grille d'articles avec image, titre et date ; l'article ouvert affiche son contenu complet et un bloc d'appel à l'action en bas.

**C'est un problème si** — un article s'ouvre sans texte, ou si les images des vignettes ne se chargent pas.

## Test 18 — Les pages de présentation

**Objectif** — vérifier les pages institutionnelles.

**Ce que vous faites** — ouvrez successivement `finarent.com/why-leasing`, `finarent.com/about`, `finarent.com/process` et `finarent.com/testimonials`.

**Ce que vous devez voir** — quatre pages distinctes : Pourquoi choisir Finarent, À propos (mission et histoire), Processus de demande en 4 étapes, et Témoignages clients.

**C'est un problème si** — l'une de ces pages affiche une erreur, ou si deux d'entre elles montrent le même contenu.

## Test 19 — Les pages légales

**Objectif** — vérifier que les mentions obligatoires sont en ligne et lisibles.

**Ce que vous faites**
1. Descendez tout en bas de n'importe quelle page.
2. Ouvrez successivement **« Mentions légales »**, **« CGU »** et **« Confidentialité »**.

**Ce que vous devez voir** — trois pages structurées, en français, sans passage manifestement inachevé (« lorem ipsum », « à compléter », « XXX »). La politique de confidentialité doit décrire vos droits d'accès, de rectification et d'effacement, et donner une adresse de contact.

**C'est un problème si** — une mention obligatoire est laissée en blanc, ou si un texte contredit ce que fait réellement la plateforme.

> Lisez ces trois pages en tant que dirigeant, pas en tant que testeur : c'est le seul contrôle que personne d'autre que vous ne peut faire.

## Test 20 — Les informations légales du bas de page

**Objectif** — vérifier les mentions réglementaires affichées sur toutes les pages.

**Ce que vous faites** — descendez en bas de la page d'accueil et lisez le bloc de bas de page.

**Ce que vous devez voir**, sous trois intitulés :
- **Informations légales** : liens Mentions légales · CGU · Confidentialité.
- **Finarent** : « SAS au capital de 2 010 € », « SIREN : 931 295 836 », « RCS Melun ».
- **Régulation** : « ORIAS n° 24005698 », « Courtier en Opérations de Banque (COBSP) », « Courtier en Assurance (COA) ».

**C'est un problème si** — l'une de ces mentions est fausse au regard de votre Kbis ou de votre inscription ORIAS. **Ce contrôle vous revient : personne d'autre ne peut le faire à votre place.**

*Ce qui manque encore, à confirmer par vous :* l'adresse postale du siège et le numéro de TVA intracommunautaire ne figurent pas dans ce bloc. Dites-nous s'ils doivent y être ajoutés.

## Test 21 — Le bandeau cookies

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

## Test 22 — Le formulaire de contact

**Objectif** — vérifier le principal point d'entrée des prospects non connectés.

**Ce que vous faites**
1. Menu **« Contact »**.
2. Choisissez le type de demande **Financement**, puis remplissez : Raison sociale, N° SIREN, Secteur d'activité, Montant souhaité, Type d'équipement, Prénom, Nom, Email professionnel, Téléphone.
3. **Cochez la case de consentement** (« J'accepte que mes données soient traitées conformément à la politique de confidentialité »).
4. Cliquez **« Envoyer ma demande »**.

**Ce que vous devez voir**
- Pendant l'envoi, le bouton affiche **« Envoi en cours... »**.
- Puis un message de succès : **« Votre demande a bien été envoyée ! »** suivi de « Nous vous recontacterons sous 48h. »
- La demande apparaît ensuite côté administrateur, dans **Demandes** (test 44).

**C'est un problème si** — le message d'erreur **« Une erreur est survenue. Veuillez réessayer… »** s'affiche alors que tous les champs sont correctement remplis. Signalez-le immédiatement : c'est un canal d'acquisition qui se ferme.

**Testez aussi le refus** : essayez d'envoyer sans cocher la case de consentement, et avec une adresse email manifestement fausse (« abc »). Le formulaire doit refuser et indiquer quel champ pose problème.

## Test 23 — Le site sur téléphone

**Objectif** — vérifier l'affichage mobile du site public.

**Ce que vous faites**
1. Ouvrez `finarent.com` sur votre smartphone.
2. Ouvrez le menu (icône à trois barres horizontales, en haut à droite).
3. Ouvrez un simulateur et déplacez un curseur.
4. Ouvrez le formulaire de contact et commencez à taper dans un champ.

**Ce que vous devez voir**
- Le menu du haut est remplacé par une icône, qui déroule la liste verticale complète : Accueil, Nos Solutions, Secteurs, Simulateurs, Assurance, Pourquoi Finarent, Nos partenaires, FAQ, Actualités, Contact, Comparateur.
- Aucun texte coupé, aucun bouton trop petit pour être touché au doigt.
- Le clavier s'ouvre normalement dans les champs de formulaire.

**C'est un problème si** — la page déborde horizontalement (il faut faire glisser latéralement pour lire), ou si un bouton est inaccessible.

---

# Partie 2 — L'espace client

**À quoi sert cet espace :** c'est l'endroit où un dirigeant dépose sa demande de financement, envoie ses pièces justificatives, échange avec son conseiller et signe son contrat.

Connectez-vous avec le **compte client** de démonstration.

## Test 24 — Se connecter

**Objectif** — vérifier l'entrée dans l'espace personnel.

**Ce que vous faites**
1. Sur `finarent.com`, cliquez **« Mon espace »** en haut à droite.
2. Saisissez l'email et le mot de passe du compte client.

**Ce que vous devez voir** — vous arrivez sur votre tableau de bord, avec une salutation personnalisée (**« Bonjour »**, **« Bon après-midi »** ou **« Bonsoir »** selon l'heure) et la mention **« Espace client • ID #… »**.

**C'est un problème si** — vous restez bloqué sur la page de connexion, ou si vous êtes renvoyé sur la page d'accueil publique sans explication.

## Test 25 — Le tableau de bord client

**Objectif** — vérifier la vue d'ensemble des dossiers.

**Ce que vous faites** — restez sur la page d'arrivée et parcourez-la de haut en bas.

**Ce que vous devez voir**
- Quatre compteurs : **Total dossiers**, **En attente**, **En cours**, **Finalisés**.
- Trois raccourcis : **Nouvelle demande**, **Simuler**, **Parrainage**.
- Une section **« Mes dossiers en cours »** avec quatre onglets : **Tous**, **En attente**, **En cours**, **Terminés**, chacun suivi de son nombre.
- Si un dossier est en cours, un bandeau **« Mon dossier en cours »** avec cinq étapes : **Dépôt · Étude · Offre · Signature · Fonds**.
- À droite, un encart **« Profil & Sécurité »** avec les boutons **« Modifier mes informations »** et **« Sécurité du compte »**.
- Un menu latéral à gauche, sous le titre **« Mon espace »** : **Mes demandes · Mon profil · Notifications · Parrainage · Sécurité · Se déconnecter**.

**C'est un problème si** — un compteur affiche un nombre qui ne correspond pas au nombre de lignes réellement listées.

> **Le menu latéral n'apparaît pas sur un écran étroit.** C'est voulu. Si vous ne le voyez pas, élargissez la fenêtre du navigateur.

## Test 26 — Le piège des deux boutons « Nouvelle demande »

**Objectif** — vérifier un point de navigation qui déroute les utilisateurs.

**Ce que vous faites**
1. Sur le tableau de bord, cliquez le bouton **« Nouvelle demande »** situé **en haut à droite**, à côté de la cloche.
2. Revenez en arrière.
3. Cliquez maintenant la **tuile « Nouvelle demande »** située dans les raccourcis, au milieu de la page.

**Ce que vous devez voir**
- Le bouton du haut vous emmène sur la **page de contact publique**.
- La tuile du milieu vous emmène sur le **formulaire de demande** (adresse `finarent.com/espace/demande`).

**C'est un problème si** — vous ne parvenez pas à distinguer les deux. **Signalez ce point comme gênant** : deux boutons portant le même nom mènent à deux endroits différents. C'est un défaut connu, mais votre avis sur la gêne réelle nous aide à décider s'il faut le corriger en priorité.

## Test 27 — Déposer une demande de financement ★ *priorité*

**Objectif** — vérifier le parcours qui produit le chiffre d'affaires.

**Ce que vous faites**
1. Ouvrez `finarent.com/espace/demande`.
2. **Étape 1 « Type »** — choisissez **« Crédit-bail »**, puis **« Suivant »**.
3. **Étape 2 « Projet »** — Type d'équipement : *Machine industrielle*. Montant souhaité : *45 000*. Durée : *48 mois*. Puis **« Suivant »**.
4. **Étape 3 « Entreprise »** — Raison sociale : *Société de test*. Numéro SIREN : **552120222**. Attendez deux secondes (voir test 30). Forme juridique : *SAS*. Secteur : *Industrie*. Puis **« Suivant »**.
5. **Étape 4 « Coordonnées »** — vérifiez que le nom, l'email et le téléphone sont préremplis. **Cochez la case des conditions générales.** Puis **« Suivant »**.
6. **Étape 5 « Récapitulatif »** — relisez, puis cliquez **« Soumettre ma demande »**.

**Ce que vous devez voir**
- Un en-tête permanent **« Nouvelle demande de financement »** et une barre à cinq étapes : **Type · Projet · Entreprise · Coordonnées · Récapitulatif**.
- À l'étape 1, six choix : Prêt professionnel, Crédit-bail, LOA, LLD, Leasing opérationnel, RC Professionnelle.
- À l'étape 4, l'adresse email est **grisée et non modifiable**, avec la mention « L'email est associé à votre compte et ne peut pas être modifié. »
- À l'étape 5, chaque bloc du récapitulatif porte un bouton **« Modifier »** qui ramène à l'étape concernée.
- Pendant l'envoi, le bouton devient **« Envoi en cours... »** et un voile affiche **« Envoi de votre demande à nos partenaires… »**.
- Vous êtes ensuite ramené au tableau de bord, où une nouvelle ligne apparaît au statut **« En attente »**.

**C'est un problème si** — la demande ne réapparaît pas dans votre liste après l'envoi, si un champ obligatoire laissé vide ne déclenche pas le message **« Ce champ est obligatoire »**, ou si un montant fantaisiste (lettres, montant négatif) est accepté sans le message **« Veuillez saisir un montant valide »**.

## Test 28 — Les conditions générales sont obligatoires ★ *priorité*

**Objectif** — vérifier qu'aucune demande ne peut être enregistrée sans consentement. C'est le seul test de ce document qui a une portée juridique directe.

**Ce que vous faites**
1. Recommencez une demande (test 27) jusqu'à l'**étape 4 « Coordonnées »**.
2. **Ne cochez pas** la case. Cliquez **« Suivant »**.
3. Cochez la case, avancez jusqu'au récapitulatif, puis revenez à l'étape 4 avec **« Modifier »** et **décochez** la case.
4. Retournez au récapitulatif et cliquez **« Soumettre ma demande »**.

**Ce que vous devez voir**
- La case porte exactement : **« J'accepte les conditions générales et la politique de confidentialité »**, où « conditions générales » et « politique de confidentialité » sont deux liens cliquables.
- Sans la case cochée, le passage à l'étape suivante est refusé et le message rouge **« Vous devez accepter les conditions »** s'affiche sous la case.
- Après avoir décoché puis tenté d'envoyer, vous êtes **ramené automatiquement à l'étape 4**, avec le même message.
- Si malgré tout une demande atteignait le serveur sans consentement, celui-ci la refuserait avec le message **« Vous devez accepter les conditions générales. »** (avec le point final).

**C'est un problème si** — une demande part sans que la case n'ait été cochée, par quelque chemin que ce soit. **Signalez-le comme bloquant, immédiatement.**

> Ce que vous ne voyez pas à l'écran, et qui compte : le texte exact que vous avez accepté et la date de votre acceptation sont conservés avec le dossier. C'est ce qui rend le consentement opposable.

## Test 29 — Un brouillon repris redemande les conditions ★ *priorité*

**Objectif** — vérifier la correction de la faille principale : un brouillon repris permettait autrefois de sauter l'étape de consentement.

**Ce que vous faites**
1. Commencez une demande et allez jusqu'à l'**étape 5 « Récapitulatif »** en cochant la case au passage.
2. **Fermez l'onglet** sans envoyer.
3. Rouvrez `finarent.com/espace/demande`.

**Ce que vous devez voir**
- Un bandeau **« Brouillon restauré depuis votre dernière visite »**, avec un bouton **« Recommencer »**.
- Vous êtes ramené **au maximum à l'étape 4 « Coordonnées »**, jamais directement au récapitulatif.
- **La case des conditions générales est décochée.** Votre acceptation précédente n'a pas été conservée.

**C'est un problème si** — vous rouvrez directement sur le récapitulatif, ou si la case est déjà cochée. **Signalez-le comme bloquant.**

## Test 30 — La reconnaissance de l'entreprise par le SIREN

**Objectif** — vérifier la recherche automatique de la raison sociale.

**Ce que vous faites**
1. Dans le formulaire de demande, étape 3, tapez le SIREN **552120222** puis cliquez ailleurs sur la page.
2. Recommencez avec un numéro inventé, par exemple **999999999**.
3. Recommencez avec **12345** (trop court).

**Ce que vous devez voir**
- Le message **« Recherche... »**, puis **« Entreprise trouvée : … »** suivi du nom réel de la société.
- Avec un numéro inventé : **« Entreprise introuvable »** — la saisie manuelle reste possible.
- Avec un numéro trop court : **« Le SIREN doit contenir 9 chiffres »**.

**C'est un problème si** — la recherche reste bloquée sur « Recherche... » indéfiniment, ou si un numéro invalide est accepté sans avertissement.

## Test 31 — La fiche d'un dossier

**Objectif** — vérifier la page de suivi d'une demande.

**Ce que vous faites**
1. Sur le tableau de bord, cliquez **« Voir le détail »** sur un dossier.
2. Parcourez les onglets.

**Ce que vous devez voir**
- Le lien **« Retour à mes dossiers »**, la référence du dossier, un badge de statut, le nom de l'entreprise et le **« Montant demandé »**.
- Une barre de progression allant de **« Soumis »** à **« Finalisé »**.
- Les onglets : **Informations**, **Documents (n)**, **Messagerie (n)**, et — uniquement pour un dossier de financement avec un montant et une durée — **Tableau d'amortissement**.
- En bas, un encart **« Documents requis »** listant les pièces attendues (Extrait KBIS, RIB professionnel, Bilan comptable, Pièce d'identité) avec un compteur du type « 1/4 ».

**C'est un problème si** — un onglet s'ouvre vide alors que son compteur annonce plusieurs éléments, ou si le montant affiché ne correspond pas à celui saisi lors du dépôt.

> Sur un dossier de RC Professionnelle, l'onglet « Tableau d'amortissement » n'existe pas. C'est normal : il n'y a pas de durée de remboursement.

## Test 32 — Le récapitulatif du dossier

**Objectif** — vérifier le document de synthèse remis au client.

**Ce que vous faites**
1. Sur la fiche d'un dossier, cliquez le bouton **« Récapitulatif »** (bordure bleue).

**Ce que vous devez voir**
- Un **nouvel onglet s'ouvre**, affichant une page intitulée « Récapitulatif dossier … — Finarent », reprenant les informations du dossier.
- Pour l'enregistrer, utilisez la fonction d'impression de votre navigateur (**Ctrl + P**, puis « Enregistrer au format PDF »).

**C'est un problème si** — l'onglet s'ouvre vide, ou si les informations affichées ne sont pas celles de votre dossier.

> **Ce n'est pas un fichier PDF téléchargé, mais une page web imprimable.** Dites-nous si vous préférez un vrai téléchargement : c'est une décision produit, pas un défaut.

## Test 33 — Ajouter un document

**Objectif** — vérifier le dépôt de pièces justificatives.

**Ce que vous faites**
1. Onglet **« Documents »** d'un dossier, bouton **« Ajouter un document »**.
2. Choisissez un fichier PDF ou une photo (Kbis, RIB…).
3. Essayez ensuite d'envoyer un fichier de plus de 10 Mo, puis un fichier d'un autre type (un fichier de programme, par exemple).
4. Enfin, supprimez le document déposé (icône corbeille).

**Ce que vous devez voir**
- Pendant l'envoi, le bouton affiche **« Envoi... »**, puis le fichier apparaît dans la liste.
- La mention **« Formats acceptés : PDF, JPG, PNG · Taille max : 10 Mo »** est affichée sous la liste.
- Un fichier trop gros ou d'un type non prévu est refusé avec un message.
- À la suppression, une confirmation apparaît : **« Supprimer ce document ? Il sera conservé 30 jours puis définitivement effacé. »**

**C'est un problème si** — un fichier valide est refusé avec le message **« Erreur lors de l'envoi du document. »**, ou si un fichier de plus de 10 Mo passe.

## Test 34 — Écrire à son conseiller

**Objectif** — vérifier la messagerie du dossier.

**Ce que vous faites**
1. Onglet **« Messagerie »**, tapez un message dans le champ **« Tapez votre message... »**.
2. Cliquez l'icône d'envoi (avion en papier).
3. Rechargez la page.

**Ce que vous devez voir** — votre message apparaît dans la conversation, signé **« Vous »**, avec l'heure. Il est toujours là après rechargement. Les réponses de l'équipe apparaissent signées **« Conseiller »**.

**C'est un problème si** — le message disparaît au rechargement, ou si le compteur de l'onglet ne s'incrémente pas.

## Test 35 — Le tableau d'amortissement

**Objectif** — vérifier l'échéancier présenté au client.

**Ce que vous faites**
1. Onglet **« Tableau d'amortissement »** d'un dossier de financement.
2. Cliquez **« Voir tout (n mois) »**.

**Ce que vous devez voir**
- Trois cartes en haut : **Mensualité**, **Coût total du crédit**, **Taux annuel**.
- Un tableau avec les colonnes **Mois · Mensualité · Capital · Intérêts · Capital restant**.
- Le **capital restant de la dernière ligne doit être nul ou proche de zéro**, et la somme des colonnes Capital doit correspondre au montant emprunté.

**C'est un problème si** — le capital restant n'atteint jamais zéro, ou si le nombre de lignes ne correspond pas à la durée du dossier.

## Test 36 — Signer un contrat ★ *priorité*

**Objectif** — vérifier la signature électronique et la preuve associée.

**Ce que vous faites**
1. Ce test nécessite un dossier au statut **« Devis accepté »** ; l'administrateur peut l'y placer (test 44).
2. En bas de la fiche du dossier, dans l'encart **« Signature du contrat »**, cochez **« Je confirme avoir lu et accepté les conditions générales »**.
3. Cliquez **« Signer le contrat »**.
4. Sur la page qui s'ouvre, lisez les conditions, tracez votre signature dans le cadre (à la souris, ou au doigt sur mobile), cochez la case de consentement, puis **« Signer le contrat »**.

**Ce que vous devez voir**
- L'encart de signature n'apparaît **que** si le dossier est au statut « Devis accepté ».
- Sur la page de signature : un bloc **« Conditions du contrat »** (Montant, Durée, Mensualité, Taux), un lien **« Lire le contrat en entier »**, et un cadre portant **« Signez ici »** avec un bouton **« Effacer et recommencer »**.
- Le bouton **« Signer le contrat »** reste **inactif** tant que le tracé n'est pas fait **et** que la case n'est pas cochée.
- La mention de consentement citée l'article 1367 du Code civil et précise que la date, l'adresse IP et l'empreinte du document sont conservées.
- Après signature : **« Contrat signé »**, la date d'enregistrement, et les boutons **« Télécharger le contrat signé »** et **« Retour à mon espace »**.

**C'est un problème si** — le bouton devient actif sans que vous ayez signé ou coché, ou si le contrat téléchargé ne porte pas votre signature.

> **Un point à connaître.** Il s'agit d'une signature à valeur probante simple : tracé manuscrit, identification par connexion, horodatage, adresse IP et empreinte du document. **Ce n'est pas une signature électronique avancée** au sens du règlement européen eIDAS. Si votre offre commerciale promet une signature certifiée par un tiers, dites-le-nous : cela suppose un prestataire externe qui n'est pas activé aujourd'hui (voir la section finale).

## Test 37 — Modifier son profil

**Objectif** — vérifier que les modifications sont bien conservées.

**Ce que vous faites**
1. Menu latéral, **« Mon profil »**.
2. Changez le téléphone et la forme juridique.
3. Cliquez **« Enregistrer les modifications »**.
4. **Rechargez la page.**

**Ce que vous devez voir**
- Les champs modifiables sont : **Nom complet**, **Téléphone**, **Entreprise**, **Forme juridique**. **L'adresse email est grisée** et ne se modifie pas.
- Un bandeau vert **« Profil mis à jour avec succès »** apparaît, puis disparaît après quelques secondes.
- **Après rechargement, vos modifications sont toujours là.**

**C'est un problème si** — le message de succès s'affiche mais la modification disparaît au rechargement.

## Test 38 — Exporter ses données personnelles

**Objectif** — vérifier le droit de portabilité prévu par le RGPD.

**Ce que vous faites**
1. Sur **« Mon profil »**, descendez jusqu'à **« Confidentialité et données personnelles »**.
2. En face de **« Exporter mes données »**, cliquez **« Exporter »**.
3. Ouvrez le fichier téléchargé avec le Bloc-notes.

**Ce que vous devez voir**
- Un fichier nommé `finarent-data-….json` se télécharge.
- Ouvert, il contient vos informations **en clair et lisibles** : nom, dossiers, documents.

**C'est un problème si** — le fichier contient des suites de caractères illisibles commençant par **`v1:`** à la place d'une information attendue. Cela signifierait qu'une donnée protégée n'a pas été rendue lisible. **Signalez-le, c'était un défaut corrigé.**

## Test 39 — Supprimer son compte

**Objectif** — vérifier le droit à l'effacement.

> **À ne faire que sur un compte de démonstration.** L'opération est irréversible.

**Ce que vous faites**
1. Sur **« Mon profil »**, section Confidentialité, bouton rouge **« Supprimer »** en face de « Supprimer mon compte ».
2. Dans la fenêtre de confirmation, cliquez **« Confirmer »**.

**Ce que vous devez voir**
- Une fenêtre **« Confirmer la suppression »** avec le texte « Cette action est irréversible. Vos données personnelles seront anonymisées et vous serez déconnecté. Souhaitez-vous continuer ? », et deux boutons **« Annuler »** et **« Confirmer »**.
- Après confirmation : déconnexion automatique.

**C'est un problème si** — le bouton « Annuler » supprime quand même, ou si vous parvenez à vous reconnecter et à retrouver vos données personnelles intactes.

## Test 40 — Sécurité du compte et coordonnées bancaires

**Objectif** — vérifier la page de sécurité et l'enregistrement d'un RIB.

**Ce que vous faites**
1. Menu latéral, **« Sécurité »**.
2. Cliquez **« Recevoir un lien de modification »** dans la section Mot de passe.
3. Dans la section **« Coordonnées bancaires (RIB) »**, cliquez **« Ajouter mon RIB »** et saisissez un IBAN de test, puis **« Enregistrer »**.
4. Saisissez ensuite un IBAN volontairement faux.

**Ce que vous devez voir**
- La page **« Sécurité du compte »** affiche la méthode d'authentification, l'email associé, la date de création du compte, la dernière connexion et le **Rôle : Client**.
- Après le clic sur le lien de mot de passe : **« Email envoyé »**, puis « Le lien de modification du mot de passe vient d'être envoyé à … ».
- Le RIB enregistré s'affiche **partiellement masqué**, avec la mention « Pour votre sécurité, l'IBAN n'est jamais réaffiché : saisissez-le en entier pour le remplacer. »
- Un IBAN invalide est refusé avec **« IBAN invalide : vérifiez le numéro saisi. »**

**C'est un problème si** — l'IBAN se réaffiche en entier après enregistrement, ou si un IBAN manifestement faux est accepté.

## Test 41 — Le parrainage

**Objectif** — vérifier le mécanisme de recommandation.

**Ce que vous faites**
1. Menu latéral, **« Parrainage »**.
2. Cliquez **« Copier »** à côté de votre lien, puis collez-le dans un nouvel onglet.
3. Dans **« Inviter par email »**, saisissez un nom et **votre propre adresse email personnelle**, puis cliquez **« Inviter »**.
4. Consultez votre boîte email.

**Ce que vous devez voir**
- Le titre **« Parrainez et gagnez »** et trois étapes : **Invitez · Il souscrit · Vous gagnez**.
- Le bouton **« Copier »** devient **« Copié ! »** pendant deux secondes ; le lien collé ouvre bien la page d'accueil Finarent.
- Deux boutons de partage : **« Email »** et **« WhatsApp »**.
- Après l'invitation : **« Invitation envoyée à … »**, et le compteur **« Invitations »** augmente de un.
- Un email arrive dans votre boîte personnelle.

**C'est un problème si** — le message **« Invitation enregistrée, mais l'email n'est pas parti. »** s'affiche, ou si aucun email n'arrive au bout de dix minutes. *À confirmer :* la délivrabilité des emails en conditions réelles de production reste à valider par l'équipe technique.

## Test 42 — Les notifications

**Objectif** — vérifier le journal des changements de statut.

**Ce que vous faites**
1. Demandez à l'administrateur de changer le statut d'un de vos dossiers (test 44).
2. Menu latéral, **« Notifications »**.

**Ce que vous devez voir** — une ligne par changement, indiquant le dossier, la date, la mention **« Statut modifié »** et le passage d'un statut à l'autre (par exemple « En attente → En cours d'étude »). S'il y a des nouveautés, un badge rouge affiche « N messages non lus ».

**C'est un problème si** — un changement effectué par l'administrateur n'apparaît jamais. À noter : cette page est un simple journal en lecture seule, il n'y a pas de bouton « tout marquer comme lu ».

---

# Partie 3 — Le back-office administrateur

**À quoi sert cet espace :** c'est le poste de travail de l'équipe Finarent. On y traite les dossiers, on y produit devis et factures, on y suit les apporteurs d'affaires et les centres d'appel, et on y gère les comptes.

Connectez-vous avec le **compte administrateur**. Vous arrivez sur `finarent.com/admin`.

## Test 43 — Le tableau de bord

**Objectif** — vérifier la vue d'ensemble de l'activité.

**Ce que vous faites** — parcourez la page d'arrivée de haut en bas.

**Ce que vous devez voir**
- Le titre **« Tableau de bord »**, sous-titré « Vue d'ensemble de l'activité Finarent ».
- Un bandeau **« À traiter aujourd'hui »** (uniquement s'il y a des actions en attente) avec quatre tuiles : *Dossiers PENDING > 4h*, *Docs en attente > 7j*, *Offres expirent < 24h*, *Offres sans réponse > 48h*.
- Six compteurs : **Total dossiers · En attente · En cours · Finalisés · Utilisateurs · Partenaires**.
- Six indicateurs : **Montant moyen · Conversion · Dossiers ce mois · Délai traitement · Délai signature · Taux d'abandon**.
- Un **Funnel de conversion**, une **Performance par opérateur**, une **Tendance mensuelle** et les **Secteurs les plus demandés**.
- Un tableau **« Dernières demandes »** (Entreprise, Contact, Montant, Statut, Date).
- Un menu latéral de dix-sept entrées, dans cet ordre : Tableau de bord · Demandes · File d'appels · Centres d'appel · Espace agents · Devis · Factures · Documents émis · Offres prêt · Utilisateurs · Prospection · Partenaires · Affiliation · Logs d'activité · FAQ · Témoignages · Paramètres.

**C'est un problème si** — le nombre total de dossiers ne correspond pas au nombre de lignes de l'écran « Demandes ».

> **Un défaut connu, inutile de le signaler :** dans le tableau « Dernières demandes », la colonne Statut affiche des libellés techniques (`en_attente`, `devis_envoye`) au lieu du français. C'est le seul écran de l'administration dans ce cas. Dites-nous simplement si cela vous gêne au quotidien.

## Test 44 — Traiter une demande et changer son statut

**Objectif** — vérifier le cœur du travail quotidien de l'équipe.

**Ce que vous faites**
1. Menu **« Demandes »**.
2. Cliquez sur la demande créée au test 27 pour la déplier.
3. Dans **« Changer le statut »**, choisissez **« En cours d'étude »**.
4. Cliquez **« Modifier »** en face de « Notes », écrivez une note, puis **« Enregistrer »**.
5. Vérifiez ensuite côté client (test 42) que la notification est arrivée.

**Ce que vous devez voir**
- Le titre **« Demandes de financement »** et une bascule **« Liste » / « Kanban »**.
- Des onglets de regroupement : **Tous · En attente · En cours · Transmis · Terminés**, avec leurs compteurs.
- Une recherche **« Rechercher par nom, email, SIREN, référence... »**.
- Le menu déroulant de statut propose exactement onze valeurs : **En attente · En cours d'étude · Documents manquants · Devis envoyé · Devis accepté · Signature en attente · Signé · Transmis au partenaire · Validée · Refusée · Finalisé**.
- Sur chaque dossier, un score de pré-qualification, une étiquette **Financement** ou **Assurance**, et une mention **Authentifié** ou **Prospect**.

**C'est un problème si** — le statut ne se met pas à jour, ou si la note saisie disparaît après rechargement.

## Test 45 — Les notes internes sont lisibles ★

**Objectif** — vérifier la correction de l'affichage des données protégées.

**Ce que vous faites**
1. Sur la liste **« Demandes »**, dépliez plusieurs dossiers, y compris d'anciens.
2. Regardez le contenu de la zone **« Notes »** et l'étiquette **« Simulateur · … »** quand elle est présente.
3. Faites de même sur `finarent.com/admin/centre-appel` (colonne des notes), sur `finarent.com/admin/offers` (Conditions particulières), et dans le tableau **« Paiements »** d'une facture (colonne **« Réf. »**).

**Ce que vous devez voir** — du texte français lisible partout.

**C'est un problème si** — une zone affiche une suite de caractères commençant par **`v1:`** suivie de lettres et de chiffres sans signification. C'est du texte protégé qui n'a pas été rendu lisible. **Signalez-le en précisant l'écran exact** : c'était un défaut corrigé sur six écrans, et une résurgence doit être traitée sans délai.

## Test 46 — Le pipeline en colonnes

**Objectif** — vérifier le suivi visuel des dossiers.

**Ce que vous faites**
1. Sur l'écran Demandes, cliquez **« Kanban »**.
2. Faites glisser une carte d'une colonne à l'autre.

**Ce que vous devez voir**
- Cinq colonnes : **En attente · En étude · Docs manquants · Offre émise · Finalisés**.
- Au dépôt, une demande de confirmation apparaît, avertissant que **le client en sera informé par email**.
- Après confirmation, la carte reste dans sa nouvelle colonne, y compris après rechargement.

**C'est un problème si** — la carte revient à sa place d'origine après rechargement, ou si aucune confirmation n'apparaît avant un changement qui déclenche un email au client.

> **Un point de vocabulaire à connaître.** La fenêtre de confirmation emploie des mots différents de la liste (« Reçu » au lieu de « En attente », « En analyse » au lieu de « En cours d'étude », « Approuvé » au lieu de « Validée »). C'est le même dossier et le même statut, avec deux vocabulaires selon l'écran. Dites-nous si cela prête à confusion : nous pouvons unifier.

## Test 47 — Créer un devis

**Objectif** — vérifier la production d'un devis.

**Ce que vous faites**
1. Menu **« Devis »**, bouton **« Nouveau devis »**.
2. Remplissez le contact (Nom du contact, Email, Téléphone, Entreprise, Adresse, SIRET).
3. Ajoutez un poste : description, quantité, prix unitaire hors taxes, TVA.
4. Renseignez **« Valide jusqu'au »**, puis cliquez **« Créer le devis »**.
5. Dans la liste, cliquez **« PDF »** sur le devis créé.

**Ce que vous devez voir**
- Le devis apparaît dans la liste au statut **« Brouillon »**, avec un numéro commençant par **DEV-**.
- Les totaux **Sous-total HT / TVA / Total TTC** se recalculent à chaque modification d'un poste.
- Le PDF s'ouvre dans un nouvel onglet, avec le logo Finarent, le tableau des postes, les totaux et les mentions légales de Finarent en bas.

**C'est un problème si** — un total est faux, ou si le PDF s'ouvre sans logo ni mentions légales.

## Test 48 — Envoyer un devis au client ★ *priorité*

**Objectif** — vérifier que l'envoi est désormais une action volontaire, et qu'il n'y a pas d'envoi involontaire.

**Ce que vous faites**
1. Sur un devis en **Brouillon**, cliquez d'abord **« PDF »**. Demandez au client s'il a reçu quelque chose.
2. Cliquez ensuite **« Passer en envoyé »**. Redemandez au client.
3. Cliquez enfin **« Envoyer au client »**.

**Ce que vous devez voir**
- **Consulter le PDF n'envoie rien au client.** C'est le point corrigé : auparavant, ouvrir le document déclenchait son expédition.
- **« Passer en envoyé » ne fait que changer le statut**, il n'envoie aucun email. Les deux boutons sont distincts, ne les confondez pas.
- Seul **« Envoyer au client »** expédie réellement. Pendant l'envoi, il affiche **« Envoi… »**, puis un message de la forme **« DEV-… envoyé à … »**.
- Une fois transmis, le bouton devient **« Renvoyer au client »**.
- Sur un devis resté en Brouillon, l'envoi est refusé avec : **« Un devis en brouillon n'engage pas Finarent : passez-le en SENT avant de l'envoyer. »**
- Un second envoi identique est bloqué : **« DEV-… : document identique déjà transmis à … — aucun second envoi. »**

**C'est un problème si** — le client reçoit un devis alors que vous n'avez cliqué que sur « PDF » ou sur « Passer en envoyé ». **Signalez-le comme bloquant.**

## Test 49 — Créer une facture : le numéro provisoire ★ *priorité*

**Objectif** — vérifier qu'un brouillon ne consomme pas de numéro comptable.

**Ce que vous faites**
1. Menu **« Factures »**, bouton **« Nouvelle facture »**.
2. Choisissez éventuellement **« Lier à une demande »** : le nom, l'email et le SIRET du client se remplissent tout seuls.
3. Ajoutez une ligne, renseignez l'échéance, puis **« Créer la facture »**.
4. Ouvrez la facture créée et lisez son en-tête.
5. Créez une deuxième facture, puis **supprimez-la**.

**Ce que vous devez voir**
- La facture porte la mention **« Brouillon »**, et non un numéro comptable.
- Sous le titre : **« Référence de travail XXXXXXXX — le numéro comptable sera attribué à l'émission. »**
- Dans la liste, le survol de cette référence affiche l'infobulle « Référence de travail — le numéro comptable sera attribué à l'émission ».
- Un brouillon se supprime **sans créer de trou** dans la numérotation : la facture suivante émise reprend le numéro attendu.

**C'est un problème si** — un brouillon porte déjà un numéro de la forme `FAC-2026-0001`, ou si la suppression d'un brouillon fait sauter un numéro par la suite.

## Test 50 — Émettre une facture : le numéro définitif ★ *priorité*

**Objectif** — vérifier l'attribution du numéro comptable et le contrôle des statuts.

**Ce que vous faites**
1. Sur une facture en Brouillon, cliquez **« Émettre »**.
2. Notez le numéro obtenu.
3. Créez et émettez une deuxième facture. Comparez les numéros.
4. Essayez de faire passer une facture jamais encaissée directement au statut « Payée ».

**Ce que vous devez voir**
- Le titre passe de « Brouillon » à un numéro de la forme **`FAC-2026-0001`**.
- La deuxième facture émise porte **le numéro immédiatement suivant**, sans saut ni doublon.
- Le statut affiché devient **« Émise »**, et la date d'émission apparaît.
- Le bouton **« Envoyer au client »** n'apparaît qu'à partir de ce moment.
- Une facture non encaissée **ne peut pas** être passée en « Payée » directement.

**C'est un problème si** — deux factures portent le même numéro, si un numéro est sauté, ou si une facture peut être marquée payée sans qu'aucun encaissement n'ait été enregistré. **Signalez-le comme bloquant : c'est un sujet comptable.**

## Test 51 — Envoyer une facture au client ★ *priorité*

**Objectif** — vérifier que l'envoi d'une facture est volontaire.

**Ce que vous faites**
1. Sur une facture émise, cliquez d'abord **« Voir PDF »**. Vérifiez auprès du client qu'il n'a rien reçu.
2. Cliquez ensuite **« Envoyer au client »**.
3. Cliquez une seconde fois sur le même bouton.
4. Essayez enfin d'envoyer une facture restée en Brouillon.

**Ce que vous devez voir**
- **Consulter le PDF n'envoie rien.** C'est le point corrigé.
- Pendant l'envoi : **« Envoi en cours… »**, puis un bandeau **« Facture envoyée à … »**.
- L'en-tête affiche désormais « Transmise le … à … », et le bouton devient **« Renvoyer au client »**.
- Au second envoi identique : **« Document identique déjà transmis à … — aucun second envoi (…) »**.
- Sur un brouillon : **« Une facture en brouillon n'a pas d'existence comptable : émettez-la avant de l'envoyer. »**
- Sans adresse email renseignée : **« Aucune adresse email renseignée sur cette facture. »**

**C'est un problème si** — le client reçoit une facture alors que vous n'avez fait que consulter le PDF. **Signalez-le comme bloquant.**

> Il n'y a **pas** de bouton d'envoi dans la liste des factures : il faut ouvrir la facture. C'est délibéré, pour éviter les envois par inadvertance.

## Test 52 — Enregistrer un paiement

**Objectif** — vérifier le suivi des encaissements.

**Ce que vous faites**
1. Sur une facture émise, dans **« Enregistrer un paiement »**, saisissez la moitié du montant, choisissez une méthode (Virement, Carte bancaire, Chèque, Espèces, Avoir), une référence, puis **« Enregistrer »**.
2. Recommencez avec le solde — le bouton **« Solder (…) »** remplit le montant restant automatiquement.
3. Rechargez la page et vérifiez que rien n'a été compté deux fois.

**Ce que vous devez voir**
- Après le premier paiement : statut **« Partielle »**, la carte **« Encaissé »** et la barre **« Avancement paiement »** sont mises à jour, et **« Reste à payer »** affiche le solde.
- Après le second : statut **« Payée »**, reste à payer nul.
- Chaque versement apparaît dans le tableau **« Paiements »** (Date, Méthode, Réf., Montant), avec une **référence lisible**.

**C'est un problème si** — le total encaissé dépasse le total de la facture, si un même versement apparaît deux fois, ou si la colonne « Réf. » affiche une suite de caractères commençant par `v1:`.

## Test 53 — Le registre des documents émis

**Objectif** — vérifier la traçabilité des documents produits et envoyés.

**Ce que vous faites**
1. Menu **« Documents émis »**.
2. Cherchez la facture et le devis envoyés aux tests 48 et 51.
3. Cliquez **« Télécharger »** sur l'un d'eux.

**Ce que vous devez voir**
- Le titre **« Documents émis »**, sous-titré « N pièce(s) archivée(s) · N non transmise(s) ».
- Des filtres : **Tous · Factures · Devis · Contrats · Commissions · Récapitulatifs · Autres**.
- Un tableau : **Date · Type · Dossier · Fichier · Destinataire · Transmis**, avec un bouton **« Télécharger »** par ligne.
- La colonne **Transmis** affiche la date d'envoi, ou **« en attente »**, ou **« archivé seul »**.
- Le document téléchargé est bien celui que vous avez envoyé.

**C'est un problème si** — un document que vous avez envoyé n'apparaît pas dans ce registre, ou s'il y apparaît comme « en attente » alors que le client l'a reçu. **C'est l'écran de contrôle à utiliser après chaque test d'envoi.**

## Test 54 — Changer le rôle d'un utilisateur ★

**Objectif** — vérifier la correction du défaut le plus insidieux : un rôle modifié qui retombait silencieusement à « client ».

**Ce que vous faites**
1. Menu **« Utilisateurs »**, ouvrez la fiche d'un compte de démonstration.
2. Dans l'en-tête, à droite, sous **« Rôle »**, choisissez une autre valeur dans la liste.
3. **Rechargez la page.**
4. **Puis déconnectez-vous du compte concerné, reconnectez-vous, et naviguez.**
5. Vérifiez enfin que la personne accède bien à son nouvel espace.

**Ce que vous devez voir**
- Les quatre rôles proposés : **CLIENT**, **ADMIN**, **PARTNER**, **INSURER**.
- Le changement s'applique immédiatement, sans bouton « Enregistrer ».
- **Après rechargement, le rôle est toujours le nouveau.**
- **Après déconnexion et reconnexion complète, il l'est toujours.** C'est l'étape décisive : c'est à ce moment précis que le rôle retombait autrefois à « client ».
- Le compte accède désormais à son nouvel espace (`/partner`, `/insurer` ou `/admin`).

**C'est un problème si** — le rôle redevient CLIENT après reconnexion, ou si l'écran annonce un succès sans effet réel.

> **Un refus franc n'est pas un défaut.** Si un message long apparaît, commençant par **« Changement de rôle indisponible : … »**, cela signifie que le service de gestion des comptes n'est pas configuré sur cet environnement. C'est un refus honnête, qui vaut mieux qu'un faux succès. Signalez-le à l'équipe technique en recopiant le message.

## Test 55 — Gérer les partenaires

**Objectif** — vérifier l'ajout d'une banque ou d'un assureur partenaire.

**Ce que vous faites**
1. Menu **« Partenaires »**.
2. Créez un partenaire : Nom *Banque de test*, Type **Banque**, Email de contact, Notes.
3. Cherchez-le dans la recherche, puis supprimez-le.

**Ce que vous devez voir**
- Trois types possibles : **Banque**, **Assurance**, **Leasing**.
- Le partenaire apparaît dans la liste avec ses compteurs **Dossiers**, **Users**, **Commissions**.
- La suppression demande confirmation : « Supprimer le partenaire "…" ? Cette action est irréversible. »

**C'est un problème si** — un partenaire créé n'apparaît pas dans la liste, ou si la suppression s'effectue sans confirmation.

## Test 56 — Créer un apporteur d'affaires

**Objectif** — vérifier la mise en place d'un commercial rémunéré à la commission.

**Ce que vous faites**
1. Menu **« Affiliation »**, bouton **« Nouvel affilié »**.
2. Renseignez Nom complet, Email, Téléphone, laissez le code vide (il sera généré), choisissez **Pourcentage (%)** et saisissez une valeur.
3. Enregistrez, puis ouvrez la fiche de l'affilié créé.
4. **Notez son code d'affiliation** : il servira aux tests 66 à 69.

**Ce que vous devez voir**
- Cinq indicateurs en haut : **Clics · Leads · Dossiers · À verser · Versé**.
- La liste affiche : Nom / Code, Commission, Clics, Leads, Dossiers, À verser, Versé, État (**Actif** ou **Inactif**).
- La fiche de l'affilié affiche son **« Lien de tracking »** et six onglets : **Vue d'ensemble · Commissions · Leads · Dossiers · Clics · Invitations**.

**C'est un problème si** — le code généré n'est pas unique, ou si les compteurs restent figés à zéro après un clic réel sur le lien de suivi (test 67).

> **Un défaut connu, inutile de le signaler :** dans l'onglet « Dossiers » de cette fiche, le lien « Voir → » mène à une page d'erreur. La liste des demandes n'a pas de page de détail séparée — le détail se déplie directement dans la liste (test 44).

## Test 57 — Les versements aux apporteurs

**Objectif** — vérifier le circuit de paiement des commissions.

**Ce que vous faites**
1. Menu **« Affiliation »**, bouton **« Versements & SEPA »**.
2. Regardez le bloc **« Affiliés prêts à verser »**.
3. Si un affilié est éligible, cliquez **« Verser »**.
4. Testez les boutons **« Export SEPA »** et **« Export DAS2 »**.

**Ce que vous devez voir**
- Le titre **« Versements & fiscal »**, sous-titré « Validation, SEPA XML, auto-factures et export DAS2. »
- Les affiliés non éligibles portent la mention **« Sous seuil (N €) »**.
- Le versement demande confirmation (« Créer le versement et générer l'auto-facture ? ») et produit un message **« Versement créé — facture … »**.
- L'historique liste : Date, Affilié, Facture, Montant TTC, avec un lien **« Télécharger »**.
- Le fichier SEPA téléchargé est un fichier destiné à la banque.

**C'est un problème si** — le total du fichier de virement ne correspond pas à la somme des lignes qu'il contient. **C'était un défaut corrigé, et il entraînait le rejet du lot entier par la banque.** Ouvrez le fichier, ou faites-le vérifier par votre comptable avant de l'envoyer la première fois.

## Test 58 — La prospection

**Objectif** — vérifier que les prospects issus des simulateurs et des formulaires arrivent bien.

**Ce que vous faites**
1. Menu **« Prospection »**.
2. Cherchez la demande de devis RC Pro déposée au test 6.
3. Ouvrez sa fiche dans le panneau latéral, changez son statut, ajoutez une note.
4. Testez **« Exporter CSV »** et ouvrez le fichier dans Excel.

**Ce que vous devez voir**
- Cinq compteurs : **Total · Nouveau · Contacté · Qualifié · Converti**.
- Un tableau : **Score · Prospect · Contact · Source · Dernier simulateur · Activité · Statut · Vu**.
- Les statuts : **Nouveau · Contacté · Qualifié · Converti · Perdu**.
- Un prospect sans nom s'affiche **« Anonyme »**.
- Le panneau latéral permet de rattacher le prospect à un centre d'appel et à un agent.

**C'est un problème si** — le prospect du test 6 est absent, **ou si Excel affiche un avertissement de sécurité à l'ouverture du fichier exporté**. Ce second point était un défaut corrigé : un visiteur anonyme pouvait glisser une formule dans un formulaire public, formule qu'Excel exécutait ensuite sur votre poste. Si l'avertissement réapparaît, **signalez-le comme bloquant et n'ouvrez pas le fichier**.

## Test 59 — Les offres de prêt

**Objectif** — vérifier la production d'une offre chiffrée.

**Ce que vous faites**
1. Menu **« Offres prêt »**, bouton **« Nouvelle offre »**.
2. Sélectionnez une demande, saisissez Montant, Durée, Taux, un partenaire et une durée de validité.
3. Regardez les aperçus calculés avant d'enregistrer.

**Ce que vous devez voir**
- Les aperçus **« Mensualité calculée »** et **« Coût total »** se recalculent à chaque modification.
- Les statuts possibles : **Brouillon · Envoyée · Vue · Acceptée · Refusée · Expirée · Signée**.

**C'est un problème si** — la mensualité calculée est incohérente avec le montant et la durée saisis, ou si une offre en Brouillon, Refusée ou Expirée peut malgré tout être signée par le client. Ce dernier point était un défaut corrigé.

## Test 60 — Modérer les témoignages

**Objectif** — vérifier ce qui est publié au nom de vos clients sur le site public.

**Ce que vous faites**
1. Menu **« Témoignages »**.
2. Approuvez et publiez un témoignage en attente.
3. Ouvrez la page publique `finarent.com/testimonials` dans un autre navigateur.
4. Revenez et dépubliez-le.

**Ce que vous devez voir**
- Des filtres : **Tous · En attente · Approuvés · Refusés · Publiés**.
- Des états lisibles : **Publié**, **Approuvé (non publié)**, **Refusé**, **En attente**.
- Un témoignage publié apparaît sur la page publique ; dépublié, il en disparaît.

**C'est un problème si** — un témoignage apparaît sur le site public **avant** d'avoir été approuvé.

## Test 61 — Gérer la FAQ publique

**Objectif** — vérifier que vous pouvez modifier vous-même les questions du site.

**Ce que vous faites**
1. Menu **« FAQ »**, bouton **« Ajouter une question »**.
2. Saisissez une question, une réponse, un ordre d'affichage, puis **« Ajouter »**.
3. Ouvrez `finarent.com/faq` dans un autre navigateur.
4. Revenez, désactivez la question, puis supprimez-la.

**Ce que vous devez voir**
- Le titre **« Gestion FAQ »** et des filtres par catégorie : Général, Financement, Assurance, Documents, Compte.
- Chaque question porte un badge **« Actif »** ou **« Inactif »**.
- La suppression demande confirmation.

**C'est un problème si** — une question désactivée reste visible sur le site public. *À confirmer :* le délai de propagation d'une modification vers le site public n'a pas été mesuré ; s'il dépasse quelques minutes, signalez-le.

## Test 62 — Le journal d'activité

**Objectif** — vérifier la traçabilité des actions administratives.

**Ce que vous faites**
1. Menu **« Logs d'activité »**.
2. Retrouvez les actions que vous venez d'effectuer (changement de statut, envoi de facture, changement de rôle).
3. Utilisez les filtres de période.

**Ce que vous devez voir**
- Le titre de la page est **« Journal d'activité »** (le menu, lui, dit « Logs d'activité »).
- Un tableau : **Date · Module · Action · Détail · Acteur**, avec des filtres de période **Aujourd'hui · 7 jours · 30 jours · Tout**.
- Vos actions récentes y figurent, à votre nom.

**C'est un problème si** — une action sensible (changement de rôle, envoi de facture, suppression) n'y laisse aucune trace.

## Test 63 — L'écran Paramètres

**Objectif** — savoir ce que cet écran fait, et surtout ce qu'il ne fait pas.

**Ce que vous faites**
1. Menu **« Paramètres »**.
2. Basculez un interrupteur de notification, cliquez **« Enregistrer les modifications »**, puis **rechargez la page**.

**Ce que vous devez voir**
- Les coordonnées de la société, et trois interrupteurs : **Changement de statut**, **Nouvelle demande**, **Document envoyé**.
- Le message « Paramètres sauvegardés » apparaît trois secondes.
- **Après rechargement, les interrupteurs sont revenus à leur position initiale.**

**C'est un problème si** — vous pensiez avoir réglé quelque chose. **Cet écran ne conserve rien aujourd'hui** : c'est une maquette de consultation, pas un écran de configuration. Nous le signalons ici pour que vous ne vous appuyiez pas dessus. Dites-nous s'il doit devenir réellement fonctionnel.

## Test 64 — La file d'appels

**Objectif** — vérifier l'outil de rappel des prospects et des demandes.

**Ce que vous faites**
1. Menu **« File d'appels »**.
2. Sur une ligne, cliquez **« Logger »**.
3. Saisissez une durée, choisissez un résultat et écrivez une note, puis enregistrez.

**Ce que vous devez voir**
- Une file unifiée mêlant prospects et demandes, avec les filtres **Tout · Prospects · Demandes · Rappels**.
- Sept résultats d'appel possibles : **Décroché · Répondeur · Pas de réponse · À rappeler · Qualifié · Converti · Refus**.
- L'appel enregistré apparaît dans l'historique du contact.

**C'est un problème si** — l'appel enregistré n'apparaît nulle part ensuite.

> Le bouton **« Appeler »** dépend d'un service de téléphonie qui n'est pas activé aujourd'hui (voir la section finale). Seul l'enregistrement manuel est testable.

## Test 65 — Les centres d'appel

**Objectif** — vérifier la configuration des équipes commerciales.

**Ce que vous faites**
1. Menu **« Centres d'appel »**, bouton **« Nouveau centre »**.
2. Créez un centre de type **Interne Finarent**, avec une commission en pourcentage.
3. Ouvrez sa fiche, onglet **« Membres »**, et ajoutez un utilisateur avec le rôle **Agent**.

**Ce que vous devez voir**
- Deux types : **Interne** et **Externe**.
- La fiche comporte cinq onglets : **Vue d'ensemble · Membres · Dossiers · Interactions · Commissions**.
- Un centre ne peut avoir qu'**un seul Manager**.
- Si un IBAN est renseigné, il s'affiche **partiellement masqué**.

**C'est un problème si** — l'IBAN s'affiche en entier, ou sous la forme d'une suite de caractères commençant par `v1:`.

---

# Partie 4 — L'apporteur d'affaires

**À quoi sert cet espace :** c'est une page personnelle, accessible sans mot de passe grâce à un code unique, où un commercial indépendant suit les clics sur son lien, les prospects qu'il a amenés et les commissions qu'il a gagnées.

Vous avez besoin du **code d'affiliation** créé au test 56.

## Test 66 — La page personnelle de l'apporteur

**Objectif** — vérifier la page de suivi d'un apporteur.

**Ce que vous faites**
1. Ouvrez `finarent.com/affiliate/VOTRECODE` (remplacez par le code réel).

**Ce que vous devez voir**
- Un badge **« Espace apporteur d'affaires »** et le titre **« Bonjour … »** suivi du prénom.
- Quatre indicateurs : **Clics · Leads générés · Dossiers · Gains totaux**.
- Un **« tunnel de conversion »** en trois barres : Clics → Leads, Leads → Dossiers, Dossiers → Commissions.
- Deux cartes de commissions : **« À verser »** et **« Déjà versé »**.
- En bas, la mention que les statistiques sont anonymisées et n'exposent aucune donnée personnelle de prospect.

**C'est un problème si** — la page affiche des noms, emails ou téléphones de prospects. Cette page est publique pour qui connaît le code : elle ne doit contenir que des compteurs.

**Testez aussi un code inventé** : `finarent.com/affiliate/XXXXXX` doit afficher **« Page non disponible »**, jamais une page vide ni une erreur technique.

## Test 67 — Le lien de suivi

**Objectif** — vérifier que le suivi des clics fonctionne.

**Ce que vous faites**
1. Sur la page de l'apporteur, cliquez **« Copier »** à côté du lien de tracking.
2. Ouvrez une fenêtre de **navigation privée** et collez le lien.
3. Revenez sur la page de l'apporteur et rechargez.

**Ce que vous devez voir**
- Le lien est de la forme `finarent.com/?ref=VOTRECODE`, et le bouton devient **« Copié ! »** deux secondes.
- Le lien collé ouvre la page d'accueil normale de Finarent.
- Le compteur **« Clics »** de la page apporteur a augmenté de un.

**C'est un problème si** — le compteur ne bouge pas. Le suivi des apporteurs est ce qui déclenche leur rémunération : s'il ne compte pas, ils ne sont pas payés.

## Test 68 — Inviter un prospect

**Objectif** — vérifier l'invitation par email depuis la page de l'apporteur.

**Ce que vous faites**
1. En bas de la page, formulaire **« Inviter un prospect par email »** : saisissez votre propre adresse personnelle, un prénom, et éventuellement un message.
2. Cliquez **« Envoyer l'invitation »**.
3. Recommencez six fois de suite.

**Ce que vous devez voir**
- Un compteur **« N / 5 envoyés cette session »**.
- Au sixième essai : **« Limite de 5 invitations par session atteinte. Reconnectez-vous plus tard. »**
- Un email arrive dans votre boîte personnelle.

**C'est un problème si** — aucun email n'arrive, ou si la limite de cinq peut être contournée en rechargeant simplement la page. *Point connu à signaler si vous l'observez :* cette limite est aujourd'hui posée dans le navigateur, elle est donc contournable ; dites-nous si vous jugez le risque d'abus réel.

## Test 69 — Le profil fiscal de l'apporteur

**Objectif** — vérifier le formulaire qui permet de payer un apporteur.

**Ce que vous faites**
1. **Demandez à l'administrateur le lien d'onboarding sécurisé** de cet apporteur (il se génère depuis la fiche de l'affilié en back-office).
2. Ouvrez ce lien et remplissez : Statut fiscal, Nom légal, SIRET, IBAN, BIC, adresse fiscale.
3. Cochez la case du mandat de facturation, puis **« Enregistrer mon profil fiscal »**.

**Ce que vous devez voir**
- Trois statuts fiscaux possibles : **Particulier**, **Micro-entrepreneur**, **Société**.
- Après enregistrement : **« Profil fiscal complet »** et « Vos commissions pourront être versées une fois validées par Finarent. »

**C'est un problème si** — vous utilisez le lien **« Compléter mon profil fiscal »** de la page publique et obtenez **« Lien invalide ou expiré »**. **C'est un défaut connu** : ce bouton ne fonctionne pas, seul le lien fourni par l'administrateur est valide. Signalez-le si vous jugez qu'il doit être corrigé en priorité, car un apporteur qui le rencontre est bloqué.

---

# Partie 5 — Le centre d'appel

**À quoi sert cet espace :** c'est le poste de travail des agents commerciaux, qui y consultent leur portefeuille de prospects, enregistrent leurs appels et envoient des emails de prospection.

Connectez-vous avec le **compte centre d'appel**.

## Test 70 — Accéder à l'espace

**Objectif** — vérifier l'entrée dans l'espace agent.

**Ce que vous faites**
1. Connectez-vous, puis tapez directement `finarent.com/call-center`.

**Ce que vous devez voir**
- Un bandeau supérieur indiquant **« Vue responsable — … »** ou **« Vue agent — … »**.
- Un menu latéral : **Tableau de bord · Prospects · Appels & SMS · Emails Brevo**, plus **Équipe** et **Admin centres** si vous êtes responsable, et en bas **File d'appels admin**.
- Quatre compteurs : **Prospects · Contactés · Interactions · Ringover**.

**C'est un problème si** — vous n'arrivez pas sur cet espace. **Point important à connaître :** se connecter et aller sur « Mon espace » n'amène **pas** à l'espace agent, mais au tableau de bord client ordinaire. Il faut taper l'adresse. Dites-nous si cela gêne vos agents au quotidien : c'est le principal piège de navigation de la plateforme.

## Test 71 — La liste des prospects

**Objectif** — vérifier le portefeuille de l'agent et son cloisonnement.

**Ce que vous faites**
1. Menu **« Prospects »**.
2. Cherchez un prospect par nom, email ou téléphone, puis cliquez **« Filtrer »**.
3. Cliquez **« Ouvrir »** sur une ligne.

**Ce que vous devez voir**
- Un tableau : **Contact · Statut · Dernier appel · Agent**, avec un lien **« Ouvrir »**.
- Des statuts en français : **Nouveau · Contacté · Qualifié · Converti · Perdu**.
- **Un agent ne voit que les prospects qui lui sont assignés** dans son centre. Un responsable voit tout son centre.

**C'est un problème si** — un agent voit des prospects assignés à un collègue, ou les prospects d'un autre centre d'appel.

## Test 72 — La fiche d'un prospect

**Objectif** — vérifier les informations dont dispose l'agent.

**Ce que vous faites**
1. Ouvrez une fiche prospect et lisez-la entièrement.

**Ce que vous devez voir** — les coordonnées du prospect, son centre, son agent, son statut et les notes commerciales.

**C'est un problème si** — le statut s'affiche en anglais (`NEW`, `CONTACTED`, `QUALIFIED`) alors que la liste, elle, l'affichait en français. **C'est un défaut connu d'affichage** : signalez simplement s'il crée de la confusion chez vos agents.

> L'encart de téléphonie (**« Appeler via Ringover »**, **« SMS »**) **n'apparaît pas du tout** aujourd'hui : le service n'est pas activé. Ce n'est pas un bug, c'est le comportement attendu tant que le compte n'est pas ouvert.

## Test 73 — L'historique des appels et des emails

**Objectif** — vérifier la traçabilité des contacts commerciaux.

**Ce que vous faites**
1. Menu **« Appels & SMS »**, puis menu **« Emails Brevo »**.

**Ce que vous devez voir**
- **Appels & SMS** : la liste des interactions enregistrées, y compris les appels saisis manuellement au test 64.
- **Emails Brevo** : trois compteurs (**Envoyés · Ouverts · Convertis**) et un tableau **Date · Destinataire · Objet · Statut**.
- En haut de la page Emails, une mention explicite indiquant si la prospection est **actif** ou **non configuré**.

**C'est un problème si** — un appel enregistré manuellement n'apparaît pas ici.

> Les formulaires d'envoi d'email restent affichés et cliquables même quand le service n'est pas configuré : l'échec ne se voit qu'après le clic. Nous vous le signalons pour que vous ne le preniez pas pour un bug.

---

# Partie 6 — L'espace partenaire

**À quoi sert cet espace :** c'est une consultation en lecture seule, où une banque ou une société de leasing partenaire suit les dossiers que Finarent lui a transmis et les commissions correspondantes.

Connectez-vous avec le **compte partenaire**. Vous êtes automatiquement redirigé vers `finarent.com/partner`.

## Test 74 — Le tableau de bord partenaire

**Objectif** — vérifier la vue d'ensemble du partenaire.

**Ce que vous faites** — parcourez la page d'arrivée.

**Ce que vous devez voir**
- Le titre **« Espace Partenaire »**, sous-titré « Suivez vos dossiers transmis par Finarent ».
- Quatre compteurs : **Total dossiers · Transmis · Validés · Finalisés**.
- Un encart **Total commissions**, **Montant total traité**, **Taux de validation**.
- Un menu latéral à trois entrées : **Tableau de bord · Dossiers · Commissions**.

**C'est un problème si** — les compteurs ne correspondent pas au nombre de dossiers réellement listés.

> **Un défaut connu, inutile de le signaler :** le lien « Voir les détails » de la carte « Suivi des commissions » ne mène nulle part.

## Test 75 — Les dossiers reçus, et leur cloisonnement ★ *priorité*

**Objectif** — vérifier qu'un partenaire ne voit **que** ses propres dossiers.

**Ce que vous faites**
1. Menu **« Dossiers »**.
2. Comptez les dossiers affichés.
3. **Comparez avec la liste complète côté administrateur** (test 44) : les dossiers non transmis à ce partenaire, et ceux transmis à un autre, **ne doivent pas apparaître**.
4. Utilisez la recherche pour tenter de faire remonter un dossier appartenant à un autre partenaire.

**Ce que vous devez voir**
- Une liste de cartes : statut, type de produit, nom de l'entreprise, contact, montant, date, pièces jointes.
- **Uniquement les dossiers transmis à ce partenaire.**

**C'est un problème si** — un seul dossier étranger apparaît. **Signalez-le comme bloquant, immédiatement.** C'était l'une des six situations corrigées où un compte pouvait atteindre les données d'un autre, et c'est le risque le plus lourd de la plateforme.

> **Cet espace est volontairement en lecture seule** : le partenaire ne peut ni changer un statut, ni valider, ni refuser un dossier. Si votre processus commercial suppose qu'il le fasse lui-même, dites-le-nous : c'est une fonctionnalité à créer, pas un défaut à corriger.

> **Un point d'affichage à signaler si vous le jugez gênant :** les statuts s'affichent ici sous forme technique (`EN_ATTENTE`, `DEVIS_ENVOYE`, `TRANSMIS`) et non en français comme dans le back-office. C'est un défaut d'affichage connu, sans conséquence sur les données.

## Test 76 — Les commissions du partenaire

**Objectif** — vérifier le suivi de rémunération du partenaire.

**Ce que vous faites**
1. Menu **« Commissions »**.
2. Utilisez les filtres **Toutes · En attente · Payées**.

**Ce que vous devez voir** — un tableau **Dossier · Montant dossier · Taux · Commission · Statut · Date**, avec les statuts **Payée** et **En attente**.

**C'est un problème si** — une commission apparaît pour un dossier que ce partenaire n'a jamais reçu, ou si le montant de commission ne correspond pas au taux appliqué au montant du dossier.

---

# Partie 7 — L'espace assureur

**À quoi sert cet espace :** c'est le poste de l'assureur partenaire, qui y consulte les demandes de RC Professionnelle et fait avancer leur traitement, de l'étude jusqu'à l'accord ou au refus.

Connectez-vous avec le **compte assureur**. Vous êtes automatiquement redirigé vers `finarent.com/insurer`.

## Test 77 — Le périmètre assurance ★

**Objectif** — vérifier qu'un assureur ne voit que les demandes d'assurance.

**Ce que vous faites**
1. Menu **« Dossiers assurance »**.
2. Passez la liste en revue.
3. **Comparez avec la liste complète côté administrateur** : les dossiers de crédit-bail, LOA, LLD et prêt professionnel ne doivent apparaître nulle part.

**Ce que vous devez voir**
- Le titre **« Espace Assureur »**, sous-titré « Gérez les demandes d'assurance RC Professionnelle ».
- Quatre compteurs : **Total demandes · En attente · Souscrites · Refusées**.
- Un menu latéral à deux entrées seulement : **Tableau de bord · Dossiers assurance**.
- **Uniquement des demandes de RC Professionnelle.**

**C'est un problème si** — un dossier de financement apparaît. **Signalez-le comme bloquant.**

> **Une limite à connaître, qui n'est pas un défaut :** le cloisonnement porte sur le **type de produit**, pas sur la compagnie. Si vous ouvrez des comptes à deux assureurs concurrents, **ils verront la même liste**. Dites-nous si c'est acceptable dans votre modèle : sinon, c'est un développement à prévoir.

## Test 78 — Faire avancer un dossier d'assurance

**Objectif** — vérifier la seule action d'écriture de cet espace.

**Ce que vous faites**
1. Sous un dossier, dans **« Changer le statut : »**, cliquez successivement **« En étude »**, **« Devis envoyé »**, puis **« Approuvé »**.
2. Vérifiez côté administrateur que le changement est bien remonté.

**Ce que vous devez voir**
- Quatre boutons : **En étude · Devis envoyé · Approuvé · Refusé**. Le bouton correspondant au statut courant est désactivé.
- Le changement est **immédiat au clic, sans confirmation**. Soyez attentif : il n'y a pas de retour en arrière depuis cet écran.

**C'est un problème si** — vous cliquez **« Approuvé »** et que le badge du dossier affiche ensuite **`VALIDEE`**. Ce n'est pas une erreur de traitement, mais une **incohérence de vocabulaire** entre le bouton et le badge. Signalez-la si elle trouble vos partenaires assureurs.

## Test 79 — Le cloisonnement des accès

**Objectif** — vérifier qu'un compte ne peut pas atteindre un espace qui ne lui est pas destiné.

**Ce que vous faites**
1. Toujours connecté avec le compte assureur, tapez dans la barre d'adresse `finarent.com/admin/demandes`.
2. Puis `finarent.com/admin/factures`.
3. Puis `finarent.com/partner`.
4. Refaites la même chose avec le **compte client** et le **compte partenaire**.

**Ce que vous devez voir** — dans tous les cas, vous êtes **renvoyé vers la page d'accueil publique ou vers votre propre espace**. Aucun contenu réservé n'apparaît, même une fraction de seconde.

**C'est un problème si** — vous apercevez, même brièvement, une liste de dossiers, de factures ou de comptes qui ne vous concerne pas. **Signalez-le comme bloquant.**

> Vous êtes simplement redirigé, sans message d'explication. C'est déroutant. Dites-nous si un message du type « Cet espace ne vous est pas accessible » serait préférable.

---

# Ce qui ne peut pas encore être testé, et pourquoi

Ces fonctions sont écrites et prêtes, mais elles dépendent de comptes de service que vous seul pouvez ouvrir. **Ne perdez pas de temps à les tester : elles échoueront, et c'est normal.**

| Fonction | Ce qu'il manque | Ce que vous verrez si vous essayez quand même |
|---|---|---|
| **Paiement en ligne d'une facture** | Un compte Stripe (le prestataire qui encaisse les cartes bancaires). Il faut une clé de service et un point de réception des confirmations de paiement. | Le bouton « Générer le lien » est visible sur la fiche d'une facture, mais un message d'erreur apparaît au clic. |
| **Signature électronique certifiée (eIDAS)** | Un compte chez un prestataire de signature qualifié. Attention : au-delà du compte, le raccordement reste à faire — il n'est aujourd'hui branché nulle part. | Rien de particulier : c'est la signature interne du test 36 qui s'exécute, avec une valeur probante simple mais réelle. |
| **Téléphonie : appel d'un clic, SMS, journal d'appels automatique** | Un compte Ringover, avec une clé de service et une clé de réception des appels entrants. | Un bandeau orange « Configuration requise » ; l'encart d'appel des fiches prospect n'apparaît tout simplement pas. |
| **Emailing de prospection en masse** | La confirmation que les identifiants d'envoi fonctionnent en conditions réelles, et le réglage anti-usurpation de votre nom de domaine (sans lui, vos emails partent en indésirables). | Les formulaires d'envoi restent affichés et cliquables ; l'échec ne se voit qu'après le clic. |
| **SMS de secours** | Un compte Twilio. Le canal principal étant la téléphonie ci-dessus, elle aussi inactive, **aucun SMS ne peut partir aujourd'hui, par aucun canal**. | Rien ne part, sans message d'erreur visible. |
| **Protection anti-robot des formulaires publics** | De vraies clés reCAPTCHA sur votre nom de domaine. Les clés actuellement en place sont les clés de démonstration publiques de Google : elles laissent tout passer. | Les formulaires fonctionnent — c'est précisément le problème : ils fonctionnent aussi pour les robots. |
| **Remontée automatique des incidents et mesure d'audience** | Un compte de supervision (Sentry) et un compte de mesure d'audience (PostHog). | Rien. C'est justement le sujet : aujourd'hui, un incident en production n'est connu que si un utilisateur téléphone. |

**Un point qui ne dépend pas de la technique et qui prime sur tout le reste :** l'hébergement de la plateforme est actuellement sous le coup d'une suspension pour facture impayée. Tant que ce point n'est pas réglé, aucun de ces raccordements ne peut être mis en service, et l'application tourne en sursis.

---

# Fiche de relevé

Imprimez cette page, ou recopiez le tableau dans un tableur. Une ligne par test effectué.

**Résultat** : notez **OK** si tout s'est passé comme décrit, **KO** si la rubrique « c'est un problème si » s'est vérifiée, **NT** si vous n'avez pas pu faire le test.

**Gravité** (uniquement si KO) : **Bloquant**, **Gênant**, **Étrange** ou **Cosmétique**.

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
| Non testés | |

**Date de début :** ................  **Date de fin :** ................  **Testeur :** ................................

---

Une question pendant les tests ? N'attendez pas la fin de la campagne pour la poser. Un point de blocage levé tôt vous fait gagner une demi-journée.
