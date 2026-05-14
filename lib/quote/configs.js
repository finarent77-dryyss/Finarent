// ─── Configurations des tunnels de devis ───────────────────
// Chaque produit définit ses étapes. Le QuoteWizard les rend
// génériquement. Pour ajouter un produit : ajouter une config ici.

export const CAR_BRANDS = [
  { name: 'Renault',    domain: 'renault.fr' },
  { name: 'Peugeot',    domain: 'peugeot.fr' },
  { name: 'Citroën',    domain: 'citroen.fr' },
  { name: 'Dacia',      domain: 'dacia.fr' },
  { name: 'Toyota',     domain: 'toyota.fr' },
  { name: 'Volkswagen', domain: 'volkswagen.fr' },
  { name: 'BMW',        domain: 'bmw.fr' },
  { name: 'Ford',       domain: 'ford.fr' },
  { name: 'Audi',       domain: 'audi.fr' },
  { name: 'Mercedes',   domain: 'mercedes-benz.fr' },
  { name: 'Tesla',      domain: 'tesla.com' },
  { name: 'Fiat',       domain: 'fiat.fr' },
  { name: 'Opel',       domain: 'opel.fr' },
  { name: 'Nissan',     domain: 'nissan.fr' },
  { name: 'Hyundai',    domain: 'hyundai.fr' },
  { name: 'Kia',        domain: 'kia.com' },
  { name: 'Skoda',      domain: 'skoda.fr' },
  { name: 'Seat',       domain: 'seat.fr' },
];

export const MOTO_BRANDS = [
  { name: 'Yamaha',     domain: 'yamaha-motor.fr' },
  { name: 'Honda',      domain: 'honda.fr' },
  { name: 'Kawasaki',   domain: 'kawasaki.fr' },
  { name: 'BMW Motorrad', domain: 'bmw-motorrad.fr' },
  { name: 'KTM',        domain: 'ktm.com' },
  { name: 'Triumph',    domain: 'triumphmotorcycles.fr' },
  { name: 'Ducati',     domain: 'ducati.fr' },
  { name: 'Suzuki',     domain: 'suzuki.fr' },
  { name: 'Piaggio',    domain: 'piaggio.com' },
  { name: 'Vespa',      domain: 'vespa.com' },
  { name: 'Peugeot',    domain: 'peugeot-motocycles.fr' },
  { name: 'MV Agusta',  domain: 'mvagusta.com' },
];

