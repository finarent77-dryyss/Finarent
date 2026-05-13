# Brief Design — Finarent

> Brief exhaustif destiné à un agent Claude Design (ou tout designer humain) pour produire **toutes** les maquettes du site Finarent. Couvre chaque page, état, breakpoint et composant transverse. Le code existant utilise Next.js 15 App Router + Tailwind v4 + Framer Motion + Auth0. Ne change rien à l'arborescence — produis seulement des écrans visuels.

---

## 0. Contexte produit

**Finarent** (ex-Finassur) est une plateforme de **courtage en financement et assurance pour entreprises et particuliers**.
Trois métiers :

1. **Financement pro & particulier** — prêts immobiliers, crédits conso/auto, leasing, LOA, prêt pro.
2. **Assurances** — emprunteur, RC Pro, auto, habitation, santé/prévoyance.
3. **Comparateur & simulateurs** — 41 outils en ligne pour estimer, comparer, qualifier.

Quatre audiences sur la plateforme :

| Audience | Espace | Rôle Auth0 |
|---|---|---|
| Visiteur / prospect | Pages publiques | aucun |
| Client (particulier ou entreprise) | `/espace` | `CLIENT` |
| Admin Finarent | `/admin` | `ADMIN` |
| Partenaire bancaire | `/partner` | `PARTNER` |
| Assureur | `/insurer` | `INSURER` |

---

## 1. Brand & design tokens

### Couleurs (CSS variables, déjà définies dans `app/globals.css`)

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#0A2540` | Bleu nuit corporate — titres, header, navigation, hero foncé, badges sérieux |
| `--color-secondary` | `#6366F1` | Indigo — CTA secondaires, focus rings, accents interactifs |
| `--color-accent` | `#10B981` | Émeraude — succès, scoring positif, validation, CTA confiance |
| `--gradient-bg` | `linear-gradient(to right, secondary → accent)` | CTA principaux, hero glow, badges premium |
| Neutres | `slate-50 → slate-900` | Backgrounds, textes secondaires, séparateurs |
| Status | `red-*`, `amber-*`, `emerald-*`, `violet-*`, `rose-*`, `sky-*` | Voir patterns §11 |

### Typographie

- Sans-serif système (déjà chargé via Next font), poids `400 / 500 / 600 / 700 / 900`
- Hiérarchie : `h1 4xl→6xl black tracking-tight` · `h2 2xl→3xl black` · `h3 lg→xl bold` · `body sm→base`
- Mono : pour références demande (`FIN-2026-XXXX`), SIREN

### Composants base (classes Tailwind existantes)

```css
.btn-primary    /* bg-linear-to-r from-secondary to-accent, white, rounded-xl, hover scale */
.btn-secondary  /* bg-white, border-2 slate-200, primary text */
.btn-outline    /* border-2 secondary, transparent → secondary fill */
.input-field    /* border-2 gray-200, focus secondary, rounded-xl */
.gradient-text  /* clip text + gradient secondary→accent */
```

### Radius, shadow, spacing

- Radius standard : `rounded-xl` (12px) pour inputs/CTA, `rounded-2xl` (16px) pour cards, `rounded-full` pour badges/pills
- Shadow : `shadow-sm` (cards au repos), `shadow-md` (hover), `shadow-xl/2xl` (CTA actifs, modales)
- Padding cards : `p-4 sm:p-6`, sections hero `py-32`, sections standard `py-16 sm:py-24`
- Grid container : `container mx-auto px-4 sm:px-6 max-w-7xl`

---

## 2. Layout shell global

### Header (sticky top)
- Logo Finarent à gauche
- Nav desktop : **Accueil · Solutions ↓ · Simulateurs ↓ · Assurance · Pourquoi Finarent · Blog · Contact**
- Solutions ↓ = mega-menu listant les 6 produits (PRET_PRO, CREDIT_BAIL, LOA, LLD, LEASING_OPS, RC_PRO)
- Simulateurs ↓ = mega-menu des 5 catégories (cf §6) + lien "Voir tous"
- À droite : sélecteur langue FR/EN, bouton **Espace client** (si connecté : avatar + prénom ; sinon : "Se connecter")
- Variantes : transparent sur fond sombre (home hero), opaque sur scroll/fond clair
- Mobile : drawer hamburger, full-screen, items en accordéon

