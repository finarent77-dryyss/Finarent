/**
 * CHARTE MAILING FINARENT — moteur de rendu + blocs réutilisables.
 *
 * Pourquoi ce fichier existe à côté de `lib/branding.js` :
 * `branding.js` reste la SOURCE UNIQUE des tokens (couleurs, coordonnées,
 * escapeHtml) et sert au rendu écran (PDF, récap HTML). Ici on ajoute la
 * couche « email réel », qui obéit à des contraintes que le HTML de site ne
 * connaît pas :
 *
 *   1. Outlook desktop (2016/2019/365 Windows) rend le HTML avec le moteur de
 *      Word : pas de flex, pas de grid, pas de `border-radius`, pas de
 *      `box-shadow`, pas de media queries. => structure en <table>.
 *   2. Gmail supprime une partie de <style> (notamment après transfert) et
 *      n'applique jamais les pseudo-classes. => tous les styles porteurs de
 *      sens sont INLINE ; <style> ne sert qu'au confort (mobile, dark mode).
 *   3. Gmail, Outlook et Yahoo n'affichent PAS les images SVG.
 *      => le logo email est un PNG (`/icon-192.png`), jamais le .svg.
 *   4. Les images sont bloquées par défaut chez ~40 % des destinataires.
 *      => aucun texte important dans une image, `alt` toujours rempli.
 *
 * Règle d'usage : un email de l'application ne construit JAMAIS son HTML à la
 * main. Il assemble des blocs de ce fichier et passe le tout à `renderMailing`.
 *
 * Charte officielle : FINARENT Partenaires.pdf §1.
 */

import { BRAND_COLORS, COMPANY_INFO, escapeHtml } from '../branding.js';

// ─── TOKENS EMAIL ───────────────────────────────────────────────
// Dérivés de la charte, figés ici dans les unités que les clients mail
// comprennent (px, hex 6 caractères — pas de rgba, pas de var()).

export const MAIL = {
  // Couleurs (charte §1)
  marine: BRAND_COLORS.marine, // #10253C — header, titres
  acier: BRAND_COLORS.acier, // #1C3654 — sous-titres, labels
  menthe: BRAND_COLORS.menthe, // #58B794 — CTA, accents (≤15 % de la surface)
  vertProfond: BRAND_COLORS.vertProfond, // #3E9D7A — liens
  texte: BRAND_COLORS.grisTexte, // #404040 — corps
  fond: BRAND_COLORS.grisDoux, // #F2F5F4 — fond de page et cartes
  blanc: BRAND_COLORS.blanc,
  bordure: '#E4E8EC',
  attenue: '#737D8C', // mentions secondaires

  // Typographie — la webfont n'est lue que par Apple Mail / iOS.
  // La pile de repli doit donc rester crédible partout ailleurs.
  police: "'Plus Jakarta Sans','Segoe UI',Roboto,Helvetica,Arial,sans-serif",

  // Gabarit
  largeur: 600, // largeur canonique de l'emailing
  gouttiere: 32, // padding horizontal desktop
  gouttiereMobile: 22,
};

// Tagline officielle (reprise du logo vectoriel Finarent).
export const MAIL_TAGLINE = 'FINANCEMENT · LOCATION · ASSURANCE PRO';

function racine(baseUrl) {
  const root = baseUrl || process.env.APP_BASE_URL || 'https://finarent.fr';
  return root.replace(/\/$/, '');
}

/**
 * Logo email : PNG obligatoire (cf. contrainte 3 en tête de fichier).
 */
export function mailLogoUrl(baseUrl) {
  return `${racine(baseUrl)}/icon-192.png`;
}

// ─── BLOCS DE CONTENU ───────────────────────────────────────────
// Chaque fonction retourne une <table> autonome, insérable dans le corps.
// Toutes prennent du texte déjà échappé OU l'échappent elles-mêmes — la
// signature le précise à chaque fois.