// ─── AUTO ──────────────────────────────────────────────────
export const autoConfig = {
  title: 'Votre devis auto',
  product: 'auto',
  icon: 'fa-car',
  steps: [
    {
      id: 'brand', title: 'Quelle est la marque de votre voiture ?',
      field: 'brand', type: 'brand-grid', options: CAR_BRANDS,
      validate: (v) => !!v.brand,
    },
    {
      id: 'date-mec', title: 'Quand a-t-elle été mise en circulation ?',
      field: 'dateMec', type: 'month-year', placeholder: 'MM/AAAA',
      helper: 'Cette date figure sur votre <strong>carte grise (zone B)</strong>. Pour un véhicule neuf, indiquez l\'année en cours.',
      validate: (v) => /^(0[1-9]|1[0-2])\/\d{4}$/.test(v.dateMec || ''),
    },
    {
      id: 'fuel', title: 'Quelle est son énergie ?',
      field: 'fuel', type: 'choice-cards', columns: 2,
      options: [
        { value: 'essence',  label: 'Essence',  icon: 'fa-gas-pump' },
        { value: 'diesel',   label: 'Diesel',   icon: 'fa-truck-droplet' },
        { value: 'hybride',  label: 'Hybride',  icon: 'fa-leaf', badge: 'Éco' },
        { value: 'electrique', label: 'Électrique', icon: 'fa-bolt', badge: '0 émission' },
      ],
      validate: (v) => !!v.fuel,
    },
    {
      id: 'usage', title: 'Quel est l\'usage du véhicule ?',
      field: 'usage', type: 'choice-cards', columns: 1,
      options: [
        { value: 'prive',         label: 'Privé',                       desc: 'Trajets domicile-travail + loisirs', icon: 'fa-house' },
        { value: 'prive-pro',     label: 'Privé + déplacements pro',    desc: 'Quelques rendez-vous occasionnels',  icon: 'fa-briefcase' },
        { value: 'tous-deplace',  label: 'Tous déplacements pro',       desc: 'Représentation commerciale, livraison', icon: 'fa-truck-fast' },
      ],
      validate: (v) => !!v.usage,
    },
    {
      id: 'location', title: 'Son lieu de stationnement',
      field: 'postal', type: 'postal-city',
      validate: (v) => /^\d{5}$/.test(v.postal || '') && v.city,
    },
    {
      id: 'driver', title: 'Votre profil conducteur',
      type: 'fields',
      fields: [
        { field: 'licenseYear', type: 'number', label: 'Année d\'obtention du permis B', placeholder: '2010', suffix: 'année' },
        { field: 'bonus', type: 'number', label: 'Coefficient bonus-malus', placeholder: '0.50', helper: 'Entre 0.50 (50% de bonus) et 3.50 (malus). En cas de doute, mettez 1.00.' },
        { field: 'claims', type: 'number', label: 'Sinistres responsables ces 3 dernières années', placeholder: '0', suffix: 'sinistre(s)' },
      ],
      validate: (v) => v.licenseYear && v.bonus !== '' && v.claims !== '',
    },
    {
      id: 'formula', title: 'Quelle formule vous intéresse ?',
      field: 'formula', type: 'choice-cards', columns: 1,
      options: [
        { value: 'tiers',          label: 'Au tiers',          desc: 'Responsabilité civile + assistance. La formule la moins chère.', icon: 'fa-shield', badge: 'Économique' },
        { value: 'tiers-plus',     label: 'Tiers étendu',       desc: 'RC + vol, incendie, bris de glace, catastrophes naturelles.', icon: 'fa-shield-halved', badge: 'Équilibrée' },
        { value: 'tous-risques',   label: 'Tous risques',       desc: 'Couverture maximale, y compris les dommages tous accidents.', icon: 'fa-shield-virus', badge: 'Recommandée' },
      ],
      validate: (v) => !!v.formula,
    },
    {
      id: 'contact', title: 'Recevoir votre devis',
      subtitle: 'Vous serez recontacté(e) sous 48 h par un conseiller Finarent.',
      type: 'fields',
      fields: [
        { field: 'firstName', type: 'text', label: 'Prénom', placeholder: 'Marie' },
        { field: 'lastName',  type: 'text', label: 'Nom',    placeholder: 'Dupont' },
        { field: 'email',     type: 'email', label: 'Email', placeholder: 'marie@example.com' },
        { field: 'phone',     type: 'tel',  label: 'Téléphone', placeholder: '06 12 34 56 78' },
      ],
      validate: (v) => v.firstName && v.lastName && /^[^@]+@[^@]+\.[^@]+$/.test(v.email || '') && v.phone,
    },
  ],
};