### Footer
- 4 colonnes : Société (about, contact, blog) · Produits (solutions, simulateurs) · Légal (mentions, CGU, privacy) · Réseaux + langue
- Bandeau bas : copyright, ORIAS n°, logos partenaires (banques)

---

## 3. Composants partagés à dessiner

| Composant | Usage | Variantes |
|---|---|---|
| `Hero` | Top de chaque page marketing | `default` (gradient), `dark` (primary bg + glow), `split` (image droite) |
| `SectionHeader` | Titre + sous-titre + badge optionnel | aligné gauche / centre |
| `Card` | Pavé info, simulateur, témoignage | `default` (white) · `featured` (gradient border) · `interactive` (hover lift) |
| `Badge` | Status, score, catégorie | 5 couleurs (cf statuts §7) · `dot` · `icon` · `plain` |
| `ConversionCTA` | Tunnel bas de page sim | `default` (banner primary) · `inline` (2 boutons côte à côte) |
| `BreadCrumb` | Sous header sur pages internes | Style discret slate-500 |
| `EmptyState` | Listes vides | icône + texte + CTA |
| `ProgressStepper` | Wizard 5 étapes (cf §7.2) | desktop horizontal · mobile compact |
| `FormField` | Input/Select/Textarea avec label, hint, error | `default` · `readonly` · `error` · `success` (SIREN trouvé) |
| `FAQItem` | Accordéon question/réponse | collapse animé Framer |
| `ScrollReveal` | Wrapper fade-up au scroll | déjà existant |
| `Avatar` | Initiales sur cercle gradient | 3 tailles (sm/md/lg) |
| `Toast` | Notifications post-action | success/error/info |
| `Modal/Drawer` | Édition admin, détails demande | desktop modal centré · mobile drawer bas |
| `Skeleton` | Loaders pendant fetch | `card` · `row` · `chart` |
| `Chart` | Stats admin / partner | line · bar · donut (slate-200 grid, secondary fills) |
| `KanbanCard` | Glisser-déposer demandes admin | dnd-kit, shadow on drag |
| `LangSwitcher` | FR/EN flag toggle | pill `bg-slate-100` |
| `LoginCTA` | Bloc se connecter (espace privé) | bouton Auth0 + lien retour |

---

## 4. Pages publiques (marketing) — 17 écrans

### 4.1 `/` — Accueil
- **Hero plein écran** : titre `Financez votre projet en 48h`, sous-titre, 2 CTA (Faire une simulation · Être recontacté), visuel droite (illustration 3D ou photo équipe), badge ORIAS
- **Section "Comment ça marche"** : 4 étapes en cards horizontales (Simulez → Soumettez → Comparez → Signez)
- **Section produits** : 6 cards (les 6 ProductTypes) avec icônes + CTA
- **Section chiffres clés** : 4 stats (clients, partenaires bancaires, M€ financés, satisfaction)
- **Témoignages slider** : 3 cards rotation
- **Section "Pourquoi Finarent"** : 3 piliers (gratuit, rapide, indépendant)
- **CTA final** : bandeau gradient + bouton

### 4.2 `/about` — À propos
- Histoire de l'entreprise · Équipe (cards portraits) · Valeurs · Logos partenaires · Certifications ORIAS

### 4.3 `/contact` — Contact / mise en relation
- Formulaire double objet : **Financement** ou **Assurance**
- Champs : raisonSoc, SIREN (avec lookup auto API SIRENE), secteur, montant, équipement, contact, message
- État spécial : **pré-rempli depuis simulateur** (lecture `?simulator=…&category=…&amount=…&months=…` — voir `lib/simulators/prefill.js`) → bandeau vert "Prérempli depuis votre simulation : XXX"
- Sidebar droite : coordonnées (téléphone, email, adresse, horaires), carte (option)
- Confirmation après envoi : référence + ETA 48h

