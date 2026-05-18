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
  const root = baseUrl || process.env.APP_BASE_URL || 'https://finarent.fr';
  return `${root.replace(/\/$/, '')}/finarent-logo.svg`;
}

export function brandPastilleUrl(baseUrl) {
  const root = baseUrl || process.env.APP_BASE_URL || 'https://finarent.fr';
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

/**
 * Style de base appliqué à <body> dans les emails.
 * Plus Jakarta Sans en webfont — fallback Segoe UI / Helvetica.
 */
function baseStyles() {
  return `
    body { font-family: ${BRAND_FONT}; margin: 0; padding: 0; background: ${BRAND_COLORS.grisDoux}; color: ${BRAND_COLORS.grisTexte}; line-height: 1.55; -webkit-font-smoothing: antialiased; }
    .fn-wrap { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 8px 32px rgba(16, 37, 60, 0.08); border: 1px solid #E4E8EC; }
    .fn-header { background: ${BRAND_COLORS.marine}; padding: 28px 32px; }
    .fn-header__brand { display: flex; align-items: center; gap: 12px; }
    .fn-header__logo { width: 36px; height: 36px; border-radius: 10px; background: #ffffff; padding: 6px; vertical-align: middle; }
    .fn-header__name { color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
    .fn-header__tagline { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 4px; letter-spacing: 0.02em; }
    .fn-body { padding: 32px; }
    .fn-body h1 { color: ${BRAND_COLORS.marine}; font-size: 22px; font-weight: 800; margin: 0 0 14px; letter-spacing: -0.01em; }
    .fn-body h2 { color: ${BRAND_COLORS.marine}; font-size: 16px; font-weight: 700; margin: 22px 0 8px; }
    .fn-body p { font-size: 15px; margin: 0 0 14px; color: ${BRAND_COLORS.grisTexte}; }
    .fn-body strong { color: ${BRAND_COLORS.marine}; font-weight: 700; }
    .fn-body a { color: ${BRAND_COLORS.vertProfond}; text-decoration: none; }
    .fn-body a:hover { color: ${BRAND_COLORS.menthe}; }
    .fn-card { background: ${BRAND_COLORS.grisDoux}; border: 1px solid #E4E8EC; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
    .fn-card__row { font-size: 14px; padding: 4px 0; }
    .fn-card__label { color: ${BRAND_COLORS.acier}; font-weight: 600; }
    .fn-btn { display: inline-block; padding: 14px 28px; background: ${BRAND_COLORS.menthe}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; box-shadow: 0 6px 18px rgba(88, 183, 148, 0.32); }
    .fn-btn:hover { background: ${BRAND_COLORS.vertProfond}; }
    .fn-btn--secondary { background: #ffffff; color: ${BRAND_COLORS.marine} !important; border: 1.5px solid ${BRAND_COLORS.marine}; box-shadow: none; }
    .fn-quote { margin: 18px 0; padding: 14px 18px; background: ${BRAND_COLORS.grisDoux}; border-left: 4px solid ${BRAND_COLORS.menthe}; border-radius: 10px; color: ${BRAND_COLORS.acier}; font-style: italic; }
    .fn-footer { background: ${BRAND_COLORS.grisDoux}; padding: 22px 32px; border-top: 1px solid #E4E8EC; }
    .fn-footer p { font-size: 11px; color: ${BRAND_COLORS.acier}; margin: 0 0 6px; line-height: 1.5; }
    .fn-footer a { color: ${BRAND_COLORS.acier}; text-decoration: underline; }
    @media (max-width: 620px) {
      .fn-wrap { margin: 0; border-radius: 0; border: 0; }
      .fn-header, .fn-body, .fn-footer { padding-left: 22px; padding-right: 22px; }
    }
  `;
}

/**
 * Bandeau header standardisé (logo Finarent + tagline).
 */
function header(baseUrl) {
  return `
    <div class="fn-header">
      <div class="fn-header__brand">
        <img class="fn-header__logo" src="${brandPastilleUrl(baseUrl)}" alt="Finarent" width="36" height="36" />
        <div>
          <div class="fn-header__name">Finarent</div>
          <div class="fn-header__tagline">Financement &amp; Assurance Pro</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Pied de page légal (mentions ORIAS + adresse + lien confidentialité).
 */
function footer(baseUrl) {
  const root = baseUrl || process.env.APP_BASE_URL || 'https://finarent.fr';
  const c = COMPANY_INFO;
  return `
    <div class="fn-footer">
      <p><strong style="color:${BRAND_COLORS.marine}">${escapeHtml(c.name)} ${escapeHtml(c.legalForm)}</strong> — ${escapeHtml(c.address)}, ${escapeHtml(c.postal)} ${escapeHtml(c.city)}</p>
      <p>SIRET ${escapeHtml(c.siret)} · RCS ${escapeHtml(c.rcs)} · ORIAS ${escapeHtml(c.orias)} · ${escapeHtml(c.phone)} · <a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></p>
      <p style="margin-top:10px;">Courtier indépendant en financement &amp; assurance, soumis au contrôle de l'ACPR. <a href="${root}/privacy">Politique de confidentialité</a> · <a href="${root}/legal">Mentions légales</a></p>
    </div>
  `;
}

/**
 * Construit un email HTML complet à partir d'un fragment de corps.
 * Toutes les fonctions d'envoi devraient passer par ce wrapper.
 *
 * @param {object} options
 * @param {string} options.title         Titre <title> et h1 implicite
 * @param {string} options.bodyHtml      Fragment HTML du corps (avec <h1>, <p>, …)
 * @param {string} [options.baseUrl]     Override de APP_BASE_URL
 * @param {string} [options.preheader]   Texte preview client mail (caché)
 */
export function renderEmail({ title, bodyHtml, baseUrl, preheader }) {
  const pre = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;visibility:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>`
    : '';
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>${baseStyles()}</style>
</head>
<body>
${pre}
<div class="fn-wrap">
  ${header(baseUrl)}
  <div class="fn-body">
${bodyHtml}
  </div>
  ${footer(baseUrl)}
</div>
</body>
</html>`;
}

// ─── HELPERS RÉUTILISABLES POUR LES CORPS D'EMAILS ─────────────

/**
 * Bouton CTA principal (vert menthe).
 */
export function emailButton(href, label, { secondary = false } = {}) {
  const cls = secondary ? 'fn-btn fn-btn--secondary' : 'fn-btn';
  return `<p style="margin:24px 0; text-align:center;"><a class="${cls}" href="${escapeHtml(href)}">${escapeHtml(label)}</a></p>`;
}

/**
 * Carte info clé/valeur.
 */
export function emailInfoCard(rows) {
  const inner = rows
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([label, value]) => `<div class="fn-card__row"><span class="fn-card__label">${escapeHtml(label)} :</span> <strong>${escapeHtml(value)}</strong></div>`)
    .join('');
  return `<div class="fn-card">${inner}</div>`;
}
