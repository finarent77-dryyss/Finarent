/**
 * TEMPLATES DE MAILING FINARENT.
 *
 * Chaque fonction retourne `{ subject, html, text }` prêt à passer au
 * dispatcher (`lib/email/send.js`). Aucune fonction d'envoi ne doit
 * reconstruire du HTML à la main : si un nouveau message est nécessaire, il
 * s'ajoute ici, en assemblant les blocs de `charter.js`.
 *
 * Deux familles, à ne pas mélanger :
 *
 *   TRANSACTIONNEL — déclenché par une action du destinataire (confirmation,
 *   accusé de réception, relance de dossier). Pas de lien de désabonnement :
 *   il n'aurait pas de sens, et Gmail pénalise les transactionnels qui en
 *   portent un.
 *
 *   COMMERCIAL — prospection, newsletter, campagne. Lien de désabonnement
 *   obligatoire, en-têtes List-Unsubscribe, et mention de la raison de
 *   réception dans le pied de page.
 */

import { COMPANY_INFO, escapeHtml } from '../branding.js';
import {
  renderMailing,
  mailingToText,
  mailEyebrow,
  mailTitle,
  mailHeading,
  mailText,
  mailButton,
  mailInfoCard,
  mailBullets,
  mailQuote,
  mailStats,
  mailDivider,
  mailSignature,
} from './charter.js';
import { unsubscribeUrl } from './unsubscribe.js';

function racine(baseUrl) {
  return (baseUrl || process.env.APP_BASE_URL || 'https://finarent.com').replace(/\/$/, '');
}

/** Assemble et dérive automatiquement la version texte. */
function finaliser({ subject, title, preheader, blocks, baseUrl, unsubscribe, raison }) {
  const html = renderMailing({
    title: title || subject,
    preheader,
    blocks,
    baseUrl,
    unsubscribeUrl: unsubscribe,
    raison,
  });
  return { subject, html, text: mailingToText(html) };
}

// ═══ TRANSACTIONNEL ═════════════════════════════════════════════

/** Accusé de réception d'une demande de financement. */
export function templateConfirmationDemande({ reference, companyName, baseUrl }) {
  const url = racine(baseUrl);
  return finaliser({
    subject: `Demande ${reference} enregistrée — Finarent`,
    preheader: `Référence ${reference} · réponse sous 48 h ouvrées`,
    baseUrl,
    blocks: [
      mailTitle('Votre demande est enregistrée'),
      mailText('Bonjour,'),
      mailText(
        'Nous accusons réception de votre demande de financement. Notre équipe étudie votre dossier et revient vers vous sous <strong>48 heures ouvrées</strong>.',
      ),
      mailInfoCard([
        ['Référence', reference],
        ['Entreprise', companyName],
      ]),
      mailButton(`${url}/espace`, 'Suivre mon dossier'),
      mailText(
        `Une question ? Répondez simplement à cet email ou appelez-nous au ${escapeHtml(COMPANY_INFO.phone)}.`,
        { muted: true, size: 13 },
      ),
      mailSignature(),
    ],
  });
}

/** Confirmation de réception d'une pièce justificative. */
export function templateDocumentRecu({ reference, fileName, documentType, baseUrl }) {
  const url = racine(baseUrl);
  return finaliser({
    subject: `Document reçu — Dossier ${reference} — Finarent`,
    preheader: `${fileName} bien reçu pour le dossier ${reference}`,
    baseUrl,
    blocks: [
      mailTitle('Document bien reçu'),
      mailText('Bonjour,'),
      mailText(
        `Nous confirmons la bonne réception du document suivant pour votre dossier <strong>${escapeHtml(reference)}</strong> :`,
      ),
      mailInfoCard([
        ['Nom du fichier', fileName],
        ['Type', documentType],
      ]),
      mailText(
        'Votre conseiller le consulte dans les meilleurs délais et vous notifiera si d\'autres pièces sont nécessaires.',
      ),
      mailButton(`${url}/espace`, 'Voir mon dossier'),
      mailSignature(),
    ],
  });
}