### 4.4 `/process` — Notre processus
- Frise visuelle des 4 étapes détaillées · Délais réels · FAQ rapide

### 4.5 `/why-leasing` — Pourquoi le leasing
- Comparatif crédit vs leasing (tableau) · Avantages fiscaux · Use cases sectoriels · CTA vers `/simulateurs`

### 4.6 `/assurance` — Page assurance
- Hero spécifique · 6 types d'assurance (cards) · CTA assurance emprunteur · CTA RC Pro

### 4.7 `/comparateur` — Comparateur
- Tableau interactif banque × produits · Filtres (montant, durée, type) · Vue cards mobile

### 4.8 `/solutions` — Liste solutions
- Grid 6 cards (1 par ProductType) → chaque card linke vers `/solutions/[id]`

### 4.9 `/solutions/[id]` — Détail solution
- Hero spécifique au produit · Sections : Pour qui · Comment ça marche · Tarifs indicatifs · FAQ · CTA simulateur lié

### 4.10 `/sectors` — Liste secteurs
- Grid des 8 secteurs (BTP, Médical, Tech, Transport, Industrie, Services, Commerce, Autre) → cards illustrées

### 4.11 `/sectors/[id]` — Détail secteur
- Use cases métier · Financements adaptés · Témoignages secteur · Statistiques · CTA contact

### 4.12 `/testimonials` — Témoignages
- Grid cards (3 col desktop, 1 mobile) · Filtre par secteur/montant · Note moyenne en hero

### 4.13 `/blog` — Liste blog
- Featured article en haut · Grid 3 col articles · Pagination · Filtre catégorie

### 4.14 `/blog/[id]` — Article blog
- Hero image + titre + meta (date, auteur, temps lecture) · Body markdown · Articles liés · CTA newsletter

### 4.15 `/faq` — FAQ
- Recherche en haut · Accordéon par catégorie · CTA contact si pas de réponse

### 4.16 `/legal`, `/privacy`, `/terms` — Légal
- Sommaire latéral collant · Body texte longue forme · Date de mise à jour

### 4.17 `/simulator` (legacy) — Simulateur unifié
- Calculatrice rapide montant + durée + résultat, **dépréciée** au profit de `/simulateurs/*` mais à conserver visuellement cohérent

---

## 5. Simulateurs — 43 écrans (1 hub + 1 layout + 41 outils)

### 5.1 `/simulateurs` — Hub
- Hero : badge "41 simulateurs · 41 actifs", titre `Tous nos simulateurs financiers`
- **5 sections par catégorie**, chaque section :
  - Header : icône colorée, nom, description, badge `N outils`
  - Grid de cards (2 col mobile · 4 col desktop) ; chaque card = icône + nom + tagline + CTA "Simuler →"
- Catégorie 1 — **Crédit immobilier** (indigo) — 20 outils
- Catégorie 2 — **Crédit conso/auto** (amber) — 5 outils
- Catégorie 3 — **Crédit professionnel** (sky) — 4 outils
- Catégorie 4 — **Assurance emprunteur** (rose) — 6 outils
- Catégorie 5 — **Assurances IARD & santé** (emerald) — 6 outils

### 5.2 `/simulateurs/[category]/[slug]` — Layout simulateur

Layout commun (`SimulatorShell.jsx`) :
- **Breadcrumb** : Accueil / Simulateurs / Catégorie / Outil
- **En-tête** : icône colorée selon catégorie, titre, description, badge catégorie
- **Layout 2 colonnes desktop** (`grid-cols-[1fr_320px]`) :
  - Main (gauche) : inputs en haut, résultats en grosses cards colorées, graphiques, tableau d'amortissement, `ConversionCTA` en bas
  - Sidebar droite (sticky) : liste des autres simulateurs de la catégorie (max 8) + lien "Voir tous"
- **Mobile** : sidebar passe en bas

