'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STAT_CARDS = [
  { key: 'total', label: 'Total dossiers', icon: 'fa-folder-open', gradient: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-500/20' },
  { key: 'transmitted', label: 'Transmis', icon: 'fa-paper-plane', gradient: 'from-sky-500 to-sky-700', shadow: 'shadow-sky-500/20' },
  { key: 'approved', label: 'Validés', icon: 'fa-circle-check', gradient: 'from-emerald-500 to-green-700', shadow: 'shadow-emerald-500/20' },
  { key: 'completed', label: 'Finalisés', icon: 'fa-flag-checkered', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
];

const STATUS_COLORS = {
  PENDING: { bg: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  REVIEWING: { bg: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  TRANSMITTED: { bg: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  APPROVED: { bg: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  REJECTED: { bg: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
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
          <i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i>
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
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"></div>
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
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-300 rounded-full"
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
            <Link href="/partner/applications" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all group">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-folder-open"></i>
              </div>
              <div>
                <div className="font-bold text-sm">Voir les dossiers</div>
                <div className="text-xs text-gray-400">{stats?.total || 0} dossiers au total</div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-300 ml-auto"></i>
            </Link>
            <Link href="/contact" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all group">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
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
                { label: 'Transmis', count: stats?.transmitted || 0, color: 'bg-sky-500' },
                { label: 'Validés', count: stats?.approved || 0, color: 'bg-green-500' },
                { label: 'Finalisés', count: stats?.completed || 0, color: 'bg-amber-500' },
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

      {/* Recent Applications */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-primary">Derniers dossiers</h3>
          <Link href="/partner/applications" className="text-xs font-bold text-purple-600 hover:underline">
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
