'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STAT_CARDS = [
  { key: 'totalApplications', label: 'Total dossiers', icon: 'fa-folder-open', gradient: 'from-primary to-primary/80', shadow: 'shadow-primary/20' },
  { key: 'pendingApplications', label: 'En attente', icon: 'fa-hourglass-half', gradient: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/20' },
  { key: 'activeApplications', label: 'En cours', icon: 'fa-spinner', gradient: 'from-secondary to-secondary/80', shadow: 'shadow-secondary/20' },
  { key: 'completedApplications', label: 'Finalisés', icon: 'fa-circle-check', gradient: 'from-accent to-emerald-700', shadow: 'shadow-accent/20' },
  { key: 'totalUsers', label: 'Utilisateurs', icon: 'fa-users', gradient: 'from-secondary/80 to-secondary', shadow: 'shadow-secondary/20' },
  { key: 'totalPartners', label: 'Partenaires', icon: 'fa-handshake', gradient: 'from-accent/80 to-accent', shadow: 'shadow-accent/20' },
];

const STATUS_COLORS = {
  PENDING: { bg: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  REVIEWING: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  DOCUMENTS_NEEDED: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  QUOTE_SENT: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  QUOTE_ACCEPTED: { bg: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  PENDING_SIGNATURE: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  SIGNED: { bg: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  TRANSMITTED: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  APPROVED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  REJECTED: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  COMPLETED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

export default function AdminDashboardClient() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slaAlerts, setSlaAlerts] = useState({ level1: [], level2: [], level3: [] });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/admin/sla-alerts')
      .then(r => r.ok ? r.json() : { level1: [], level2: [], level3: [] })
      .then(setSlaAlerts)
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-gray-400">Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  const pendingCount = stats?.pendingApplications || 0;
  const conversionRate = stats?.totalApplications > 0
    ? Math.round(((stats?.completedApplications || 0) / stats.totalApplications) * 100)
    : 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Tableau de bord</h1>
          <p className="text-gray-400 text-sm mt-1">Vue d'ensemble de l'activité Finassur</p>
        </div>
        {pendingCount > 0 && (
          <Link href="/admin/demandes" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-bold border border-secondary/20 hover:bg-secondary/20 transition-all">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
            {pendingCount} dossier{pendingCount > 1 ? 's' : ''} en attente
          </Link>
        )}
      </motion.div>

      {/* À traiter aujourd'hui */}
      {(stats?.todayActions?.total || 0) > 0 && (
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-[#0A2540] rounded-2xl p-5 mb-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-bolt text-amber-400"></i>
              </div>
              <div>
                <h3 className="text-base font-black">À traiter aujourd'hui</h3>
                <p className="text-xs text-white/50">{stats.todayActions.total} action{stats.todayActions.total > 1 ? 's' : ''} prioritaire{stats.todayActions.total > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { count: stats.todayActions.urgentPending, label: 'Dossiers PENDING > 4h', icon: 'fa-hourglass-half', href: '/admin/demandes?sla=1', tone: 'red' },
                { count: stats.todayActions.urgentDocs, label: 'Docs en attente > 7j', icon: 'fa-folder-open', href: '/admin/demandes?status=DOCUMENTS_NEEDED', tone: 'amber' },
                { count: stats.todayActions.expiringSoonOffers, label: 'Offres expirent < 24h', icon: 'fa-clock', href: '/admin/offers?filter=expiring', tone: 'amber' },
                { count: stats.todayActions.staleOffers, label: 'Offres sans réponse > 48h', icon: 'fa-bell', href: '/admin/offers?filter=stale', tone: 'slate' },
              ].map((action, idx) => {
                const colors = action.tone === 'red'
                  ? 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                  : action.tone === 'amber'
                    ? 'bg-amber-500/10 text-amber-200 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10';
                return (
                  <Link
                    key={idx}
                    href={action.href}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${colors} ${action.count === 0 ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <i className={`fa-solid ${action.icon} mt-0.5`}></i>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl font-black tabular-nums">{action.count}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider leading-tight mt-0.5">{action.label}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* SLA Alerts */}
      {(slaAlerts.level1.length + slaAlerts.level2.length + slaAlerts.level3.length) > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
              <h3 className="text-base font-bold text-primary">Alertes SLA</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {slaAlerts.level1.length + slaAlerts.level2.length + slaAlerts.level3.length} en cours
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { level: 1, count: slaAlerts.level1.length, label: 'Non traité > 4h', dot: 'bg-red-500', text: 'text-red-500', bar: 'bg-red-500', border: 'border-red-200', soft: 'bg-red-50' },
              { level: 2, count: slaAlerts.level2.length, label: 'Analyse > 24h', dot: 'bg-secondary', text: 'text-secondary', bar: 'bg-secondary', border: 'border-secondary/20', soft: 'bg-secondary/5' },
              { level: 3, count: slaAlerts.level3.length, label: 'Documents > 48h', dot: 'bg-slate-500', text: 'text-slate-700', bar: 'bg-slate-500', border: 'border-slate-200', soft: 'bg-slate-50' },
            ].map(a => (
              <Link
                key={a.level}
                href={`/admin/demandes?sla=${a.level}`}
                className={`block rounded-xl p-4 border ${a.border} ${a.soft} hover:shadow-md transition-all group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${a.dot} ${a.count > 0 ? 'animate-pulse' : ''}`}></span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${a.text}`}>Niveau {a.level}</span>
                  </div>
                  <i className={`fa-solid fa-arrow-right text-xs ${a.text} opacity-50 group-hover:opacity-100 transition-opacity`}></i>
                </div>
                <div className={`text-3xl font-black ${a.text}`}>{a.count}</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">{a.label}</div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden mt-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, a.count * 10)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`h-full ${a.bar} rounded-full`}
                  />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <motion.div
            key={card.key}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 sm:p-5 text-white shadow-xl ${card.shadow} relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                <i className={`fa-solid ${card.icon}`}></i>
              </div>
              <div className="text-2xl sm:text-3xl font-black">{stats?.[card.key] ?? 0}</div>
              <div className="text-xs font-semibold text-white/70 mt-1">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue & Performance */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-[#0A2540] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Montant total validé</div>
              <div className="text-3xl font-black">{(stats?.totalAmount || 0).toLocaleString('fr-FR')}€</div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Taux de conversion</div>
              <div className="flex items-center gap-3">
                <div className="text-xl font-black">{conversionRate}%</div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${conversionRate}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Dossiers finalisés</div>
              <div className="text-xl font-black">{stats?.completedApplications || 0}</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Actions rapides</h3>
          <div className="space-y-3">
            {[
              { href: '/admin/demandes', icon: 'fa-folder-open', label: 'Demandes', desc: `${stats?.totalApplications || 0} dossiers` },
              { href: '/admin/users', icon: 'fa-users', label: 'Utilisateurs', desc: `${stats?.totalUsers || 0} inscrits` },
              { href: '/admin/partners', icon: 'fa-handshake', label: 'Partenaires', desc: `${stats?.totalPartners || 0} actifs` },
              { href: '/', icon: 'fa-globe', label: 'Voir le site', desc: 'Site public' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-secondary/5 hover:text-secondary transition-all group">
                <div className="w-9 h-9 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                  <i className={`fa-solid ${item.icon} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
                <i className="fa-solid fa-chevron-right text-xs text-gray-300"></i>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Répartition des statuts</h3>
          {stats?.totalApplications > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'En attente', count: stats?.pendingApplications || 0, color: 'bg-slate-500' },
                { label: 'En cours', count: stats?.activeApplications || 0, color: 'bg-secondary' },
                { label: 'Finalisés', count: stats?.completedApplications || 0, color: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600">{item.label}</span>
                    <span className="font-bold text-primary">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.totalApplications > 0 ? (item.count / stats.totalApplications) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <i className="fa-solid fa-chart-bar text-3xl mb-2 block"></i>
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Montant moyen</div>
          <div className="text-xl font-black text-secondary">
            {(stats?.averageAmount || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">Sur dossiers validés</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Conversion</div>
          <div className="text-xl font-black text-accent">{conversionRate}%</div>
          <div className="text-xs text-slate-400 mt-1">Finalisés / Total</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Dossiers ce mois</div>
          <div className="text-xl font-black text-secondary">
            {(() => {
              const now = new Date();
              const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
              const current = (stats?.monthlyData || []).find((m) => m.month === currentKey);
              return current ? current.count : 0;
            })()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Depuis le 1er du mois</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Délai traitement</div>
          <div className="text-xl font-black text-primary">
            {stats?.avgProcessingHours > 0 ? `${stats.avgProcessingHours}h` : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Moy. dépôt → fonds</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Délai signature</div>
          <div className="text-xl font-black text-primary">
            {stats?.avgSignatureHours > 0 ? `${stats.avgSignatureHours}h` : '—'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Moy. envoi → signé</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Taux d'abandon</div>
          <div className={`text-xl font-black ${(stats?.abandonmentRate || 0) > 25 ? 'text-red-500' : 'text-slate-700'}`}>
            {stats?.abandonmentRate ?? 0}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Refusés + stagnants 30j</div>
        </motion.div>
      </div>

      {/* Conversion Funnel */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-primary">Funnel de conversion</h3>
            <p className="text-xs text-slate-400 mt-0.5">Cumul des dossiers passés par chaque étape</p>
          </div>
          {stats?.stagnantCount > 0 && (
            <Link href="/admin/demandes?stagnant=1" className="text-xs font-bold text-red-500 hover:underline">
              <i className="fa-solid fa-triangle-exclamation mr-1"></i>
              {stats.stagnantCount} dossier{stats.stagnantCount > 1 ? 's' : ''} stagnant{stats.stagnantCount > 1 ? 's' : ''}
            </Link>
          )}
        </div>
        {(stats?.funnel || []).length > 0 && stats.funnel[0].count > 0 ? (
          <div className="space-y-3">
            {stats.funnel.map((step, idx) => {
              const top = stats.funnel[0].count;
              const prev = idx === 0 ? null : stats.funnel[idx - 1];
              const widthPct = top > 0 ? (step.count / top) * 100 : 0;
              const conversionFromPrev = prev && prev.count > 0 ? Math.round((step.count / prev.count) * 100) : null;
              const colors = ['bg-secondary', 'bg-secondary/85', 'bg-secondary/70', 'bg-accent/80', 'bg-accent', 'bg-emerald-600'];
              return (
                <div key={step.status} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary">{step.label}</span>
                      {conversionFromPrev !== null && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conversionFromPrev >= 70 ? 'bg-emerald-100 text-emerald-700' : conversionFromPrev >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {conversionFromPrev}% vs étape précédente
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-primary tabular-nums">{step.count}</span>
                  </div>
                  <div className="h-7 bg-slate-100 rounded-lg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.08 }}
                      className={`h-full ${colors[idx]} flex items-center px-3`}
                    >
                      {widthPct > 15 && (
                        <span className="text-xs font-bold text-white tabular-nums">{Math.round(widthPct)}%</span>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <i className="fa-solid fa-filter text-3xl mb-2 block"></i>
            <p className="text-sm">Aucun dossier dans le funnel</p>
          </div>
        )}
      </motion.div>

      {/* Performance par opérateur */}
      {(stats?.topOperators || []).length > 0 && (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <h3 className="text-base font-bold text-primary mb-4">Performance par opérateur</h3>
          {(() => {
            const ops = stats.topOperators;
            const maxActions = Math.max(...ops.map((o) => o.actions), 1);
            const ROLE_BADGE = {
              ADMIN: { label: 'Admin', cls: 'bg-primary/10 text-primary' },
              PARTNER: { label: 'Partenaire', cls: 'bg-secondary/10 text-secondary' },
              INSURER: { label: 'Assureur', cls: 'bg-accent/10 text-accent' },
            };
            return (
              <div className="space-y-3">
                {ops.map((op, idx) => {
                  const badge = ROLE_BADGE[op.role] || { label: op.role, cls: 'bg-slate-100 text-slate-600' };
                  const pct = (op.actions / maxActions) * 100;
                  return (
                    <div key={op.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-primary text-sm truncate">{op.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.1 }}
                            className="h-full bg-secondary rounded-full"
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-black text-primary tabular-nums">{op.actions}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">actions</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Analytics: Monthly Trend & Top Sectors */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Tendance mensuelle</h3>
          {(stats?.monthlyData || []).length > 0 ? (() => {
            const data = stats.monthlyData;
            const maxCount = Math.max(...data.map((d) => d.count), 1);
            const FR_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
            return (
              <div className="space-y-3">
                {data.map((item) => {
                  const [y, m] = item.month.split('-');
                  const monthLabel = `${FR_MONTHS[parseInt(m, 10) - 1]} ${y}`;
                  const pct = (item.count / maxCount) * 100;
                  return (
                    <div key={item.month}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600 capitalize">{monthLabel}</span>
                        <span className="font-bold text-primary">{item.count}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-secondary hover:bg-accent transition-colors"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div className="py-8 text-center text-slate-400">
              <i className="fa-solid fa-chart-simple text-3xl mb-2 block"></i>
              <p className="text-sm">Aucune donnée mensuelle</p>
            </div>
          )}
        </motion.div>

        {/* Top Sectors */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Secteurs les plus demandés</h3>
          {(stats?.topSectors || []).length > 0 ? (() => {
            const sectors = stats.topSectors;
            const maxCount = Math.max(...sectors.map((s) => s.count), 1);
            return (
              <div className="space-y-3">
                {sectors.map((item, idx) => {
                  const pct = (item.count / maxCount) * 100;
                  return (
                    <div key={item.sector || idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600">{item.sector || 'Non renseigné'}</span>
                        <span className="font-bold text-primary">{item.count}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                          className="h-full rounded-full bg-accent"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div className="py-8 text-center text-slate-400">
              <i className="fa-solid fa-industry text-3xl mb-2 block"></i>
              <p className="text-sm">Aucun secteur disponible</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-primary">Dernières demandes</h3>
          <Link href="/admin/demandes" className="text-xs font-bold text-secondary hover:underline">
            Voir tout <i className="fa-solid fa-arrow-right text-[10px] ml-1"></i>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Entreprise</th>
                <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase hidden sm:table-cell">Contact</th>
                <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Montant</th>
                <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Statut</th>
                <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentApplications || []).map((app) => {
                const sc = STATUS_COLORS[app.status] || { bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
                return (
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-bold text-primary">{app.companyName || app.equipmentType || '-'}</div>
                      <div className="text-xs text-gray-400 sm:hidden">{app.user?.email}</div>
                    </td>
                    <td className="py-3 px-2 hidden sm:table-cell">
                      <div className="text-gray-600">{app.user?.name || '-'}</div>
                      <div className="text-xs text-gray-400">{app.user?.email}</div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-primary">{app.amount ? `${app.amount.toLocaleString()}€` : '-'}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                        {STATUS_TO_LEGACY[app.status] || app.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-400 hidden md:table-cell">{new Date(app.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                );
              })}
              {(!stats?.recentApplications || stats.recentApplications.length === 0) && (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">
                  <i className="fa-solid fa-inbox text-3xl mb-2 block"></i>
                  Aucune demande
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
