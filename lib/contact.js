/**
 * Coordonnées de contact publiques Finarent.
 *
 * Source unique pour les liens `tel:`/`mailto:` du site vitrine, le JSON-LD
 * et les documents commerciaux — ne jamais réécrire le numéro en dur ailleurs.
 * Le libellé affiché reste piloté par `common.phone` / `common.email` (i18n).
 */

// Affichage humain (identique à messages/fr.json → common.phone).
export const CONTACT_PHONE = '01 60 28 59 41';

// Format E.164 : requis par les liens tel: (mobiles, itinérance) et le JSON-LD.
export const CONTACT_PHONE_E164 = '+33160285941';
export const CONTACT_PHONE_HREF = `tel:${CONTACT_PHONE_E164}`;

// Boîte réelle : `contact@finarent.fr`, hébergée chez Hostinger (les MX de
// finarent.fr pointent vers mx1/mx2.hostinger.com). `finarent.com` reste le
// domaine canonique du site, mais n'a aucun enregistrement MX : une adresse
// en @finarent.com affichée ici renvoyait un rebond à quiconque écrivait.
export const CONTACT_EMAIL = 'contact@finarent.fr';
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;

export const CONTACT_HOURS = 'Lun-Ven 9h-18h · Sam 10h-19h';

// Profils sociaux officiels : pied de page + `sameAs` du JSON-LD Organization.
// URL canoniques, sans les paramètres de suivi ajoutés au partage (?stkn=, ?_r=…).
export const SOCIAL_LINKS = [
  { icon: 'linkedin-in', label: 'LinkedIn', url: 'https://www.linkedin.com/in/finarent-finarent-3a747a424' },
  { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/finarent77' },
  { icon: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@finarent.77' },
];
