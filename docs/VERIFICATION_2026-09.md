# Rapport de vérification — Finarent

**Date** 10 septembre 2026, **révisé le 12** (voir la rectification en 3.3) · **Périmètre** les 21 constats de `docs/AUDIT_2026-09.md`, plus ce que la vérification a révélé au-delà · **Documents liés** `docs/PLAN_CORRECTION_2026-09.md` (la feuille de route), `docs/TESTS_DEBUTANT.md` (la procédure que vous pouvez suivre vous-même)

Ce document répond à une seule question : **qu'est-ce qui a été corrigé, et comment le savons-nous ?**

Chaque affirmation qui suit est adossée à une preuve reproductible — une commande qui passe, un test qui échouerait si le défaut revenait, une requête réellement envoyée à l'application. Ce qui n'a pas pu être prouvé est dit comme tel, et rangé dans la section « Ce qui reste ouvert ». Une correction non vérifiée n'est pas une correction.

---

## 1. Méthode

Trois moyens de vérification ont été employés, du moins concluant au plus concluant.

| Moyen | Ce qu'il établit | Sa limite |
|---|---|---|
| **Lecture du code** | Qu'une protection est écrite | Ne dit pas qu'elle fonctionne |
| **Tests automatisés** | Qu'une règle se comporte comme prévu, et qu'elle continuera de le faire | Ne couvre que la logique isolée |
| **Appels réels à l'application** | Que le comportement observé est le bon | Ne couvre pas ce qui exige une connexion |

Les quatre revues de code ont porté sur les **100 routes** de la plateforme, lues intégralement. La campagne d'exécution a réellement appelé **145 combinaisons adresse + action** sur une application démarrée, avec une base de données peuplée.

**Un point de méthode mérite d'être signalé**, parce qu'il conditionne la confiance à accorder au reste. Une première campagne a produit 45 erreurs graves. Elles étaient **fausses** : plusieurs vérifications tournaient en parallèle dans le même dossier et s'écrasaient mutuellement des fichiers de travail. La campagne a été rejouée sur une copie isolée, et les 45 erreurs ont disparu. Sans cette contre-vérification, ce rapport vous aurait annoncé 45 pannes inexistantes.

---

## 2. État de la vérification automatique

| Contrôle | Avant | Après |
|---|---|---|
| Tests automatisés | **0** | **538**, répartis sur 24 fichiers, tous au vert |
| Contrôle des types | passait | passe, verrouillé par l'intégration continue |
| Contrôle de style | passait, sur 263 fichiers | passe, sur **536** — les 273 fichiers d'interface en étaient absents (voir 4.6) |
| Failles connues dans les bibliothèques | 13 | **4**, toutes issues d'une même brique et corrigibles seulement par sa montée de version |
| Intégration continue | inexistante | en place, sur chaque modification |

L'audit annonçait « aucun test automatisé ». C'était juste au moment de sa rédaction. La plateforme en compte aujourd'hui 538, qui couvrent en priorité ce qui coûte cher quand c'est faux : les calculs financiers, la numérotation comptable, les fichiers de virement bancaire, le chiffrement, et les règles d'accès aux dossiers.

L'intérêt de ces tests n'est pas leur nombre. C'est qu'ils **échoueront si le défaut revient**. Chaque correction décrite plus bas est accompagnée du test qui la garde.

---

## 3. Ce qui a été corrigé

### 3.1 Le risque de destruction de données (constat B-1)

L'environnement de développement ne travaille plus sur des données réelles : une base de développement locale est en service, et une garde automatique refuse toute commande d'écriture visant une base distante.

Cette garde a été **étendue au-delà de ce que le plan prévoyait**, pour une raison concrète exposée en section 5 : elle ne couvrait que les scripts maison, alors que ce sont les commandes de base de données ordinaires qui sont dangereuses. Elles y passent désormais toutes, et affichent la base réellement visée avant d'agir.

> **Preuve** — contre une base distante, la commande s'interrompt sans rien toucher et affiche le motif du refus. Contre la base locale, elle s'exécute normalement en affichant `localhost`.

### 3.2 Les traitements automatiques silencieux (constat B-2)

