/**
 * Agrégation du journal OWNER : journal d'activité admin (AdminActivityLog)
 * + audits RGPD (RgpdAction) + historique des statuts de demandes
 * (StatusHistory), fusionnés en un flux unique trié par date.
 *
 * Inspiré de slformations/journal-query, adapté aux modèles finassur.
 */

import { prisma } from './prisma';
import {
  ACTIVITY_MODULES,
  activityActionLabel,
  activityModuleLabel,
  activityModuleTone,
} from './admin-activity-log';

const STATUS_LABELS = {
  PENDING: 'En attente', REVIEWING: 'En analyse', DOCUMENTS_NEEDED: 'Docs manquants',
  QUOTE_SENT: 'Devis envoyé', QUOTE_ACCEPTED: 'Devis accepté', PENDING_SIGNATURE: 'Signature en attente',
  SIGNED: 'Signé', TRANSMITTED: 'Transmis', APPROVED: 'Validé', REJECTED: 'Refusé', COMPLETED: 'Finalisé',
};

const RGPD_LABELS = {
  EXPORT: 'Export des données', DELETE_ACCOUNT: 'Suppression de compte',
  RECTIFY: 'Rectification', CONSENT_GRANT: 'Consentement accordé', CONSENT_REVOKE: 'Consentement retiré',
};

const FETCH_PER_SOURCE = 300;
const PAGE_SIZE_DEFAULT = 50;

function periodWhere(period) {
  if (!period || period === 'all') return {};
  const now = Date.now();
  const map = { today: 0, '7d': 7 * 864e5, '30d': 30 * 864e5 };
  if (period === 'today') {
    const d = new Date();
    return { createdAt: { gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()) } };
  }
  const delta = map[period];
  if (delta == null) return {};
  return { createdAt: { gte: new Date(now - delta) } };
}

/**
 * @param {object} opts
 * @param {string} [opts.module]   filtre module (clé ACTIVITY_MODULES, ou 'demandes'/'rgpd')
 * @param {string} [opts.period]   today | 7d | 30d | all
 * @param {string} [opts.search]   recherche plein-texte sur le résumé/acteur
 * @param {number} [opts.page]
 * @param {number} [opts.pageSize]
 */