// ─── MOTO ──────────────────────────────────────────────────
export const motoConfig = {
  title: 'Votre devis moto',
  product: 'moto',
  icon: 'fa-motorcycle',
  steps: [
    {
      id: 'category', title: 'Quel type de 2-roues ?',
      field: 'motoCategory', type: 'choice-cards', columns: 2,
      options: [
        { value: 'scooter-50',     label: 'Scooter 50 cm³',  desc: 'BSR, cyclo, < 50 cm³', icon: 'fa-motorcycle' },
        { value: 'scooter-125',    label: 'Scooter 125 cm³', desc: 'A1 ou permis B 2 ans', icon: 'fa-motorcycle' },
        { value: 'moto-roadster',  label: 'Moto routière',    desc: 'Roadster, sportive, GT', icon: 'fa-motorcycle' },
        { value: 'moto-trail',     label: 'Trail / Custom',   desc: 'Trail, custom, cruiser',   icon: 'fa-motorcycle' },
      ],
      validate: (v) => !!v.motoCategory,
    },
    {
      id: 'brand', title: 'Quelle est la marque ?',
      field: 'brand', type: 'brand-grid', options: MOTO_BRANDS,
      validate: (v) => !!v.brand,
    },
    {
      id: 'date-mec', title: 'Quand a-t-elle été mise en circulation ?',
      field: 'dateMec', type: 'month-year', placeholder: 'MM/AAAA',
      helper: 'Cette date figure sur votre <strong>carte grise (zone B)</strong>.',
      validate: (v) => /^(0[1-9]|1[0-2])\/\d{4}$/.test(v.dateMec || ''),
    },
    {
      id: 'usage', title: 'Quel usage ?',
      field: 'usage', type: 'choice-cards', columns: 2,
      options: [
        { value: 'occasionnel', label: 'Occasionnel',       desc: 'Beau temps, loisirs', icon: 'fa-sun' },
        { value: 'au-km',       label: 'Au kilomètre',      desc: '< 4 000 km/an',       icon: 'fa-gauge', badge: '−30%' },
        { value: 'quotidien',   label: 'Quotidien',         desc: 'Domicile-travail',    icon: 'fa-road' },
        { value: 'pro',         label: 'Professionnel',     desc: 'Livraison, coursier', icon: 'fa-briefcase' },
      ],
      validate: (v) => !!v.usage,
    },
    {
      id: 'location', title: 'Lieu de stationnement',
      field: 'postal', type: 'postal-city',
      validate: (v) => /^\d{5}$/.test(v.postal || '') && v.city,
    },
    {
      id: 'driver', title: 'Votre profil',
      type: 'fields',
      fields: [
        { field: 'licenseYear', type: 'number', label: 'Année d\'obtention du permis', placeholder: '2010' },
        { field: 'bonus', type: 'number', label: 'Bonus-malus moto', placeholder: '0.50', helper: '0.50 (50% bonus) à 3.50 (malus).' },
        { field: 'claims', type: 'number', label: 'Sinistres ces 3 dernières années', placeholder: '0' },
      ],
      validate: (v) => v.licenseYear && v.bonus !== '' && v.claims !== '',
    },
    {
      id: 'formula', title: 'Quelle formule ?',
      field: 'formula', type: 'choice-cards', columns: 1,
      options: [
        { value: 'tiers',        label: 'Au tiers',        desc: 'RC obligatoire + assistance', icon: 'fa-shield' },
        { value: 'tiers-vol',    label: 'Tiers + vol/incendie', desc: 'RC + vol + incendie + bris de glace', icon: 'fa-shield-halved', badge: 'Équilibrée' },
        { value: 'tous-risques', label: 'Tous risques',     desc: 'Couverture maximale + équipement pilote', icon: 'fa-shield-virus', badge: 'Recommandée' },
      ],
      validate: (v) => !!v.formula,
    },
    {
      id: 'contact', title: 'Recevoir votre devis', subtitle: 'Réponse sous 48 h par un conseiller Finarent.',
      type: 'fields',
      fields: [
        { field: 'firstName', type: 'text', label: 'Prénom' },
        { field: 'lastName',  type: 'text', label: 'Nom' },
        { field: 'email',     type: 'email', label: 'Email' },
        { field: 'phone',     type: 'tel',  label: 'Téléphone' },
      ],
      validate: (v) => v.firstName && v.lastName && /^[^@]+@[^@]+\.[^@]+$/.test(v.email || '') && v.phone,
    },
  ],
};

