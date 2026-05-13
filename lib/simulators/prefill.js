// Helpers de pré-remplissage du wizard /espace/demande depuis un simulateur.
// Convertit les params bruts d'un simulateur (slug, montant, durée, etc.) en
// valeurs valides pour le formulaire de demande de financement.

import { SIMULATORS, getSimulator } from './registry';

// Mapping explicite simulateur → productType du wizard
const SIMULATOR_TO_PRODUCT_TYPE = {
  loa: 'LOA',
  leasing: 'LLD',
  'leasing-pro': 'LEASING_OPS',
  'rc-pro': 'RC_PRO',
};

// Fallback par catégorie
const CATEGORY_DEFAULT_PRODUCT_TYPE = {
  'credit-immobilier': 'PRET_PRO',
  'credit-conso-auto': 'PRET_PRO',
  'credit-professionnel': 'PRET_PRO',
  'assurance-emprunteur': 'PRET_PRO',
};

// Simulateurs IARD/perso : aucun type du wizard ne correspond → /contact uniquement
const NO_WIZARD_SLUGS = new Set([
  'assurance-auto',
  'assurance-habitation',
  'sante-prevoyance',
  'comparateur-iard',
  'cout-total-assurance',
]);

const ALLOWED_DURATIONS = [12, 24, 36, 48, 60, 72, 84];

// Liste des secteurs du wizard /espace/demande
const WIZARD_SECTORS = [
  'BTP & Construction',
  'Médical & Santé',
  'Informatique & Tech',
  'Transport & Logistique',
  'Industrie',
  'Services',
  'Commerce',
  'Autre',
];

// Fuzzy mapping : tokens normalisés → secteur du wizard
const SECTOR_RULES = [
  { tokens: ['btp', 'construction', 'batiment'], target: 'BTP & Construction' },
  { tokens: ['medical', 'sante', 'paramedical', 'pharma'], target: 'Médical & Santé' },
  { tokens: ['tech', 'it', 'informatique', 'numerique', 'software', 'saas'], target: 'Informatique & Tech' },
  { tokens: ['transport', 'logistique', 'fret', 'livraison'], target: 'Transport & Logistique' },
  { tokens: ['industrie', 'usine', 'manufacture', 'production'], target: 'Industrie' },
  { tokens: ['service', 'conseil', 'consulting'], target: 'Services' },
  { tokens: ['commerce', 'distribution', 'retail', 'magasin'], target: 'Commerce' },
];

