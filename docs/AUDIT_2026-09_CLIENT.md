# Audit de la plateforme Finarent — synthèse pour la direction

**Date** : 8 septembre 2026
**Périmètre** : l'intégralité de la plateforme — site public, espace client, back-office, centre d'appels, espaces partenaire et assureur, base de données, sécurité, hébergement.
**Méthode** : revue complète du code (environ 45 000 lignes), contrôle des 92 points d'entrée de l'application, analyse des bibliothèques externes, comparaison entre ce qui est configuré en ligne et ce que le code attend réellement.
**Public** : ce document est écrit sans vocabulaire technique. Une version détaillée destinée aux développeurs existe en parallèle.

---

> ### ⚠️ Mise à jour du 10 septembre 2026 — à lire avant ce document
>
> Cet audit décrit la plateforme **telle qu'elle était le 8 septembre 2026**. Il est conservé en l'état, comme constat daté. Une campagne de correction et de vérification a eu lieu depuis : son résultat figure dans le **Rapport de vérification** (document 7 de cette livraison), qui fait foi sur l'état actuel.
>
> **Trois affirmations de ce document sont devenues fausses, dont une dans le sens rassurant :**
>
> 1. **« Chaque utilisateur ne voit que ce qui le concerne, et cette règle ne peut pas être contournée »** (§1, ci-dessous). C'était inexact. La revue ligne à ligne des 100 points d'entrée a mis au jour **six situations** où un compte pouvait atteindre les données d'un autre — notamment un compte partenaire sans rattachement, qui accédait aux messages et aux pièces de tous les dossiers déposés en direct. Ces six situations sont corrigées et couvertes par 35 tests. Le détail est en section 3.4 du rapport de vérification.
> 2. **« Aucun test automatisé »** (constat M-2). La plateforme en compte aujourd'hui **480**, exécutés à chaque modification par une intégration continue.
> 3. **« Onze failles connues dans les bibliothèques »** (constat M-3). Il en reste **quatre**, toutes issues d'une même brique et corrigibles seulement par sa montée de version — ce n'est donc plus « une commande standard sans risque », mais un chantier planifié.
>
> Par ailleurs, **cinq constats absents de cet audit** ont été découverts pendant les travaux, dont la remontée d'erreurs qui n'était pas branchée du tout, et l'impossibilité de reconstruire la base de données à partir de son historique. Ils sont en section 4 du rapport de vérification.

---

## 1. En une page

La plateforme est **solide et très complète sur le fond**. Les fonctionnalités sont là, elles sont bien construites, et la protection des données de vos clients est sérieusement traitée : chaque utilisateur ne voit que ce qui le concerne, et cette règle est appliquée par le serveur — elle ne peut donc pas être contournée depuis un navigateur.

Les problèmes identifiés ne sont **pas dans le produit, mais dans son environnement d'exploitation** : la façon dont il est configuré, surveillé et mis à jour.

Trois points méritent votre attention immédiate :

1. **Vos clients ne reçoivent aucun email.** L'envoi d'emails n'est pas configuré en production. Une entreprise qui dépose une demande de financement sur le site n'obtient aucun accusé de réception. Le tunnel commercial est en place, mais il est muet.
2. **Les pannes sont invisibles.** Aucun outil de remontée d'erreur n'est branché. Si une page cesse de fonctionner cette nuit, personne ne le saura avant qu'un utilisateur ne se plaigne.
3. **Les traitements automatiques ne sont pas confirmés comme fonctionnels.** Trois traitements doivent s'exécuter seuls — relance des dossiers en attente, alerte sur les dossiers en retard, purge des données d'affiliation. Un contrôle de quelques minutes est nécessaire pour confirmer qu'ils tournent réellement.

### Notation par domaine