// ─── HABITATION ────────────────────────────────────────────
export const habitationConfig = {
  title: 'Votre devis habitation',
  product: 'habitation',
  icon: 'fa-house-chimney',
  steps: [
    {
      id: 'housing', title: 'Quel type de logement ?',
      field: 'housing', type: 'choice-cards', columns: 2,
      options: [
        { value: 'appart-loc',   label: 'Appartement loué',     desc: 'Locataire', icon: 'fa-building' },
        { value: 'appart-prop',  label: 'Appartement propriété', desc: 'Propriétaire occupant', icon: 'fa-building-shield' },
        { value: 'maison-loc',   label: 'Maison louée',         desc: 'Locataire', icon: 'fa-house' },
        { value: 'maison-prop',  label: 'Maison propriété',     desc: 'Propriétaire occupant', icon: 'fa-house-chimney-window' },
      ],
      validate: (v) => !!v.housing,
    },
    {
      id: 'surface', title: 'Quelle est sa superficie ?',
      type: 'fields',
      fields: [
        { field: 'surface', type: 'number', label: 'Surface habitable', placeholder: '60', suffix: 'm²' },
        { field: 'rooms',   type: 'number', label: 'Nombre de pièces principales', placeholder: '3', helper: 'Hors cuisine, salle de bain et toilettes.' },
      ],
      validate: (v) => v.surface > 0 && v.rooms > 0,
    },
    {
      id: 'location', title: 'Adresse du logement',
      field: 'postal', type: 'postal-city',
      validate: (v) => /^\d{5}$/.test(v.postal || '') && v.city,
    },
    {
      id: 'value', title: 'Valeur des biens à assurer',
      type: 'fields',
      fields: [
        { field: 'value', type: 'number', label: 'Valeur totale du mobilier', placeholder: '15000', suffix: '€', helper: 'Estimation globale : meubles, électroménager, vêtements, électronique.' },
        { field: 'valuables', type: 'number', label: 'Objets de valeur (option)', placeholder: '0', suffix: '€', helper: 'Bijoux, œuvres d\'art, instruments de musique > 1 500 €.' },
      ],
      validate: (v) => v.value > 0,
    },
    {
      id: 'formula', title: 'Quelle formule ?',
      field: 'formula', type: 'choice-cards', columns: 1,
      options: [
        { value: 'eco',        label: 'Économique',          desc: 'MRH essentielle : RC, incendie, dégât des eaux, vol', icon: 'fa-shield' },
        { value: 'confort',    label: 'Confort',             desc: '+ bris de glace, vol amélioré, catastrophes naturelles', icon: 'fa-shield-halved', badge: 'Recommandée' },
        { value: 'premium',    label: 'Premium',             desc: 'Tous risques + objets de valeur + protection juridique', icon: 'fa-crown', badge: 'Premium' },
      ],
      validate: (v) => !!v.formula,
    },
    {
      id: 'contact', title: 'Recevoir votre devis', subtitle: 'Réponse sous 48 h.',
      type: 'fields',
      fields: [
        { field: 'firstName', type: 'text', label: 'Prénom' },
        { field: 'lastName',  type: 'text', label: 'Nom' },
        { field: 'email',     type: 'email', label: 'Email' },
        { field: 'phone',     type: 'tel',  label: 'Téléphone' },
      ],
      validate: (v) => v.firstName && v.lastName && /^[^@]+@[^@]+\.[^@]+$/.test(v.email || '') && v.phone,
    },
  ],
};

