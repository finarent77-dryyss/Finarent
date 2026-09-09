/**
 * Cycle de vie des factures et des devis.
 *
 * Les colonnes `Invoice.status` et `Quote.status` sont des `String` libres (pas
 * des `enum` Prisma) : la base n'oppose donc aucune résistance. Le PATCH
 * d'administration recopiait la valeur reçue telle quelle, avec deux
 * conséquences relevées en revue :
 *
 *   - `{"status":"PAID"}` soldait une facture n'ayant jamais rien encaissé,
 *     `paidAmount` restant à 0 : l'écran et les compteurs `groupBy` mentaient ;
 *   - une valeur arbitraire (« BANANA ») était stockée et créait une catégorie
 *     fantôme dans les filtres.
 *
 * Les routes `offers/[id]` et `prospects/[id]` validaient déjà leur statut
 * contre une liste fermée ; ce module rend le contrôle explicite et le durcit
 * en décrivant les transitions autorisées, pas seulement les valeurs.
 */

/** Statuts d'une facture, dans l'ordre du cycle de vie. */
export const STATUTS_FACTURE = ['DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'CANCELLED'];

/**
 * Transitions autorisées.
 *
 * PAID est terminal : une facture réglée ne « redevient » pas modifiable, elle
 * se corrige par un avoir (CreditNote). CANCELLED l'est aussi.
 */
export const TRANSITIONS_FACTURE = {
  DRAFT: ['ISSUED', 'CANCELLED'],
  ISSUED: ['PARTIAL', 'PAID', 'CANCELLED'],
  PARTIAL: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: [],
};

/**
 * Statuts qui valent émission comptable.
 *
 * C'est le passage vers l'un d'eux — et lui seul — qui consomme un numéro de la
 * séquence FAC-AAAA-NNNN. Annuler un brouillon n'en consomme pas : il n'a
 * jamais existé comptablement, et lui attribuer un numéro recréerait le trou
 * que l'on cherche à supprimer.
 */
export const STATUTS_FACTURE_EMISE = ['ISSUED', 'PARTIAL', 'PAID'];

/** Vrai si le statut visé constitue une émission. */
export function statutVautEmission(statut) {
  return STATUTS_FACTURE_EMISE.includes(statut);
}

/** Statuts d'un devis. */
export const STATUTS_DEVIS = ['DRAFT', 'SENT', 'ACCEPTED', 'REFUSED', 'EXPIRED'];

/** Un devis expiré peut être renvoyé après prolongation ; ACCEPTED et REFUSED sont définitifs. */
export const TRANSITIONS_DEVIS = {
  DRAFT: ['SENT', 'EXPIRED'],
  SENT: ['ACCEPTED', 'REFUSED', 'EXPIRED'],
  ACCEPTED: [],
  REFUSED: [],
  EXPIRED: ['SENT'],
};

/**
 * Identité du destinataire figée à l'émission.
 *
 * Ce sont les mentions obligatoires d'une facture : les modifier après émission
 * revient à réécrire une pièce comptable déjà transmise. Le courriel et le
 * téléphone en sont volontairement exclus — ce sont des canaux de contact, pas
 * des mentions légales, et il faut pouvoir corriger une adresse erronée pour
 * renvoyer le document.
 */
export const CHAMPS_IDENTITE_FACTURE = [
  'clientName',
  'clientAddress',
  'clientPostal',
  'clientCity',
  'clientSiret',
];

/** Tolérance d'arrondi sur les comparaisons de montants en euros. */
const EPSILON = 0.01;

/**
 * Vérifie une transition contre une table de transitions.
 *
 * Un statut courant inconnu (donnée antérieure au contrôle, ou écrite par
 * l'ancien PATCH permissif) n'est pas bloquant : on autorise alors n'importe
 * quel statut valide, pour laisser une porte de sortie à la réparation. Les
 * règles de montant, elles, continuent de s'appliquer.
 *
 * @returns {{ ok: boolean, message?: string }}
 */
export function verifierTransition(transitions, statutsValides, actuel, cible) {
  if (!statutsValides.includes(cible)) {
    return { ok: false, message: `Statut invalide : « ${cible} ». Attendu : ${statutsValides.join(', ')}.` };
  }
  if (actuel === cible) return { ok: true };

  const permises = transitions[actuel];
  if (permises === undefined) return { ok: true };

  if (!permises.includes(cible)) {
    return {
      ok: false,
      message: permises.length
        ? `Transition ${actuel} → ${cible} interdite. Depuis ${actuel}, seuls ${permises.join(', ')} sont possibles.`
        : `Transition ${actuel} → ${cible} interdite : le statut ${actuel} est définitif.`,
    };
  }
  return { ok: true };
}

/**
 * Transition de facture, montants encaissés compris.
 *
 * @param {{ status: string, paidAmount: number, totalTTC: number }} facture
 * @param {string} cible
 * @returns {{ ok: boolean, message?: string }}
 */
export function verifierTransitionFacture(facture, cible) {
  const base = verifierTransition(TRANSITIONS_FACTURE, STATUTS_FACTURE, facture?.status, cible);
  if (!base.ok) return base;

  const encaisse = Number(facture?.paidAmount) || 0;
  const total = Number(facture?.totalTTC) || 0;

  if (cible === 'PAID' && encaisse < total - EPSILON) {
    return {
      ok: false,
      message:
        `Facture non soldée : ${encaisse.toFixed(2)} € encaissés sur ${total.toFixed(2)} € TTC. `
        + 'Enregistrez le versement plutôt que de forcer le statut.',
    };
  }

  if (cible === 'PARTIAL' && encaisse <= 0) {
    return {
      ok: false,
      message: 'Aucun versement enregistré : la facture ne peut pas être partiellement réglée.',
    };
  }

  return { ok: true };
}

/**
 * Transition de devis.
 * @returns {{ ok: boolean, message?: string }}
 */
export function verifierTransitionDevis(devis, cible) {
  return verifierTransition(TRANSITIONS_DEVIS, STATUTS_DEVIS, devis?.status, cible);
}

/**
 * Champs d'identité qu'une requête tente de modifier sur une facture émise.
 * Retourne la liste des champs refusés (vide si la modification est licite).
 */
export function champsIdentiteFiges(facture, corps) {
  if (!facture || facture.status === 'DRAFT') return [];
  return CHAMPS_IDENTITE_FACTURE.filter(
    (champ) => champ in corps && corps[champ] !== facture[champ],
  );
}
