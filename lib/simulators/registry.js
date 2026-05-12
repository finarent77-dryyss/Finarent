// Registry centralisé des simulateurs Finassur.
// Source de vérité unique. Toute la nav, le hub, les pages dynamiques
// et le sitemap s'alimentent ici. Pour ajouter un simulateur :
// 1) ajouter une entrée ci-dessous (available: false par défaut)
// 2) créer le composant dans components/simulators/working/<slug>.jsx
// 3) basculer available: true

export const CATEGORIES = [
  {
    slug: 'credit-immobilier',
    name: 'Crédit immobilier',
    short: 'Immobilier',
    icon: 'fa-house-chimney',
    color: 'indigo',
    desc: 'Simulez votre capacité, vos mensualités, et le coût total de votre prêt immobilier.',
  },
  {
    slug: 'credit-conso-auto',
    name: 'Crédit conso & auto',
    short: 'Conso / Auto',
    icon: 'fa-car',
    color: 'amber',
    desc: 'Crédit à la consommation, financement automobile, LOA et leasing.',
  },
  {
    slug: 'credit-professionnel',
    name: 'Crédit professionnel',
    short: 'Pro',
    icon: 'fa-briefcase',
    color: 'sky',
    desc: 'Financement et scoring bancaire pour entreprises et indépendants.',
  },
  {
    slug: 'assurance-emprunteur',
    name: 'Assurance emprunteur',
    short: 'Emprunteur',
    icon: 'fa-shield-heart',
    color: 'rose',
    desc: 'Comparez assurance bancaire et délégation, sur CRD ou capital initial.',
  },
  {
    slug: 'assurances',
    name: 'Assurances',
    short: 'Assurances',
    icon: 'fa-umbrella',
    color: 'emerald',
    desc: 'Auto, habitation, RC Pro, santé, prévoyance — comparez tous vos contrats.',
  },
];

