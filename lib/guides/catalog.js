// Guides pédagogiques — un guide structuré par produit principal.
// Format : { slug, productType, title, intro, duration, sections: [{ title, content }], cta }

export const GUIDES = [
  {
    slug: 'credit-bail',
    productType: 'CREDIT_BAIL',
    title: 'Tout comprendre sur le crédit-bail',
    tagline: 'Aussi appelé leasing financier, c\'est la solution n°1 pour équiper son entreprise sans plomber sa trésorerie.',
    duration: 8,
    icon: 'fa-handshake',
    color: 'indigo',
    sections: [
      {
        title: 'Qu\'est-ce que le crédit-bail ?',
        content: `Le crédit-bail mobilier est un contrat tripartite entre votre entreprise (le crédit-preneur), un établissement financier (le crédit-bailleur) et un fournisseur. Le crédit-bailleur achète le bien que vous avez choisi puis vous le loue, en général sur 36 à 84 mois.

À la fin du contrat, trois options s'offrent à vous :
- **Lever l'option d'achat** pour devenir propriétaire (valeur résiduelle 1 à 6 %)
- **Restituer le bien** sans rien payer de plus
- **Prolonger** la location à un loyer réduit

C'est la formule reine pour les véhicules utilitaires, le matériel informatique, l'outillage et l'équipement professionnel.`,
      },
      {
        title: 'Les 4 avantages clés',
        content: `**1. Préservation de la trésorerie.** Pas d'apport requis, pas d'immobilisation de capital. Vous payez à l'usage.

**2. 100 % déductible fiscalement.** Les loyers s'imputent au compte de résultat en charges, réduisant l'impôt sur les bénéfices.

**3. Hors bilan.** Le bien n'apparaît pas à l'actif (jusqu'à la levée d'option). Votre capacité d'endettement reste intacte pour d'autres projets.

**4. Renouvellement facile.** En fin de contrat, vous repartez avec du matériel neuf — particulièrement intéressant pour l'IT qui se déprécie vite.`,
      },
      {
        title: 'Crédit-bail vs LOA vs LLD : choisir',
        content: `**Crédit-bail (mobilier)** : pour équipement pro, option d'achat à valeur faible (1-6 %), entreprise.

**LOA** : variante grand public et flotte auto pro. Option d'achat plus élevée (30-40 %), apport possible.

**LLD** : pas d'option d'achat. Loyer englobe entretien + assurance + assistance. Idéal flotte auto pure.

**Crédit classique** : vous êtes propriétaire dès le 1er jour, le bien est à l'actif. Mensualités fixes, intérêts déductibles, capital amorti comptablement.`,
      },
      {
        title: 'Combien ça coûte ?',
        content: `Le coût total d'un crédit-bail est supérieur à l'achat comptant (de 10 à 25 % selon la durée et le profil), mais il préserve la trésorerie et la capacité d'endettement.

**Exemple** : Un véhicule utilitaire à 30 000 € HT financé sur 48 mois avec valeur résiduelle 6 % :
- Loyer mensuel ~700 € HT
- Total loyers : 33 600 € HT
- Levée d'option : 1 800 € HT
- Coût total : 35 400 € HT (+18 % vs comptant)

À comparer avec le coût d'opportunité du cash immobilisé.`,
      },
      {
        title: 'Quels biens financer ?',
        content: `Tout équipement professionnel durable de plus de 4 000 € HT :
- **Véhicules** : utilitaires, VTC, taxis, flotte commerciale (les véhicules de tourisme sont éligibles mais TVA non récupérable)
- **Matériel informatique** : serveurs, parc PC, équipements réseau
- **Outillage et machines** : BTP, agro, industrie, restauration
- **Mobilier et agencement** professionnel
- **Médical** : matériel imagerie, cabinet dentaire, équipement

Non éligible : immobilier (relève du crédit-bail immobilier), stocks, fonds de commerce.`,
      },
    ],
    cta: { label: 'Estimer mon crédit-bail', href: '/simulateurs/credit-conso-auto/leasing-pro' },
  },

  {
    slug: 'pret-professionnel',
    productType: 'PRET_PRO',
    title: 'Le prêt professionnel de A à Z',
    tagline: 'De la création d\'entreprise au rachat de parts, le prêt pro reste le financement le plus polyvalent.',
    duration: 10,
    icon: 'fa-briefcase',
    color: 'violet',
    sections: [
      {
        title: 'À quoi sert un prêt professionnel ?',
        content: `Le prêt pro finance les investissements durables de l'entreprise :
- Création ou reprise d'activité
- Achat de fonds de commerce
- Acquisition de murs commerciaux (immobilier d'entreprise)
- Investissement matériel ou immatériel
- Renforcement du besoin en fonds de roulement (BFR)
- Rachat de parts sociales

Montant : 3 000 € à 2 M€ chez Finarent. Durée : 2 à 15 ans. Taux 2026 : entre 3,8 et 7 % selon profil et garanties.`,
      },
      {
        title: 'Les 5 critères que la banque examine',
        content: `**1. La pérennité du projet.** Plan d'affaires, étude de marché, projections à 3 ans.

**2. La capacité de remboursement.** Le ratio CAF/annuité doit dépasser 1,3 (CAF = Capacité d'Autofinancement, soit résultat net + dotations aux amortissements).

**3. L'apport personnel.** 20 à 30 % du projet en règle générale — gage de votre engagement.

**4. Les garanties.** Caution personnelle du dirigeant quasi systématique, plus éventuellement nantissement, hypothèque ou garantie BPI.

**5. Le scoring du dirigeant.** Historique bancaire, expérience sectorielle, situation patrimoniale.`,
      },
      {
        title: 'Garanties : que va-t-on vous demander ?',
        content: `**Caution personnelle du dirigeant** : Quasi-systématique. Souvent limitée à 100-200 % du capital emprunté, sur une durée définie. Peut être contre-garantie par BPI France (jusqu'à 70 %) ou la SOCAMA pour les artisans/commerçants.

**Nantissement** : Sur fonds de commerce, parts sociales, contrats d'assurance-vie. Permet à la banque de prendre une sûreté sans hypothèque.

**Hypothèque** : Sur immobilier d'entreprise ou personnel. Plus contraignante (frais de notaire ~1 % + mainlevée à terme).

**Caution mutuelle** (SOCAMA, Crédit Logement) : Alternative payante (~0,5-1 %) qui dispense d'hypothèque.`,
      },
      {
        title: 'Comment monter un dossier solide',
        content: `**Documents indispensables** :
- Statuts + Kbis de moins de 3 mois
- 3 derniers bilans + comptes de résultat (ou prévisionnel pour création)
- Plan d'affaires détaillé sur 3 ans (création/reprise)
- Compte d'exploitation prévisionnel et plan de trésorerie
- Justificatifs d'apport (relevés bancaires, livret A, vente de bien)
- Pièces d'identité du/des dirigeant(s) + situation patrimoniale

**Astuce** : Présentez plusieurs banques en parallèle (lettre type de demande de financement). La concurrence joue toujours.`,
      },
      {
        title: 'Délais et étapes',
        content: `**Semaine 1** : Constitution du dossier + envoi banque(s)
**Semaine 2-3** : Échanges, questions, demande de pièces complémentaires
**Semaine 4** : Passage en comité de crédit
**Semaine 5** : Édition de l'offre + délai légal de réflexion (10 jours min.)
**Semaine 6-8** : Signature + mise à disposition des fonds

Compter 6 à 10 semaines au total, plus court via un courtier qui présente plusieurs banques en parallèle.`,
      },
    ],
    cta: { label: 'Simuler mon prêt pro', href: '/simulateurs/credit-professionnel/pret-professionnel' },
  },

  {
    slug: 'assurance-emprunteur',
    productType: 'ASSURANCE',
    title: 'Assurance emprunteur : économiser jusqu\'à 60 %',
    tagline: 'Depuis la loi Lemoine, vous pouvez changer d\'assurance à tout moment. Voici comment optimiser.',
    duration: 7,
    icon: 'fa-shield-heart',
    color: 'emerald',
    sections: [
      {
        title: 'À quoi sert l\'assurance emprunteur ?',
        content: `L'assurance emprunteur protège la banque (et indirectement votre famille) en cas d'aléa de la vie : décès, invalidité, incapacité de travail.

Si l'événement assuré survient pendant le remboursement, l'assurance prend en charge tout ou partie des mensualités à la place de l'emprunteur.

Elle n'est pas légalement obligatoire mais **toutes les banques l'exigent** pour accorder un prêt immobilier — c'est donc une obligation contractuelle.`,
      },
      {
        title: 'Les 4 garanties à connaître',
        content: `**DC (Décès)** : Couverture de base, obligatoire. L'assurance solde le capital restant dû.

**PTIA (Perte Totale et Irréversible d'Autonomie)** : Vous ne pouvez plus exercer aucune activité ni effectuer les actes de la vie quotidienne. Assimilée au décès.

**ITT (Incapacité Temporaire de Travail)** : Vous êtes en arrêt maladie/accident, l'assurance prend en charge les mensualités après une franchise (souvent 90 jours). Optionnelle mais fortement recommandée.

**IPT/IPP (Invalidité Permanente Totale/Partielle)** : Vous restez handicapé après consolidation. Couverture variable selon le taux d'invalidité (33 % ou 66 % minimum).`,
      },
      {
        title: 'Loi Lemoine : la révolution de 2022',
        content: `Trois changements majeurs depuis juin 2022 :

**1. Résiliation à tout moment** : Plus besoin d'attendre la date anniversaire. Vous pouvez changer d'assurance n'importe quand, sans frais ni préavis (15 jours de prévenance à la banque).

**2. Suppression du questionnaire médical** pour les prêts < 200 k€ par assuré remboursés avant 60 ans. Plus de discrimination par antécédents.

**3. Droit à l'oubli** ramené à 5 ans (vs 10 ans avant) pour les cancers et l'hépatite C : vous n'avez plus à les déclarer.

Concrètement, ça veut dire que vous pouvez réinterroger le marché chaque année et faire jouer la concurrence.`,
      },
      {
        title: 'Délégation d\'assurance : 40 à 60 % d\'économies',
        content: `Quand vous signez votre prêt, la banque propose son **contrat groupe** : un contrat collectif avec un tarif mutualisé. Profitable surtout aux profils à risque (seniors, fumeurs, sportifs extrêmes).

La **délégation d'assurance** consiste à souscrire à un contrat individuel chez un assureur externe (Aprivia, MetLife, April, etc.). Ces contrats sont tarifés selon votre profil personnel : jeune non-fumeur en bonne santé = tarif imbattable.

**Exemple** : Pour un prêt de 250 000 € sur 20 ans, un couple non-fumeur 30 ans paie typiquement 12 000 € en délégation vs 25 000 € en contrat groupe — soit 13 000 € d'économies sur la durée totale.

**Condition** : la banque doit accepter le contrat externe. Elle ne peut refuser que si les garanties sont strictement inférieures à son contrat groupe.`,
      },
      {
        title: 'Comparer : la quotité',
        content: `Sur un prêt à 2 emprunteurs, la quotité totale doit atteindre au minimum 100 %.

**50/50** : chaque emprunteur couvre la moitié. Coût minimal mais protection partielle (en cas de décès d'un, l'autre continue à payer sa moitié).

**100/100** : chaque emprunteur couvre tout. Coût ~× 2 mais protection maximale (en cas de décès d'un, l'autre n'a plus rien à payer).

**Mix asymétrique** (ex. 70/30) : selon les revenus respectifs. Bonne option quand l'un gagne nettement plus que l'autre.

La règle d'or : protégez le capital à hauteur de la dépendance financière du foyer. Une famille avec enfants à un seul revenu = 100/100 sur le revenu principal.`,
      },
    ],
    cta: { label: 'Simuler mon assurance', href: '/simulateurs/assurance-emprunteur/assurance-emprunteur' },
  },

  {
    slug: 'loa-vs-lld-vs-credit',
    productType: 'LOA',
    title: 'LOA, LLD, crédit auto : quelle formule pour vous ?',
    tagline: 'Trois formules pour un même besoin : rouler. Voici comment trancher selon votre profil et votre usage.',
    duration: 6,
    icon: 'fa-car',
    color: 'sky',
    sections: [
      {
        title: 'Les 3 formules en 30 secondes',
        content: `**Crédit auto** : Vous êtes propriétaire dès le 1er jour. Mensualités fixes, vous remboursez capital + intérêts. Apport recommandé 10-20 %. Coût total = prix + intérêts.

**LOA (Location avec Option d'Achat)** : Vous louez pour 3-5 ans. Apport possible 10-15 %, loyers mensuels, valeur résiduelle ~30-40 % à payer en fin de contrat si vous voulez devenir propriétaire.

**LLD (Location Longue Durée)** : Vous louez pour 2-5 ans, sans option d'achat. Loyer souvent tout compris (entretien + assurance + assistance). En fin de contrat, vous rendez le véhicule.`,
      },
      {
        title: 'Quel coût total ?',
        content: `Pour un véhicule à 30 000 €, 4 ans, 15 000 km/an, profil moyen :

**Crédit auto (taux 5 %)** : Apport 6 000 € + mensualité 553 € × 48 = 32 544 € total. Vous gardez le véhicule, revente possible (~10-12 000 € à 4 ans).

**LOA** : Apport 4 500 € + loyer 380 € × 48 + VR 9 000 € = **31 740 €** si vous achetez en fin de contrat.

**LLD tout compris** : Loyer 450 € × 48 = 21 600 €. Vous rendez le véhicule, mais les frais d'entretien et assurance sont inclus (~3 000 € d'économies vs achat).

**Conclusion** : Crédit pour les rouleurs qui gardent longtemps. LLD pour ceux qui changent souvent et veulent zéro surprise. LOA en compromis souple.`,
      },
      {
        title: 'Les pièges à éviter',
        content: `**Kilométrage** : LOA/LLD facturent les km au-delà du contrat (souvent 0,10 à 0,25 €/km). Estimez avec marge.

**État du véhicule** : Tout dégât hors usure normale est refacturé en fin de contrat. Prenez l'option "carrosserie" si trajets fréquents.

**Résiliation anticipée** : Quasi-impossible sans pénalité lourde sur LOA/LLD. Crédit auto plus flexible.

**Taux affiché** : Sur la LOA, ce qui compte c'est le TAEG (loyers + frais + VR vs prix réel), pas le loyer mensuel seul.

**Apport** : Ne montez pas l'apport pour faire baisser le loyer — vous payez d'avance pour rien si vous ne levez pas l'option.`,
      },
      {
        title: 'Pro : préférez le crédit-bail',
        content: `Pour une entreprise, la LOA n'est pas la solution la plus optimisée fiscalement. Préférez :

**Crédit-bail mobilier** : Loyers 100 % déductibles, hors bilan, VR très faible (1-6 %) — vraie option d'achat à terme.

**LLD pro** : Si vous renouvelez régulièrement votre flotte, LLD reste imbattable car frais d'entretien/assurance englobés.

**Crédit classique** : Si vous voulez immobiliser le véhicule à l'actif (équipement métier marquant, valeur de revente).

Pour un véhicule de tourisme acheté par l'entreprise, la TVA n'est pas récupérable (sauf usage exclusif pro très encadré) — un détail qui peut coûter 20 %.`,
      },
    ],
    cta: { label: 'Comparer mes options', href: '/simulateurs/credit-conso-auto/loa' },
  },

  {
    slug: 'rc-pro',
    productType: 'RC_PRO',
    title: 'RC Pro : pourquoi et comment bien se couvrir',
    tagline: 'Obligatoire pour beaucoup, indispensable pour tous : la RC Pro protège votre entreprise des conséquences financières de ses erreurs.',
    duration: 6,
    icon: 'fa-shield-halved',
    color: 'rose',
    sections: [
      {
        title: 'Qui est obligé d\'avoir une RC Pro ?',
        content: `**Obligatoire** pour :
- Professions médicales (médecin, dentiste, infirmière, sage-femme)
- Professions juridiques (avocat, notaire, huissier, expert-comptable)
- Professions du bâtiment (assurance décennale + RC obligatoires)
- Agents immobiliers, syndics, agents généraux d'assurance
- Auto-entrepreneurs dans les activités réglementées

**Fortement recommandée** pour les autres :
- Consultants, formateurs, coachs
- Artisans et commerçants
- Restauration, traiteur, métiers de bouche
- Activités numériques (dev web, agence, e-commerce)

Sans RC Pro, vous engagez votre patrimoine personnel en cas de réclamation client.`,
      },
      {
        title: 'Ce que couvre une RC Pro',
        content: `Trois grands types de dommages causés à un tiers (client, fournisseur, passant) dans le cadre de votre activité :

**Dommages corporels** : Blessure, atteinte à la santé. Ex. client qui glisse dans votre boutique.

**Dommages matériels** : Détérioration d'un bien. Ex. plombier qui inonde l'appartement du client.

**Dommages immatériels** : Perte financière, perte de chiffre d'affaires, atteinte à l'image. Ex. consultant qui livre une étude erronée causant une perte de clientèle.

Plafond typique : 500 k€ à 5 M€ selon l'activité. Franchise généralement 150 à 500 €.`,
      },
      {
        title: 'RC Pro vs Multirisque pro',
        content: `**RC Pro seule** : Couvre uniquement votre responsabilité envers les tiers. Ne couvre PAS vos propres biens, locaux, matériel, stocks.

**Multirisque pro** : Combine RC Pro + dommages aux biens (incendie, dégât des eaux, vol, bris de glace) + perte d'exploitation + protection juridique.

**Décision** :
- Pas de local commercial, peu de matériel : RC Pro suffit
- Local pro avec matériel et stock : Multirisque indispensable
- Travail à domicile : assurance habitation + RC Pro spécifique

Coût indicatif : RC Pro 150-600 €/an. Multirisque 500-2 500 €/an selon surface et activité.`,
      },
      {
        title: 'Comment bien comparer',
        content: `Vérifiez systématiquement :

**Le plafond de garantie** : suffisant pour le risque maximal de votre métier (consultez les sinistres typiques de votre secteur).

**Les exclusions** : activités annexes non couvertes (ex. consultant qui code n'est pas forcément couvert pour le code).

**La rétroactivité** : couvre-t-on les réclamations sur faits antérieurs à la souscription ?

**La franchise** : montant restant à votre charge en cas de sinistre.

**Le territoire** : France ? UE ? Monde entier ?

**La protection juridique** incluse ou non : assistance en cas de litige avec un client.

Pour des activités atypiques (esports, NFT, IA, conseil cyber), exigez une RC adaptée — les contrats standard excluent souvent.`,
      },
    ],
    cta: { label: 'Devis RC Pro', href: '/assurance/rc-pro' },
  },
];

export function getGuide(slug) {
  return GUIDES.find((g) => g.slug === slug);
}