/** Relance : pièces manquantes au dossier. */
export function templateDocumentsManquants({ reference, missingDocs = [], baseUrl }) {
  const url = racine(baseUrl);
  return finaliser({
    subject: `Action requise — Documents manquants — Dossier ${reference}`,
    preheader: 'Quelques pièces à téléverser pour finaliser votre dossier',
    baseUrl,
    blocks: [
      mailTitle('Pièces complémentaires nécessaires'),
      mailText('Bonjour,'),
      mailText(
        `Pour finaliser l'instruction de votre dossier <strong>${escapeHtml(reference)}</strong>, il nous manque les éléments suivants :`,
      ),
      missingDocs.length
        ? mailBullets(missingDocs)
        : mailText('Le détail des pièces manquantes est disponible dans votre espace.'),
      mailButton(`${url}/espace`, 'Téléverser mes documents'),
      mailText('Dès réception, notre équipe poursuit l\'analyse sous 48 h.'),
      mailSignature(),
    ],
  });
}

/** Alerte interne : nouvelle demande à traiter. */
export function templateAlerteAdmin({ reference, companyName, productType, amount, email, baseUrl }) {
  const url = racine(baseUrl);
  return finaliser({
    subject: `[Finarent] Nouvelle demande ${reference} — ${companyName}`,
    preheader: `${companyName} — ${productType}`,
    baseUrl,
    blocks: [
      mailEyebrow('Alerte interne'),
      mailTitle('Nouvelle demande à traiter'),
      mailText('Un prospect vient de soumettre une demande sur le site Finarent.'),
      mailInfoCard([
        ['Référence', reference],
        ['Entreprise', companyName],
        ['Type', productType],
        ['Montant', amount || '—'],
        ['Contact', email],
      ]),
      mailButton(`${url}/admin/demandes`, 'Ouvrir le dossier'),
    ],
  });
}

// ═══ COMMERCIAL ═════════════════════════════════════════════════

/** Bienvenue après inscription à la newsletter. */
export function templateBienvenueNewsletter({ to, baseUrl }) {
  const url = racine(baseUrl);
  return finaliser({
    subject: 'Bienvenue chez Finarent',
    preheader: 'Financement, location et assurance pro — l\'essentiel, une fois par mois.',
    baseUrl,
    unsubscribe: unsubscribeUrl(to, baseUrl),
    raison: 'Vous recevez cet email car vous vous êtes inscrit à la lettre Finarent depuis notre site.',
    blocks: [
      mailEyebrow('Bienvenue'),
      mailTitle('Vous êtes bien inscrit'),
      mailText(
        'Merci pour votre inscription. Une fois par mois, nous partageons ce qui bouge côté financement professionnel : taux, dispositifs, arbitrages LLD / LOA / crédit, et nos analyses de dossiers réels.',
      ),
      mailStats([
        { valeur: '100+', label: 'partenaires bancaires et assureurs' },
        { valeur: '48 h', label: 'de délai de réponse' },
        { valeur: '0 €', label: 'de frais de dossier' },
      ]),
      mailHeading('En attendant, testez votre financement'),
      mailText(
        'Nos simulateurs donnent une mensualité indicative en moins d\'une minute, sans inscription.',
      ),
      mailButton(`${url}/simulateurs`, 'Faire une simulation'),
      mailSignature(),
    ],
  });
}

/**
 * Coquille générique de campagne — c'est LE template à utiliser pour un
 * mailing de masse. Le contenu éditorial est passé en paramètre, la structure
 * et la charte restent identiques d'une campagne à l'autre.
 *
 * @param {object}   o
 * @param {string}   o.to
 * @param {string}   o.subject
 * @param {string}   o.preheader
 * @param {string}   [o.eyebrow]     catégorie affichée au-dessus du titre
 * @param {string}   o.titre
 * @param {string}   o.intro         HTML court (1 à 3 phrases)
 * @param {Array<{heading?: string, text?: string, bullets?: string[]}>} [o.sections]
 * @param {Array<{valeur: string, label: string}>} [o.stats]
 * @param {{href: string, label: string}} [o.cta]
 * @param {{texte: string, auteur?: string}} [o.temoignage]
 */
