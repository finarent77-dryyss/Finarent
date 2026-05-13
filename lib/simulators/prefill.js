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

// Fallback par catégorie (utilisé si le slug n'a pas de mapping explicite)
const CATEGORY_DEFAULT_PRODUCT_TYPE = {
  'credit-immobilier': 'PRET_PRO',
  'credit-conso-auto': 'PRET_PRO',
  'credit-professionnel': 'PRET_PRO',
  'assurance-emprunteur': 'PRET_PRO',
  // 'assurances' : pas de mapping par défaut, l'utilisateur choisira
};

const ALLOWED_DURATIONS = [12, 24, 36, 48, 60, 72, 84];

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

/**
 * Lit les query params d'une URL et retourne un objet prêt à fusionner
 * dans l'état initial du wizard /espace/demande.
 */
export function buildPrefillFromParams(params) {
  const get = (k) => (typeof params?.get === 'function' ? params.get(k) : params?.[k] ?? null);

  const simulator = get('simulator') || get('fromSimulator');
  const category = get('category');
  if (!simulator && !category && !get('amount')) {
    return null;
  }

  const productType = inferProductType({ simulator, category });
  const isRcPro = productType === 'RC_PRO';

  const amount = num(get('amount'));
  const months = num(get('months')) ?? num(get('duration'));
  const snapped = snapDuration(months);

  // RC_PRO : ca (chiffre d'affaires), employees, sector
  const ca = num(get('ca'));
  const employees = num(get('employees'));
  const sectorRaw = get('sector_rcpro') || get('sector');

  const label = simulatorLabel(simulator, category);

  return {
    productType,
    amount: !isRcPro && amount ? String(Math.round(amount)) : '',
    duration: snapped ? String(snapped) : '',
    equipmentType: !isRcPro && label ? label : '',
    description: label ? `Préparé via le simulateur "${label}".` : '',
    ca: isRcPro && ca ? String(Math.round(ca)) : '',
    employees: isRcPro && employees ? String(Math.round(employees)) : '',
    sector_rcpro: isRcPro && typeof sectorRaw === 'string' ? sectorRaw : '',
    fromSimulatorSlug: simulator || '',
    fromSimulatorLabel: label || '',
  };
}
