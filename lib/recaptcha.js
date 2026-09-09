/**
 * Vérification du jeton reCAPTCHA v3 côté serveur.
 *
 * Deux régimes, selon que `RECAPTCHA_SECRET_KEY` est renseignée ou non.
 *
 * **Protection inactive** (secret absent — état de la production au 9 septembre
 * 2026) : la vérification est ignorée et la demande passe. C'est un choix
 * délibéré : refuser toutes les soumissions tant que la clé n'est pas posée
 * fermerait les formulaires publics, donc le canal d'acquisition. Le pot de miel
 * et la limitation par IP restent actifs entre-temps.
 *
 * **Protection active** (secret renseigné) : une soumission sans jeton est
 * REFUSÉE. C'est le point corrigé le 9 septembre 2026. Le code précédent
 * renvoyait `success: true` quand aucun jeton n'était fourni, et l'appelant ne
 * vérifiait le jeton que s'il était présent : un robot obtenait donc le passage
 * en omettant simplement le champ. Le contournement ne disparaissait pas une
 * fois la clé configurée — il était permanent. Un contrôle qu'on peut sauter en
 * n'envoyant rien n'est pas un contrôle.
 *
 * Le seul cas où l'on continue de laisser passer sans vérifier est une panne
 * réseau côté Google : pénaliser un prospect pour une indisponibilité tierce
 * coûterait plus cher que le spam que cela laisse entrer. Ce cas est journalisé.
 *
 * @param {string} token - Jeton reCAPTCHA fourni par le navigateur
 * @returns {Promise<{success: boolean, skipped: boolean, score?: number, reason?: string}>}
 *   `skipped: true` signifie « pas de verdict » ; l'appelant laisse passer.
 *   `success: false` avec `skipped: false` est un refus ferme : rejeter en 400.
 */

/** Score minimal accepté (reCAPTCHA v3 note de 0.0 à 1.0). */
const SCORE_MINIMAL_PAR_DEFAUT = 0.5;

function scoreMinimal() {
  const brut = Number.parseFloat(process.env.RECAPTCHA_SCORE_MIN ?? '');
  return Number.isFinite(brut) && brut >= 0 && brut <= 1 ? brut : SCORE_MINIMAL_PAR_DEFAUT;
}

/** Vrai si la protection est réellement armée côté serveur. */
export function recaptchaEstActif() {
  return Boolean(process.env.RECAPTCHA_SECRET_KEY);
}

export async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'reCAPTCHA : RECAPTCHA_SECRET_KEY absente en production — les formulaires ' +
        'publics ne sont protégés que par le pot de miel et la limite par IP.'
      );
    }
    return { success: true, skipped: true, reason: 'no_secret' };
  }

  // Protection armée : l'absence de jeton est un refus, pas une dispense.
  if (!token) {
    console.warn('reCAPTCHA : soumission sans jeton refusée.');
    return { success: false, skipped: false, reason: 'no_token' };
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();

    if (data.success !== true) {
      return { success: false, skipped: false, reason: 'jeton_invalide' };
    }

    // v3 ne dit pas « humain ou robot » : il note. Sans seuil, on n'écarte que
    // les jetons franchement invalides, ce qui laisse passer le trafic robotisé
    // correctement outillé.
    const score = typeof data.score === 'number' ? data.score : null;
    if (score !== null && score < scoreMinimal()) {
      console.warn(`reCAPTCHA : score ${score} sous le seuil ${scoreMinimal()} — soumission refusée.`);
      return { success: false, skipped: false, score, reason: 'score_insuffisant' };
    }

    return { success: true, skipped: false, score: score ?? undefined };
  } catch (err) {
    // Google injoignable : ne pas pénaliser un prospect pour une panne réseau.
    console.error('reCAPTCHA : vérification impossible —', err.message);
    return { success: true, skipped: true, reason: 'network_error' };
  }
}
