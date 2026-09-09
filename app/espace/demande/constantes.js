// Constantes de l'assistant de dépôt de demande (/espace/demande).
// Déplacées telles quelles depuis DemandeWizardClient.jsx : aucune valeur modifiée.

export const DRAFT_KEY = 'finarent.wizard.draft.v1';

export const STEPS = ['type', 'project', 'company', 'contact', 'summary'];

export const PRODUCT_TYPES = [
  { key: 'PRET_PRO', icon: 'fa-solid fa-building-columns' },
  { key: 'CREDIT_BAIL', icon: 'fa-solid fa-file-contract' },
  { key: 'LOA', icon: 'fa-solid fa-car-side' },
  { key: 'LLD', icon: 'fa-solid fa-truck-moving' },
  { key: 'LEASING_OPS', icon: 'fa-solid fa-gear' },
  { key: 'RC_PRO', icon: 'fa-solid fa-shield-halved' },
];

export const DURATIONS = [12, 24, 36, 48, 60, 72, 84];

export const LEGAL_FORMS = [
  'SAS', 'SARL', 'EURL', 'SA', 'SCI', 'EI', 'SASU', 'SNC', 'Auto-entrepreneur',
];

export const SECTORS = [
  'BTP & Construction',
  'Médical & Santé',
  'Informatique & Tech',
  'Transport & Logistique',
  'Industrie',
  'Services',
  'Commerce',
  'Autre',
];

// ─── VARIANTES DE TRANSITION ────────────────────────────

export const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};