export function templateCampagne({
  to,
  subject,
  preheader,
  eyebrow,
  titre,
  intro,
  sections = [],
  stats,
  cta,
  temoignage,
  baseUrl,
  // Envoi de masse : un seul HTML est rendu pour toute la liste, on ne peut
  // donc pas signer un lien par destinataire. On passe alors le tag Brevo
  // `{{ unsubscribe }}`, remplacé par la plateforme à la livraison.
  unsubscribe,
}) {
  const blocsSections = sections.flatMap((s) => [
    s.heading ? mailHeading(s.heading) : null,
    s.text ? mailText(s.text) : null,
    s.bullets?.length ? mailBullets(s.bullets) : null,
  ]);

  return finaliser({
    subject,
    preheader,
    baseUrl,
    unsubscribe: unsubscribe || unsubscribeUrl(to, baseUrl),
    raison: `Vous recevez cet email car vous êtes en relation avec ${COMPANY_INFO.name} ou inscrit à notre lettre d'information.`,
    blocks: [
      eyebrow ? mailEyebrow(eyebrow) : null,
      mailTitle(titre),
      intro ? mailText(intro) : null,
      stats?.length ? mailStats(stats) : null,
      ...blocsSections,
      temoignage ? mailQuote(temoignage.texte, temoignage.auteur) : null,
      cta ? mailButton(cta.href, cta.label) : null,
      mailDivider(),
      mailText(
        `Une question ? Répondez à cet email ou appelez-nous au ${escapeHtml(COMPANY_INFO.phone)}.`,
        { muted: true, size: 13 },
      ),
      mailSignature(),
    ],
  });
}

/**
 * Email de prospection envoyé par un agent du centre d'appels.
 * Le corps est rédigé par l'agent ; la charte, le bloc de suivi et le
 * désabonnement sont imposés par le template.
 */
export function templateProspection({
  to,
  recipientName,
  subject,
  messageHtml,
  trackingCode,
  trackingUrl,
  senderName,
  baseUrl,
}) {
  const url = racine(baseUrl);
  const lien = trackingUrl || `${url}/?ref=${encodeURIComponent(trackingCode || '')}`;

  return finaliser({
    subject,
    preheader: subject,
    baseUrl,
    unsubscribe: unsubscribeUrl(to, baseUrl),
    raison: `Vous recevez cet email dans le cadre d'une prospection commerciale de ${COMPANY_INFO.name}, courtier en financement et assurance professionnelle.`,
    blocks: [
      mailTitle(subject),
      mailText(recipientName ? `Bonjour ${escapeHtml(recipientName)},` : 'Bonjour,'),
      mailText(messageHtml),
      mailButton(lien, 'Découvrir Finarent'),
      trackingCode
        ? mailText(`Code de suivi : <strong>${escapeHtml(trackingCode)}</strong>`, { muted: true, size: 12 })
        : null,
      mailSignature(senderName),
    ],
  });
}

/** Invitation / recommandation envoyée au nom d'un affilié. */
export function templateInvitationAffilie({
  to,
  recipientName,
  affiliateName,
  affiliateCode,
  message,
  baseUrl,
}) {
  const url = racine(baseUrl);
  const lien = `${url}/?ref=${encodeURIComponent(affiliateCode)}`;

  return finaliser({
    subject: `${affiliateName} vous recommande Finarent`,
    preheader: `Recommandation personnelle de ${affiliateName}`,
    baseUrl,
    unsubscribe: unsubscribeUrl(to, baseUrl),
    raison: `Vous recevez cet email parce que ${affiliateName} a estimé que nos services pouvaient vous être utiles. Aucune relance automatique ne sera envoyée.`,
    blocks: [
      mailEyebrow('Recommandation'),
      mailTitle(`${affiliateName} vous recommande Finarent`),
      mailText(recipientName ? `Bonjour ${escapeHtml(recipientName)},` : 'Bonjour,'),
      mailText(
        `<strong>${escapeHtml(affiliateName)}</strong> pense que Finarent peut vous être utile pour vos projets de financement professionnel ou d'assurance pro.`,
      ),
      message ? mailQuote(message, affiliateName) : null,
      mailText(
        `${escapeHtml(COMPANY_INFO.name)} est un courtier indépendant qui compare 100+ partenaires bancaires et assureurs pour vous proposer la meilleure offre.`,
      ),
      mailStats([
        { valeur: '3 000 € – 500 000 €', label: 'montants financés' },
        { valeur: '48 h', label: 'de délai de réponse' },
        { valeur: 'Sans frais', label: 'étude de dossier' },
      ]),
      mailButton(lien, 'Découvrir Finarent'),
      mailSignature(),
    ],
  });
}