export async function fetchJournalRows(opts = {}) {
  const moduleFilter = (opts.module || '').trim();
  const period = opts.period || 'all';
  const search = (opts.search || '').trim();
  const page = Math.max(1, opts.page || 1);
  const pageSize = opts.pageSize || PAGE_SIZE_DEFAULT;

  const dateWhere = periodWhere(period);

  const wantActivity = !moduleFilter || ACTIVITY_MODULES[moduleFilter] != null;
  const wantRgpd = !moduleFilter || moduleFilter === 'rgpd';
  const wantDemandes = !moduleFilter || moduleFilter === 'demandes';

  const activityWhere = { ...dateWhere };
  if (moduleFilter && ACTIVITY_MODULES[moduleFilter]) activityWhere.module = moduleFilter;
  if (search) {
    activityWhere.OR = [
      { summary: { contains: search, mode: 'insensitive' } },
      { action: { contains: search, mode: 'insensitive' } },
      { entityId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [activities, rgpdActions, statusHistory, activityModuleCounts, rgpdCount, statusCount] = await Promise.all([
    wantActivity
      ? prisma.adminActivityLog.findMany({
          where: activityWhere,
          include: { actor: { select: { id: true, name: true, email: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: FETCH_PER_SOURCE,
        })
      : Promise.resolve([]),
    wantRgpd
      ? prisma.rgpdAction.findMany({ where: dateWhere, orderBy: { createdAt: 'desc' }, take: FETCH_PER_SOURCE })
      : Promise.resolve([]),
    wantDemandes
      ? prisma.statusHistory.findMany({
          where: dateWhere,
          include: { application: { select: { id: true, companyName: true } } },
          orderBy: { createdAt: 'desc' },
          take: FETCH_PER_SOURCE,
        })
      : Promise.resolve([]),
    wantActivity
      ? prisma.adminActivityLog.groupBy({ by: ['module'], _count: true })
      : Promise.resolve([]),
    wantRgpd ? prisma.rgpdAction.count({ where: dateWhere }) : Promise.resolve(0),
    wantDemandes ? prisma.statusHistory.count({ where: dateWhere }) : Promise.resolve(0),
  ]);

  const merged = [];

  for (const a of activities) {
    merged.push({
      id: `act-${a.id}`,
      source: 'activity',
      createdAt: a.createdAt,
      module: a.module,
      moduleLabel: activityModuleLabel(a.module),
      moduleTone: activityModuleTone(a.module),
      action: a.action,
      actionLabel: activityActionLabel(a.action),
      summary: a.summary,
      entityType: a.entityType,
      entityId: a.entityId,
      details: a.details,
      ipAddress: a.ipAddress,
      actorId: a.actorId,
      actorName: a.actor?.name ?? null,
      actorEmail: a.actor?.email ?? null,
      actorRole: a.actor?.role ?? null,
    });
  }

  for (const r of rgpdActions) {
    merged.push({
      id: `rgpd-${r.id}`,
      source: 'rgpd',
      createdAt: r.createdAt,
      module: 'rgpd',
      moduleLabel: ACTIVITY_MODULES.rgpd.label,
      moduleTone: ACTIVITY_MODULES.rgpd.tone,
      action: r.action,
      actionLabel: RGPD_LABELS[r.action] || r.action,
      summary: `${RGPD_LABELS[r.action] || r.action}${r.email ? ` — ${r.email}` : ''}`,
      entityType: 'RgpdAction',
      entityId: r.id,
      details: r.details,
      ipAddress: r.ip,
      actorId: r.userId,
      actorName: null,
      actorEmail: r.email,
      actorRole: null,
    });
  }

  for (const s of statusHistory) {
    const from = STATUS_LABELS[s.fromStatus] || s.fromStatus;
    const to = STATUS_LABELS[s.toStatus] || s.toStatus;
    merged.push({
      id: `st-${s.id}`,
      source: 'demandes',
      createdAt: s.createdAt,
      module: 'demandes',
      moduleLabel: ACTIVITY_MODULES.demandes.label,
      moduleTone: ACTIVITY_MODULES.demandes.tone,
      action: 'STATUS_CHANGED',
      actionLabel: 'Statut modifié',
      summary: `${s.application?.companyName || 'Dossier'} : ${from} → ${to}${s.comment ? ` — ${s.comment}` : ''}`,
      entityType: 'Application',
      entityId: s.applicationId,
      details: null,
      ipAddress: null,
      actorId: s.changedById,
      actorName: null,
      actorEmail: null,
      actorRole: null,
    });
  }

  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Recherche plein-texte appliquée aussi aux sources rgpd/demandes (déjà côté SQL pour activity)
  let filtered = merged;
  if (search) {
    const q = search.toLowerCase();
    filtered = merged.filter((r) =>
      (r.summary || '').toLowerCase().includes(q) ||
      (r.actorEmail || '').toLowerCase().includes(q) ||
      (r.actorName || '').toLowerCase().includes(q),
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  // Résolution batch des acteurs manquants (rgpd/demandes n'ont pas de relation)
  const missingActorIds = [...new Set(rows.filter((r) => r.actorId && !r.actorName && !r.actorEmail).map((r) => r.actorId))];
  if (missingActorIds.length) {
    const actors = await prisma.user.findMany({
      where: { id: { in: missingActorIds } },
      select: { id: true, name: true, email: true, role: true },
    });
    const byId = Object.fromEntries(actors.map((u) => [u.id, u]));
    for (const r of rows) {
      if (r.actorId && byId[r.actorId]) {
        r.actorName = r.actorName || byId[r.actorId].name;
        r.actorEmail = r.actorEmail || byId[r.actorId].email;
        r.actorRole = r.actorRole || byId[r.actorId].role;
      }
    }
  }

  // Compteurs par module (pour les filtres)
  const moduleCounts = new Map();
  for (const m of activityModuleCounts) {
    moduleCounts.set(m.module, (moduleCounts.get(m.module) || 0) + m._count);
  }
  if (rgpdCount > 0) moduleCounts.set('rgpd', (moduleCounts.get('rgpd') || 0) + rgpdCount);
  if (statusCount > 0) moduleCounts.set('demandes', (moduleCounts.get('demandes') || 0) + statusCount);

  const modules = [...moduleCounts.entries()]
    .map(([code, count]) => ({ code, label: ACTIVITY_MODULES[code]?.label || code, tone: ACTIVITY_MODULES[code]?.tone || 'slate', count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

  return { rows, total, page, pageSize, modules };
}