// ─── SANTÉ ─────────────────────────────────────────────────
export const santeConfig = {
  title: 'Votre devis santé',
  product: 'sante',
  icon: 'fa-heart-pulse',
  steps: [
    {
      id: 'profile', title: 'Pour qui cherchez-vous une mutuelle ?',
      field: 'profile', type: 'choice-cards', columns: 2,
      options: [
        { value: 'solo',     label: 'Moi seul(e)',     desc: 'Couverture individuelle',  icon: 'fa-user' },
        { value: 'couple',   label: 'Mon conjoint et moi', desc: 'Couverture couple',     icon: 'fa-user-group' },
        { value: 'famille',  label: 'Toute la famille', desc: 'Avec enfants à charge', icon: 'fa-people-roof', badge: 'Économies' },
        { value: 'senior',   label: 'Senior 60+',      desc: 'Couverture renforcée',  icon: 'fa-person-cane' },
      ],
      validate: (v) => !!v.profile,
    },
    {
      id: 'age', title: 'Votre âge',
      type: 'fields',
      fields: [
        { field: 'age', type: 'number', label: 'Votre âge', placeholder: '35', suffix: 'ans' },
        { field: 'familySize', type: 'number', label: 'Nombre de personnes à couvrir', placeholder: '2', helper: 'Vous compris.' },
      ],
      validate: (v) => v.age > 0 && v.familySize > 0,
    },
    {
      id: 'status', title: 'Votre statut professionnel',
      field: 'status', type: 'choice-cards', columns: 2,
      options: [
        { value: 'salarie',     label: 'Salarié',          desc: 'Complémentaire à la mutuelle entreprise', icon: 'fa-briefcase' },
        { value: 'tns',         label: 'TNS / Indépendant', desc: 'Madelin déductible',           icon: 'fa-user-tie', badge: 'Fiscal' },
        { value: 'fonctionnaire', label: 'Fonctionnaire',  desc: 'Mutuelle fonction publique',   icon: 'fa-building-columns' },
        { value: 'retraite',    label: 'Retraité',          desc: 'Couverture renforcée',         icon: 'fa-person-cane' },
        { value: 'sans-emploi', label: 'Sans emploi / étudiant', desc: 'Couverture économique', icon: 'fa-graduation-cap' },
      ],
      validate: (v) => !!v.status,
    },
    {
      id: 'needs', title: 'Quels sont vos besoins prioritaires ?',
      field: 'needs', type: 'choice-cards', columns: 1,
      options: [
        { value: 'hospitalisation', label: 'Hospitalisation', desc: 'Chambre particulière, frais de séjour',   icon: 'fa-hospital' },
        { value: 'optique',        label: 'Optique & Dentaire', desc: 'Lunettes, lentilles, prothèses', icon: 'fa-glasses', badge: 'Fréquent' },
        { value: 'medecines-douces', label: 'Médecines douces', desc: 'Ostéopathie, acupuncture, nutrition', icon: 'fa-leaf' },
        { value: 'famille',         label: 'Maternité & famille', desc: 'Suivi grossesse, pédiatrie',         icon: 'fa-baby' },
      ],
      validate: (v) => !!v.needs,
    },
    {
      id: 'location', title: 'Où habitez-vous ?',
      field: 'postal', type: 'postal-city',
      validate: (v) => /^\d{5}$/.test(v.postal || '') && v.city,
    },
    {
      id: 'contact', title: 'Recevoir votre devis', subtitle: 'Réponse sous 48 h.',
      type: 'fields',
      fields: [
        { field: 'firstName', type: 'text', label: 'Prénom' },
        { field: 'lastName',  type: 'text', label: 'Nom' },
        { field: 'email',     type: 'email', label: 'Email' },
        { field: 'phone',     type: 'tel',  label: 'Téléphone' },
      ],
      validate: (v) => v.firstName && v.lastName && /^[^@]+@[^@]+\.[^@]+$/.test(v.email || '') && v.phone,
    },
  ],
};