// ═══ CYCLE DE VIE D'UN DOSSIER ══════════════════════════════════

/**
 * Message associé à chaque statut d'`Application`.
 *
 * Un statut absent de cette table ne déclenche AUCUN email : c'est le cas de
 * PENDING (déjà couvert par l'accusé de réception) et de QUOTE_ACCEPTED
 * (le client vient lui-même d'accepter, le prévenir n'apporte rien).
 */
const ETAPES_DOSSIER = {
  REVIEWING: {
    objet: 'votre dossier est à l\'étude',
    titre: 'Votre dossier est à l\'étude',
    texte: 'Un conseiller analyse votre demande et la confronte aux offres de nos partenaires. Vous recevrez notre retour sous <strong>48 heures ouvrées</strong>.',
    cta: { chemin: '/espace', label: 'Suivre mon dossier' },
  },
  DOCUMENTS_NEEDED: {
    objet: 'des pièces sont attendues',
    titre: 'Il nous manque des pièces',
    texte: 'L\'instruction de votre dossier est en pause le temps de recevoir les documents demandés. Le détail figure dans votre espace.',
    cta: { chemin: '/espace', label: 'Téléverser mes documents' },
  },
  QUOTE_SENT: {
    objet: 'votre devis est disponible',
    titre: 'Votre devis est disponible',
    texte: 'Nous avons retenu la meilleure offre parmi nos partenaires. Le détail — montant, durée, mensualité et coût total — vous attend dans votre espace.',
    cta: { chemin: '/espace', label: 'Consulter mon devis' },
  },
  PENDING_SIGNATURE: {
    objet: 'votre contrat est prêt à signer',
    titre: 'Votre contrat est prêt',
    texte: 'La signature se fait en ligne, en quelques minutes, depuis votre espace. Aucun document papier à renvoyer.',
    cta: { chemin: '/espace', label: 'Signer mon contrat' },
  },
  SIGNED: {
    objet: 'contrat signé',
    titre: 'Contrat signé',
    texte: 'Nous avons bien reçu votre signature. Votre dossier part maintenant chez le partenaire financier pour validation finale.',
    cta: { chemin: '/espace', label: 'Voir mon dossier' },
  },
  TRANSMITTED: {
    objet: 'dossier transmis au partenaire',
    titre: 'Votre dossier est transmis',
    texte: 'Le partenaire financier étudie votre dossier. Ce délai dépend de son propre circuit de décision — nous vous tenons informé dès que nous avons son retour.',
    cta: { chemin: '/espace', label: 'Suivre mon dossier' },
  },
  APPROVED: {
    objet: 'votre financement est accordé',
    titre: 'Votre financement est accordé',
    texte: 'Le partenaire a validé votre dossier. Le déblocage des fonds intervient dans les prochains jours ouvrés ; nous revenons vers vous dès qu\'il est effectif.',
    cta: { chemin: '/espace', label: 'Voir mon dossier' },
  },
  REJECTED: {
    objet: 'suite donnée à votre demande',
    titre: 'Suite donnée à votre demande',
    texte: 'Après étude, nous ne sommes pas en mesure de donner suite à cette demande dans les conditions présentées. Cette décision ne préjuge pas d\'un futur dossier : un changement de montant, de durée ou de garanties peut suffire à la faire évoluer.',
    cta: null,
  },
  COMPLETED: {
    objet: 'dossier finalisé',
    titre: 'Votre dossier est finalisé',
    texte: 'Les fonds sont débloqués — ou votre couverture est active selon le produit souscrit. Merci de votre confiance.',
    cta: { chemin: '/espace', label: 'Voir mon dossier' },
  },
};

/**
 * Notification de changement de statut d'un dossier.
 *
 * @returns {{subject: string, html: string, text: string} | null}
 *          `null` si le statut ne justifie pas d'email — l'appelant n'envoie
 *          alors rien plutôt que d'expédier un message vide de sens.
 */
