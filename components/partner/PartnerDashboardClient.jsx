'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STAT_CARDS = [
  { key: 'total', label: 'Total dossiers', icon: 'fa-folder-open', gradient: 'from-primary to-primary/80', shadow: 'shadow-primary/20' },
  { key: 'transmitted', label: 'Transmis', icon: 'fa-paper-plane', gradient: 'from-secondary to-secondary/80', shadow: 'shadow-secondary/20' },
  { key: 'approved', label: 'Validés', icon: 'fa-circle-check', gradient: 'from-accent to-emerald-700', shadow: 'shadow-accent/20' },
  { key: 'completed', label: 'Finalisés', icon: 'fa-flag-checkered', gradient: 'from-slate-600 to-slate-800', shadow: 'shadow-slate-500/20' },
];

const STATUS_COLORS = {
  PENDING: { bg: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  REVIEWING: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  TRANSMITTED: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  APPROVED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  REJECTED: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  COMPLETED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

export default function PartnerDashboardClient() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/partner/stats').then(r => r.json()),
      fetch('/api/partner/applications').then(r => r.json()),
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
  const approvalRate = stats?.total > 0 ? Math.round(((stats?.approved || 0) / stats.total) * 100) : 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-primary">Espace Partenaire</h1>
        <p className="text-gray-400 text-sm mt-1">Suivez vos dossiers transmis par Finassur</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
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
        {/* Commissions & Performance */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-[#0A2540] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Total commissions</div>
              <div className="text-3xl font-black">{(stats?.totalCommissions || 0).toLocaleString('fr-FR')}€</div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Montant total traité</div>
              <div className="text-xl font-black">{(stats?.totalAmount || 0).toLocaleString('fr-FR')}€</div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Taux de validation</div>
              <div className="flex items-center gap-3">
                <div className="text-xl font-black">{approvalRate}%</div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${approvalRate}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-secondary to-secondary/70 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Link href="/partner/applications" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-secondary/5 hover:text-secondary transition-all group">
              <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <div>
                <div className="font-bold text-sm">Voir les dossiers</div>
                <div className="text-xs text-gray-400">{stats?.total || 0} dossiers au total</div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-300 ml-auto"></i>
            </Link>
            <Link href="/contact" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-secondary/5 hover:text-secondary transition-all group">
              <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div>
                <div className="font-bold text-sm">Contacter Finassur</div>
                <div className="text-xs text-gray-400">Support dédié partenaire</div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-300 ml-auto"></i>
            </Link>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Répartition des statuts</h3>
          {stats?.total > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'Transmis', count: stats?.transmitted || 0, color: 'bg-secondary' },
                { label: 'Validés', count: stats?.approved || 0, color: 'bg-green-500' },
                { label: 'Finalisés', count: stats?.completed || 0, color: 'bg-slate-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600">{item.label}</span>
                    <span className="font-bold text-primary">{item.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
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

      {/* Commission Tracking Card */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-primary">Suivi des commissions</h3>
          <a href="#" className="text-xs font-bold text-secondary hover:underline">
            Voir les détails <i className="fa-solid fa-arrow-right text-[10px] ml-1"></i>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-accent/5 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-accent">
              {(stats?.commissionStats?.totalPaid || 0).toLocaleString('fr-FR')}€
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Commissions perçues</div>
          </div>
          <div className="bg-secondary/5 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-secondary">
              {(stats?.commissionStats?.totalPending || 0).toLocaleString('fr-FR')}€
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">En attente</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-700">
              {(stats?.commissionStats?.avgRate || 0).toFixed(1)}%
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Taux moyen</div>
          </div>
        </div>
      </motion.div>

      {/* Monthly Performance Chart */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 className="text-base font-bold text-primary mb-5">Performance mensuelle</h3>
        {stats?.monthlyData?.length > 0 ? (() => {
          const maxCount = Math.max(...stats.monthlyData.map(m => m.count), 1);
          const FR_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
          return (
            <div className="flex items-end gap-3 h-48">
              {stats.monthlyData.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <span className="text-xs font-bold text-primary">{m.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((m.count / maxCount) * 100, 4)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                    className="w-full rounded-t-lg bg-secondary hover:bg-accent transition-colors cursor-default min-h-[4px]"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{FR_MONTHS[m.month]}</span>
                </div>
              ))}
            </div>
          );
        })() : (
          <div className="py-8 text-center text-slate-400">
            <i className="fa-solid fa-chart-bar text-3xl mb-2 block"></i>
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        )}
      </motion.div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Taux de conversion */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="relative w-20 h-20 mb-3">
            <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
            <div
              className="absolute inset-0 rounded-full border-[6px] border-secondary"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${(stats?.conversionRate || 0) > 25 ? '100% 0%' : `${50 + 50 * Math.tan(((stats?.conversionRate || 0) / 100) * 2 * Math.PI)}% 0%`}${(stats?.conversionRate || 0) > 25 ? ', 100% 100%' : ''}${(stats?.conversionRate || 0) > 50 ? ', 100% 100%' : ''}${(stats?.conversionRate || 0) > 75 ? ', 0% 100%' : ''}${(stats?.conversionRate || 0) > 75 ? ', 0% 0%' : ''})`,
              }}
            ></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <span className="text-lg font-black text-secondary">{stats?.conversionRate || 0}%</span>
            </div>
          </div>
          <div className="text-sm font-bold text-primary">Taux de conversion</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dossiers validés / total</div>
        </motion.div>

        {/* Délai moyen */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-3">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{stats?.avgProcessingTime || 0}</div>
              <div className="text-[9px] font-bold text-slate-400 -mt-0.5">jours</div>
            </div>
          </div>
          <div className="text-sm font-bold text-primary">Délai moyen</div>
          <div className="text-[10px] text-slate-400 mt-0.5">De transmis à validé</div>
        </motion.div>

        {/* Commission moyenne */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-3">
            <div className="text-center">
              <div className="text-2xl font-black text-accent">
                {stats?.total > 0 && stats?.totalCommissions > 0
                  ? Math.round(stats.totalCommissions / stats.total).toLocaleString('fr-FR')
                  : 0}€
              </div>
            </div>
          </div>
          <div className="text-sm font-bold text-primary">Commission moyenne</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Par dossier</div>
        </motion.div>
      </div>

      {/* Recent Applications */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-primary">Derniers dossiers</h3>
          <Link href="/partner/applications" className="text-xs font-bold text-secondary hover:underline">
            Voir tout <i className="fa-solid fa-arrow-right text-[10px] ml-1"></i>
          </Link>
        </div>

        {recentApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Entreprise</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase hidden sm:table-cell">Type</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Montant</th>
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
                        <div className="text-xs text-gray-400 sm:hidden">{app.productType}</div>
                      </td>
                      <td className="py-3 px-2 text-gray-500 hidden sm:table-cell">{app.productType}</td>
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
            <i className="fa-solid fa-inbox text-4xl mb-3 block"></i>
            <p className="text-sm">Aucun dossier pour le moment</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
