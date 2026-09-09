/**
 * Cycle de vie des liens de paiement Stripe attachés à une facture (ADM2-06).
 *
 * Un `paymentLink` Stripe reste payable tant qu'il n'est pas explicitement
 * désactivé (`active: false`), et il porte un montant figé à sa création — le
 * reste à payer du moment. Trois gestes le rendaient donc obsolète sans le
 * rendre inoffensif :
 *
 *  - « Regénérer un nouveau lien » créait un second lien sans toucher au
 *    premier : deux liens vivants pour la même facture, dont l'un au mauvais
 *    montant, et un client qui règle par l'ancien solde une facture déjà
 *    partiellement encaissée ;
 *  - enregistrer un versement (virement, chèque) réduit le reste à payer, mais
 *    le lien continuait de réclamer l'ancien montant ;
 *  - annuler une facture laissait son lien de paiement actif : une pièce
 *    annulée restait encaissable.
 *
 * La règle tenue ici : dès que le montant dû change ou que la facture cesse
 * d'être exigible, le lien existant est désactivé chez Stripe *et* détaché en
 * base. Un nouveau lien, au bon montant, se regénère en un clic.
 */

import { prisma } from '@/lib/prisma';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

/**
 * Désactive le lien de paiement d'une facture, s'il en porte un.
 *
 * Ne lève jamais : l'appelant décide quoi faire d'un échec, selon qu'il peut
 * encore refuser l'opération (création d'un nouveau lien, annulation) ou
 * qu'elle est déjà acquise (versement encaissé).
 *
 * @param {{ id: string, stripePaymentLinkId?: string | null }} facture
 * @returns {Promise<{ desactive: boolean, raison?: string }>}
 */
export async function desactiverLienPaiement(facture) {
  const lienId = facture?.stripePaymentLinkId;
  if (!lienId) return { desactive: true };

  if (!isStripeConfigured()) {
    return {
      desactive: false,
      raison: 'Stripe non configuré (STRIPE_SECRET_KEY manquante) : le lien existant n\'a pas pu être désactivé.',
    };
  }

  try {
    await getStripe().paymentLinks.update(lienId, { active: false });
  } catch (erreur) {
    // Le lien n'existe plus chez Stripe : il n'est donc plus payable, ce qui
    // est le résultat recherché. On nettoie la base et on continue.
    if (erreur?.code !== 'resource_missing') {
      console.error(`Désactivation du lien Stripe ${lienId} impossible :`, erreur);
      return {
        desactive: false,
        raison: erreur?.message || 'erreur Stripe inconnue',
      };
    }
  }

  await prisma.invoice.update({
    where: { id: facture.id },
    data: { stripePaymentLinkId: null, stripePaymentLinkUrl: null },
  });

  return { desactive: true };
}
