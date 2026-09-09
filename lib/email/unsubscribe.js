/**
 * Lien de désabonnement des emails commerciaux Finarent.
 *
 * Contexte légal : tout email de prospection ou de newsletter doit offrir un
 * moyen de désinscription simple et gratuit (art. L34-5 CPCE, art. 21 RGPD).
 * Un lien qui demande de se connecter, ou un simple « répondez STOP », ne
 * suffit pas — d'où cette route publique.
 *
 * Conception : le lien porte un jeton HMAC calculé sur l'adresse email. Pas de
 * table de jetons à maintenir, pas d'énumération possible (sans le secret on
 * ne peut pas forger de lien pour désabonner quelqu'un d'autre), et le lien
 * reste valable indéfiniment — ce qui est le comportement attendu : un
 * destinataire peut se désabonner depuis un mail vieux de six mois.
 */

import crypto from 'crypto';
import { COMPANY_INFO } from '../invoicing/company.js';

/**
 * Secret de signature. On accepte plusieurs sources pour ne pas ajouter une
 * variable d'environnement obligatoire de plus au déploiement Clever Cloud.
 */
function secret() {
  return (
    process.env.UNSUBSCRIBE_SECRET
    || process.env.ENCRYPTION_KEY
    || process.env.CRON_SECRET
    || null
  );
}

function normaliser(email) {
  return String(email || '').trim().toLowerCase();
}

/** Jeton HMAC-SHA256 tronqué (128 bits — largement suffisant ici). */
export function unsubscribeToken(email) {
  const cle = secret();
  if (!cle) return null;
  return crypto
    .createHmac('sha256', cle)
    .update(`unsubscribe:${normaliser(email)}`)
    .digest('base64url')
    .slice(0, 22);
}

/** Vérifie un jeton à temps constant. */
export function verifyUnsubscribeToken(email, token) {
  const attendu = unsubscribeToken(email);
  if (!attendu || !token) return false;
  const a = Buffer.from(String(token));
  const b = Buffer.from(attendu);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * URL de désabonnement à placer dans le pied de page.
 *
 * Repli sans secret configuré : un `mailto:` de désinscription. C'est moins
 * confortable mais cela reste conforme — mieux vaut ça qu'un email commercial
 * expédié sans aucune voie de sortie.
 *
 * @param {string} email    destinataire
 * @param {string} [baseUrl]
 * @returns {string}
 */
export function unsubscribeUrl(email, baseUrl) {
  const dest = normaliser(email);
  const token = unsubscribeToken(dest);
  if (!token) {
    return `mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent('Désabonnement')}`;
  }
  const root = (baseUrl || process.env.APP_BASE_URL || 'https://finarent.com').replace(/\/$/, '');
  return `${root}/api/newsletter/unsubscribe?email=${encodeURIComponent(dest)}&token=${token}`;
}

/**
 * En-têtes RFC 2369 / RFC 8058 : ils affichent le bouton « Se désabonner »
 * natif de Gmail et d'Outlook, en haut du message. Gmail l'exige depuis 2024
 * pour les expéditeurs de volume, et sa présence améliore la délivrabilité.
 */
export function unsubscribeHeaders(email, baseUrl) {
  const url = unsubscribeUrl(email, baseUrl);
  if (url.startsWith('mailto:')) {
    return { 'List-Unsubscribe': `<${url}>` };
  }
  return {
    'List-Unsubscribe': `<${url}>, <mailto:${COMPANY_INFO.email}?subject=Desabonnement>`,
    // Autorise le désabonnement en un clic (POST serveur à serveur).
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
