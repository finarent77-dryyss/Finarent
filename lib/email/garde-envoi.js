/**
 * Garde d'envoi hors production — défaut RUN-05.
 *
 * ## Le défaut corrigé
 *
 * Le `.env` local porte des identifiants Brevo actifs. Un simple
 * `npm run dev` suivi d'un dépôt de demande a donc expédié **deux vrais
 * messages** : l'un vers l'adresse saisie dans le formulaire, l'autre vers
 * `admin@finarent.com`, la boîte d'exploitation. Rien dans le code ne
 * distinguait le poste d'un développeur d'un serveur de production.
 *
 * C'est exactement le défaut déjà traité pour la base de données —
 * « l'environnement de travail branché sur les vraies données » — transposé au
 * canal email : rejouer un formulaire en local écrit à de vraies personnes,
 * pollue une boîte d'exploitation et consomme le quota Brevo.
 *
 * ## La règle
 *
 * Hors production, **aucun email ne part par défaut**. Le message est rendu
 * dans la console et déposé dans `.email-preview/envois-simules/`, dossier
 * déjà couvert par `.gitignore`. Le rendu est celui qui serait parti :
 * destinataire, expéditeur, sujet, en-têtes, HTML et texte réels, produits par
 * `lib/email/templates.js` comme en production.
 *
 * ## L'échappatoire
 *
 * `AUTORISER_ENVOI_EMAIL_REEL=1` rétablit l'envoi réel depuis un environnement
 * de développement. Valeurs acceptées : `1`, `true`, `oui`, `yes`, `on`
 * (casse indifférente). Toute autre valeur, y compris l'absence de la
 * variable, laisse la garde active.
 *
 * À poser dans le `.env` local, le temps d'une recette de délivrabilité — et à
 * retirer ensuite. Ne jamais la poser en production : elle y est inutile.
 *
 * ## Le chemin de production est inchangé
 *
 * En production `NODE_ENV` vaut `production`, la garde s'efface et
 * `lib/email/send.js` déroule exactement la séquence d'avant : API Brevo, puis
 * repli SMTP, puis journalisation dans `EmailLog`. Aucune branche de ce
 * chemin n'a été modifiée.
 *
 * Corollaire assumé : un `next build && next start` local se comporte comme la
 * production et envoie réellement. `NODE_ENV` est le seul discriminant fiable
 * dont dispose le code ; un build de production *est* un environnement de
 * production du point de vue de l'application.
 *
 * ## Portée
 *
 * La garde est posée dans `sendMail`, point de passage unique de tout envoi
 * nominatif de l'application : `lib/email.js` (confirmations, alertes admin,
 * pièces manquantes, statuts, invitations affiliés), `lib/referral-events.js`,
 * `lib/documents/deliver.js`, `lib/email/outbound-attribution.js`,
 * `app/api/newsletter`, `app/api/referrals`, `app/api/sign/[token]`, et les
 * routes d'administration. Aucun de ces appelants n'a besoin de la connaître.
 */

/** Nom de la variable qui rétablit l'envoi réel hors production. */
export const VARIABLE_AUTORISATION = 'AUTORISER_ENVOI_EMAIL_REEL';

/** Dossier de dépôt des messages simulés (ignoré par git via `.email-preview/`). */
export const DOSSIER_SIMULATION = '.email-preview/envois-simules';

const VALEURS_VRAIES = new Set(['1', 'true', 'oui', 'yes', 'on']);

/** Longueur du corps texte recopié dans la console. Au-delà, on renvoie au fichier. */
const APERCU_TEXTE = 600;

/**
 * L'environnement courant a-t-il le droit d'expédier réellement ?
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {boolean}
 */
export function envoiReelAutorise(env = process.env) {
  if (env?.NODE_ENV === 'production') return true;
  const brut = env?.[VARIABLE_AUTORISATION];
  return VALEURS_VRAIES.has(String(brut ?? '').trim().toLowerCase());
}

/**
 * Phrase expliquant pourquoi un message n'est pas parti, destinée à la console.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {string}
 */
export function raisonGarde(env = process.env) {
  const environnement = env?.NODE_ENV || 'development';
  return (
    `garde d'envoi active (NODE_ENV=${environnement}) — `
    + `poser ${VARIABLE_AUTORISATION}=1 pour expédier réellement depuis cet environnement`
  );
}

/** Identifiant local, reconnaissable au premier coup d'œil dans `EmailLog`. */
export function identifiantSimule() {
  const jeton = Math.random().toString(36).slice(2, 10);
  return `<simule-${Date.now()}-${jeton}@finarent.local>`;
}

/** Fragment de nom de fichier tiré du sujet. */
function slug(sujet) {
  return String(sujet || 'sans-sujet')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'sans-sujet';
}

/** Horodatage triable et compatible avec les noms de fichiers Windows. */
function horodatage(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-').replace('Z', '');
}

