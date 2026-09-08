/**
 * Signature électronique simple — article 1367 du Code civil.
 *
 * Le prestataire externe (Yousign) reste utilisable, mais n'est pas requis :
 * cette voie recueille et conserve elle-même les éléments de preuve. C'est
 * suffisant pour un contrat de mise en relation entre Finarent et son client ;
 * ça ne l'est pas pour un acte exigeant une signature avancée ou qualifiée.
 *
 * La preuve repose sur quatre éléments, tous nécessaires :
 *   1. l'identité      — compte authentifié, nom et email figés à la signature
 *   2. l'intégrité     — empreinte SHA-256 du PDF présenté, PDF signé archivé
 *   3. l'horodatage    — date serveur, jamais celle du navigateur
 *   4. l'imputabilité  — adresse IP, navigateur, consentement explicite
 *
 * Le maillon faible d'une signature « maison » est presque toujours le second :
 * sans empreinte, on prouve que quelqu'un a signé, pas ce qu'il a signé.
 */

import crypto from 'node:crypto';

/** Durée de validité d'un lien de signature. */
export const DUREE_VALIDITE_MS = 14 * 24 * 60 * 60 * 1000; // 14 jours

/** Empreinte SHA-256 d'un document, en hexadécimal. */
export function empreinteDocument(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/** Jeton d'URL imprévisible (32 octets). */
export function genererJeton() {
  return crypto.randomBytes(32).toString('base64url');
}

/** Adresse IP du client, derrière le proxy Clever Cloud. */
export function ipClient(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'inconnue'
  );
}

/**
 * Valide l'image de signature reçue du navigateur.
 * Rejette tout ce qui n'est pas un PNG en data URL de taille plausible : ce
 * champ finit dans un document probant, il ne doit pas accepter n'importe quoi.
 */
export function validerSignatureImage(dataUrl) {
  if (typeof dataUrl !== 'string') return { ok: false, error: 'Signature manquante' };
  if (!dataUrl.startsWith('data:image/png;base64,')) {
    return { ok: false, error: 'Format de signature invalide' };
  }
  const base64 = dataUrl.slice('data:image/png;base64,'.length);
  if (!/^[A-Za-z0-9+/]+=*$/.test(base64)) {
    return { ok: false, error: 'Signature illisible' };
  }
  const octets = Math.floor((base64.length * 3) / 4);
  // Un tracé vide fait quelques centaines d'octets ; au-delà de 2 Mo c'est anormal.
  if (octets < 800) return { ok: false, error: 'Signature trop courte — veuillez signer dans le cadre' };
  if (octets > 2 * 1024 * 1024) return { ok: false, error: 'Signature trop volumineuse' };
  return { ok: true };
}

/** Une demande de signature est-elle encore exploitable ? */
export function etatDemande(demande, maintenant = new Date()) {
  if (!demande) return { utilisable: false, raison: 'introuvable' };
  if (demande.status === 'SIGNED') return { utilisable: false, raison: 'deja_signee' };
  if (demande.status === 'REFUSED') return { utilisable: false, raison: 'refusee' };
  if (new Date(demande.expiresAt) < maintenant) return { utilisable: false, raison: 'expiree' };
  return { utilisable: true };
}

export const MESSAGES_ETAT = {
  introuvable: "Ce lien de signature n'existe pas ou a été révoqué.",
  deja_signee: 'Ce document a déjà été signé.',
  refusee: 'Cette demande de signature a été refusée.',
  expiree: 'Ce lien de signature a expiré. Demandez-en un nouveau à votre conseiller.',
};