Les trois traitements programmés (relances, alertes de retard, purge des données d'affiliation) ne peuvent plus échouer en silence. Trois changements :

- un refus d'exécution est désormais compté comme un **échec**, et non comme un succès ;
- chaque passage est **enregistré** — date, durée, nombre d'éléments traités, et l'erreur le cas échéant ;
- un écran d'administration liste les trois tâches avec leur dernier succès et signale celles qui ont dépassé leur délai.

Ce troisième point traite un angle mort que le plan avait identifié : un traitement qui **ne se déclenche pas du tout** ne produit aucun échec, donc aucune alerte. Seule la date du dernier succès permet de le détecter.

### 3.3 Le changement de rôle qui ne tenait pas (constat M-5)

Le back-office écrivait le rôle en base ; le service de connexion le réécrivait par-dessus à la visite suivante. L'écran annonçait une action sans effet.

Le back-office écrit désormais **d'abord dans le service de connexion**, et en base seulement si celui-ci a accepté. Si la configuration nécessaire manque, l'écran **refuse franchement** au lieu d'afficher un faux succès.

> **Rectification du 12 septembre 2026 — à lire.** La version du 10 septembre de ce rapport présentait ce point comme réglé et « opérationnel ». **C'était faux, et l'erreur est de notre fait.**
>
> Ce que nous avions vérifié : que la plateforme parvient bien à écrire chez le service de connexion. Ce que nous en avions conclu : que le changement de rôle fonctionne. La seconde affirmation ne découle pas de la première. La plateforme écrivait la bonne information **au mauvais endroit** : la règle de connexion réellement en service chez le prestataire lit une autre donnée que celle que nous écrivions. Le rôle était donc bien transmis, accepté, enregistré — et ignoré. Il retombait à l'ancien à la reconnexion suivante, c'est-à-dire exactement le défaut que la correction devait supprimer, déplacé d'un cran.
>
> Le défaut a été trouvé en préparant les comptes de recette, pas par nos vérifications. C'est instructif : aucun test ne couvrait ce module, et une vérification qui s'arrête au premier maillon ne prouve rien sur le second.
>
> **Corrigé depuis** : la plateforme écrit désormais les deux formes, en commençant par celle que la règle en service lit réellement, et retire l'ancien rôle au passage — sans quoi les rôles s'additionnent et c'est le hasard qui tranche. **7 tests** couvrent maintenant ce module, dont un qui vérifie qu'en cas d'échec, aucun succès de façade n'est produit.
>
> **Ce qui reste à prouver** : un administrateur promu depuis le back-office, qui se déconnecte, se reconnecte, et conserve ses droits. Cette vérification demande un compte réel sur le service de connexion — elle figure au protocole de test qui accompagne ce document, et nous ne la déclarerons faite qu'une fois constatée.

### 3.4 Les accès entre comptes

C'est la famille de défauts la plus grave que la revue ait mise au jour, et elle ne figurait dans aucun audit. Six situations permettaient à un compte d'atteindre les données d'un autre :

| Situation | Ce qui était possible |
|---|---|
| Rattachement par adresse email | Ouvrir un compte avec l'adresse d'un tiers donnait accès à son dossier complet |
| Comparaison de rattachements vides | Un compte partenaire sans rattachement lisait les messages et téléchargeait les pièces de **tous** les dossiers déposés en direct |
| Rôle assureur non borné | Tout compte assureur accédait à la messagerie de n'importe quel dossier |
| Partenaire sans rattachement | Recevait la liste de tous les dossiers non attribués |
| Assureur et dossiers de financement | Pouvait approuver ou refuser un dossier hors de son domaine |
| Signature d'offre | Une offre en brouillon, refusée ou expirée pouvait être signée |

Le mécanisme commun : une comparaison entre deux identifiants **tous deux vides** était tenue pour une preuve d'appartenance. En informatique, « rien » est alors égal à « rien », et la porte s'ouvre. Une règle unique et partagée corrige les six cas : **une absence de rattachement ne vaut jamais appartenance**.

> **Preuve** — 35 tests dédiés, dont ceux qui vérifient explicitement le cas « les deux sont vides » et le cas « bon rôle, mais aucun rattachement ».

### 3.5 L'acceptation des conditions générales

Un brouillon de demande enregistré à la dernière étape rouvrait le formulaire directement sur le récapitulatif — où le bouton d'envoi ne vérifiait rien. **La demande partait sans que les conditions générales aient été acceptées.**

Trois verrous ont été posés : le formulaire ne peut plus s'ouvrir au-delà de l'étape des conditions, l'envoi vérifie l'ensemble des étapes, et surtout **le serveur refuse désormais toute demande sans acceptation**. Ce dernier point est le seul qui compte juridiquement : une vérification qui ne vit que dans le navigateur s'écarte en quelques secondes.

Le texte exact accepté et l'horodatage sont conservés avec le dossier.

### 3.6 Les chiffres affichés aux clients

Quatre défauts de calcul, tous sur des écrans qui engagent commercialement.

| Défaut | Ce qui s'affichait | Ce qui s'affiche |
|---|---|---|
| **TAEG à taux nul** | **« 0,00 % »** — un calcul impossible présenté comme un taux nul | Un taux réel — 5,42 % pour 10 000 € sur 12 mois à 0 % avec 300 € de frais ; et « — » quand le calcul est impossible |
| **Fichier de virement bancaire** | Un total incohérent avec le détail des lignes, entraînant le **rejet du lot entier par la banque** | Total et lignes arrondis une seule fois, donc toujours cohérents |
| **Jours fériés** | Une date d'exécution tombant un 1ᵉʳ janvier | Report au premier jour ouvré bancaire réel |
| **Comparateur d'assurance** | 1 000 € d'économie annoncés au lieu de 990 € | Le bon montant |

Le premier est le plus sérieux : un financement à 0 % avec frais de dossier — l'offre constructeur classique, celle qu'on présente comme un « crédit gratuit » — affichait un TAEG nul alors qu'il ne l'est pas. C'est un sujet de conformité, pas de confort.

> **Preuve** — l'extraction des formules de crédit-bail et de location a été comparée à l'ancien code sur **1 210 572 combinaisons** couvrant tout le domaine des curseurs : aucun écart. Les corrections ne changent donc que ce qui était faux.

### 3.7 Les exports vers Excel

Les cinq exports de la plateforme passaient les données brutes dans le fichier. Or certaines de ces données proviennent de formulaires **publics, sans authentification** : un visiteur anonyme pouvait donc choisir le contenu d'une cellule qu'Excel exécuterait comme une formule sur le poste de l'administrateur qui ouvre le fichier.

Les cinq exports sont désormais neutralisés, avec deux arbitrages qui méritent d'être connus : les montants négatifs restent des nombres (les neutraliser aurait cassé vos totaux Excel), et les numéros de téléphone commençant par `+33` sont protégés — sans quoi Excel mangeait l'indicatif.

### 3.8 La facturation

- **Rejeu de paiement** — un même événement de paiement reçu deux fois créait deux règlements et doublait le montant encaissé. Les événements sont désormais dédoublonnés, et le montant mis à jour de façon indivisible.
- **Numérotation** — deux factures créées simultanément pouvaient recevoir le même numéro ; et au-delà de 9 999 factures dans l'année, le numéro 10 000 était réattribué indéfiniment. Corrigé.
- **Trous de séquence** — un brouillon consommait un numéro comptable, définitivement perdu s'il était supprimé. Un brouillon porte maintenant un numéro provisoire ; le numéro comptable n'est attribué qu'à l'émission.
- **Statuts** — une facture jamais encaissée pouvait être passée en « payée ». Les transitions sont désormais contrôlées.

### 3.9 Le reste

- **Page de diagnostic** — n'expose plus les informations d'environnement et ne pollue plus les journaux.
- **Réponses de la FAQ** — une réponse contenant certains caractères techniques ne peut plus casser l'affichage de la page.
- **Parcours de dépôt** — le composant de 1 089 lignes qui porte le chiffre d'affaires est découpé en 15 fichiers lisibles, **à comportement strictement identique** : les données envoyées ont été comparées champ par champ, avant et après.
- **Documentation** — le fichier d'accueil décrivait un hébergement, un service d'emails et une organisation de fichiers qui n'existent plus. Il a été réécrit à partir du code.
- **Quotas de formulaires** — le compteur, jusqu'ici gardé en mémoire (donc perdu à chaque redémarrage et sans effet sur plusieurs serveurs), est désormais conservé en base.

---

### 3.10 Le client peut enfin voir et accepter ses offres

Relevé à la rédaction du guide de test, et tranché par vous le 10 septembre.

Le constat de départ était qu'aucun bouton ne permettait d'accepter une offre. La réalité était plus large : **l'espace client n'affichait aucune offre**, et la page ne les chargeait même pas. Le client ne voyait donc jamais ce qui lui était proposé — sur une plateforme dont c'est précisément l'objet. La route serveur d'acceptation, elle, existait depuis longtemps et n'était appelée par rien.

Ce qui a été construit :

- un onglet **Offres** qui présente montant, mensualité, taux, coût total, partenaire et date limite d'acceptation ;
- un **bouton d'acceptation** qui demande une confirmation rappelant le montant et la durée — accepter engage, ce n'est pas un clic anodin ;
- l'affichage **du motif exact renvoyé par le serveur** en cas de refus : « offre expirée » et « offre déjà acceptée » ne veulent pas dire la même chose pour celui qui les lit ;
- une offre encore **en préparation reste invisible** du client : elle n'a jamais été transmise, elle n'existe pas pour lui.

> **Preuve** — 5 tests sur la règle de visibilité. L'un d'eux a d'ailleurs révélé un défaut de la règle que nous venions d'écrire : une offre au statut inconnu était **montrée** au lieu d'être masquée. Corrigé dans le sens qui ferme par défaut.

**Ce qui n'est pas prouvé** : le parcours complet — un vrai client acceptant une vraie offre — n'a pas été exercé, faute de session de connexion automatisable. C'est l'un des tests du guide manuel qui accompagne ce document.

---

## 4. Ce que l'audit n'avait pas vu

Cinq constats sont apparus pendant les travaux. Aucun n'était dans les 21 de l'audit.

### 4.1 La remontée d'erreurs n'était pas branchée du tout

L'audit disait « il manque la clé ». C'était incomplet : les fichiers de configuration existaient et étaient corrects, mais **rien ne les chargeait**. Le mécanisme de chargement a changé dans une version récente de la brique utilisée, et le projet était resté sur l'ancien.

Conséquence : poser la clé n'aurait **rien remonté**. Le câblage manquant a été ajouté.

### 4.2 Le déploiement avalait les échecs de mise à jour de la base

Si la mise à jour de la base échouait au déploiement, le script écrivait un avertissement et **poursuivait**. L'application partait donc en ligne avec une base désalignée du code — des erreurs pour les clients, sans qu'aucune étape n'apparaisse en échec.

C'est la même faute que les traitements automatiques silencieux, mais sur le chemin du déploiement. Un commentaire du fichier indiquait que ce mécanisme avait déjà effacé des colonnes en production. **Un échec de mise à jour interrompt désormais le déploiement**, avec un contournement d'urgence explicite et documenté.

### 4.3 L'historique de la base était irrejouable

Constat le plus lourd techniquement, confirmé indépendamment par deux vérifications.

L'historique des mises à jour de la base ne permettait pas de reconstruire la base à partir de zéro : il s'arrêtait en erreur à la cinquième étape sur dix-huit. **23 tables sur 41 n'y figuraient pas** — elles avaient été créées par une commande qui aligne la base sans laisser de trace dans l'historique.

Conséquences concrètes : impossible de monter un environnement de recette, impossible de vérifier qu'une sauvegarde se restaure, et impossible d'utiliser la commande normale de mise à jour de la base.

Trois migrations de rattrapage ont été écrites, dont deux antidatées pour s'insérer au bon endroit de l'histoire.

> **Preuve** — l'historique complet est rejoué sur une base vide, puis le résultat est comparé au modèle de référence : **aucun écart**. La même opération sur la base existante, avec ses données, ne modifie rien (14 comptes, 15 dossiers, 57 lignes d'historique inchangés).