// ─── RC PRO ────────────────────────────────────────────────
export const rcProConfig = {
  title: 'Votre devis RC Pro',
  product: 'rc-pro',
  icon: 'fa-shield-halved',
  steps: [
    {
      id: 'activity', title: 'Quel est votre secteur d\'activité ?',
      field: 'activity', type: 'choice-cards', columns: 2,
      options: [
        { value: 'btp',         label: 'BTP / Bâtiment',      desc: 'Décennale obligatoire',         icon: 'fa-hard-hat', badge: 'Décennale' },
        { value: 'medical',     label: 'Médical / Paramédical', desc: 'Profession réglementée',      icon: 'fa-user-doctor' },
        { value: 'conseil',     label: 'Conseil / Services',  desc: 'Consulting, formation, coaching', icon: 'fa-briefcase' },
        { value: 'immobilier',  label: 'Immobilier',          desc: 'Agent, gestion, syndic',          icon: 'fa-house-chimney' },
        { value: 'it',          label: 'IT / Numérique',      desc: 'Dev, agence web, e-commerce',     icon: 'fa-laptop-code' },
        { value: 'commerce',    label: 'Commerce / Artisanat', desc: 'Boutique, restaurant, atelier', icon: 'fa-store' },
        { value: 'transport',   label: 'Transport / Logistique', desc: 'Livraison, fret, taxi',       icon: 'fa-truck' },
        { value: 'autre',       label: 'Autre',                desc: 'Précisez ensuite',                icon: 'fa-ellipsis' },
      ],
      validate: (v) => !!v.activity,
    },
    {
      id: 'legal-form', title: 'Quelle est la forme juridique ?',
      field: 'legalForm', type: 'choice-cards', columns: 2,
      options: [
        { value: 'auto-entrepreneur', label: 'Auto-entrepreneur', desc: 'Micro-entreprise', icon: 'fa-user' },
        { value: 'ei',                label: 'EI / EIRL',         desc: 'Entreprise individuelle', icon: 'fa-user-tie' },
        { value: 'sarl',              label: 'SARL / EURL',       desc: '1 à plusieurs associés', icon: 'fa-building' },
        { value: 'sas',               label: 'SAS / SASU',        desc: 'Société par actions', icon: 'fa-building-columns', badge: 'Fréquent' },
        { value: 'sa',                label: 'SA',                desc: 'Société anonyme', icon: 'fa-building-flag' },
        { value: 'autre',             label: 'Autre',             desc: 'Association, SCP, etc.', icon: 'fa-ellipsis' },
      ],
      validate: (v) => !!v.legalForm,
    },
    {
      id: 'company', title: 'Votre entreprise',
      type: 'fields',
      fields: [
        { field: 'companyName', type: 'text', label: 'Raison sociale', placeholder: 'Ma Société SARL' },
        { field: 'revenue', type: 'number', label: 'Chiffre d\'affaires annuel', placeholder: '120000', suffix: '€' },
        { field: 'employees', type: 'number', label: 'Nombre de salariés (hors dirigeant)', placeholder: '0' },
      ],
      validate: (v) => v.companyName && v.revenue > 0 && v.employees !== '',
    },
    {
      id: 'location', title: 'Siège de l\'entreprise',
      field: 'postal', type: 'postal-city',
      validate: (v) => /^\d{5}$/.test(v.postal || '') && v.city,
    },
    {
      id: 'coverage', title: 'Garanties souhaitées',
      field: 'coverage', type: 'choice-cards', columns: 1,
      options: [
        { value: 'rc-seul',         label: 'RC Pro seule',                desc: 'Responsabilité civile professionnelle de base', icon: 'fa-shield' },
        { value: 'rc-multirisque',  label: 'RC + Multirisque pro',        desc: 'Locaux, matériel, pertes d\'exploitation',  icon: 'fa-shield-halved', badge: 'Recommandée' },
        { value: 'rc-cyber',        label: 'RC + Cyber-risques',           desc: 'RC + protection cyber-attaques + RGPD',      icon: 'fa-shield-virus', badge: 'Tech' },
        { value: 'tout-compris',    label: 'Couverture complète',          desc: 'RC + Multirisque + Cyber + Protection juridique', icon: 'fa-crown', badge: 'Premium' },
      ],
      validate: (v) => !!v.coverage,
    },
    {
      id: 'contact', title: 'Recevoir votre devis', subtitle: 'Réponse sous 48 h par un conseiller dédié pro.',
      type: 'fields',
      fields: [
        { field: 'firstName', type: 'text', label: 'Prénom du dirigeant' },
        { field: 'lastName',  type: 'text', label: 'Nom du dirigeant' },
        { field: 'email',     type: 'email', label: 'Email pro' },
        { field: 'phone',     type: 'tel',  label: 'Téléphone' },
      ],
      validate: (v) => v.firstName && v.lastName && /^[^@]+@[^@]+\.[^@]+$/.test(v.email || '') && v.phone,
    },
  ],
};