/**
 * Dépose le message sur le disque. Ne lève jamais : un système de fichiers en
 * lecture seule ne doit pas transformer une simulation en échec de route.
 *
 * @returns {Promise<{html: string, texte: string} | null>} Chemins relatifs.
 */
async function deposer(nomBase, contenuHtml, contenuTexte) {
  try {
    const [{ default: fs }, { default: path }] = await Promise.all([
      import('node:fs'),
      import('node:path'),
    ]);
    const dossier = path.resolve(process.cwd(), DOSSIER_SIMULATION);
    fs.mkdirSync(dossier, { recursive: true });

    const fichierHtml = path.join(dossier, `${nomBase}.html`);
    const fichierTexte = path.join(dossier, `${nomBase}.txt`);
    fs.writeFileSync(fichierHtml, contenuHtml, 'utf8');
    fs.writeFileSync(fichierTexte, contenuTexte, 'utf8');

    return {
      html: path.relative(process.cwd(), fichierHtml),
      texte: path.relative(process.cwd(), fichierTexte),
    };
  } catch (e) {
    console.error(`[email] dépôt du message simulé impossible : ${e?.message || e}`);
    return null;
  }
}

/**
 * En-tête lisible placé en tête du fichier `.txt` : tout ce que le serveur
 * SMTP aurait vu, au même endroit que le corps.
 */
function enTeteLisible({ to, subject, from, replyTo, headers, pieces, commercial }) {
  const lignes = [
    '='.repeat(72),
    'MESSAGE NON ENVOYÉ — rendu par la garde de développement',
    '='.repeat(72),
    `Date          : ${new Date().toISOString()}`,
    `Destinataire  : ${to}`,
    `Expéditeur    : ${from?.name || ''} <${from?.email || ''}>`,
    `Répondre à    : ${replyTo || '(défaut)'}`,
    `Sujet         : ${subject}`,
    `Nature        : ${commercial ? 'commercial (List-Unsubscribe posé)' : 'transactionnel'}`,
  ];

  const noms = Object.keys(headers || {});
  if (noms.length) {
    lignes.push('En-têtes      :');
    for (const nom of noms) lignes.push(`  ${nom}: ${headers[nom]}`);
  }
  if (pieces?.length) {
    lignes.push('Pièces jointes :');
    for (const p of pieces) {
      lignes.push(`  ${p.name} (${Math.round((p.content?.length || 0) / 1024)} Ko)`);
    }
  }

  lignes.push('='.repeat(72), '');
  return lignes.join('\n');
}

/**
 * Rend le message au lieu de l'expédier : console + dépôt disque.
 *
 * Le HTML est déposé tel quel, sans bandeau ajouté, pour qu'il s'affiche dans
 * le navigateur exactement comme il s'afficherait chez le destinataire — même
 * principe que `scripts/preview-emails.mjs`, qui relit la charte sans rien
 * envoyer. Les métadonnées vivent dans le `.txt` qui l'accompagne.
 *
 * @param {object} message                Le message tel que `sendMail` l'a préparé.
 * @param {string} message.to
 * @param {string} message.subject
 * @param {string} message.html
 * @param {string} [message.text]
 * @param {{name?: string, email?: string}} [message.from]
 * @param {string} [message.replyTo]
 * @param {Record<string, string>} [message.headers]
 * @param {Array<{name: string, content: Buffer}>} [message.pieces]
 * @param {boolean} [message.commercial]
 * @param {Record<string, string | undefined>} [env]
 * @returns {Promise<{messageId: string, fichiers: {html: string, texte: string} | null}>}
 */
export async function simulerEnvoi(message, env = process.env) {
  const { to, subject, html, text, from, replyTo, headers, pieces, commercial } = message;

  const entete = enTeteLisible({ to, subject, from, replyTo, headers, pieces, commercial });
  const nomBase = `${horodatage()}__${slug(subject)}`;
  const fichiers = await deposer(nomBase, html ?? '', `${entete}${text ?? ''}\n`);

  const corps = String(text ?? '').trim();
  const apercu = corps.length > APERCU_TEXTE
    ? `${corps.slice(0, APERCU_TEXTE)}\n… (${corps.length - APERCU_TEXTE} caractères de plus)`
    : corps;

  const bloc = [
    '',
    '─'.repeat(72),
    `[email] NON ENVOYÉ — ${raisonGarde(env)}`,
    `  Destinataire : ${to}`,
    `  Sujet        : ${subject}`,
    `  Expéditeur   : ${from?.name || ''} <${from?.email || ''}>`,
    ...(pieces?.length ? [`  Pièces       : ${pieces.map((p) => p.name).join(', ')}`] : []),
    ...(fichiers ? [`  Rendu HTML   : ${fichiers.html}`, `  Rendu texte  : ${fichiers.texte}`] : []),
    '  ─── corps ───',
    apercu ? apercu.split('\n').map((l) => `  ${l}`).join('\n') : '  (corps texte vide)',
    '─'.repeat(72),
  ].join('\n');

  console.warn(bloc);

  return { messageId: identifiantSimule(), fichiers };
}
