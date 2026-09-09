/**
 * Observation du claim de rôle historique — préparation du constat P2-4.
 *
 * Le rôle se lit dans `https://finarent/role`. L'ancien namespace
 * `https://finassur/role` est encore accepté en repli dans `lib/auth.ts`,
 * `lib/users.js` et `middleware.ts` : retiré trop tôt, il ferait retomber en
 * CLIENT toute session ouverte avant la bascule de l'Action Auth0.
 *
 * Ce module ne change aucun comportement. Il journalise **une fois par
 * utilisateur et par processus** qu'un jeton porte encore l'ancien claim, pour
 * que la condition de retrait devienne observable : quand plus aucune ligne
 * `[P2-4]` n'apparaît dans les journaux sur une durée supérieure à celle d'une
 * session Auth0, le repli peut être supprimé des trois fichiers sans risque.
 *
 * Mis en place le 9 septembre 2026.
 */

/** Clés déjà signalées, pour ne pas répéter l'avertissement à chaque requête. */
const dejaSignales = new Set<string>();

/** Borne mémoire : au-delà, on repart de zéro (le message se répètera une fois). */
const PLAFOND_MEMOIRE = 500;

/**
 * Signale, une seule fois par utilisateur, un jeton portant l'ancien claim.
 *
 * @param sub       identifiant Auth0 du porteur du jeton, s'il est connu
 * @param contexte  fichier appelant, pour situer la lecture dans les journaux
 */
export function signalerClaimHistorique(sub: string | undefined | null, contexte: string): void {
  const cle = `${contexte}|${sub || 'inconnu'}`;
  if (dejaSignales.has(cle)) return;
  if (dejaSignales.size >= PLAFOND_MEMOIRE) dejaSignales.clear();
  dejaSignales.add(cle);

  console.warn(
    `[P2-4] Jeton portant encore l'ancien claim https://finassur/role — `
    + `sub=${sub || 'inconnu'} (${contexte}). Le repli ne peut pas être retiré `
    + `tant que ce message apparaît.`,
  );
}