/** Ouvre une ligne pleine largeur avec la gouttière standard. */
function ligne(contenu, { paddingTop = 0, paddingBottom = 0, background = '' } = {}) {
  const bg = background ? ` bgcolor="${background}"` : '';
  return `<tr><td${bg} style="padding:${paddingTop}px ${MAIL.gouttiere}px ${paddingBottom}px;${background ? `background-color:${background};` : ''}" class="fn-pad">${contenu}</td></tr>`;
}

/**
 * Titre principal (un seul par email).
 * @param {string} texte  texte brut, échappé ici
 */
export function mailTitle(texte) {
  return ligne(
    `<h1 style="margin:0;font-family:${MAIL.police};font-size:24px;line-height:1.25;font-weight:800;color:${MAIL.marine};letter-spacing:-0.02em;">${escapeHtml(texte)}</h1>`,
    { paddingTop: 32, paddingBottom: 0 },
  );
}

/**
 * Sur-titre discret au-dessus du titre (catégorie du mailing).
 * @param {string} texte  texte brut, échappé ici
 */
export function mailEyebrow(texte) {
  return ligne(
    `<p style="margin:0;font-family:${MAIL.police};font-size:11px;line-height:1.4;font-weight:700;color:${MAIL.menthe};letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(texte)}</p>`,
    { paddingTop: 32, paddingBottom: 8 },
  );
}

/** Intertitre de section. @param {string} texte texte brut, échappé ici */
export function mailHeading(texte) {
  return ligne(
    `<h2 style="margin:0;font-family:${MAIL.police};font-size:17px;line-height:1.35;font-weight:700;color:${MAIL.marine};">${escapeHtml(texte)}</h2>`,
    { paddingTop: 26, paddingBottom: 6 },
  );
}

/**
 * Paragraphe de corps.
 * @param {string} html  fragment HTML (autorise <strong>, <a>, <br>) — à
 *                       échapper par l'appelant si la donnée vient d'un tiers.
 */
export function mailText(html, { muted = false, size = 15 } = {}) {
  const couleur = muted ? MAIL.attenue : MAIL.texte;
  return ligne(
    `<p style="margin:0;font-family:${MAIL.police};font-size:${size}px;line-height:1.6;color:${couleur};">${html}</p>`,
    { paddingTop: 14, paddingBottom: 0 },
  );
}

/**
 * Bouton d'action « bulletproof » : VML pour Outlook, <a> ailleurs.
 * Un seul CTA principal par email (règle charte §3).
 */
export function mailButton(href, label, { secondary = false, align = 'center' } = {}) {
  const url = escapeHtml(href);
  const texte = escapeHtml(label);
  const fond = secondary ? MAIL.blanc : MAIL.menthe;
  const encre = secondary ? MAIL.marine : MAIL.blanc;
  const trait = secondary ? MAIL.marine : MAIL.menthe;
  // Outlook exige une largeur fixe : on l'estime sur la longueur du libellé.
  const largeur = Math.min(440, Math.max(190, label.length * 9 + 60));

  const contenu = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:0 auto;">
  <tr><td align="center">
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:48px;v-text-anchor:middle;width:${largeur}px;" arcsize="25%" strokecolor="${trait}" fillcolor="${fond}">
      <w:anchorlock/>
      <center style="color:${encre};font-family:'Segoe UI',Arial,sans-serif;font-size:15px;font-weight:bold;">${texte}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-- -->
    <a href="${url}" style="display:inline-block;padding:15px 30px;background-color:${fond};border:1px solid ${trait};border-radius:12px;font-family:${MAIL.police};font-size:15px;font-weight:700;line-height:1;color:${encre};text-decoration:none;mso-hide:all;">${texte}</a>
    <!--<![endif]-->
  </td></tr>
</table>`;
  return ligne(contenu, { paddingTop: 26, paddingBottom: 4 });
}

/**
 * Carte clé / valeur (référence dossier, montant, entreprise…).
 * @param {Array<[string, any]>} rows  valeurs brutes, échappées ici
 */
export function mailInfoCard(rows) {
  const lignes = rows
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(
      ([label, valeur]) => `
      <tr>
        <td style="padding:5px 0;font-family:${MAIL.police};font-size:14px;line-height:1.5;color:${MAIL.acier};font-weight:600;white-space:nowrap;">${escapeHtml(label)}</td>
        <td style="padding:5px 0 5px 16px;font-family:${MAIL.police};font-size:14px;line-height:1.5;color:${MAIL.marine};font-weight:700;" align="right">${escapeHtml(valeur)}</td>
      </tr>`,
    )
    .join('');

  const contenu = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${MAIL.fond}" style="background-color:${MAIL.fond};border:1px solid ${MAIL.bordure};border-radius:12px;">
  <tr><td style="padding:16px 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${lignes}</table>
  </td></tr>
</table>`;
  return ligne(contenu, { paddingTop: 20 });
}

