/**
 * Journal centralisé d'activité (OWNER) — best-effort, ne bloque jamais
 * l'action métier. Inspiré du modèle slformations (AdminActivityLog).
 *
 * Usage : await logAdminActivity({ actorId, module, action, summary, ... })
 */

import { prisma } from './prisma';
import { extractRequestContext } from './audit';

/** Modules métier + couleur (tone) pour l'affichage du journal. */
export const ACTIVITY_MODULES = {
  security:     { label: 'Sécurité & accès',     tone: 'red' },
  finance:      { label: 'Finance & commissions', tone: 'emerald' },
  settings:     { label: 'Paramètres',            tone: 'purple' },
  demandes:     { label: 'Demandes',              tone: 'blue' },
  crm:          { label: 'CRM & prospection',     tone: 'amber' },
  call_center:  { label: "Centres d'appel",       tone: 'cyan' },
  affiliations: { label: 'Affiliation',           tone: 'pink' },
  exports:      { label: 'Exports de données',    tone: 'slate' },
  rgpd:         { label: 'RGPD & données',         tone: 'indigo' },
};

/** Libellés lisibles des actions (fallback : snake_case → minuscules). */
export const ACTIVITY_ACTION_LABELS = {
  LOGIN: 'Connexion',
  LOGIN_FAILED: 'Échec connexion',
  LOGOUT: 'Déconnexion',
  USER_CREATED: 'Compte créé',
  USER_DELETED: 'Compte supprimé',
  ROLES_CHANGED: 'Rôle modifié',
  SETTINGS_UPDATED: 'Paramètres modifiés',
  // Demandes
  STATUS_CHANGED: 'Statut demande modifié',
  DEMANDE_ASSIGNED_CENTER: 'Demande rattachée à un centre',
  // Finance / commissions
  COMMISSION_PAID: 'Commission versée',
  COMMISSION_CANCELLED: 'Commission annulée',
  COMMISSION_RESET: 'Commission remise en attente',
  INVOICE_CREATED: 'Facture créée',
  QUOTE_CREATED: 'Devis créé',
  // Centres d'appel
  CENTER_CREATED: "Centre d'appel créé",
  CENTER_UPDATED: "Centre d'appel modifié",
  CENTER_DEACTIVATED: "Centre d'appel désactivé",
  MEMBER_ADDED: 'Membre ajouté au centre',
  MEMBER_REMOVED: 'Membre retiré du centre',
  // CRM / prospects
  PROSPECT_IMPORTED: 'Prospects importés',
  PROSPECT_ASSIGNED: 'Prospect assigné',
  PROSPECT_DELETED: 'Prospect supprimé',
  PROSPECT_STATUS_CHANGED: 'Statut prospect modifié',
  CALL_LOGGED: 'Appel journalisé',
  // Affiliation
  AFFILIATE_CREATED: 'Affilié créé',
  AFFILIATE_ACTION: 'Action affiliation',
  // Exports
  EXPORT: 'Export de données',
  // RGPD
  RGPD_EXPORT: 'Export RGPD',
  RGPD_DELETE: 'Suppression compte',
  CONSENT_UPDATED: 'Consentement modifié',
};

export function activityModuleLabel(module) {
  return ACTIVITY_MODULES[module]?.label || module;
}

export function activityModuleTone(module) {
  return ACTIVITY_MODULES[module]?.tone || 'slate';
}

export function activityActionLabel(action) {
  return ACTIVITY_ACTION_LABELS[action] || String(action || '').replace(/_/g, ' ').toLowerCase();
}

/**
 * Enregistre une entrée de journal. Échec silencieux (best-effort).
 *
 * @param {object} input
 * @param {string} [input.actorId]    id User de l'acteur
 * @param {string} input.module       clé de ACTIVITY_MODULES
 * @param {string} input.action       code action (cf. ACTIVITY_ACTION_LABELS)
 * @param {string} input.summary      phrase lisible
 * @param {string} [input.entityType]
 * @param {string} [input.entityId]
 * @param {object} [input.details]    payload JSON additionnel
 * @param {Request} [input.request]   pour extraire IP / User-Agent
 */
export async function logAdminActivity(input) {
  try {
    if (!input?.module || !input?.action || !input?.summary) return null;
    const { ip, userAgent } = extractRequestContext(input.request);
    return await prisma.adminActivityLog.create({
      data: {
        actorId: input.actorId ?? null,
        module: input.module,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        summary: String(input.summary).slice(0, 500),
        details: input.details ?? undefined,
        ipAddress: ip,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
      },
    });
  } catch (err) {
    console.error('[AdminActivityLog] échec enregistrement:', err.message);
    return null;
  }
}
