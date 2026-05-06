'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STAT_CARDS = [
  { key: 'total', label: 'Total demandes', icon: 'fa-shield-halved', gradient: 'from-primary to-primary/80', shadow: 'shadow-primary/20' },
  { key: 'pending', label: 'En attente', icon: 'fa-hourglass-half', gradient: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/20' },
  { key: 'approved', label: 'Souscrites', icon: 'fa-circle-check', gradient: 'from-accent to-emerald-700', shadow: 'shadow-accent/20' },
  { key: 'rejected', label: 'Refusées', icon: 'fa-circle-xmark', gradient: 'from-red-500 to-red-700', shadow: 'shadow-red-500/20' },
];

const STATUS_COLORS = {
  PENDING: { bg: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  REVIEWING: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  QUOTE_SENT: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  APPROVED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  REJECTED: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  COMPLETED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

export default function InsurerDashboardClient() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/insurer/stats').then((r) => r.json()),
      fetch('/api/insurer/applications').then((r) => r.json()),
    ])
      .then(([s, a]) => { setStats(s); setApplications(Array.isArray(a) ? a : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  const recentApps = applications.slice(0, 5);
  const pendingCount = applications.filter((a) => a.status === 'PENDING' || a.status === 'REVIEWING').length;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Espace Assureur</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez les demandes d'assurance RC Professionnelle</p>
        </div>
        {pendingCount > 0 && (
          <Link href="/insurer/applications" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-bold border border-secondary/20 hover:bg-secondary/20 transition-all">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
            {pendingCount} dossier{pendingCount > 1 ? 's' : ''} à traiter
          </Link>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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

      {/* Métriques clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Primes validées</div>
          <div className="text-xl font-black text-secondary">{(stats?.totalAmount || 0).toLocaleString('fr-FR')}€</div>
          <div className="text-xs text-slate-400 mt-1">Volume cumulé</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Prime moyenne</div>
          <div className="text-xl font-black text-accent">
            {(stats?.avgPremium || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-400 mt-1">Sur dossiers souscrits</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Taux de conversion</div>
          <div className="text-xl font-black text-primary">{stats?.conversionRate ?? 0}%</div>
          <div className="text-xs text-slate-400 mt-1">Souscrites / Total</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Délai traitement</div>
          <div className="text-xl font-black text-primary">{stats?.avgProcessingHours > 0 ? `${stats.avgProcessingHours}h` : '—'}</div>
          <div className="text-xs text-slate-400 mt-1">Moy. dépôt → souscription</div>
        </motion.div>
      </div>

      {/* Funnel + Sectors */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-1">Funnel RC Pro</h3>
          <p className="text-xs text-slate-400 mb-5">Conversion des demandes assurance</p>
          {(stats?.funnel || []).length > 0 && stats.funnel[0].count > 0 ? (
            <div className="space-y-3">
              {stats.funnel.map((step, idx) => {
                const top = stats.funnel[0].count;
                const prev = idx === 0 ? null : stats.funnel[idx - 1];
                const widthPct = top > 0 ? (step.count / top) * 100 : 0;
                const conv = prev && prev.count > 0 ? Math.round((step.count / prev.count) * 100) : null;
                const colors = ['bg-secondary', 'bg-secondary/80', 'bg-accent/80', 'bg-emerald-600'];
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">{step.label}</span>
                        {conv !== null && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conv >= 70 ? 'bg-emerald-100 text-emerald-700' : conv >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {conv}%
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-primary tabular-nums">{step.count}</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.08 }}
                        className={`h-full ${colors[idx]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400">
              <i className="fa-solid fa-filter text-3xl mb-2 block"></i>
              <p className="text-sm">Aucun dossier dans le funnel</p>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-1">Top secteurs</h3>
          <p className="text-xs text-slate-400 mb-5">Segmentation risque par activité</p>
          {(stats?.topSectors || []).length > 0 ? (() => {
            const max = Math.max(...stats.topSectors.map((s) => s.count), 1);
            return (
              <div className="space-y-3">
                {stats.topSectors.map((s, idx) => {
                  const pct = (s.count / max) * 100;
                  return (
                    <div key={s.sector || idx}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-slate-600">{s.sector || 'Non renseigné'}</span>
                        <span className="font-bold text-primary tabular-nums">{s.count}</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.07 }}
                          className="h-full rounded-full bg-accent"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div className="py-10 text-center text-slate-400">
              <i className="fa-solid fa-industry text-3xl mb-2 block"></i>
              <p className="text-sm">Aucun secteur disponible</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Tendance mensuelle */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <h3 className="text-base font-bold text-primary mb-1">Volume des demandes (6 derniers mois)</h3>
        <p className="text-xs text-slate-400 mb-5">Nombre de demandes RC Pro par mois</p>
        {(stats?.monthlyData || []).length > 0 ? (() => {
          const data = stats.monthlyData;
          const max = Math.max(...data.map((d) => d.count), 1);
          return (
            <div className="flex items-end gap-3 h-40">
              {data.map((m, idx) => {
                const pct = (m.count / max) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-bold text-primary tabular-nums">{m.count}</div>
                    <div className="w-full bg-slate-50 rounded-t-md flex items-end h-32 overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.06 }}
                        className="w-full bg-gradient-to-t from-secondary to-accent rounded-t-md"
                      />
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 capitalize">{m.label}</div>
                  </div>
                );
              })}
            </div>
          );
        })() : (
          <div className="py-10 text-center text-slate-400">
            <i className="fa-solid fa-chart-column text-3xl mb-2 block"></i>
            <p className="text-sm">Aucune donnée mensuelle</p>
          </div>
        )}
      </motion.div>

      {/* Recent Applications */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-primary">Dernières demandes</h3>
          <Link href="/insurer/applications" className="text-xs font-bold text-accent hover:underline">
            Voir tout <i className="fa-solid fa-arrow-right text-[10px] ml-1"></i>
          </Link>
        </div>
        {recentApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Entreprise</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase hidden sm:table-cell">SIREN</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Prime</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Statut</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => {
                  const sc = STATUS_COLORS[app.status] || { bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
                  return (
                    <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-bold text-primary">{app.companyName || app.equipmentType || '-'}</div>
                        <div className="text-xs text-gray-400">{app.user?.name || app.user?.email}</div>
                      </td>
                      <td className="py-3 px-2 text-gray-500 hidden sm:table-cell font-mono text-xs">{app.siren || '-'}</td>
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
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <i className="fa-solid fa-shield-halved text-4xl mb-3 block"></i>
            <p className="text-sm">Aucune demande d'assurance pour le moment</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
