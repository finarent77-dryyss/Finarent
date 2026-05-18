// Cartographie des partenaires Finarent — source : "FINARENT Partenaires.pdf" (Mai 2026)
// 100+ partenaires classés en 4 familles métiers et 14 sous-sections fidèles au PDF.
//
// Le champ `domain` est utilisé pour récupérer le logo via Clearbit Logo API
// (https://logo.clearbit.com/<domain>). Si le domaine n'existe pas chez Clearbit,
// l'image se charge en silence puis tombe sur le fallback initiales.

export const PARTNER_GROUPS = [
  // ─── ASSURANCE 3.1 — Grands assureurs généralistes ────
  {
    id: 'assurance-generalistes',
    family: 'assurance',
    icon: 'fa-shield-halved',
    color: 'rose-600',
    title: 'Grands assureurs généralistes',
    description: 'Compagnies majeures sollicitées en direct ou en co-courtage pour la RC Pro, la multirisque, la flotte et la prévoyance TNS.',
    items: [
      { name: 'AXA',             domain: 'axa.fr',                specialty: 'Compagnie généraliste', atout: 'Leader français, gamme PME large, réseau d\'agents très dense' },
      { name: 'Allianz',         domain: 'allianz.fr',            specialty: 'Compagnie généraliste', atout: 'Offre multirisque pro très complète, assistance 24/7, grands risques' },
      { name: 'Generali',        domain: 'generali.fr',           specialty: 'Compagnie généraliste', atout: 'Forte expertise PME, prévoyance TNS, retraite Madelin' },
      { name: 'Groupama',        domain: 'groupama.fr',           specialty: 'Mutuelle généraliste',  atout: 'Très implanté en région et milieu rural, agricole, artisanat' },
      { name: 'MAIF',            domain: 'maif.fr',               specialty: 'Mutuelle',              atout: 'Offre B2B en développement, indépendants et associations' },
      { name: 'MMA / Covéa',     domain: 'mma.fr',                specialty: 'Mutuelle',              atout: 'Réseau d\'agents généraux, artisans et commerçants' },
      { name: 'Aviva / Abeille', domain: 'abeille-assurances.fr', specialty: 'Compagnie',             atout: 'PME, professions libérales, décennale' },
      { name: 'Swiss Life',      domain: 'swisslife.fr',          specialty: 'Compagnie',             atout: 'Prévoyance, santé collective, retraite, indépendants' },
    ],
  },
  // ─── ASSURANCE 3.2 — Spécialistes pros & indépendants ─
  {
    id: 'assurance-specialistes',
    family: 'assurance',
    icon: 'fa-user-tie',
    color: 'rose-600',
    title: 'Spécialistes pros & indépendants',
    description: 'Assureurs ciblés sur les professions libérales, IT, conseil, cyber et grands risques.',
    items: [
      { name: 'Hiscox',            domain: 'hiscox.fr',                   specialty: 'Spécialiste TPE/PME',  atout: 'Référence RC Pro consultants, IT, services. Souscription rapide' },
      { name: 'AIG',               domain: 'aig.com',                     specialty: 'Grandes entreprises',  atout: 'RC Pro complexes, D&O dirigeants, cyber, lignes financières' },
      { name: 'Chubb',             domain: 'chubb.com',                   specialty: 'Risques complexes',    atout: 'Multinationales, cyber, RC pro métiers réglementés' },
      { name: 'CNA Hardy',         domain: 'cnahardy.com',                specialty: 'Lignes pro',           atout: 'RC Pro IT, professions du conseil, financial lines' },
      { name: 'Beazley',           domain: 'beazley.com',                 specialty: 'Cyber & pro',          atout: 'Cyber-risque leader mondial, RC santé et conseil' },
      { name: 'Liberty Specialty', domain: 'libertyspecialtymarkets.com', specialty: 'Pro & construction',   atout: 'Décennale, RC Pro BTP, risques industriels' },
    ],
  },
  // ─── ASSURANCE 3.3 — Assurtechs & néo-courtiers ───────
  {
    id: 'assurance-assurtechs',
    family: 'assurance',
    icon: 'fa-bolt',
    color: 'violet-600',
    title: 'Assurtechs & néo-courtiers',
    description: 'Acteurs 100 % digitaux pour souscription instantanée, indépendants et freelances.',
    items: [
      { name: 'Orus',    domain: 'orus.eu',    specialty: 'Assurtech PME/TPE', atout: 'Souscription 100% digitale, partenariats Wakam et Munich Re, 40 000+ assurés' },
      { name: 'Coover',  domain: 'coover.fr',  specialty: 'Courtier en ligne', atout: '13 partenaires assureurs, comparateur multi-produits pro' },
      { name: 'Stello',  domain: 'stello.eu',  specialty: 'Courtier digital',  atout: '20 partenaires (AXA, Hiscox, April, Malakoff…), espace client unifié' },
      { name: 'Simplis', domain: 'simplis.fr', specialty: 'Indépendants',      atout: '1 300+ activités acceptées, professions réglementées' },
      { name: 'Wemind',  domain: 'wemind.io',  specialty: 'Freelances',        atout: 'RC Pro, mutuelle, prévoyance, syndicat freelance' },
      { name: 'Acheel',  domain: 'acheel.com', specialty: 'Multi-branches',    atout: 'Tarifs compétitifs, souscription instantanée' },
    ],
  },
  // ─── ASSURANCE 4.1 — Grossistes généralistes ──────────
  {
    id: 'assurance-grossistes-generalistes',
    family: 'assurance',
    icon: 'fa-network-wired',
    color: 'sky-600',
    title: 'Courtiers grossistes généralistes',
    description: 'Wholesalers donnant accès à plusieurs assureurs via une seule plateforme — précieux en démarrage.',
    items: [
      { name: 'April',          domain: 'april.com',     specialty: 'Grossiste généraliste majeur', atout: 'Santé, prévoyance, emprunteur, IARD pro. Plateforme APRIL On' },
      { name: 'Solly Azar',     domain: 'sollyazar.com', specialty: 'Grossiste IARD',               atout: 'Auto, MRH, pro, emprunteur. Outils de souscription performants' },
      { name: 'AssurOne Group', domain: 'assurone.com',  specialty: 'Multi-branches',               atout: 'Auto, MRH, santé, pro. Plateforme digitale étendue' },
      { name: 'Wakam',          domain: 'wakam.com',     specialty: 'Assureur B2B',                 atout: 'White label, partenariats assurtechs, API' },
      { name: 'CFDP / Néoliane',domain: 'cfdp.fr',       specialty: 'Santé/prévoyance pro',         atout: 'TNS, professions libérales, mutuelles entreprise' },
      { name: 'MAXANCE',        domain: 'maxance.fr',    specialty: 'IARD pro & particuliers',      atout: 'Multirisques pro, flottes, RC Pro artisans' },
      { name: 'Albingia',       domain: 'albingia.fr',   specialty: 'Risques de niche',             atout: 'RC Pro, dommages biens, professions atypiques' },
    ],
  },
  // ─── ASSURANCE 4.2 — Grossistes TNS & santé ───────────
  {
    id: 'assurance-grossistes-tns',
    family: 'assurance',
    icon: 'fa-heart-pulse',
    color: 'sky-600',
    title: 'Grossistes TNS & santé',
    description: 'Spécialistes santé collective, prévoyance TNS, retraite Madelin et lignes financières.',
    items: [
      { name: 'Alptis',          domain: 'alptis.org',          specialty: 'Grossiste TNS & santé pro', atout: 'Référence santé/prévoyance indépendants, loi Madelin, dirigeants' },
      { name: 'Henner',          domain: 'henner.com',          specialty: 'Santé collective',          atout: 'Mutuelle entreprise, expatriation, grands comptes' },
      { name: 'SwissLife Prévoyance', domain: 'swisslife.fr',   specialty: 'Grossiste partenaire',      atout: 'Distribution via courtiers, prévoyance TNS, retraite' },
      { name: 'Malakoff Humanis',domain: 'malakoffhumanis.com', specialty: 'Groupe paritaire',          atout: 'Santé collective, prévoyance, retraite supplémentaire' },
      { name: 'AXA XL',          domain: 'axaxl.com',           specialty: 'Wholesale lignes fin.',     atout: 'Cyber, D&O, RC Pro grandes entreprises' },
      { name: 'Zurich Wholesale',domain: 'zurich.com',          specialty: 'Risques d\'entreprise',     atout: 'Dommages aux biens, RC, lignes spécialisées' },
    ],
  },
  // ─── ASSURANCE 4.3 — Grossistes métiers techniques ────
  {
    id: 'assurance-grossistes-metiers',
    family: 'assurance',
    icon: 'fa-helmet-safety',
    color: 'sky-600',
    title: 'Grossistes métiers techniques',
    description: 'Mutuelles BTP, architectes, professions libérales et lignes IARD spécialisées.',
    items: [
      { name: 'SMABTP',            domain: 'smabtp.fr',             specialty: 'Mutuelle BTP',           atout: 'Référence absolue décennale, RC Pro bâtiment et travaux publics' },
      { name: 'L\'Auxiliaire',     domain: 'auxiliaire.fr',         specialty: 'Mutuelle BTP',           atout: 'Décennale, dommages-ouvrage, artisans du bâtiment' },
      { name: 'MAF',               domain: 'maf.fr',                specialty: 'Architectes',            atout: 'Architectes, maîtres d\'œuvre, bureaux d\'études' },
      { name: 'CIPRES Assurances', domain: 'cipres-assurances.com', specialty: 'Professions libérales',  atout: 'Médecins, paramédicaux, juridiques' },
      { name: 'Verspieren',        domain: 'verspieren.com',        specialty: 'IARD pro',               atout: 'Flottes auto, transport, marchandises, RC industrielle' },
      { name: 'Gras Savoye / WTW', domain: 'wtwco.com',             specialty: 'Lignes financières',     atout: 'Cyber, construction, transport, B2B' },
    ],
  },
  // ─── BANQUE 5.1 — Banques de réseau ────────────────────
  {
    id: 'banque-reseau',
    family: 'banque',
    icon: 'fa-building-columns',
    color: 'secondary',
    title: 'Banques de réseau nationales',
    description: 'Grandes banques pour le crédit pro classique (prêt amortissable, trésorerie, création, lignes de crédit).',
    items: [
      { name: 'BNP Paribas',        domain: 'bnpparibas.fr',       specialty: 'Banque universelle', atout: 'Réseau dense, offre PME structurée, filiale BNP Paribas Leasing Solutions' },
      { name: 'Crédit Agricole',    domain: 'credit-agricole.fr',  specialty: 'Banque mutualiste',  atout: 'Premier financeur des PME et de l\'agriculture. CA Leasing & Factoring' },
      { name: 'Société Générale',   domain: 'societegenerale.fr',  specialty: 'Banque universelle', atout: 'Filiale Franfinance, partenariat Ayvens (LLD)' },
      { name: 'BPCE',               domain: 'bpce.fr',             specialty: 'Banque mutualiste',  atout: 'Banque Populaire / Caisse d\'Épargne, BPCE Lease pour le matériel' },
      { name: 'Crédit Mutuel / CIC',domain: 'creditmutuel.fr',     specialty: 'Banque mutualiste',  atout: 'Pro et PME, Crédit Mutuel Leasing (50+ ans d\'expérience)' },
      { name: 'La Banque Postale',  domain: 'labanquepostale.fr',  specialty: 'Banque universelle', atout: 'PME, ETI, crédit-bail mobilier et immobilier via LBP Leasing & Factoring' },
      { name: 'LCL',                domain: 'lcl.fr',              specialty: 'Banque réseau',      atout: 'Pro et PME, LCL Leasing pour le crédit-bail' },
      { name: 'HSBC / CCF',         domain: 'ccf.fr',              specialty: 'Banque internationale',atout: 'PME structurées, international, financement d\'équipement' },
    ],
  },
  // ─── BANQUE 5.2 — Publiques & garantes ────────────────
  {
    id: 'banque-publiques',
    family: 'banque',
    icon: 'fa-landmark',
    color: 'accent',
    title: 'Banques publiques & garantes',
    description: 'Bpifrance et sociétés de caution mutuelle pour sécuriser et accélérer le financement.',
    items: [
      { name: 'Bpifrance', domain: 'bpifrance.fr', specialty: 'Banque publique',  atout: 'Prêts garantis, crédit-bail mobilier (à partir de 70 k€), garanties création' },
      { name: 'SIAGI',     domain: 'siagi.com',    specialty: 'Caution mutuelle', atout: 'Garantie pour artisans, commerçants, professions libérales' },
      { name: 'SOCAMA',    domain: 'socama.com',   specialty: 'Caution mutuelle', atout: 'Garantie Banques Populaires, ciblée TPE et création' },
    ],
  },
  // ─── BANQUE 5.3 — Néobanques pro ──────────────────────
  {
    id: 'banque-neo',
    family: 'banque',
    icon: 'fa-mobile-screen',
    color: 'sky-600',
    title: 'Néobanques pro & banques en ligne',
    description: 'Comptes pro digitaux, partenariats financement et assurance embarqués.',
    items: [
      { name: 'Qonto',          domain: 'qonto.com',      specialty: 'Néobanque pro',       atout: '200 000+ entreprises clientes, partenariats Defacto et October' },
      { name: 'Shine',          domain: 'shine.fr',       specialty: 'Néobanque (SocGen)',  atout: 'TPE et indépendants, partenariats assurance et financement' },
      { name: 'Boursorama Pro', domain: 'boursorama.com', specialty: 'Banque en ligne',     atout: 'Comptes pro, crédits aux indépendants' },
      { name: 'Memo Bank',      domain: 'memo.bank',      specialty: 'Néobanque PME',       atout: 'PME établies, crédits pro, comptes structurés' },
      { name: 'Anytime / Finom',domain: 'anytime.eu',     specialty: 'Néobanque pro',       atout: 'Indépendants et TPE, écosystème de partenariats' },
    ],
  },
  // ─── BANQUE 5.4 — Plateformes alternatives ────────────
  {
    id: 'banque-alternatives',
    family: 'banque',
    icon: 'fa-rocket',
    color: 'amber-600',
    title: 'Financement alternatif',
    description: 'Crowdlending, RBF, microcrédit, prêts d\'honneur — pour combler ce que les banques ne font pas.',
    items: [
      { name: 'October',           domain: 'october.eu',              specialty: 'Crowdlending PME',         atout: 'Prêts pro 30 k€ à 5 M€, décision rapide, réseau de courtiers' },
      { name: 'Defacto',           domain: 'defacto.com',             specialty: 'Court terme',              atout: 'Avances de trésorerie embarquées dans les outils SaaS, API' },
      { name: 'Mansa',             domain: 'getmansa.com',            specialty: 'Indépendants',             atout: 'Spécialiste freelances, validation rapide, jusqu\'à 50 k€' },
      { name: 'Karmen',            domain: 'karmen.io',               specialty: 'Revenue-based financing',  atout: 'Financement SaaS et e-commerce sur récurrents' },
      { name: 'Silvr',             domain: 'silvr.co',                specialty: 'Non dilutif',              atout: 'E-commerce et SaaS, jusqu\'à 10 M€' },
      { name: 'ADIE',              domain: 'adie.org',                specialty: 'Microcrédit',              atout: 'Aide à la création, complémentaire des banques' },
      { name: 'Initiative France', domain: 'initiative-france.fr',    specialty: 'Prêts d\'honneur',         atout: 'Réseau d\'aide à la création' },
      { name: 'Réseau Entreprendre',domain: 'reseau-entreprendre.org',specialty: 'Prêts d\'honneur',         atout: 'Accompagnement entrepreneurs ambitieux' },
    ],
  },
  // ─── LEASING 6.1 — Filiales bancaires (leaders) ───────
  {
    id: 'leasing-filiales',
    family: 'leasing',
    icon: 'fa-building-columns',
    color: 'primary',
    title: 'Filiales bancaires (leaders du marché)',
    description: 'Captives leasing des grands réseaux bancaires français — couverture mobilier, immobilier, transport.',
    items: [
      { name: 'BNP Paribas Leasing',    domain: 'leasingsolutions.bnpparibas.fr',       specialty: 'Filiale BNPP', atout: 'Leader européen, matériel industriel, IT, médical, BTP. Réseau de prescripteurs étendu' },
      { name: 'CA Leasing & Factoring', domain: 'ca-leasingfactoring.com',              specialty: 'Filiale CA',   atout: 'Mobilier et immobilier, énergies renouvelables (SOFERGIE)' },
      { name: 'SG Equipment Finance',   domain: 'equipmentfinance.societegenerale.com', specialty: 'Filiale SG',   atout: 'Matériel industriel, IT, médical, transport, énergies vertes' },
      { name: 'BPCE Lease',             domain: 'bpcelease.com',                        specialty: 'Filiale BPCE', atout: 'Leasing matériel pro, véhicules, immobilier, agricole' },
      { name: 'Crédit Mutuel Leasing',  domain: 'creditmutuel-leasing.eu',              specialty: 'Filiale CM',   atout: '50+ ans d\'expérience, LOA, LOA ballon, LLD, location financière' },
      { name: 'LCL Leasing',            domain: 'lcl.fr',                               specialty: 'Filiale LCL',  atout: 'Crédit-bail mobilier pour PME' },
      { name: 'LBP Leasing & Factoring',domain: 'labanquepostale.fr',                   specialty: 'Filiale LBP',  atout: 'Crédit-bail mobilier et immobilier, financement jusqu\'à 100 %' },
    ],
  },
  // ─── LEASING 6.2 — Spécialistes mobilier ──────────────
  {
    id: 'leasing-materiel',
    family: 'leasing',
    icon: 'fa-cogs',
    color: 'primary',
    title: 'Spécialistes du crédit-bail mobilier',
    description: 'Sociétés financières ASF spécialisées en équipement, IT/bureautique, médical et industriel.',
    items: [
      { name: 'Franfinance',       domain: 'franfinance.com',                specialty: 'Spécialiste équipement', atout: 'Financement matériel pro, partenariats distributeurs, BTP, IT, médical' },
      { name: 'Bpifrance Leasing', domain: 'bpifrance.fr',                   specialty: 'Banque publique',        atout: 'Crédit-bail mobilier à partir de 70 k€ HT, soutien création' },
      { name: 'Sogelease',         domain: 'sogelease.com',                  specialty: 'Filiale SG',             atout: 'Crédit-bail mobilier multi-secteurs' },
      { name: 'GRENKE France',     domain: 'grenke.fr',                      specialty: 'Petit ticket',           atout: 'IT/bureautique (1-100 k€), procédure très rapide, médical, machines' },
      { name: 'Cetelem Pro',       domain: 'cetelem.fr',                     specialty: 'BNPP Personal Finance',  atout: 'Prêt et leasing matériel, partenariats vendeurs' },
      { name: 'Locam',             domain: 'locam.fr',                       specialty: 'Filiale Crédit Mutuel Arkéa', atout: 'Location équipement pro, télécoms, sécurité' },
      { name: 'Siemens Financial', domain: 'siemens-financialservices.com',  specialty: 'Captive industrielle',   atout: 'Matériel industriel, médical, énergie' },
      { name: 'DLL',               domain: 'dllgroup.com',                   specialty: 'Filiale Rabobank',       atout: 'Vendor finance, matériel agricole, médical, construction' },
    ],
  },
  // ─── LEASING 6.3 — Crédit-bail immobilier (CBI) ───────
  {
    id: 'leasing-immobilier',
    family: 'leasing',
    icon: 'fa-building',
    color: 'primary',
    title: 'Crédit-bail immobilier (CBI)',
    description: 'Financement de bureaux, commerces, entrepôts et locaux d\'activité — tickets > 500 k€.',
    items: [
      { name: 'BNP Paribas Lease Group Immo', domain: 'leasingsolutions.bnpparibas.fr', specialty: 'Filiale BNPP',    atout: 'Bureaux, commerces, entrepôts, santé. Ticket > 1,5 M€' },
      { name: 'CA Leasing Immobilier',        domain: 'ca-leasingfactoring.com',        specialty: 'Filiale CA',      atout: 'CBI grands projets, énergies renouvelables (SOFERGIE)' },
      { name: 'SG Real Estate Leasing',       domain: 'societegenerale.com',            specialty: 'Filiale SG',      atout: 'CBI bureaux, logistique, hôtellerie' },
      { name: 'Natixis Lease Immobilier',     domain: 'natixis.com',                    specialty: 'Filiale BPCE',    atout: 'CBI commerces et bureaux, montages structurés' },
      { name: 'BPI France Immo',              domain: 'bpifrance.fr',                   specialty: 'Banque publique', atout: 'CBI co-financé pour PME industrielles' },
    ],
  },
  // ─── LOA/LLD 7.1 — Majors généralistes ────────────────
  {
    id: 'loa-lld-majors',
    family: 'loa-lld',
    icon: 'fa-truck-fast',
    color: 'emerald-600',
    title: 'Majors LOA / LLD multi-marques',
    description: 'Loueurs longue durée et opérateurs LOA généralistes — flottes d\'entreprise et indépendants.',
    items: [
      { name: 'Arval',           domain: 'arval.fr',     specialty: 'Major LLD/LOA (BNPP)', atout: '1,9 M véhicules financés, leader français, accessible TPE/PME, services tout-inclus' },
      { name: 'Ayvens',          domain: 'ayvens.com',   specialty: 'Major mondial (SG)',   atout: '3,3 M véhicules, leader mondial, électrification (ex-ALD + LeasePlan)' },
      { name: 'Alphabet',        domain: 'alphabet.com', specialty: 'Captive BMW',          atout: 'LLD multi-marques, flottes d\'entreprise, mobilité électrique' },
      { name: 'Athlon',          domain: 'athlon.com',   specialty: 'Major européen',       atout: 'LLD multi-marques, intégré BNPP Personal Finance' },
      { name: 'Leasys',          domain: 'leasys.com',   specialty: 'Major (Stellantis)',   atout: 'LLD/LOA, forte gamme Stellantis (Peugeot, Citroën, Fiat, Opel, Jeep)' },
      { name: 'Sixt Mobility',   domain: 'sixt.fr',      specialty: 'Spécialiste flottes',  atout: '~33 000 contrats, flexibilité, mid-term rental' },
      { name: 'Parcours',        domain: 'parcours.fr',  specialty: 'Filiale Renault',      atout: 'Réseau RCI/Mobilize, multi-marques' },
    ],
  },
  // ─── LOA/LLD 7.2 — Captives constructeurs ─────────────
  {
    id: 'loa-lld-captives',
    family: 'loa-lld',
    icon: 'fa-car-side',
    color: 'emerald-600',
    title: 'Captives constructeurs',
    description: 'Filiales financement des constructeurs — meilleures conditions sur la marque associée.',
    items: [
      { name: 'Mobilize Financial',   domain: 'mobilize-fs.fr',     specialty: 'Captive Renault',    atout: 'LOA/LLD Renault, Dacia, Alpine, Nissan' },
      { name: 'Stellantis FS',        domain: 'stellantis.com',     specialty: 'Captive Stellantis', atout: 'Toutes marques Stellantis, offres B2B' },
      { name: 'VW Financial Services',domain: 'vwfs.fr',            specialty: 'Captive VW Group',   atout: 'VW, Audi, Seat, Skoda, Porsche pro' },
      { name: 'Mercedes-Benz FS',     domain: 'mercedes-benz.fr',   specialty: 'Captive Mercedes',   atout: 'VP et VU Mercedes, Smart' },
      { name: 'BMW Financial / Alphabet',domain: 'bmw.fr',          specialty: 'Captive BMW',        atout: 'BMW, Mini, flottes multi-marques' },
      { name: 'Toyota / Kinto',       domain: 'kinto-mobility.fr',  specialty: 'Captive Toyota',     atout: 'Toyota, Lexus, mobilité partagée' },
      { name: 'Ford Lease',           domain: 'ford.fr',            specialty: 'Captive Ford',       atout: 'VU Ford, flottes utilitaires' },
    ],
  },
  // ─── LOA/LLD 7.3 — Acteurs digitaux & courtiers ───────
  {
    id: 'loa-lld-digitaux',
    family: 'loa-lld',
    icon: 'fa-laptop',
    color: 'emerald-600',
    title: 'Acteurs digitaux & courtiers LOA/LLD',
    description: 'Plateformes en ligne et courtiers spécialisés — comparaison rapide, véhicules neufs et reconditionnés.',
    items: [
      { name: 'Lizy',          domain: 'lizy.eu',         specialty: 'Pure player digital',  atout: 'LLD d\'occasion reconditionnée, PME et indépendants, livraison 3 semaines' },
      { name: 'Welease',       domain: 'welease.fr',      specialty: 'Plateforme digitale',  atout: 'LLD multi-marques en ligne' },
      { name: 'Leazing.com',   domain: 'leazing.com',     specialty: 'Plateforme digitale',  atout: 'Comparateur et courtage LLD/LOA pros' },
      { name: 'Captain Drive', domain: 'captaindrive.com',specialty: 'Courtier LLD',         atout: 'Multi-marques, conseillers dédiés' },
      { name: 'Reezocar Pro',  domain: 'reezocar.com',    specialty: 'Courtier LOA',         atout: 'Véhicules neufs et occasion' },
      { name: 'Aramis Pro',    domain: 'aramisauto.com',  specialty: 'Distributeur',         atout: 'Offres LOA véhicules d\'occasion certifiés' },
    ],
  },
];

export const PARTNER_FAMILIES = [
  { id: 'all',         label: 'Tous les partenaires', icon: 'fa-globe' },
  { id: 'assurance',   label: 'Assurance',            icon: 'fa-shield-halved' },
  { id: 'banque',      label: 'Banque',               icon: 'fa-building-columns' },
  { id: 'leasing',     label: 'Leasing & CBI',        icon: 'fa-cogs' },
  { id: 'loa-lld',     label: 'LOA / LLD véhicules',  icon: 'fa-truck-fast' },
];
