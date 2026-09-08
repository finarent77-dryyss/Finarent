import { brevoApi } from './client.js';
import { brevoConfigured, marketingListId } from './config.js';

/**
 * Gestion des contacts Brevo (liste marketing + liste de suppression).
 *
 * La « blocklist » Brevo est notre liste de suppression officielle : une fois
 * une adresse marquée `emailBlacklisted`, Brevo refuse tout envoi vers elle,
 * campagne comme transactionnel marketing. C'est volontairement Brevo qui la
 * porte plutôt qu'une table locale : la garantie doit tenir même si un envoi
 * part d'un autre outil, ou d'un import manuel dans l'interface Brevo.
 */

function normaliser(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Inscrit (ou met à jour) une adresse dans la liste marketing.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function subscribeToMarketingList(email, attributes = {}) {
  if (!brevoConfigured()) return { ok: false, error: 'Brevo non configuré' };
  const dest = normaliser(email);
  if (!dest.includes('@')) return { ok: false, error: 'Email invalide' };

  const listId = marketingListId();
  try {
    await brevoApi('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email: dest,
        updateEnabled: true,
        attributes,
        ...(listId ? { listIds: [listId] } : {}),
      }),
    });
    return { ok: true };
  } catch (e) {
    console.error('[brevo] subscribe failed:', e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Place une adresse en liste de suppression.
 * Idempotent : rejouer l'appel sur un contact déjà bloqué est sans effet.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function blocklistContact(email) {
  if (!brevoConfigured()) return { ok: false, error: 'Brevo non configuré' };
  const dest = normaliser(email);
  if (!dest.includes('@')) return { ok: false, error: 'Email invalide' };

  try {
    await brevoApi(`/contacts/${encodeURIComponent(dest)}`, {
      method: 'PUT',
      body: JSON.stringify({ emailBlacklisted: true }),
    });
    return { ok: true };
  } catch (e) {
    // 404 = contact inconnu de Brevo : il n'a jamais été importé, donc rien
    // à bloquer côté plateforme. Ce n'est pas une erreur de désabonnement.
    if (e.status === 404) return { ok: true };
    console.error('[brevo] blocklist failed:', e.message);
    return { ok: false, error: e.message };
  }
}