### 4.4 Neuf index manquaient en base

En réparant l'historique, il est apparu que neuf index — dont celui qui permet de retrouver les dossiers d'un client — **n'existaient dans aucune base**. L'historique affirmait qu'ils avaient été créés ; ils ne l'avaient jamais été.

Sans eux, chaque affichage de l'espace client parcourt la table entière. Invisible aux volumes actuels, pénalisant dès qu'ils montent. Ils sont créés.

### 4.5 L'environnement de développement envoie de vrais emails

Le relais d'envoi est configuré en local : une campagne de test a expédié **deux messages réels**, dont un vers l'adresse d'administration. Un développeur qui rejoue un dépôt de demande écrit donc à de vraies personnes.

C'est exactement la faute du constat B-1 — l'environnement de travail branché sur du réel — transposée au canal email. Corrigé : hors production, le message est affiché dans la console et déposé dans un dossier local, jamais expédié. Une variable d'environnement explicite permet de rétablir l'envoi réel quand on en a besoin.

La même garde a été posée sur les écritures dans la base de contacts marketing : s'inscrire à la newsletter depuis un poste de développement ajoutait une **vraie** adresse à la **vraie** liste, et un désabonnement de test plaçait une vraie adresse en liste de suppression.

### 4.6 Le contrôle de style ne regardait qu'un tiers du code