### 5.3 Patterns simulateur par type d'outil

| Pattern | Outils concernés | Spécificités UI |
|---|---|---|
| **Loan calc** | mensualité, capacité-emprunt, cout-credit, taeg, amortissement, etc. | Sliders montant/durée/taux + cards résultat (mensualité, coût total) + graphique évolution + bouton "Voir tableau" → tableau d'amortissement collapsible |
| **Comparator** | comparateur-bancaire, comparateur-assurance, fixe-vs-variable, bancaire-vs-délégation | 2 ou 3 colonnes côte à côte avec mise en évidence du gagnant (gradient bg + badge "Meilleure offre") |
| **Eligibility** | PTZ, scoring-bancaire | Formulaire multi-step + gauge circulaire de score + verdict colore (green/amber/red) |
| **Analysis** | analyse-revenus-charges, taux-endettement, reste-a-vivre | Inputs CA/charges + donut chart répartition + indicateurs santé financière |
| **Insurance pricing** | rc-pro, assurance-auto, habitation, santé | Sélecteur secteur/profil + ascenseur formule + cards cotisation mensuelle/annuelle |

### 5.4 Liste complète des 41 simulateurs

**Crédit immobilier (indigo)** : capacite-emprunt, taux-endettement, reste-a-vivre, mensualite, cout-credit, taeg, amortissement, capital-restant-du, remboursement-anticipe, modulation-echeances, differe, regroupement-credits, comparateur-bancaire, fixe-vs-variable, apport-personnel, ptz, pret-relais, frais-notaire, plus-value, valorisation

**Crédit conso/auto (amber)** : credit-consommation, credit-auto, loa, leasing, leasing-pro

**Crédit professionnel (sky)** : pret-professionnel, capacite-financement-pro, analyse-revenus-charges, scoring-bancaire

**Assurance emprunteur (rose)** : assurance-emprunteur, assurance-crd, assurance-capital-initial, comparateur-assurance, quotite, co-emprunteur

**Assurances (emerald)** : assurance-auto, assurance-habitation, rc-pro, sante-prevoyance, comparateur-iard, cout-total-assurance

---

## 6. Espace client `/espace/*` — 7 écrans

### 6.1 `/espace` — Dashboard client
- Si **non connecté** → `EspaceLoginClient` : grand bouton Auth0 + bénéfices (3 bullets) + lien retour accueil
- Si **connecté** : header avec avatar + prénom + bouton "Faire une demande"
  - **Stats** : 4 mini-cards (demandes totales, en cours, validées, montant total)
  - **Liste demandes** : timeline ou cards groupées par status (badge couleur) + reference + date + amount
  - **Notifications récentes** : 3 dernières alertes
  - **Empty state** si 0 demande : illustration + CTA "Faire ma première demande"

### 6.2 `/espace/demande` — Wizard nouvelle demande (5 étapes)
- **Header** : bouton retour, titre, sous-titre, **bandeau vert si prérempli depuis simulateur** (+ bouton "Modifier ma simulation"), **bandeau ambre si brouillon restauré** (+ bouton "Recommencer")
- **Progress stepper** : 5 ronds numérotés, vert = complété, indigo = actuel, gris = à venir
- **Étape 1 — Type produit** : grid 6 cards cliquables (PRET_PRO, CREDIT_BAIL, LOA, LLD, LEASING_OPS, RC_PRO), checkmark si sélectionné
- **Étape 2 — Projet** : si financement → équipement, montant, durée (select), description ; si RC_PRO → secteur, CA, effectif
- **Étape 3 — Entreprise** : raison sociale, SIREN/SIRET (avec lookup auto + spinner + check vert), forme juridique, secteur
- **Étape 4 — Contact** : nom, email (lock), téléphone, checkbox CGU
- **Étape 5 — Récapitulatif** : 4 cards résumé chacune avec bouton "Modifier" → revient à l'étape · CTA final vert "Soumettre"
- Boutons nav bas : Précédent (ghost) · Suivant (indigo) · Envoyer (vert) — état submitting avec spinner

