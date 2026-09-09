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

export const CONTACT_EMAIL = 'contact@finarent.com';
export const CONTACT_EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;

export const CONTACT_HOURS = 'Lun-Ven 9h-18h · Sam 10h-19h';
