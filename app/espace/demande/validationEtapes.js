// Validation par étape de l'assistant de demande.
// Règles reprises à l'identique de DemandeWizardClient.jsx : mêmes conditions,
// mêmes clés d'erreur, mêmes clés de traduction.

import { STEPS } from './constantes';

/**
 * Nombre d'étapes de saisie. La dernière étape (récapitulatif) n'a aucun champ
 * qui lui soit propre : elle ne se valide pas, elle se contente de relire les
 * précédentes.
 */
export const ETAPES_DE_SAISIE = STEPS.length - 1;

/**
 * Valide une étape et renvoie les erreurs sous la forme { champ: message }.
 * @param {number} stepIndex index de l'étape (0 = type, 1 = projet, 2 = entreprise, 3 = contact)
 * @param {object} form état courant du formulaire
 * @param {(cle: string) => string} t fonction de traduction
 */
export function validerEtape(stepIndex, form, t) {
  const errs = {};
  if (stepIndex === 0) {
    if (!form.productType) errs.productType = t('espace.wizard.errors.required');
  }
  if (stepIndex === 1) {
    if (form.productType === 'RC_PRO') {
      if (!form.sector_rcpro) errs.sector_rcpro = t('espace.wizard.errors.required');
      if (!form.ca || isNaN(Number(form.ca)) || Number(form.ca) <= 0) errs.ca = t('espace.wizard.errors.invalidAmount');
      if (!form.employees || isNaN(Number(form.employees)) || Number(form.employees) <= 0) errs.employees = t('espace.wizard.errors.required');
    } else {
      if (!form.equipmentType.trim()) errs.equipmentType = t('espace.wizard.errors.required');
      if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = t('espace.wizard.errors.invalidAmount');
    }
  }
  if (stepIndex === 2) {
    if (!form.companyName.trim()) errs.companyName = t('espace.wizard.errors.required');
    {
      // Un champ vide est un champ manquant, pas un SIREN invalide : annoncer
      // « SIREN invalide » sur une case jamais remplie envoie l'utilisateur
      // corriger une saisie qui n'existe pas.
      const sirenDigits = form.siren.replace(/\D/g, '');
      if (!form.siren.trim()) {
        errs.siren = t('espace.wizard.errors.required');
      } else if (sirenDigits.length !== 9 && sirenDigits.length !== 14) {
        errs.siren = t('espace.wizard.errors.invalidSiren');
      }
    }
    if (!form.legalForm) errs.legalForm = t('espace.wizard.errors.required');
    if (!form.sector) errs.sector = t('espace.wizard.errors.required');
  }
  if (stepIndex === 3) {
    if (!form.name.trim()) errs.name = t('espace.wizard.errors.required');
    if (!form.phone.trim()) errs.phone = t('espace.wizard.errors.required');
    if (!form.terms) errs.terms = t('espace.wizard.errors.termsRequired');
  }
  return errs;
}

/**
 * Première étape de saisie en défaut, avec ses erreurs, ou null si toutes sont
 * valides.
 *
 * Garde unique du parcours : la navigation « Suivant » valide l'étape courante,
 * mais rien n'empêchait d'entrer dans l'assistant directement au récapitulatif
 * (brouillon restauré) et d'envoyer sans qu'aucune étape n'ait été validée —
 * les CGU comprises, qui ne sont jamais persistées dans le brouillon.
 *
 * @param {object} form état courant du formulaire
 * @param {(cle: string) => string} t fonction de traduction
 * @returns {{etape: number, errors: object}|null}
 */
export function premiereEtapeInvalide(form, t) {
  for (let etape = 0; etape < ETAPES_DE_SAISIE; etape += 1) {
    const errors = validerEtape(etape, form, t);
    if (Object.keys(errors).length > 0) return { etape, errors };
  }
  return null;
}

/**
 * Étape la plus avancée que l'on puisse ouvrir avec ce formulaire.
 *
 * Sert à borner l'étape restaurée d'un brouillon : un brouillon enregistré au
 * récapitulatif rouvre au plus tard sur la première étape encore incomplète —
 * en pratique l'étape des CGU, puisque l'acceptation n'est pas persistée.
 *
 * @param {object} form état courant du formulaire
 * @param {(cle: string) => string} t fonction de traduction
 * @returns {number} index d'étape
 */
export function etapeMaximaleAutorisee(form, t) {
  const blocage = premiereEtapeInvalide(form, t);
  return blocage ? blocage.etape : STEPS.length - 1;
}