Celui-ci mérite d'être raconté, parce que **nous l'avons introduit nous-mêmes** au cours de ces travaux.

Le plan prévoyait de remplacer la commande de contrôle de style, appelée à disparaître dans la prochaine version du socle applicatif. Le remplacement a été fait, et le contrôle est resté au vert. Il ne regardait pourtant plus la même chose : l'ancienne commande couvrait les fichiers d'interface, la nouvelle ne les connaît pas par défaut. **273 fichiers — la totalité de l'interface React — n'étaient plus analysés par personne**, ni par le contrôle de style, ni par le contrôle des types.

Une fois le périmètre rétabli, 157 anomalies sont apparues. Après examen : 145 étaient des apostrophes dans du texte français, sans conséquence, et la règle correspondante a été désactivée avec justification. Douze concernaient des liens de connexion, **volontairement** écrits d'une façon que l'outil désapprouve — les convertir aurait cassé l'authentification. L'exception est désormais documentée à chacun des douze endroits, pour qu'un intervenant futur ne la « corrige » pas. La dernière était un vrai défaut d'écriture, corrigé.

La leçon vaut d'être retenue : **une migration qui préserve la commande mais en perd le périmètre est une migration ratée**, et elle est indétectable — le contrôle passe au vert d'autant plus facilement qu'il regarde moins de choses.

