/**
 * Source unique de la charte graphique Finarent.
 *
 * Tous les documents générés par l'application (emails, PDF, contrats,
 * récap HTML) doivent s'appuyer sur ces tokens — ne pas redéfinir les
 * couleurs ou les coordonnées ailleurs.
 *
 * Charte officielle : FINARENT Partenaires.pdf §1.
 */

import { COMPANY_INFO } from './invoicing/company.js';

// ─── COULEURS OFFICIELLES (charte §1) ──────────────────────────
export const BRAND_COLORS = {
  marine:       '#10253C', // couleur principale, titres, logo, structure
  acier:        '#1C3654', // secondaire, sous-titres, accents
  menthe:       '#58B794', // accent (≤15% surface), filets, validations
  vertProfond:  '#3E9D7A', // hover, liens actifs
  grisTexte:    '#404040', // corps de texte
  grisDoux:     '#F2F5F4', // fonds doux
  blanc:        '#FFFFFF',
};

// Versions RGB array (utiles pour jsPDF qui consomme `[r, g, b]`)
export const BRAND_RGB = {
  marine:      [16, 37, 60],
  acier:       [28, 54, 84],
  menthe:      [88, 183, 148],
  vertProfond: [62, 157, 122],
  grisTexte:   [64, 64, 64],
  grisDoux:    [242, 245, 244],
  blanc:       [255, 255, 255],
  border:      [228, 232, 236],
  muted:       [115, 125, 140],
};

export const BRAND_FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// URL absolue du logo (utilisée par les emails — pas de pièce jointe).
export function brandLogoUrl(baseUrl) {
  const root = baseUrl || process.env.APP_BASE_URL || 'https://finarent.com';
  return `${root.replace(/\/$/, '')}/finarent-logo.svg`;
}

export function brandPastilleUrl(baseUrl) {
  const root = baseUrl || process.env.APP_BASE_URL || 'https://finarent.com';
  return `${root.replace(/\/$/, '')}/finarent-pastille.svg`;
}

// ─── INFOS LÉGALES (re-export pratique) ────────────────────────
export { COMPANY_INFO };

// ─── HELPERS HTML EMAIL ────────────────────────────────────────

/**
 * Échappe une chaîne pour insertion dans du HTML.
 */
export function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── RENDU DES EMAILS ──────────────────────────────────────────
//
// L'ancien moteur (renderEmail / emailButton / emailInfoCard, en <div> avec
// une feuille de style dans <head>) vivait ici. Il est remplacé par
// `lib/email/charter.js`, en <table> et styles inline : les <div> et le
// <style> ne survivent pas à Outlook ni au transfert Gmail.
//
// Les tokens ci-dessus restent la source unique — la charte email les importe.