export function templateStatutDemande({ statut, reference, companyName, amount, baseUrl }) {
  const etape = ETAPES_DOSSIER[statut];
  if (!etape) return null;

  const url = racine(baseUrl);
  const montant = typeof amount === 'number' ? `${amount.toLocaleString('fr-FR')} €` : amount;

  return finaliser({
    subject: `Dossier ${reference} — ${etape.objet}`,
    preheader: etape.titre,
    baseUrl,
    blocks: [
      mailEyebrow(`Dossier ${reference}`),
      mailTitle(etape.titre),
      mailText('Bonjour,'),
      mailText(etape.texte),
      mailInfoCard([
        ['Référence', reference],
        ['Entreprise', companyName],
        ['Montant', montant],
      ]),
      etape.cta ? mailButton(`${url}${etape.cta.chemin}`, etape.cta.label) : null,
      mailText(
        `Une question sur cette étape ? Répondez à cet email ou appelez-nous au ${escapeHtml(COMPANY_INFO.phone)}.`,
        { muted: true, size: 13 },
      ),
      mailSignature(),
    ],
  });
}

/** Statuts qui déclenchent une notification client. */
export const STATUTS_NOTIFIES = Object.keys(ETAPES_DOSSIER);

// ═══ INTERNE ════════════════════════════════════════════════════

/**
 * Rapport interne (recette automatisée, tâche planifiée).
 *
 * Même charte que le reste : ces messages arrivent dans la même boîte que les
 * emails clients, et un rapport qui ne ressemble pas à Finarent se confond
 * avec du bruit. Jamais de désabonnement — ce sont des emails de service.
 */
export function templateRapportInterne({ titre, intro, lignes = [], reussis, total, baseUrl }) {
  const echecs = typeof total === 'number' && typeof reussis === 'number' ? total - reussis : null;

  return finaliser({
    subject: echecs === null ? titre : `${titre} — ${reussis}/${total} réussis`,
    preheader: echecs ? `${echecs} échec(s) à examiner` : 'Toutes les étapes sont passées',
    baseUrl,
    blocks: [
      mailEyebrow('Rapport interne'),
      mailTitle(titre),
      intro ? mailText(intro) : null,
      mailInfoCard([
        ['Date', new Date().toLocaleString('fr-FR')],
        ['Étapes réussies', typeof reussis === 'number' ? `${reussis} / ${total}` : null],
        ['Échecs', echecs === null ? null : String(echecs)],
      ]),
      lignes.length ? mailHeading('Détail') : null,
      lignes.length ? mailBullets(lignes) : null,
      mailText('Message automatique — ne pas répondre.', { muted: true, size: 12 }),
    ],
  });
}

// ═══ DOCUMENTS ══════════════════════════════════════════════════

/** Libellés lisibles des types de documents archivés. */
const LIBELLE_DOCUMENT = {
  FACTURE: 'Votre facture',
  FACTURE_AFFILIE: 'Votre facture de commission',
  DEVIS: 'Votre devis',
  CONTRAT: 'Votre contrat',
  RECAP_DOSSIER: 'Le récapitulatif de votre dossier',
  AUTRE: 'Votre document',
};

/**
 * Transmission d'un document généré (facture, devis, contrat…).
 *
 * Le PDF part en pièce jointe — un client doit pouvoir classer la pièce sans
 * se connecter — et le bouton renvoie malgré tout vers l'espace, seul endroit
 * où le document reste disponible si l'email est perdu.
 */
export function templateDocumentGenere({
  kind,
  reference,
  fileName,
  numeroDocument,
  montant,
  messageComplementaire,
  baseUrl,
}) {
  const url = racine(baseUrl);
  const libelle = LIBELLE_DOCUMENT[kind] || LIBELLE_DOCUMENT.AUTRE;

  return finaliser({
    subject: numeroDocument ? `${libelle} ${numeroDocument}` : libelle,
    preheader: reference ? `Dossier ${reference} — document en pièce jointe` : 'Document en pièce jointe',
    baseUrl,
    blocks: [
      reference ? mailEyebrow(`Dossier ${reference}`) : null,
      mailTitle(libelle),
      mailText('Bonjour,'),
      mailText(
        messageComplementaire
        || 'Vous trouverez le document en pièce jointe de cet email. Il reste également disponible à tout moment dans votre espace.',
      ),
      mailInfoCard([
        ['Document', numeroDocument],
        ['Fichier', fileName],
        ['Dossier', reference],
        ['Montant', montant],
      ]),
      mailButton(`${url}/espace`, 'Ouvrir mon espace'),
      mailText(
        `Une question ? Répondez à cet email ou appelez-nous au ${escapeHtml(COMPANY_INFO.phone)}.`,
        { muted: true, size: 13 },
      ),
      mailSignature(),
    ],
  });
}