### 4.7 Soixante pages, dont l'accueil, ne renvoyaient aucun contenu

Une campagne a appelé les 146 adresses du site en conditions de production. Verdict : **60 pages ne renvoyaient qu'un marqueur technique de quelques dizaines d'octets** au lieu de leur contenu.

Un visiteur ne voyait rien d'anormal — son navigateur reconstituait la page. Mais un moteur de recherche, lui, recevait une page vide. Sur une plateforme dont le métier est d'attirer des demandes de financement, c'était le référencement de tout le site public qui tombait, sans le moindre symptôme visible.

La cause était une seule ligne du gabarit commun : une frontière technique posée autour de **toute** la page au lieu des deux petits composants de suivi qui la nécessitaient. Tout ce qu'elle englobait basculait en rendu navigateur.

| Page | Texte servi avant | Après |
|---|---|---|
| Accueil | 67 caractères | **11 901** |
| Conditions générales de vente | 42 | **28 101** |
| Partenaires | 63 | **15 321** |
| Foire aux questions | 57 | **7 059** |
| Simulateurs | 54 | **6 073** |

Deux défauts voisins tombaient avec le même correctif : une page inexistante répondait « tout va bien » au lieu de « introuvable » — les moteurs indexaient donc des adresses mortes — et la page de contact avait sa propre frontière mal placée, qui l'aurait laissée vide malgré la correction du gabarit.

> **Preuve** — 31 pages statiques et 28 simulateurs publics vérifiés un à un en build de production : aucun échec. Les pages déjà correctes sont inchangées à l'octet près, et le suivi des apporteurs d'affaires a été contrôlé à l'exécution, inchangé.

---

## 5. L'incident du 9 septembre

Nous le rapportons parce qu'il illustre précisément le risque que le plan de correction visait, et parce qu'il a conduit à renforcer la protection au-delà de ce qui était prévu.

**Ce qui s'est passé.** Le fichier de configuration locale contient plusieurs lignes désignant la base de données : une locale, et une distante normalement neutralisée. En ajoutant des clés dans ce fichier, la ligne distante a été réactivée. Le mécanisme de lecture de ce fichier retient la **dernière** occurrence d'une clé, pas la première : la base distante l'a donc emporté silencieusement. Une commande de mise à jour de la base lancée pour l'environnement local est partie sur la base distante.

**Impact réel, mesuré.** Deux tables vides ajoutées, un type, trois index, une ligne d'historique. Opération purement additive : **aucune donnée existante lue, modifiée ou supprimée**. La base concernée n'est pas celle de production, mais un addon hors inventaire déjà signalé par l'audit.

**Ce que nous en avons tiré.** La garde anti-production existante n'aurait pas pu l'empêcher : elle ne protégeait que les scripts maison, pas les commandes de base de données ordinaires — précisément celles que le plan désignait comme dangereuses. Elle a été étendue, et affiche désormais la base réellement visée avant toute opération.