| Domaine | Appréciation | En clair |
|---|---|---|
| Conception et qualité du logiciel | 🟢 Bon | Code propre, bien organisé, sans défaut de construction détecté |
| Protection des données et des accès | 🟢 Bon | Cloisonnement strict entre utilisateurs, chiffrement des données sensibles |
| Configuration de la mise en ligne | 🔴 Critique | Services externes non branchés, environnement de travail mal séparé de la production |
| Base de données | 🟠 Moyen | Structure cohérente et complète, mais un historique de mise à jour fragile |
| Tests automatisés | 🔴 Insuffisant | Aucun filet de sécurité automatique contre les régressions |
| Traitements automatiques | 🟠 À vérifier | Correctement programmés, mais leur bon fonctionnement n'est pas confirmé |
| Bibliothèques externes | 🟠 Moyen | 11 failles connues à corriger, dont 8 importantes ; correction simple |
| Documentation interne | 🟠 Moyen | Riche, mais partiellement périmée |

### Volume de travail à prévoir

| Niveau | Nombre de constats | Effort estimé |
|---|---|---|
| 🔴 **Bloquant** | 2 | Une demi-journée |
| 🟠 **Majeur** | 9 | 4 à 6 journées |
| 🟡 **Mineur** | 10 | 2 journées |
| | **21 constats** | **environ 8 journées au total** |

---

## 2. Ce que couvre la plateforme aujourd'hui

Pour situer l'ampleur de ce qui a été audité :