// ═══ PARRAINAGE CLIENT ══════════════════════════════════════════

/**
 * Invitation envoyée au filleul, au nom du parrain.
 *
 * Email commercial adressé à quelqu'un qui n'a rien demandé : lien de
 * désabonnement obligatoire, et `replyTo` reste Finarent — l'adresse
 * personnelle du parrain n'a pas à être exposée.
 */
export function templateInvitationParrainage({ to, prenomFilleul, nomParrain, code, message, baseUrl }) {
  const url = racine(baseUrl);
  const lien = `${url}/?ref=${encodeURIComponent(code)}`;

  return finaliser({
    subject: `${nomParrain} vous invite à découvrir Finarent`,
    preheader: 'Financement professionnel : réponse sous 48 h, sans frais de dossier.',
    baseUrl,
    unsubscribe: unsubscribeUrl(to, baseUrl),
    raison: `Vous recevez cet email parce que ${nomParrain}, client de ${COMPANY_INFO.name}, vous a invité. Aucune relance automatique ne suivra.`,
    blocks: [
      mailEyebrow('Invitation'),
      mailTitle(`${nomParrain} vous invite`),
      mailText(prenomFilleul ? `Bonjour ${escapeHtml(prenomFilleul)},` : 'Bonjour,'),
      mailText(
        `<strong>${escapeHtml(nomParrain)}</strong> est client chez nous et a pensé que Finarent pouvait vous être utile pour vos projets de financement professionnel ou d'assurance pro.`,
      ),
      message ? mailQuote(message, nomParrain) : null,
      mailStats([
        { valeur: '100+', label: 'partenaires comparés' },
        { valeur: '48 h', label: 'de délai de réponse' },
        { valeur: '0 €', label: 'de frais de dossier' },
      ]),
      mailButton(lien, 'Découvrir Finarent'),
      mailText(
        'En passant par ce lien, votre demande est rattachée à cette recommandation.',
        { muted: true, size: 13 },
      ),
      mailSignature(),
    ],
  });
}

/** Notification au parrain quand son filleul devient client. */
export function templateParrainageConverti({ nomFilleul, emailFilleul, baseUrl }) {
  const url = racine(baseUrl);
  return finaliser({
    subject: 'Votre filleul est devenu client',
    preheader: 'Votre recommandation a abouti.',
    baseUrl,
    blocks: [
      mailEyebrow('Parrainage'),
      mailTitle('Votre filleul est devenu client'),
      mailText('Bonjour,'),
      mailText(
        `La personne que vous nous avez recommandée vient de signer son dossier. Merci pour cette recommandation — c'est de loin la façon dont on nous fait le plus confiance.`,
      ),
      mailInfoCard([['Filleul', nomFilleul || emailFilleul]]),
      mailText('Notre équipe revient vers vous pour votre récompense.'),
      mailButton(`${url}/espace/parrainage`, 'Voir mes parrainages'),
      mailSignature(),
    ],
  });
}

/** Alerte interne : une récompense de parrainage est à traiter. */
export function templateParrainageAdmin({ emailParrain, emailFilleul, baseUrl }) {
  const url = racine(baseUrl);
  return finaliser({
    subject: '[Finarent] Récompense de parrainage à traiter',
    preheader: `${emailParrain} a converti un filleul`,
    baseUrl,
    blocks: [
      mailEyebrow('Alerte interne'),
      mailTitle('Parrainage converti'),
      mailText('Un dossier signé provient d\'un parrainage : la récompense du parrain reste à honorer manuellement.'),
      mailInfoCard([
        ['Parrain', emailParrain],
        ['Filleul', emailFilleul],
      ]),
      mailButton(`${url}/admin/users`, 'Ouvrir l\'admin'),
    ],
  });
}
