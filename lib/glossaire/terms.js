// Glossaire financier Finarent — termes courants des produits proposés.
// Format : { slug, term, category, short, definition, related?: [slug] }

export const CATEGORIES = [
  { slug: 'credit',     label: 'Crédit',             color: 'indigo' },
  { slug: 'assurance',  label: 'Assurance',          color: 'emerald' },
  { slug: 'pro',        label: 'Professionnel',      color: 'violet' },
  { slug: 'fiscalite',  label: 'Fiscalité',          color: 'amber' },
];

export const TERMS = [
  // ─── CRÉDIT ─────────────────────────────────────────────
  { slug: 'taux-nominal', term: 'Taux nominal', category: 'credit',
    short: 'Taux d\'intérêt brut appliqué au capital emprunté, hors frais.',
    definition: 'Le taux nominal (ou taux débiteur) correspond au coût des intérêts seuls. Il ne tient pas compte des frais de dossier, garantie ou assurance. Pour comparer deux offres de crédit, utilisez plutôt le TAEG qui intègre l\'ensemble des coûts.',
    related: ['taeg', 'taux-fixe', 'taux-variable'] },

  { slug: 'taeg', term: 'TAEG', category: 'credit',
    short: 'Taux Annuel Effectif Global — coût total du crédit en %.',
    definition: 'Le TAEG est l\'indicateur de référence pour comparer les offres de crédit. Il englobe le taux nominal, les frais de dossier, la garantie, l\'assurance obligatoire et tout autre frais lié à l\'octroi du prêt. C\'est le seul taux affichable légalement en publicité.',
    related: ['taux-nominal', 'taux-usure', 'frais-dossier'] },

  { slug: 'taux-fixe', term: 'Taux fixe', category: 'credit',
    short: 'Taux d\'intérêt constant pendant toute la durée du prêt.',
    definition: 'Avec un prêt à taux fixe, la mensualité ne change jamais. Vous savez dès la signature combien vous rembourserez chaque mois et au total. C\'est le format le plus répandu en France pour le crédit immobilier (>95 % des prêts).',
    related: ['taux-variable', 'taux-nominal'] },

  { slug: 'taux-variable', term: 'Taux variable (révisable)', category: 'credit',
    short: 'Taux indexé sur un indice (souvent Euribor) qui peut évoluer.',
    definition: 'Le taux variable suit l\'évolution d\'un indice financier (Euribor 3 mois en général). Souvent capé (limite + ou − 1 ou 2 points), il offre un taux initial plus bas que le fixe, mais expose à une hausse future. Marginal en France (<5 %).',
    related: ['taux-fixe', 'taeg'] },

  { slug: 'taux-usure', term: 'Taux d\'usure', category: 'credit',
    short: 'Plafond légal du TAEG fixé par la Banque de France.',
    definition: 'Aucun établissement ne peut prêter à un TAEG supérieur au taux d\'usure, publié trimestriellement par la Banque de France selon la nature du prêt et sa durée. Un dépassement entraîne la nullité du contrat.',
    related: ['taeg'] },

  { slug: 'amortissement', term: 'Tableau d\'amortissement', category: 'credit',
    short: 'Échéancier détaillant capital remboursé et intérêts pour chaque mensualité.',
    definition: 'Au début du prêt, la mensualité contient une grande part d\'intérêts et peu de capital. La proportion s\'inverse à la fin. Le tableau d\'amortissement, obligatoire dans l\'offre de prêt, détaille mois par mois ces deux composantes plus le capital restant dû.',
    related: ['capital-restant-du', 'mensualite'] },

  { slug: 'capital-restant-du', term: 'Capital restant dû (CRD)', category: 'credit',
    short: 'Montant du capital encore à rembourser à un moment donné.',
    definition: 'Le CRD est la somme due à la banque si vous décidiez de tout rembourser maintenant (hors indemnités). Il décroît au fil des mensualités selon la formule d\'amortissement. Sert de base de calcul pour l\'assurance emprunteur quand celle-ci est en mode CRD.',
    related: ['amortissement', 'remboursement-anticipe'] },

  { slug: 'mensualite', term: 'Mensualité', category: 'credit',
    short: 'Somme remboursée chaque mois (capital + intérêts + assurance).',
    definition: 'La mensualité d\'un prêt amortissable se calcule par la formule PMT : M = C × t / (1 − (1+t)^−n), où C est le capital, t le taux mensuel et n la durée en mois. Elle peut être augmentée d\'une prime d\'assurance prélevée séparément ou en complément.',
    related: ['amortissement', 'taux-endettement'] },

  { slug: 'taux-endettement', term: 'Taux d\'endettement', category: 'credit',
    short: 'Part des revenus mensuels consacrée au remboursement des crédits.',
    definition: 'Taux d\'endettement = (charges de crédit / revenus nets) × 100. Le HCSF recommande de ne pas dépasser 35 % (assurance comprise), avec une dérogation possible pour 20 % des dossiers d\'une banque. Au-delà, le risque de refus est élevé.',
    related: ['reste-a-vivre', 'mensualite'] },

  { slug: 'reste-a-vivre', term: 'Reste à vivre', category: 'credit',
    short: 'Revenus restants après paiement des charges fixes.',
    definition: 'Reste à vivre = revenus nets − charges fixes (loyer/mensualité, pensions, crédits). Les banques surveillent ce critère en plus du taux d\'endettement : minimum recommandé environ 1 000 €/personne seule, 700 €/personne en couple ou avec enfants.',
    related: ['taux-endettement'] },

  { slug: 'frais-notaire', term: 'Frais de notaire', category: 'credit',
    short: 'Émoluments + droits d\'enregistrement payés lors de l\'achat.',
    definition: 'Les "frais de notaire" sont en réalité composés à ~80 % de droits d\'enregistrement (taxes pour l\'État/département/commune). Le notaire ne perçoit que ses émoluments (~1 %) et des débours. Comptez ~7-8 % du prix dans l\'ancien et ~2-3 % dans le neuf.',
    related: ['apport-personnel'] },

  { slug: 'apport-personnel', term: 'Apport personnel', category: 'credit',
    short: 'Somme personnelle investie dans le projet, hors emprunt.',
    definition: 'Idéalement 10 à 20 % du prix d\'achat. Couvre généralement les frais de notaire et de garantie. Plus l\'apport est élevé, meilleures sont les conditions négociées : taux, durée, frais réduits. Sans apport ("financement à 110 %"), les dossiers passent surtout pour les primo-accédants jeunes en CDI.',
    related: ['frais-notaire'] },

  { slug: 'remboursement-anticipe', term: 'Remboursement anticipé', category: 'credit',
    short: 'Solde total ou partiel du prêt avant le terme prévu.',
    definition: 'Possible à tout moment. Indemnité de remboursement anticipé (IRA) plafonnée à 6 mois d\'intérêts du capital remboursé OU 3 % du CRD (le plus petit des deux). Souvent négociable à 0 lors de la souscription, surtout pour vente du bien ou changement de situation pro.',
    related: ['capital-restant-du'] },

  { slug: 'pret-relais', term: 'Prêt relais', category: 'credit',
    short: 'Avance bancaire pour acheter avant d\'avoir vendu son bien actuel.',
    definition: 'Le prêt relais avance 60 à 80 % de la valeur estimée du bien à vendre, sur 12 à 24 mois. Vous ne remboursez que les intérêts pendant la durée, et le capital est soldé par le produit de la vente. Risque principal : la vente qui traîne ou se conclut sous l\'estimation.',
    related: ['valorisation'] },

  { slug: 'ptz', term: 'PTZ (Prêt à Taux Zéro)', category: 'credit',
    short: 'Prêt aidé sans intérêts pour primo-accédants.',
    definition: 'Réservé aux primo-accédants (n\'ayant pas été propriétaire depuis 2 ans) sous conditions de revenus. Finance jusqu\'à 50 % du projet selon la zone géographique et le revenu du foyer. Élargi en 2026 au neuf individuel zones B2/C en plus du collectif.',
    related: ['apport-personnel'] },

  // ─── ASSURANCE EMPRUNTEUR ───────────────────────────────
  { slug: 'assurance-emprunteur', term: 'Assurance emprunteur', category: 'assurance',
    short: 'Assurance qui rembourse la banque en cas de décès/invalidité de l\'emprunteur.',
    definition: 'Non obligatoire légalement mais exigée par toutes les banques pour un crédit immobilier. Couvre généralement : décès, PTIA (Perte Totale et Irréversible d\'Autonomie), ITT (Incapacité Temporaire de Travail), IPT (Invalidité Permanente Totale). Coûte 10 à 30 % du coût total du crédit.',
    related: ['quotite', 'loi-lemoine', 'delegation-assurance'] },

  { slug: 'loi-lemoine', term: 'Loi Lemoine', category: 'assurance',
    short: 'Loi 2022 permettant de changer d\'assurance emprunteur à tout moment.',
    definition: 'Depuis le 1er juin 2022 (sept. 2022 pour les contrats existants), vous pouvez résilier et changer d\'assurance emprunteur à n\'importe quel moment, sans frais, sans préavis. Suppression aussi du questionnaire médical pour les prêts < 200 k€ remboursés avant 60 ans.',
    related: ['assurance-emprunteur', 'delegation-assurance'] },

  { slug: 'delegation-assurance', term: 'Délégation d\'assurance', category: 'assurance',
    short: 'Choisir une assurance externe à la banque prêteuse.',
    definition: 'Au lieu du contrat groupe proposé par la banque, vous souscrivez à une assurance individuelle (souvent moins chère car tarifée selon votre profil). Économie moyenne : 40 à 60 % sur le coût total. La banque doit accepter si les garanties sont équivalentes.',
    related: ['loi-lemoine', 'assurance-emprunteur'] },

  { slug: 'quotite', term: 'Quotité d\'assurance', category: 'assurance',
    short: 'Part du capital couverte par chaque emprunteur.',
    definition: 'Sur un prêt à 2 emprunteurs, la quotité totale doit faire au moins 100 %. Exemples : 50/50 (chacun couvre la moitié), 100/100 (chacun couvre tout — coût × 2), 70/30 (selon revenus). En cas de décès, la banque est remboursée à hauteur de la quotité du défunt.',
    related: ['assurance-emprunteur'] },

  { slug: 'rc-pro', term: 'RC Pro', category: 'assurance',
    short: 'Responsabilité Civile Professionnelle — couvre les dommages causés à des tiers.',
    definition: 'Obligatoire pour les professions réglementées (santé, droit, expertise, bâtiment, conseil). Couvre les conséquences financières d\'un dommage corporel, matériel ou immatériel causé à un client, fournisseur ou tiers dans le cadre de l\'activité.',
    related: [] },

  { slug: 'multirisque-pro', term: 'Multirisque professionnelle', category: 'assurance',
    short: 'Contrat tout-en-un protégeant locaux et activité.',
    definition: 'Combine RC Pro, dommages aux biens (locaux, stocks, matériel), perte d\'exploitation, protection juridique. Indispensable dès qu\'on loue ou possède un local pro. Adaptable selon l\'activité (restauration, commerce, services, industrie).',
    related: ['rc-pro'] },

  // ─── PROFESSIONNEL / FINANCEMENT ────────────────────────
  { slug: 'credit-bail', term: 'Crédit-bail', category: 'pro',
    short: 'Location longue durée d\'un bien pro avec option d\'achat à terme.',
    definition: 'Aussi appelé "leasing financier", le crédit-bail mobilier permet d\'utiliser un équipement (véhicule, machine, matériel) en payant un loyer mensuel, avec possibilité d\'acheter le bien en fin de contrat à une valeur résiduelle. 100 % déductible fiscalement. Pas d\'apport requis en général.',
    related: ['loa', 'lld', 'leasing-pro'] },

  { slug: 'loa', term: 'LOA', category: 'pro',
    short: 'Location avec Option d\'Achat — formule particuliers et pro.',
    definition: 'La LOA permet de louer un véhicule (le plus souvent) avec option d\'acheter en fin de contrat à un prix défini à la signature. Apport initial possible (10-15 %), loyers mensuels, valeur résiduelle ~30-40 % du prix neuf. Souple, mais le total payé > achat comptant.',
    related: ['credit-bail', 'lld'] },

  { slug: 'lld', term: 'LLD', category: 'pro',
    short: 'Location Longue Durée — sans option d\'achat.',
    definition: 'Contrairement à la LOA, pas d\'option d\'achat en fin de contrat. Le bien est rendu. Très utilisé pour les flottes auto pro (loyer englobe entretien, assurance, assistance). Pas d\'inscription au bilan (off-balance sheet), allège la dette comptable.',
    related: ['loa', 'credit-bail'] },

  { slug: 'pret-pro', term: 'Prêt professionnel', category: 'pro',
    short: 'Prêt amortissable pour financer un investissement d\'entreprise.',
    definition: 'De 3 000 € à 2 M€ chez Finarent. Finance création/reprise, immobilier d\'entreprise, équipement, fonds de commerce, BFR. Durée 2 à 15 ans. Taux 2026 : entre 4 et 7 % selon profil. Souvent garanti par caution personnelle, hypothèque ou nantissement.',
    related: ['credit-bail', 'caution-bpi'] },

  { slug: 'caution-bpi', term: 'Garantie BPI / Crédit logement', category: 'pro',
    short: 'Cautionnement bancaire alternatif à l\'hypothèque.',
    definition: 'Pour un prêt pro ou immo, la banque exige une garantie. BPI France (PME), Crédit Logement (particuliers) ou société de caution mutuelle se portent garants moyennant une cotisation (~0,5-1 % du capital). Moins cher que l\'hypothèque, pas de frais de mainlevée.',
    related: ['pret-pro'] },

  { slug: 'scoring-bancaire', term: 'Scoring bancaire', category: 'pro',
    short: 'Note attribuée par la banque pour évaluer le risque crédit.',
    definition: 'Algorithme propriétaire qui synthétise revenus, endettement, ancienneté pro, apport, statut emploi, historique bancaire (FICP). Score élevé = meilleur taux et plus de chances d\'accord. Les modèles modernes ajoutent des signaux ML (comportement transactionnel, géo, etc.).',
    related: ['taux-endettement', 'ficp'] },

  { slug: 'ficp', term: 'FICP', category: 'pro',
    short: 'Fichier des Incidents de Remboursement des Crédits aux Particuliers.',
    definition: 'Tenu par la Banque de France. Y être inscrit (impayés, surendettement) bloque quasiment tout nouveau crédit pendant 5 ans (impayé) à 7 ans (dossier surendettement). À ne pas confondre avec le FCC (Fichier Central des Chèques, interdit bancaire).',
    related: ['scoring-bancaire'] },

  // ─── FISCALITÉ ──────────────────────────────────────────
  { slug: 'plus-value', term: 'Plus-value immobilière', category: 'fiscalite',
    short: 'Gain à la revente d\'un bien immobilier, soumis à impôt.',
    definition: 'Plus-value = prix de vente − prix d\'achat ajusté (frais d\'acquisition + travaux). Imposée à 19 % (IR) + 17,2 % (PS) = 36,2 %, avec abattements selon la durée de détention : exonération totale d\'IR après 22 ans, de PS après 30 ans. Résidence principale exonérée.',
    related: ['valorisation'] },

  { slug: 'valorisation', term: 'Valorisation immobilière', category: 'fiscalite',
    short: 'Estimation de la valeur de marché d\'un bien à un instant T.',
    definition: 'Méthodes : comparatif (€/m² du secteur ajusté), capitalisation des loyers (pour l\'investissement locatif), revenu actualisé. Sert pour un achat-vente, succession, prêt relais ou refinancement. Outils en ligne (DVF, Meilleurs Agents) donnent une fourchette indicative.',
    related: ['plus-value'] },

  { slug: 'tva-deductible', term: 'TVA déductible', category: 'fiscalite',
    short: 'TVA récupérable par l\'entreprise sur ses achats pros.',
    definition: 'Les entreprises assujetties à la TVA récupèrent la TVA payée sur leurs achats professionnels (matériel, services, immobilier neuf). Exclus : véhicules de tourisme (sauf usage exclusif pro très encadré). En crédit-bail, la TVA s\'applique sur les loyers, déductibles.',
    related: ['credit-bail', 'amortissement-comptable'] },

  { slug: 'amortissement-comptable', term: 'Amortissement comptable', category: 'fiscalite',
    short: 'Étalement comptable du coût d\'un bien sur sa durée d\'utilisation.',
    definition: 'À ne pas confondre avec l\'amortissement d\'un prêt. Comptablement, un bien d\'équipement de 10 000 € amorti sur 5 ans génère une charge de 2 000 €/an au résultat, sans sortie de cash. Réduit l\'impôt sur les bénéfices proportionnellement.',
    related: ['tva-deductible'] },

  { slug: 'leasing-pro', term: 'Leasing professionnel', category: 'pro',
    short: 'Location longue durée d\'équipements pro (machines, IT, flottes).',
    definition: 'Permet de disposer d\'un équipement pro contre un loyer mensuel, sans immobiliser de trésorerie ni de capital. Loyers déductibles à 100 %, pas d\'inscription au bilan. Souvent renouvelable en fin de contrat avec le matériel neuf — courant en IT et flotte auto.',
    related: ['credit-bail', 'lld'] },
];

export function getTermBySlug(slug) {
  return TERMS.find((t) => t.slug === slug);
}
export function getTermsByCategory(catSlug) {
  return TERMS.filter((t) => t.category === catSlug);
}