### 6.3 `/espace/[id]` — Détail d'une demande
- Header avec référence + status badge
- 4 sections collapsibles : Informations · Documents (upload + liste) · Messages (chat-like avec admin) · Offres reçues
- Sidebar : timeline statuts (vertical), prochaine étape, contact conseiller

### 6.4 `/espace/notifications` — Centre de notifications
- Liste filtrée (toutes / non lues) · Chaque notif : icône type + texte + date + bouton "Marquer lu"
- Bouton "Tout marquer lu" en haut · Empty state animé

### 6.5 `/espace/profile` — Profil utilisateur
- Avatar + bouton upload · Sections : Identité, Coordonnées, Entreprise, Préférences (langue, emails)
- Boutons "Modifier" inline · Toast confirmation

### 6.6 `/espace/security` — Sécurité
- Auth0 connecté (badge vert) · Lien "Changer mon mot de passe" (redirige Auth0) · Sessions actives (liste avec bouton révoquer) · Suppression de compte (danger zone rouge)

### 6.7 `/espace/parrainage` — Programme parrainage
- Hero : "Parrainez un proche, gagnez 100€"
- Card code personnel + bouton copier · Card lien à partager + boutons réseaux
- Tableau filleuls (status : invité / inscrit / financé) · Compteur gains totaux

---

## 7. Espace admin `/admin/*` — 13 écrans

### 7.1 Layout admin
- **Sidebar gauche fixe** (rétractable, drawer mobile — pattern `slformations` existant) : Logo, navigation, profil bas
- **Sections nav** : Dashboard · Demandes · Devis · Factures · Offres · Partenaires · Assureurs · Utilisateurs · Témoignages · FAQ · Logs · Paramètres
- **Header top** : titre page + breadcrumb + bouton notifications + avatar admin

### 7.2 `/admin` — Dashboard
- 6 KPI cards en haut : demandes du mois, en attente, taux conversion, CA mois, commissions, partenaires actifs
- 2 charts : Volume demandes (line 12 mois) · Répartition par produit (donut)
- 2 cards listes : Dernières demandes · Demandes urgentes (>7j sans action)