export const SIMULATORS = [
  // ─── Crédit immobilier (17) ──────────────────────────────────
  { slug: 'capacite-emprunt',         category: 'credit-immobilier', name: 'Capacité d\'emprunt',         icon: 'fa-house-circle-check', desc: 'Combien pouvez-vous emprunter selon vos revenus ?', available: true },
  { slug: 'taux-endettement',         category: 'credit-immobilier', name: 'Taux d\'endettement',         icon: 'fa-scale-balanced',     desc: 'Vérifiez votre taux d\'endettement actuel.',          available: false },
  { slug: 'reste-a-vivre',            category: 'credit-immobilier', name: 'Reste à vivre',               icon: 'fa-coins',              desc: 'Calculez votre reste à vivre après charges.',         available: false },
  { slug: 'mensualite',               category: 'credit-immobilier', name: 'Mensualité de crédit',        icon: 'fa-calendar-days',      desc: 'Estimez vos mensualités selon montant et durée.',     available: true },
  { slug: 'cout-credit',              category: 'credit-immobilier', name: 'Coût total du crédit',        icon: 'fa-receipt',            desc: 'Découvrez le coût total de votre emprunt.',           available: true },
  { slug: 'taeg',                     category: 'credit-immobilier', name: 'TAEG',                        icon: 'fa-percent',            desc: 'Taux Annuel Effectif Global tous frais compris.',     available: false },
  { slug: 'amortissement',            category: 'credit-immobilier', name: 'Tableau d\'amortissement',    icon: 'fa-table-list',         desc: 'Visualisez le détail de chaque échéance.',            available: false },
  { slug: 'capital-restant-du',       category: 'credit-immobilier', name: 'Capital restant dû',          icon: 'fa-chart-line',         desc: 'Suivez votre capital restant dû au fil du temps.',    available: false },
  { slug: 'remboursement-anticipe',   category: 'credit-immobilier', name: 'Remboursement anticipé',      icon: 'fa-rotate-left',        desc: 'Économies réalisées en remboursant en avance.',       available: false },
  { slug: 'modulation-echeances',     category: 'credit-immobilier', name: 'Modulation échéances',        icon: 'fa-sliders',            desc: 'Adaptez vos mensualités à votre situation.',          available: false },
  { slug: 'differe',                  category: 'credit-immobilier', name: 'Différé partiel / total',     icon: 'fa-hourglass-half',     desc: 'Reportez le début des remboursements.',                available: false },
  { slug: 'regroupement-credits',     category: 'credit-immobilier', name: 'Regroupement de crédits',     icon: 'fa-object-group',       desc: 'Rassemblez plusieurs crédits en un seul.',            available: false },
  { slug: 'comparateur-bancaire',     category: 'credit-immobilier', name: 'Comparateur bancaire',        icon: 'fa-building-columns',   desc: 'Comparez les offres des principales banques.',        available: false },
  { slug: 'fixe-vs-variable',         category: 'credit-immobilier', name: 'Taux fixe vs variable',       icon: 'fa-arrow-down-up-across-line', desc: 'Choisissez entre stabilité et flexibilité.',  available: false },
  { slug: 'apport-personnel',         category: 'credit-immobilier', name: 'Apport personnel',            icon: 'fa-piggy-bank',         desc: 'Impact de votre apport sur le crédit.',               available: false },
  { slug: 'ptz',                      category: 'credit-immobilier', name: 'Prêt à Taux Zéro (PTZ)',      icon: 'fa-gift',               desc: 'Vérifiez votre éligibilité au PTZ.',                  available: false },
  { slug: 'pret-relais',              category: 'credit-immobilier', name: 'Prêt relais',                 icon: 'fa-arrows-rotate',      desc: 'Financez votre nouveau bien avant de vendre.',        available: false },
  { slug: 'frais-notaire',            category: 'credit-immobilier', name: 'Frais de notaire',            icon: 'fa-stamp',              desc: 'Estimez les frais d\'acquisition (ancien/neuf).',     available: true },
  { slug: 'plus-value',               category: 'credit-immobilier', name: 'Plus-value immobilière',      icon: 'fa-chart-line',         desc: 'Calculez la plus-value imposable à la revente.',      available: false },
  { slug: 'valorisation',             category: 'credit-immobilier', name: 'Valorisation immobilière',    icon: 'fa-house-chimney-medical',desc: 'Estimez la valeur de votre bien.',                  available: false },

  // ─── Crédit conso / auto (5) ─────────────────────────────────
  { slug: 'credit-consommation',      category: 'credit-conso-auto', name: 'Crédit consommation',         icon: 'fa-cart-shopping',      desc: 'Simulez votre prêt personnel.',                       available: false },
  { slug: 'credit-auto',              category: 'credit-conso-auto', name: 'Crédit auto',                 icon: 'fa-car-side',           desc: 'Financez votre véhicule au meilleur taux.',           available: false },
  { slug: 'loa',                      category: 'credit-conso-auto', name: 'LOA',                         icon: 'fa-key',                desc: 'Location avec option d\'achat.',                       available: false },
  { slug: 'leasing',                  category: 'credit-conso-auto', name: 'Leasing',                     icon: 'fa-handshake',          desc: 'Location longue durée pour véhicules.',               available: false },
  { slug: 'leasing-pro',              category: 'credit-conso-auto', name: 'Leasing professionnel',       icon: 'fa-truck',              desc: 'Leasing flotte et équipements pro.',                  available: false },

  // ─── Crédit professionnel (4) ────────────────────────────────
  { slug: 'pret-professionnel',       category: 'credit-professionnel', name: 'Prêt professionnel',       icon: 'fa-building',           desc: 'Financez le développement de votre entreprise.',      available: false },
  { slug: 'capacite-financement-pro', category: 'credit-professionnel', name: 'Capacité financement pro', icon: 'fa-chart-pie',          desc: 'Plafond de financement pour votre activité.',         available: false },
  { slug: 'analyse-revenus-charges',  category: 'credit-professionnel', name: 'Analyse revenus / charges',icon: 'fa-magnifying-glass-chart', desc: 'Diagnostic financier de votre entreprise.',        available: false },
  { slug: 'scoring-bancaire',         category: 'credit-professionnel', name: 'Scoring bancaire',         icon: 'fa-gauge-high',         desc: 'Estimez votre score auprès des banques.',             available: false },

  // ─── Assurance emprunteur (6) ────────────────────────────────
  { slug: 'assurance-emprunteur',     category: 'assurance-emprunteur', name: 'Assurance emprunteur',      icon: 'fa-shield-heart',       desc: 'Coût de votre assurance de prêt immobilier.',        available: true },
  { slug: 'assurance-crd',            category: 'assurance-emprunteur', name: 'Assurance sur CRD',         icon: 'fa-chart-area',         desc: 'Cotisation calculée sur capital restant dû.',         available: false },
  { slug: 'assurance-capital-initial',category: 'assurance-emprunteur', name: 'Assurance sur capital initial', icon: 'fa-square-poll-vertical', desc: 'Cotisation fixe sur capital initial.',           available: false },
  { slug: 'comparateur-assurance',    category: 'assurance-emprunteur', name: 'Bancaire vs délégation',    icon: 'fa-arrows-left-right',  desc: 'Économisez grâce à la délégation d\'assurance.',       available: false },
  { slug: 'quotite',                  category: 'assurance-emprunteur', name: 'Quotité',                   icon: 'fa-percent',            desc: 'Répartition de la couverture entre emprunteurs.',     available: false },
  { slug: 'co-emprunteur',            category: 'assurance-emprunteur', name: 'Co-emprunteur',             icon: 'fa-user-group',         desc: 'Optimisez l\'assurance à plusieurs.',                  available: false },

  // ─── Assurances IARD & santé (6) ─────────────────────────────
  { slug: 'assurance-auto',           category: 'assurances',        name: 'Assurance auto',              icon: 'fa-car-burst',          desc: 'Estimez votre cotisation auto annuelle.',             available: false },
  { slug: 'assurance-habitation',     category: 'assurances',        name: 'Assurance habitation',        icon: 'fa-house-chimney-window', desc: 'MRH selon surface et localisation.',                available: false },
  { slug: 'rc-pro',                   category: 'assurances',        name: 'RC Pro',                      icon: 'fa-shield-halved',      desc: 'Responsabilité civile professionnelle.',              available: false },
  { slug: 'sante-prevoyance',         category: 'assurances',        name: 'Santé / prévoyance',          icon: 'fa-heart-pulse',        desc: 'Mutuelle santé et prévoyance pro.',                   available: false },
  { slug: 'comparateur-iard',         category: 'assurances',        name: 'Comparateur garanties IARD',  icon: 'fa-list-check',         desc: 'Comparez les garanties auto, habitation, etc.',       available: false },
  { slug: 'cout-total-assurance',     category: 'assurances',        name: 'Coût total assurance',        icon: 'fa-calculator',         desc: 'Synthèse annuelle de toutes vos cotisations.',        available: false },
];

// Helpers ────────────────────────────────────────────────────────
export function getSimulator(category, slug) {
  return SIMULATORS.find((s) => s.category === category && s.slug === slug) || null;
}

export function getSimulatorsByCategory(categorySlug) {
  return SIMULATORS.filter((s) => s.category === categorySlug);
}

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}