/**
 * Liste à puces (pièces manquantes, avantages…).
 * Les puces sont dessinées en cellules : les <ul> sont rendus de façon
 * incohérente d'un client à l'autre (marges Outlook notamment).
 * @param {string[]} items  texte brut, échappé ici
 */
export function mailBullets(items) {
  const lignes = items
    .map(
      (item) => `
      <tr>
        <td width="20" valign="top" style="padding:5px 0 0;font-family:${MAIL.police};font-size:15px;line-height:1.5;color:${MAIL.menthe};font-weight:700;">&bull;</td>
        <td style="padding:5px 0 0;font-family:${MAIL.police};font-size:15px;line-height:1.5;color:${MAIL.texte};">${escapeHtml(item)}</td>
      </tr>`,
    )
    .join('');
  return ligne(
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${lignes}</table>`,
    { paddingTop: 12 },
  );
}

/**
 * Citation / message personnalisé (recommandation d'un affilié, verbatim).
 * @param {string} texte   texte brut, échappé ici
 * @param {string} [auteur]
 */
export function mailQuote(texte, auteur) {
  const signature = auteur
    ? `<p style="margin:10px 0 0;font-family:${MAIL.police};font-size:13px;line-height:1.5;color:${MAIL.attenue};">— ${escapeHtml(auteur)}</p>`
    : '';
  const contenu = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${MAIL.fond}" style="background-color:${MAIL.fond};border-left:4px solid ${MAIL.menthe};border-radius:0 10px 10px 0;">
  <tr><td style="padding:14px 18px;">
    <p style="margin:0;font-family:${MAIL.police};font-size:15px;line-height:1.6;color:${MAIL.acier};font-style:italic;">${escapeHtml(texte)}</p>
    ${signature}
  </td></tr>
</table>`;
  return ligne(contenu, { paddingTop: 18 });
}

/**
 * Bandeau de chiffres clés (3 colonnes max — au-delà, illisible sur mobile).
 * @param {Array<{valeur: string, label: string}>} stats
 */
export function mailStats(stats) {
  const cellules = stats
    .slice(0, 3)
    .map(
      (s) => `
      <td width="33%" align="center" valign="top" style="padding:4px 6px;" class="fn-stack">
        <p style="margin:0;font-family:${MAIL.police};font-size:22px;line-height:1.2;font-weight:800;color:${MAIL.marine};">${escapeHtml(s.valeur)}</p>
        <p style="margin:4px 0 0;font-family:${MAIL.police};font-size:12px;line-height:1.4;color:${MAIL.attenue};">${escapeHtml(s.label)}</p>
      </td>`,
    )
    .join('');
  const contenu = `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${MAIL.fond}" style="background-color:${MAIL.fond};border:1px solid ${MAIL.bordure};border-radius:12px;">
  <tr><td style="padding:18px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${cellules}</tr></table>
  </td></tr>
</table>`;
  return ligne(contenu, { paddingTop: 22 });
}

/** Filet de séparation. */
export function mailDivider() {
  return ligne(
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:${MAIL.bordure};">&nbsp;</td></tr></table>`,
    { paddingTop: 26 },
  );
}

/** Espace vertical explicite (en px). */
export function mailSpacer(hauteur = 16) {
  return `<tr><td height="${hauteur}" style="height:${hauteur}px;line-height:${hauteur}px;font-size:0;">&nbsp;</td></tr>`;
}

/**
 * Signature d'équipe — clôture standard de tous les mailings Finarent.
 */
export function mailSignature(prenom) {
  const qui = prenom ? `${escapeHtml(prenom)} — ${escapeHtml(COMPANY_INFO.name)}` : `L'équipe ${escapeHtml(COMPANY_INFO.name)}`;
  return ligne(
    `<p style="margin:0;font-family:${MAIL.police};font-size:15px;line-height:1.6;color:${MAIL.texte};">${qui}</p>`,
    { paddingTop: 22 },
  );
}

// ─── STRUCTURE ──────────────────────────────────────────────────

function preheader(texte) {
  if (!texte) return '';
  // Le rembourrage invisible empêche le client mail de compléter l'aperçu
  // avec le début du HTML (« Afficher dans le navigateur… »).
  const bourrage = '&#847;&zwnj;&nbsp;'.repeat(60);
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${MAIL.blanc};opacity:0;">${escapeHtml(texte)}${bourrage}</div>`;
}

function entete(baseUrl) {
  const root = racine(baseUrl);
  return `
<tr>
  <td bgcolor="${MAIL.marine}" style="background-color:${MAIL.marine};padding:24px ${MAIL.gouttiere}px;" class="fn-pad">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="44" valign="middle" style="padding-right:12px;">
          <a href="${root}" style="text-decoration:none;">
            <img src="${mailLogoUrl(baseUrl)}" width="44" height="44" alt="Finarent" style="display:block;width:44px;height:44px;border:0;border-radius:22px;" />
          </a>
        </td>
        <td valign="middle">
          <a href="${root}" style="text-decoration:none;">
            <span style="display:block;font-family:${MAIL.police};font-size:19px;line-height:1.2;font-weight:800;color:${MAIL.blanc};letter-spacing:-0.01em;">Finarent</span>
            <span style="display:block;margin-top:3px;font-family:${MAIL.police};font-size:10px;line-height:1.3;font-weight:600;color:#9FB3C8;letter-spacing:0.1em;">${MAIL_TAGLINE}</span>
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

/**
 * Pied de page légal.
 *
 * `unsubscribeUrl` est OBLIGATOIRE dès que l'email est de nature commerciale
 * (prospection, newsletter, campagne) : art. L34-5 CPCE + RGPD. Il doit être
 * omis sur les emails purement transactionnels, où il n'a pas de sens.
 */
function pied({ baseUrl, unsubscribeUrl, raison }) {
  const root = racine(baseUrl);
  const c = COMPANY_INFO;
  const styleP = `margin:0 0 6px;font-family:${MAIL.police};font-size:11px;line-height:1.55;color:${MAIL.acier};`;
  const styleA = `color:${MAIL.acier};text-decoration:underline;`;

  const blocRaison = raison
    ? `<p style="${styleP}">${escapeHtml(raison)}</p>`
    : '';

  const blocDesabo = unsubscribeUrl
    ? `<p style="${styleP}margin-top:10px;"><a href="${escapeHtml(unsubscribeUrl)}" style="${styleA}">Se désabonner</a> · <a href="${root}/privacy" style="${styleA}">Vos données</a></p>`
    : '';

  return `
<tr>
  <td bgcolor="${MAIL.fond}" style="background-color:${MAIL.fond};padding:22px ${MAIL.gouttiere}px;border-top:1px solid ${MAIL.bordure};" class="fn-pad">
    <p style="${styleP}"><strong style="color:${MAIL.marine};">${escapeHtml(c.name)} ${escapeHtml(c.legalForm)}</strong> — ${escapeHtml(c.address)}, ${escapeHtml(c.postal)} ${escapeHtml(c.city)}</p>
    <p style="${styleP}">SIREN ${escapeHtml(c.siren)} · RCS ${escapeHtml(c.rcs)} · ORIAS ${escapeHtml(c.orias)} · ${escapeHtml(c.phone)} · <a href="mailto:${escapeHtml(c.email)}" style="${styleA}">${escapeHtml(c.email)}</a></p>
    <p style="${styleP}">Courtier indépendant en financement &amp; assurance, soumis au contrôle de l'ACPR. <a href="${root}/legal" style="${styleA}">Mentions légales</a> · <a href="${root}/privacy" style="${styleA}">Politique de confidentialité</a></p>
    ${blocRaison}
    ${blocDesabo}
  </td>
</tr>`;
}

/**
 * Feuille de style d'appoint : uniquement du confort (mobile, dark mode).
 * Tout ce qui est indispensable au rendu est déjà inline dans les blocs.
 */
function styleAppoint() {
  return `
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; }
    @media only screen and (max-width:620px) {
      .fn-shell { width:100% !important; }
      .fn-pad { padding-left:${MAIL.gouttiereMobile}px !important; padding-right:${MAIL.gouttiereMobile}px !important; }
      .fn-stack { display:block !important; width:100% !important; padding-bottom:14px !important; }
    }
    @media (prefers-color-scheme: dark) {
      /* Les clients qui inversent d'office (Outlook.com, Gmail Android) ne
         lisent pas cette règle ; on se contente de garantir que le contenu
         reste lisible là où elle s'applique (Apple Mail). */
      .fn-shell { background-color:#FFFFFF !important; }
    }
  `;
}

/**
 * Assemble un email complet au format Finarent.
 *
 * @param {object}   o
 * @param {string}   o.title            titre de l'onglet / <title>
 * @param {string}   o.preheader        aperçu affiché dans la boîte de réception
 * @param {string[]} o.blocks           blocs produits par les helpers ci-dessus
 * @param {string}   [o.baseUrl]        override de APP_BASE_URL
 * @param {string}   [o.unsubscribeUrl] obligatoire pour tout email commercial
 * @param {string}   [o.raison]         « Vous recevez cet email parce que… »
 * @returns {string} HTML prêt à l'envoi
 */
export function renderMailing({ title, preheader: apercu, blocks = [], baseUrl, unsubscribeUrl, raison }) {
  const corps = blocks.filter(Boolean).join('\n');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="fr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style type="text/css">${styleAppoint()}</style>
</head>
<body style="margin:0;padding:0;background-color:${MAIL.fond};" bgcolor="${MAIL.fond}">
${preheader(apercu)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${MAIL.fond}" style="background-color:${MAIL.fond};">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${MAIL.largeur}"><tr><td><![endif]-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${MAIL.largeur}" class="fn-shell" bgcolor="${MAIL.blanc}" style="width:${MAIL.largeur}px;max-width:${MAIL.largeur}px;background-color:${MAIL.blanc};border:1px solid ${MAIL.bordure};border-radius:16px;overflow:hidden;">
        ${entete(baseUrl)}
        <tr><td style="padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
${corps}
            ${mailSpacer(32)}
          </table>
        </td></tr>
        ${pied({ baseUrl, unsubscribeUrl, raison })}
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Version texte brut, dérivée du HTML.
 *
 * Une alternative texte n'est pas cosmétique : son absence est un signal
 * négatif fort pour les filtres anti-spam (et casse les lecteurs d'écran
 * configurés en texte seul).
 */
export function mailingToText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(style|head|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => {
      const texte = label.replace(/<[^>]+>/g, '').trim();
      if (!href || href.startsWith('mailto:')) return texte;
      return texte ? `${texte} : ${href}` : href;
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h1|h2|tr|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&bull;/g, '-')
    .replace(/&nbsp;|&#847;|&zwnj;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