### 7.3 `/admin/demandes` — Liste demandes (Liste)
- Barre filtres : recherche (nom/email/SIREN/réf) + 5 onglets statut (Tous, En attente, En cours, Transmis, Terminés) avec compteurs
- Toggle vue : **Liste** (actif ici) | **Kanban**
- Cards rows (clic = expand) avec :
  - **Header** : référence (mono), badge status, badge score (excellent/bon/moyen/faible avec icône), badge requestType, **badge violet "Simulateur · XXX"** (si issu d'un simulateur), nom entreprise, nom client, email, montant droite, date droite, pill "Authentifié" / "Prospect"
  - **Expanded** : grid 4 infos (SIREN, secteur, montant, équipement), téléphone, documents joints, **bloc violet "Issue du simulateur XXX"** (avec lien externe + grid des paramètres capturés + date capture), notes admin (textarea + bouton Enregistrer), historique statuts

### 7.4 `/admin/demandes/kanban` — Vue Kanban
- 5 colonnes drag & drop : En attente · En cours · Documents manquants · Transmis · Terminés
- Cards compactes : référence, entreprise, email, montant, **mini-badge violet simulateur si présent**
- Sticky header par colonne avec compteur · Modal détail au clic
- Toggle vue (revient à Liste)

### 7.5 `/admin/devis` — Liste devis
- Tableau ou cards : numéro devis, client, montant, date, statut (brouillon/envoyé/accepté/refusé)
- Actions : voir · éditer · envoyer · supprimer

### 7.6 `/admin/factures` — Liste factures
- Tableau : numéro, client, montant TTC, date émission, échéance, statut paiement (impayée/partiellement/payée)
- Filtres période · Export CSV · Bouton "Nouvelle facture"

### 7.7 `/admin/factures/[id]` — Détail facture
- Aperçu PDF embarqué à gauche, métadonnées + actions à droite (envoyer, marquer payée, télécharger PDF, signer)
- Historique des actions sur la facture

### 7.8 `/admin/offers` — Offres bancaires
- Liste des offres reçues des partenaires bancaires (montant, mensualité, taux, durée, partenaire, statut, expiration)
- Filtres : statut, partenaire, demande associée

### 7.9 `/admin/partners` — Partenaires bancaires
- Cards : logo, nom, type (BANK/INSURER/OTHER), contact, score relation, volume traité, commission moyenne
- Bouton "Ajouter un partenaire"

### 7.10 `/admin/users` — Utilisateurs plateforme
- Table : avatar, nom, email, rôle (CLIENT/ADMIN/PARTNER/INSURER), date inscription, dernière connexion, nb demandes
- Recherche + filtre rôle · Actions : voir, modifier rôle, désactiver

### 7.11 `/admin/testimonials` — Témoignages
- Cards : auteur, note (étoiles), texte, secteur, status (en attente/publié)
- Actions : modérer, publier, supprimer · Bouton "Ajouter un témoignage"

### 7.12 `/admin/faq` — FAQ
- Liste sortable drag-and-drop des questions
- Inline edit : catégorie, ordre, actif/inactif · Bouton "Ajouter"

### 7.13 `/admin/logs` — Logs système
- Tableau filtrable : date, niveau (info/warn/error), utilisateur, action, payload JSON expand
- Export · Recherche full-text

### 7.14 `/admin/settings` — Paramètres
- Sections : Identité société, Email transactionnel, Webhook Auth0, Clés API, Notifications admin, Couleurs/thème

---

## 8. Espace partenaire `/partner/*` — 3 écrans

### 8.1 `/partner` — Dashboard partenaire
- KPI cards : demandes reçues ce mois, en cours d'étude, offres acceptées, commissions à percevoir
- Chart volume mensuel · Liste demandes assignées

### 8.2 `/partner/applications` — Demandes à étudier
- Liste filtrée selon ce qu'admin a transmis · Boutons "Faire une offre" / "Refuser"

### 8.3 `/partner/commissions` — Commissions
- Tableau : référence demande, client, montant offre, taux commission, montant commission, status (pending/paid), date

---

## 9. Espace assureur `/insurer/*` — 2 écrans

Symétrique à partner mais spécialisé assurance.

### 9.1 `/insurer` — Dashboard assureur
### 9.2 `/insurer/applications` — Demandes assurance

---

## 10. Pages techniques

### 10.1 `/not-found` — 404
- Illustration animée · Texte "Cette page a pris la fuite" · Bouton retour accueil · Suggestions liens populaires

### 10.2 `/error` — Erreur globale
- Illustration · Code erreur (sentry id) · Bouton "Réessayer" + "Retour accueil"

### 10.3 États de loading
- Skeletons par page (cards grises pulsing)

---

## 11. Patterns UI récurrents à dessiner explicitement

### Status badges
| Status | Couleur | Usage |
|---|---|---|
| `en_attente` / `pending` | slate | Demandes pas encore traitées |
| `en_cours` / `reviewing` | secondary (indigo) | En cours d'instruction |
| `documents_manquants` | red | Bloquée par pièces manquantes |
| `devis_envoye` / `signature_en_attente` | secondary | Étapes intermédiaires |
| `devis_accepte` / `signe` | accent (emerald) | Avancement positif |
| `transmis` | secondary | Transmise partenaire |
| `validee` / `finalise` | emerald | Succès final |
| `refusee` | red | Refus |
| **Score badges** | trophy/check-circle/half/triangle | excellent / bon / moyen / faible |
| **Source simulateur** | violet | Démarque les demandes issues des simulateurs |

### Formulaires
- **Field réussi** : bord emerald + check icon (ex: SIREN validé)
- **Field erreur** : bord red + bg red-50/50 + message rouge avec icône d'alerte
- **Field readonly** : bg slate-50 + icône cadenas
- **Lookup async** : spinner inline + message "Recherche…"
- **Required** : pas d'astérisque, juste validation au blur
- **Optional** : suffix `(optionnel)` grisé

### CTA hierarchy
- **CTA primaire** (1 par section) : gradient indigo→emerald, white text, scale on hover
- **CTA secondaire** : white bg, slate border, primary text
- **CTA tertiaire / lien** : secondary color text, underline on hover

### Mobile patterns
- Touch targets ≥ 44px
- Drawer bottom-sheet pour actions multiples
- Sticky bottom CTA sur les pages produit et simulateurs
- Pas de hover-only, toujours fallback tap/active

---

## 12. Breakpoints & responsive

| Breakpoint | Largeur | Usage |
|---|---|---|
| Default | < 640px | Mobile portrait |
| `sm:` | ≥ 640px | Mobile large / petite tablette |
| `md:` | ≥ 768px | Tablette portrait |
| `lg:` | ≥ 1024px | Tablette paysage / petit laptop |
| `xl:` | ≥ 1280px | Desktop |

**Comportements clés** :
- Sidebar admin : drawer < lg, fixe ≥ lg
- Wizard demande : steps labels masqués < sm
- Simulateur layout : 1 col < lg, 2 col ≥ lg
- Hub simulateurs : 2 col grid mobile, 4 col desktop
- Tables admin : transformées en cards stacked < md

---

## 13. États globaux à prévoir sur chaque page

Pour **chaque** écran fonctionnel, livrer 4 variantes :

1. **Default / data présente** — état nominal
2. **Loading** — skeletons cohérents
3. **Empty** — illustration + CTA d'amorce
4. **Error** — message + bouton retry

Plus pour les écrans authentifiés :

5. **Unauthenticated redirect** (espace privé non connecté → `EspaceLoginClient` ou Auth0 redirect)

---

## 14. Internationalisation

- Toutes les pages bilingues **FR / EN** (clés dans `messages/fr.json` et `messages/en.json`)
- Switcher dans le header
- Dates et nombres formatés via `Intl.NumberFormat('fr-FR')` / `('en-US')`
- Montants en EUR uniquement (`€` après le nombre style FR, `€` avant style EN)

---

## 15. Livrables attendus

Pour **chaque page** listée ci-dessus :

- ✅ Maquette **Desktop** (1440px) — état default
- ✅ Maquette **Mobile** (375px) — état default
- ✅ Variations d'état (loading, empty, error) au minimum sur les pages dynamiques
- ✅ Annotations sur composants nouveaux (à intégrer au design system)
- ✅ Export Figma ou PNG haute résolution

Total à produire : **88 écrans** (43 publics + 7 espace client + 14 admin + 3 partner + 2 insurer + technique + variantes mobile)

**Priorité de livraison** :
1. Layout shell + design system (§1 à §3, §11)
2. Pages publiques marketing (§4)
3. Simulateurs : layout + 5 patterns représentatifs (§5)
4. Espace client (§6)
5. Espace admin (§7)
6. Partner / Insurer (§8 à §9)

---

## 16. Hors scope (à ne PAS retoucher)

- Logique métier, code backend, schéma Prisma
- Architecture des routes Next.js
- Intégrations Auth0 / Sentry / reCAPTCHA
- Email templates transactionnels (livrables séparés)
- Documentation technique `*.md` à la racine

---

## 17. Ressources existantes à exploiter

| Ressource | Chemin |
|---|---|
| Tokens design | `app/globals.css` |
| Composants existants | `components/` |
| Inventaire simulateurs | `lib/simulators/registry.js` |
| Schéma data | `prisma/schema.prisma` |
| Statuts demandes | `lib/statusMap.js` |
| i18n strings | `messages/fr.json`, `messages/en.json` |
| Helper prefill simulateur | `lib/simulators/prefill.js` |

---

**Contact technique** : pour toute question sur la structure existante, se référer à `PROJECT_HANDOFF.md`, `PROJECT_STATUS.md` et `CAHIER_DES_CHARGES.md` à la racine du repo.

**Fin du brief — bonne création 🎨**
