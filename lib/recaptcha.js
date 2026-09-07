/**
 * Verification du jeton reCAPTCHA v3 cote serveur.
 *
 * Renvoie `skipped: true` quand la verification n'a pas pu avoir lieu
 * (cle secrete absente, ou aucun jeton envoye par le navigateur). L'appelant
 * laisse alors passer la demande : le pot de miel et la limite par IP restent
 * actifs. Une configuration incomplete degrade l'anti-spam, elle ne doit pas
 * bloquer la totalite des formulaires publics.
 *
 * @param {string} token - Jeton reCAPTCHA fourni par le client
 * @returns {Promise<{success: boolean, skipped: boolean, score?: number, reason?: string}>}
 */
export async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('reCAPTCHA : RECAPTCHA_SECRET_KEY absente en production — verification ignoree.');
    }
    return { success: true, skipped: true, reason: 'no_secret' };
  }

  if (!token) {
    console.warn('reCAPTCHA : aucun jeton recu — le script est-il bien charge ? Verification ignoree.');
    return { success: true, skipped: true, reason: 'no_token' };
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    return { success: data.success === true, skipped: false, score: data.score };
  } catch (err) {
    // Google injoignable : ne pas penaliser un prospect pour une panne reseau.
    console.error('reCAPTCHA : verification impossible —', err.message);
    return { success: true, skipped: true, reason: 'network_error' };
  }
}