Si la migration en cause avait comporté une suppression de colonne au lieu d'un ajout de table, l'issue aurait été tout autre. C'est la raison pour laquelle nous le documentons plutôt que de le passer sous silence.

---

## 6. Ce qui reste ouvert

### Ce qui dépend de vous

| Sujet | Ce qui manque |
|---|---|
| Remontée d'erreurs | Un compte à ouvrir. Le câblage est fait, la clé suffit. |
| Envoi d'emails en production | Les identifiants sont renseignés en local ; leur validité en production reste à confirmer, ainsi que les réglages anti-usurpation du domaine. |
| Paiement, signature, téléphonie, emailing | Comptes à ouvrir selon votre calendrier commercial. |
| Facture d'hébergement | L'application est sous le coup d'une suspension pour impayé. Ce point conditionne tout le reste. |
| Score de pré-qualification | Un arbitrage : souhaitez-vous collecter l'ancienneté, le chiffre d'affaires et l'effectif à la demande ? |

### Ce qui reste à faire de notre côté

| Sujet | Pourquoi ce n'est pas fait |
|---|---|
| Montée de version du service de connexion | Chantier à mener sur une branche dédiée, avec recette des sept profils. C'est le seul travail capable de rendre la plateforme inaccessible s'il est mal conduit. |
| Montée de version des trois autres briques | À planifier une par une ; l'une d'elles supprime un outil que le projet utilise. |
| Tests de bout en bout | Trois parcours à couvrir. Le découpage du formulaire de demande, prérequis, est fait. |
| Environnement de recette | Devenu possible seulement maintenant que l'historique de base est réparé. |
| Restauration de sauvegarde testée | Une sauvegarde jamais restaurée n'est pas une sauvegarde. |

### Ce qui n'a pas pu être vérifié

Il faut le dire clairement : **les parcours nécessitant une connexion n'ont pas été testés automatiquement.** La campagne d'exécution a vérifié que les 116 adresses protégées refusent bien un visiteur non connecté — y compris avec un identifiant réel tiré de la base, et sans jamais laisser fuir la moindre donnée. Mais ce qui se passe **une fois connecté**, et notamment le cloisonnement entre deux clients ou entre deux profils, n'est établi que par la lecture du code et par les tests unitaires.

C'est précisément ce que la procédure de test manuelle qui accompagne ce document permet de couvrir, et pourquoi nous vous invitons à la dérouler.

---

## 7. En résumé

La plateforme était moins prête que l'audit ne le laissait penser, et elle l'est nettement plus aujourd'hui.

Moins prête, parce que quatre mécanismes que l'on croyait en place ne l'étaient pas du tout : la remontée d'erreurs, la protection anti-robot des formulaires, la capacité à reconstruire la base, et le référencement de soixante pages qui ne renvoyaient rien aux moteurs de recherche. Parce que six chemins permettaient à un compte d'atteindre les données d'un autre. Et parce que le contrôle de qualité automatique ne regardait qu'un tiers du code — il passait au vert d'autant plus facilement.

Plus prête, parce que ces points sont corrigés, et surtout parce que la plateforme dispose maintenant de ce qui lui manquait le plus : **538 tests qui échoueront si ces défauts reviennent**, une intégration continue qui les exécute à chaque modification, et des échecs qui se voient au lieu de passer inaperçus.

Ce qui reste tient en deux catégories : ce qui attend l'ouverture de vos comptes de service, et deux montées de version à conduire posément. Rien de tout cela n'est bloquant pour l'exploitation, à l'exception de la facture d'hébergement.

Un dernier mot sur la méthode, parce qu'il en dit plus que la liste des correctifs. Ce rapport ne vous annonce pas que « tout fonctionne ». Il vous dit ce qui a été prouvé, par quel moyen, et ce qui ne l'a pas été — notamment les parcours nécessitant une connexion, que seule la procédure de test manuelle qui l'accompagne permettra de valider. **C'est précisément parce que la plateforme s'est longtemps déclarée en bonne santé sans que rien ne le vérifie qu'elle en est arrivée là.**

---

*Rapport établi le 10 septembre 2026. Les preuves citées sont reproductibles : chaque commande de vérification figure dans `docs/PROCEDURES_EXPLOITATION.md`.*
