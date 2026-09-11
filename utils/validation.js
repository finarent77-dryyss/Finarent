export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone) => /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(phone);
export const validateSIREN = (siren) => /^\d{9}$/.test((siren || '').replace(/\s/g, ''));
/**
 * Un champ obligatoire est-il renseigné ?
 *
 * La version précédente faisait `value.trim()` sans vérifier le type. Sur une
 * case à cocher — `consent` du formulaire de contact — la valeur est le booléen
 * `true`, qui n'a pas de méthode `trim` : l'appel levait un TypeError.
 *
 * Comme `validateForm()` est invoqué hors du `try` du gestionnaire de
 * soumission, cette exception tuait le gestionnaire en silence. Le formulaire
 * d'acquisition ne partait donc jamais **pour quiconque le remplissait
 * correctement** : case décochée, message d'erreur normal ; case cochée, plus
 * rien — ni requête, ni animation, ni message.
 *
 * Un champ obligatoire peut légitimement être une case à cocher, un nombre ou
 * une chaîne. Cette garde couvre les trois.
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value);
  return String(value).trim().length > 0;
};

export const validateForm = (formData, requiredFields) => {
  const errors = {};
  requiredFields.forEach(field => {
    if (!validateRequired(formData[field])) errors[field] = 'Ce champ est requis';
  });
  if (formData.email && !validateEmail(formData.email)) errors.email = 'Email invalide';
  if (formData.phone && !validatePhone(formData.phone)) errors.phone = 'Numéro de téléphone invalide';
  if (formData.siren && !validateSIREN(formData.siren)) errors.siren = 'SIREN invalide (9 chiffres requis)';
  if (requiredFields.includes('consent') && !formData.consent) errors.consent = 'Vous devez accepter la politique de confidentialité';
  return { isValid: Object.keys(errors).length === 0, errors };
};