function normalize(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function matchWizardSector(raw) {
  if (!raw || typeof raw !== 'string') return '';
  // Match exact d'abord (ex. wizard l'a déjà envoyé)
  if (WIZARD_SECTORS.includes(raw)) return raw;
  const norm = normalize(raw);
  for (const rule of SECTOR_RULES) {
    if (rule.tokens.some((t) => norm.includes(t))) return rule.target;
  }
  return 'Autre';
}

export function canPrefillWizard({ simulator } = {}) {
  if (!simulator) return true;
  return !NO_WIZARD_SLUGS.has(simulator);
}

export function inferProductType({ simulator, category }) {
  if (simulator && SIMULATOR_TO_PRODUCT_TYPE[simulator]) {
    return SIMULATOR_TO_PRODUCT_TYPE[simulator];
  }
  if (category && CATEGORY_DEFAULT_PRODUCT_TYPE[category]) {
    return CATEGORY_DEFAULT_PRODUCT_TYPE[category];
  }
  return '';
}

export function snapDuration(months) {
  const n = Number(months);
  if (!n || !Number.isFinite(n) || n <= 0) return null;
  return ALLOWED_DURATIONS.reduce(
    (best, d) => (Math.abs(d - n) < Math.abs(best - n) ? d : best),
    ALLOWED_DURATIONS[0],
  );
}

export function findSimulatorBySlug(slug) {
  if (!slug) return null;
  return SIMULATORS.find((s) => s.slug === slug) || null;
}

export function simulatorLabel(slug, category) {
  if (category && slug) {
    const exact = getSimulator(category, slug);
    if (exact) return exact.name;
  }
  const fallback = findSimulatorBySlug(slug);
  if (fallback) return fallback.name;
  return slug ? slug.split('-').map((s) => s[0]?.toUpperCase() + s.slice(1)).join(' ') : '';
}

function num(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pickFirst(get, keys) {
  for (const k of keys) {
    const v = num(get(k));
    if (v != null && v > 0) return v;
  }
  return null;
}

const AMOUNT_KEYS = [
  'amount',
  'loanAmount',
  'loanNeeded',
  'ptzAmount',
  'finalCapacity',
  'totalRemaining',
  'propertyPrice',
];

const DURATION_KEYS = ['months', 'newMonths', 'duration'];

const FR_NUMBER = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const FR_EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const FR_PCT = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function formatRate(v) {
  // rate peut être 3.5 (pourcentage en clair) ou 0.035 (décimal)
  if (v == null) return '';
  return v > 1 ? `${v.toFixed(2)} %` : FR_PCT.format(v);
}

function buildDescription({ label, amount, months, monthly, rate, totalCost, savings }) {
  const lines = [];
  if (label) lines.push(`Simulation : ${label}`);
  if (amount) lines.push(`Montant : ${FR_EUR.format(amount)}`);
  if (months) lines.push(`Durée : ${FR_NUMBER.format(months)} mois`);
  if (rate != null) lines.push(`Taux : ${formatRate(rate)}`);
  if (monthly) lines.push(`Mensualité : ${FR_EUR.format(monthly)}`);
  if (totalCost) lines.push(`Coût total : ${FR_EUR.format(totalCost)}`);
  if (savings) lines.push(`Économies estimées : ${FR_EUR.format(savings)}`);
  return lines.join('\n');
}

/**
 * Lit les query params (URLSearchParams ou objet plat) et retourne un objet prêt
 * à fusionner dans l'état initial du wizard /espace/demande.
 * Retourne null si rien d'exploitable.
 */
export function buildPrefillFromParams(params) {
  const get = (k) => {
    if (!params) return null;
    if (typeof params.get === 'function') return params.get(k);
    return params[k] ?? null;
  };

  const simulator = get('simulator') || get('fromSimulator');
  const category = get('category');

  // Si vraiment aucun contexte, on n'a rien à préremplir
  if (!simulator && !category && pickFirst(get, AMOUNT_KEYS) == null) {
    return null;
  }

  const productType = inferProductType({ simulator, category });
  const isRcPro = productType === 'RC_PRO';

  const amount = pickFirst(get, AMOUNT_KEYS);
  const monthsRaw = pickFirst(get, DURATION_KEYS) ?? (() => {
    const y = num(get('years'));
    return y ? y * 12 : null;
  })();
  const snapped = snapDuration(monthsRaw);

  // RC_PRO
  const ca = num(get('ca'));
  const employees = num(get('employees'));
  const sectorRaw = get('sector_rcpro') || get('sector');
  const mappedSector = isRcPro ? matchWizardSector(sectorRaw) : '';

  // Description enrichie
  const label = simulatorLabel(simulator, category);
  const monthly = pickFirst(get, ['monthly', 'monthlyPayment', 'newMonthly', 'm']);
  const rate = num(get('rate')) ?? num(get('newRate')) ?? num(get('taeg'));
  const totalCost = pickFirst(get, ['totalCost', 'total', 'fees']);
  const savings = pickFirst(get, ['savings', 'netSavings']);
  const description = buildDescription({ label, amount, months: monthsRaw, monthly, rate, totalCost, savings });

  // Capture des paramètres bruts pour persistance et tracking serveur
  const rawParams = {};
  if (typeof params?.forEach === 'function') {
    params.forEach((v, k) => { rawParams[k] = v; });
  } else if (params && typeof params === 'object') {
    Object.assign(rawParams, params);
  }

  return {
    productType,
    amount: !isRcPro && amount ? String(Math.round(amount)) : '',
    duration: snapped ? String(snapped) : '',
    equipmentType: !isRcPro && label ? label : '',
    description,
    ca: isRcPro && ca ? String(Math.round(ca)) : '',
    employees: isRcPro && employees ? String(Math.round(employees)) : '',
    sector_rcpro: mappedSector,
    fromSimulatorSlug: simulator || '',
    fromSimulatorCategory: category || '',
    fromSimulatorLabel: label || '',
    rawParams,
  };
}
