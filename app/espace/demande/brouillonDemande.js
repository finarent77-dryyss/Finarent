// Gestion du brouillon localStorage et des valeurs initiales du formulaire.
// Logique déplacée telle quelle depuis DemandeWizardClient.jsx.

import { DRAFT_KEY, STEPS } from './constantes';

/**
 * Lit le brouillon enregistré. Renvoie null s'il y a un préremplissage simulateur
 * (pour ne pas l'écraser), si le stockage est indisponible, ou si le brouillon
 * appartient à une autre adresse e-mail.
 */
export function lireBrouillon(prefill, email) {
  if (prefill || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.email && parsed.email !== email) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Enregistre le brouillon (les CGU ne sont volontairement pas persistées).
 *
 * Ne fait rien en présence d'un préremplissage simulateur : `lireBrouillon`
 * renvoie alors `null` pour ne pas écraser la saisie venue de l'URL, si bien
 * qu'un enregistrement dans ce cas détruirait un brouillon que plus personne
 * ne relirait jamais.
 */
export function enregistrerBrouillon(prefill, form, step, email) {
  if (prefill || typeof window === 'undefined') return;
  try {
    const { terms, ...persistable } = form;
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ ...persistable, step, email }),
    );
  } catch {
    // localStorage indisponible / plein — silencieux
  }
}

/** Supprime le brouillon enregistré. */
export function supprimerBrouillon() {
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(DRAFT_KEY);
  } catch { /* noop */ }
}

/**
 * Étape souhaitée à l'ouverture de l'assistant.
 *
 * Valeur brute : elle doit encore être bornée par `etapeMaximaleAutorisee`
 * (validationEtapes.js), car un brouillon peut mémoriser une étape que le
 * formulaire restauré ne justifie plus.
 */
export function calculerEtapeInitiale(prefill, draft) {
  if (prefill?.productType) return 1;
  if (draft?.step != null && draft.step < STEPS.length) return draft.step;
  return 0;
}

/** Valeurs initiales du formulaire : préremplissage simulateur, puis brouillon, puis profil. */
export function construireFormulaireInitial({ prefill, draft, user, dbUser }) {
  const isRcPrefill = prefill?.productType === 'RC_PRO';
  return {
    // Étape 1 - Type
    productType: prefill?.productType || draft?.productType || '',
    // Étape 2 - Projet (financement)
    equipmentType: prefill?.equipmentType || draft?.equipmentType || '',
    amount: (prefill && !isRcPrefill ? prefill.amount : '') || draft?.amount || '',
    duration: (prefill && !isRcPrefill && prefill.duration ? prefill.duration : '') || draft?.duration || '36',
    description: prefill?.description || draft?.description || '',
    // Étape 2 - Projet (RC_PRO)
    sector_rcpro: prefill?.sector_rcpro || draft?.sector_rcpro || '',
    ca: (isRcPrefill ? prefill.ca : '') || draft?.ca || '',
    employees: (isRcPrefill ? prefill.employees : '') || draft?.employees || '',
    // Étape 3 - Entreprise
    companyName: dbUser.company || draft?.companyName || '',
    siren: draft?.siren || '',
    legalForm: dbUser.legalForm || draft?.legalForm || '',
    sector: draft?.sector || '',
    // Étape 4 - Contact
    name: dbUser.name || user.name || draft?.name || '',
    email: dbUser.email || user.email || '',
    phone: dbUser.phone || draft?.phone || '',
    terms: false,
  };
}

/** Formulaire remis à zéro (bouton « Recommencer ») : profil uniquement, sans brouillon. */
export function construireFormulaireVierge({ user, dbUser }) {
  return {
    productType: '',
    equipmentType: '',
    amount: '',
    duration: '36',
    description: '',
    sector_rcpro: '',
    ca: '',
    employees: '',
    companyName: dbUser.company || '',
    siren: '',
    legalForm: dbUser.legalForm || '',
    sector: '',
    name: dbUser.name || user.name || '',
    email: dbUser.email || user.email || '',
    phone: dbUser.phone || '',
    terms: false,
  };
}