| Élément | Quantité |
|---|---|
| Pages accessibles aux utilisateurs | 75 |
| Espaces distincts (public, client, admin, centre d'appels, partenaire, assureur, affilié) | 7 |
| Simulateurs financiers | 45 |
| Types de données gérés en base | 42 |
| Lignes de code | environ 45 000 |

---

## 3. Ce qui fonctionne bien

Ces points sont au-dessus de ce qu'on rencontre habituellement sur un projet de cette taille. Ils méritent d'être préservés lors des évolutions futures.

**Le cloisonnement des accès est irréprochable.** Un client ne peut pas voir le dossier d'un autre client. Un agent de centre d'appels ne voit que les prospects qui lui sont affectés ; son manager, ceux de son centre. Un partenaire ne voit que les dossiers qu'on lui a transmis. Nous avons vérifié les 92 points d'entrée de l'application un par un : **aucun n'est laissé sans contrôle**. C'est le point le plus important d'un audit de ce type, et il est acquis.

**Les données sensibles sont chiffrées.** Les informations confidentielles stockées en base le sont sous une forme illisible sans la clé de l'application.

**Plusieurs protections contre les attaques courantes sont en place** : blocage des tentatives de faire appeler par le serveur une adresse interne, blocage des tentatives de lire un fichier hors du répertoire autorisé, vérification de l'authenticité des notifications reçues des services de paiement et de téléphonie.

**Les obligations RGPD sont outillées** : export des données d'une personne, suppression de compte, journal horodaté de ces opérations, et suppression automatique des données de suivi d'affiliation au bout de 13 mois — la durée recommandée par la CNIL.

**Les actions sensibles laissent une trace.** Modifications par un administrateur, changements de statut de dossier, consultations de documents, emails envoyés : tout est journalisé et consultable.

**Un incident grave a déjà été corrigé durablement.** Une mise en ligne pouvait auparavant effacer des colonnes de la base de données. Le mécanisme fautif a été retiré et le motif documenté : l'incident ne peut plus se reproduire sans être vu.

---

## 4. Ce qui bloque aujourd'hui

### 🔴 B-1 — L'environnement de travail est branché sur les vraies données

L'environnement de développement travaille actuellement sur **la base de données de production**, celle qui contient les vrais dossiers de vos clients.

**Ce que cela signifie concrètement :** une manipulation de routine pendant le développement — lancer un jeu de données de démonstration, mettre à jour la structure de la base — peut **effacer des données réelles**. Il n'existe aujourd'hui aucun garde-fou qui l'en empêche.

**Ce qui doit être fait :** créer une base de test séparée, y brancher l'environnement de développement, et ajouter un refus automatique dans les outils qui écrivent en base dès qu'ils détectent qu'ils visent la production.

**Effort** : une demi-journée. **Priorité** : immédiate.

### 🔴 B-2 — Les traitements automatiques peuvent échouer en silence

Trois traitements sont programmés pour s'exécuter tout seuls :

| Traitement | Fréquence | À quoi il sert | Conséquence s'il ne tourne pas |
|---|---|---|---|
| Relance des dossiers | tous les jours à 9 h | Relancer les clients dont le dossier attend des pièces depuis plus de 7 jours | **Des dossiers dorment sans que personne ne relance** |
| Alerte sur les retards | toutes les 2 heures | Signaler les dossiers qui dépassent les délais de traitement | **Les retards ne remontent plus** |
| Purge des données d'affiliation | tous les dimanches à 3 h | Supprimer les données de suivi de plus de 13 mois | **Non-conformité CNIL** sur la durée de conservation |

Les trois sont correctement programmés. Deux réserves cependant : la clé qui les autorise à s'exécuter n'est pas vérifiable depuis le dépôt de code — **c'est le premier contrôle à faire dans la console d'hébergement** ; et surtout, la façon dont ils sont lancés fait qu'**un refus d'exécution est compté comme un succès**. Un traitement peut donc ne rien faire depuis des semaines sans qu'aucune alerte ne se déclenche.

**Ce qui doit être fait :** vérifier la clé dans la console d'hébergement, et modifier le lancement pour qu'un échec devienne visible.

**Effort** : moins d'une heure. **Priorité** : immédiate.

---

## 5. Ce qui doit être corrigé

### 🟠 M-1 — Les services externes ne sont pas branchés en production

C'est **le constat le plus lourd en valeur commerciale**. Huit services sont prévus par la plateforme mais n'ont pas de clé d'accès configurée en ligne.

| Service | Ce qui ne fonctionne pas aujourd'hui | Enjeu |
|---|---|---|
| **Envoi d'emails** | Aucun email ne part : ni accusé de réception au client, ni alerte à l'équipe, ni invitation d'apporteur d'affaires | **Critique — commercial** |
| **Remontée d'erreurs** | Aucune panne n'est signalée ; les incidents restent invisibles | **Critique — exploitation** |
| **Anti-robot des formulaires** | Les formulaires publics ne sont pas protégés contre les envois automatisés | Important |
| **Emailing de prospection** | Le module d'emailing du centre d'appels est inactif | Selon calendrier commercial |
| **Paiement en ligne** | Aucune facture ne peut être encaissée | Selon calendrier commercial |
| **Signature électronique** | La signature est inerte | Selon calendrier commercial |
| **Téléphonie** | Ni appel sortant, ni SMS, ni remontée d'appels dans le centre d'appels | Selon calendrier commercial |
| **Mesure d'audience** | Aucune statistique d'usage n'est collectée | Confort |

**Ce qui doit être fait :** ouvrir les comptes correspondants et nous transmettre les clés d'accès. Nous recommandons de traiter d'abord l'envoi d'emails et la remontée d'erreurs — les deux premiers du tableau — qui n'ont aucune dépendance commerciale et débloquent immédiatement le parcours client.

**Effort de notre côté** : environ une journée une fois les accès fournis. **Action attendue de votre part** : ouverture des comptes.

### 🟠 M-2 — Aucun test automatisé

Il n'existe aujourd'hui aucun mécanisme qui vérifie automatiquement que la plateforme fonctionne toujours après une modification. Sur 45 000 lignes, cela signifie qu'**une modification dans un coin peut casser autre chose sans que personne ne s'en aperçoive** avant qu'un utilisateur ne le signale.

Toute la validation repose actuellement sur des campagnes de tests manuels — celles décrites dans le plan de recette qui accompagne ce document.

**Ce qui doit être fait :** mettre en place des tests automatiques, en commençant par les calculs financiers (simulateurs, score de pré-qualification, numérotation des factures, virements) où le rapport valeur/effort est le meilleur. Puis, dans un second temps, des tests de bout en bout sur les trois parcours critiques : dépôt d'une demande, traitement par un administrateur, signature.

**Effort** : 2 jours pour la première étape, 2 jours pour la seconde.

### 🟠 M-3 — Onze failles connues dans les bibliothèques utilisées

La plateforme s'appuie sur des bibliothèques externes, dont trois présentent des failles publiquement documentées — deux d'entre elles qualifiées d'importantes. Elles concernent le traitement des images et la génération des feuilles de style.

**Bonne nouvelle** : la correction est une commande standard, sans risque de rupture. **Effort** : quelques minutes.

### 🟠 M-4 — Retard de versions sur quatre briques majeures

Quatre briques centrales accusent un à quatre retards de version majeure — notamment le service de connexion des utilisateurs, dont la version utilisée **ne reçoit plus les correctifs de sécurité**.

Un point d'attention : la prochaine version du socle applicatif supprimera un outil de contrôle qualité que le projet utilise aujourd'hui. Cette migration doit donc être préparée, pas subie.

**Ce qui doit être fait :** planifier ces montées de version une par une, en commençant par le service de connexion. **Effort** : 2 à 3 jours répartis sur deux mois.

### 🟠 M-5 — Changer le rôle d'un utilisateur depuis le back-office ne tient pas

Le back-office propose de modifier le rôle d'un utilisateur — le passer administrateur, par exemple. **Cette modification ne dure pas.** Dès que la personne concernée navigue sur la plateforme, son rôle **retombe silencieusement à « client »**.

La raison : la véritable référence des rôles est le service de connexion externe, pas la base de données. Le back-office écrit dans la base ; le service de connexion réécrit par-dessus.

**Conséquence** : l'écran laisse croire à une action qui n'a pas d'effet. Un administrateur nouvellement promu perd ses droits sans explication.

**Ce qui doit être fait :** soit faire écrire le back-office dans le service de connexion en même temps que dans la base — c'est la bonne solution ; soit, à défaut, retirer le sélecteur de rôle et documenter que l'attribution se fait exclusivement dans la console du service de connexion. **Effort** : une demi-journée.

### 🟠 M-6 — Les comptes de démonstration ne peuvent pas se connecter

Les outils qui créent les comptes de démonstration visent un espace de connexion différent de celui réellement utilisé par la plateforme. Les comptes créés existent en base mais **ne correspondent à aucun compte réel** : impossible de s'y connecter.

**Ce qui doit être fait :** faire lire la configuration réelle à ces outils plutôt que de la figer, puis recréer les comptes de démonstration. **Effort** : 2 heures.

### 🟠 M-7 — Les outils de test peuvent écrire sur la production

Quatre outils internes écrivent en base de données sans vérifier laquelle. Combiné au constat B-1, le risque de destruction de données réelles est immédiat.

**Ce qui doit être fait :** ajouter un refus automatique dès que l'outil détecte qu'il vise la production. Traité en même temps que B-1.

### 🟠 M-8 — Le fichier de référence de configuration est périmé

Le fichier qui documente la configuration nécessaire décrit un service qui n'est plus utilisé, et omet deux réglages qui le sont. Un nouvel intervenant configure donc un service inutile et en oublie deux.

**Effort** : une heure.

### 🟠 M-9 — La documentation d'accueil décrit une architecture qui n'existe plus

Le premier fichier que lit un nouvel intervenant décrit un hébergement, un outil d'emails et une organisation de fichiers qui ont tous été remplacés. Il ne mentionne ni la base de données, ni la gestion des rôles, ni les traitements automatiques.

**En l'état, il oriente un nouvel arrivant à l'opposé de la réalité** — un coût caché sur chaque intervention future, et un risque si vous confiez un jour la plateforme à une autre équipe.

**Effort** : une demi-journée.

---

## 6. Points d'amélioration secondaires

Dix constats mineurs complètent l'audit. Ils n'ont pas d'impact immédiat sur l'exploitation mais méritent d'être traités dans la durée.

| Sujet | Nature |
|---|---|
| Une page de diagnostic technique expose des informations d'environnement sans authentification | Discrétion |
| Une page devenue inaccessible subsiste dans le code | Propreté |
| La protection contre les envois massifs perd son effet si l'application passe à plusieurs serveurs | Anticipation |
| Un ancien format d'autorisation reste accepté : un accès périmé conserve ses droits | Sécurité |
| Deux configurations concurrentes de traitements automatiques coexistent, avec des horaires différents | Risque d'erreur |
| Une réponse de la FAQ contenant certains caractères techniques peut casser l'affichage de la page | Fiabilité |
| Quatre fichiers dépassent 650 lignes et deviennent difficiles à faire évoluer | Maintenabilité |
| Un document d'entreprise (Kbis) est stocké dans le dépôt de code | Rangement |
| Le score de pré-qualification est calculé sur des critères incomplets : ancienneté, chiffre d'affaires et effectif de l'entreprise ne sont pas collectés | **À arbitrer avec vous** |
| Une documentation d'hébergement cite un service remplacé et un nom de domaine qui n'est pas le domaine officiel | Documentation |

Le point sur le **score de pré-qualification** est le seul de cette liste qui appelle une décision de votre part : souhaitez-vous que ces trois critères soient collectés lors du dépôt d'une demande, afin de fiabiliser la note attribuée automatiquement aux dossiers ?

---

## 7. Plan de correction proposé

### Lot 1 — Immédiat (1 journée)

Sécuriser l'existant. Aucune dépendance de votre côté, hors accès à la console d'hébergement.

| Action | Bénéfice |
|---|---|
| Séparer l'environnement de travail de la base de production | Supprime le risque de destruction de données |
| Ajouter des garde-fous dans les outils qui écrivent en base | Protection durable contre la même erreur |
| Vérifier la clé des traitements automatiques dans la console d'hébergement | Confirme que relances et alertes fonctionnent |
| Rendre visibles les échecs de traitements automatiques | Fin des pannes silencieuses |
| Supprimer la configuration concurrente héritée de l'ancien hébergement | Une seule source de vérité |
| Corriger les 11 failles de bibliothèques | Surface d'attaque réduite |

### Lot 2 — Sous deux semaines (3 à 5 journées)

Rendre la plateforme réellement opérationnelle commercialement. **Ce lot dépend de l'ouverture des comptes de service de votre côté.**

| Action | Bénéfice |
|---|---|
| Brancher l'envoi d'emails et valider les confirmations client | **Vos clients reçoivent enfin un accusé de réception** |
| Brancher la remontée d'erreurs | Les incidents deviennent visibles et traitables |
| Brancher la protection anti-robot des formulaires | Fin du spam sur les formulaires publics |
| Corriger les comptes de démonstration | Démonstrations et recette redeviennent possibles |
| Rendre effectif le changement de rôle depuis le back-office | L'écran fait ce qu'il annonce |
| Mettre à jour les documents de configuration et d'accueil | Toute intervention future coûte moins cher |
| Mettre en place les premiers tests automatisés | Filet de sécurité sur les calculs financiers |

### Lot 3 — Sous deux mois

Consolider et préparer l'avenir.

| Action | Bénéfice |
|---|---|
| Monter les quatre briques majeures en version courante | Retour sur le canal des correctifs de sécurité |
| Préparer la migration du socle applicatif | Migration maîtrisée plutôt que subie |
| Tests automatisés de bout en bout sur les 3 parcours critiques | Détection automatique des régressions |
| Traiter les 10 constats secondaires | Dette technique résorbée |
| Brancher paiement, signature électronique, téléphonie et emailing | Selon votre calendrier commercial |

---

## 8. Ce que nous attendons de votre part

Pour que le plan ci-dessus puisse se dérouler, trois éléments dépendent de vous :

1. **L'ouverture des comptes de service externes**, par ordre de priorité : envoi d'emails, remontée d'erreurs, protection anti-robot. Puis, selon votre calendrier commercial : paiement, signature électronique, téléphonie, emailing de prospection.
2. **L'accès à la console d'hébergement**, ou la vérification par vos soins d'un réglage précis que nous vous indiquerons — quelques minutes.
3. **Un arbitrage sur le score de pré-qualification** : souhaitez-vous collecter l'ancienneté, le chiffre d'affaires et l'effectif de l'entreprise lors du dépôt d'une demande ?

---

## 9. Conclusion

La plateforme est **prête sur le fond**. Ce qui manque n'est pas du développement, mais du branchement et de la surveillance.

Le Lot 1 supprime le risque de perte de données en une journée. Le Lot 2 rend la plateforme réellement exploitable commercialement — c'est celui qui a le plus d'impact visible pour vos clients, et il dépend principalement de l'ouverture de vos comptes de service. Le Lot 3 sécurise les mois à venir.

**Prochain audit recommandé** : à l'issue du Lot 2, soit fin septembre 2026.

---

| Version | Date | Objet |
|---|---|---|
| 1.0 | 08/09/2026 | Version initiale, destinée à la direction |
