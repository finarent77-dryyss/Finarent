import { brevoApi } from './client.js';
import { brevoConfigured, brevoSenderEmail, marketingListId } from './config.js';
import { templateCampagne } from '../email/templates.js';
import { COMPANY_INFO } from '../invoicing/company.js';

/**
 * Campagnes de masse Brevo (mailing à une liste).
 *
 * À ne pas confondre avec `lib/email/send.js`, qui envoie un message à UN
 * destinataire. Ici on crée une campagne côté Brevo : c'est la plateforme qui
 * gère l'étalement des envois, les statistiques agrégées et le désabonnement
 * par destinataire (tag `{{ unsubscribe }}` — un seul HTML est rendu pour
 * toute la liste, on ne peut donc pas y signer un lien individuel).
 *
 * Le HTML reste produit par la charte Finarent : une campagne créée depuis
 * l'éditeur Brevo ne respecterait pas la charte et ne serait pas versionnée.
 */

/**
 * Prépare le HTML d'une campagne à partir du template générique.
 * @param {object} contenu  cf. `templateCampagne` (sans `to`)
 * @returns {{subject: string, html: string, text: string}}
 */
export function buildCampaignHtml(contenu) {
  return templateCampagne({
    ...contenu,
    to: null,
    unsubscribe: '{{ unsubscribe }}',
  });
}

/**
 * Crée une campagne Brevo. Ne l'envoie pas : par défaut elle reste en
 * brouillon, à relire dans l'interface Brevo avant expédition.
 *
 * @param {object}   o
 * @param {string}   o.nom            nom interne de la campagne (visible admin Brevo)
 * @param {object}   o.contenu        paramètres du template (titre, intro, sections, cta…)
 * @param {number}   [o.listId]       liste destinataire (défaut : BREVO_MARKETING_LIST_ID)
 * @param {string}   [o.scheduledAt]  ISO 8601 ; planifie l'envoi au lieu du brouillon
 * @returns {Promise<{ok: boolean, campaignId?: number, error?: string}>}
 */
export async function createCampaign({ nom, contenu, listId, scheduledAt }) {
  if (!brevoConfigured()) return { ok: false, error: 'BREVO_API_KEY non configurée.' };

  const liste = listId || marketingListId();
  if (!liste) {
    return { ok: false, error: 'Aucune liste marketing (BREVO_MARKETING_LIST_ID absent).' };
  }

  const { subject, html } = buildCampaignHtml(contenu);

  try {
    const res = await brevoApi('/emailCampaigns', {
      method: 'POST',
      body: JSON.stringify({
        name: nom,
        subject,
        type: 'classic',
        sender: { name: COMPANY_INFO.name, email: brevoSenderEmail() },
        replyTo: COMPANY_INFO.email,
        htmlContent: html,
        recipients: { listIds: [liste] },
        ...(scheduledAt ? { scheduledAt } : {}),
      }),
    });
    return { ok: true, campaignId: res.id };
  } catch (e) {
    console.error('[brevo] création campagne échouée :', e.message);
    return { ok: false, error: e.message?.slice(0, 280) };
  }
}

/**
 * Expédie immédiatement une campagne existante.
 * Action irréversible : à n'appeler qu'après relecture du brouillon.
 */
export async function sendCampaignNow(campaignId) {
  if (!brevoConfigured()) return { ok: false, error: 'BREVO_API_KEY non configurée.' };
  try {
    await brevoApi(`/emailCampaigns/${campaignId}/sendNow`, { method: 'POST' });
    return { ok: true };
  } catch (e) {
    console.error('[brevo] envoi campagne échoué :', e.message);
    return { ok: false, error: e.message?.slice(0, 280) };
  }
}

/**
 * Envoie un aperçu de la campagne à des adresses de test avant expédition.
 * @param {number}   campaignId
 * @param {string[]} destinataires
 */
export async function sendCampaignTest(campaignId, destinataires) {
  if (!brevoConfigured()) return { ok: false, error: 'BREVO_API_KEY non configurée.' };
  try {
    await brevoApi(`/emailCampaigns/${campaignId}/sendTest`, {
      method: 'POST',
      body: JSON.stringify({ emailTo: destinataires }),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message?.slice(0, 280) };
  }
}
