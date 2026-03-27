'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STAT_CARDS = [
  { key: 'total', label: 'Total demandes', icon: 'fa-shield-halved', gradient: 'from-primary to-primary/80', shadow: 'shadow-primary/20' },
  { key: 'pending', label: 'En attente', icon: 'fa-hourglass-half', gradient: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/20' },
  { key: 'approved', label: 'Validées', icon: 'fa-circle-check', gradient: 'from-accent to-emerald-700', shadow: 'shadow-accent/20' },
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
      fetch('/api/insurer/stats').then(r => r.json()),
      fetch('/api/insurer/applications').then(r => r.json()),
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
  const pendingCount = applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING').length;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Espace Assureur</h1>
          <p className="text-gray-400 text-sm mt-1">Gérez les demandes d'assurance RC Professionnelle</p>
        </div>
        {pendingCount > 0 && (
          <Link href="/insurer/applications" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl text-sm font-bold border border-secondary/20 hover:bg-secondary/20 transition-all">
            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
            {pendingCount} dossier{pendingCount > 1 ? 's' : ''} en attente
          </Link>
        )}
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
        {/* Primes & Performance */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-[#0A2540] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 space-y-6">
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Primes validées (total)</div>
              <div className="text-3xl font-black">{(stats?.totalAmount || 0).toLocaleString('fr-FR')}€</div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Taux d'approbation</div>
              <div className="flex items-center gap-3">
                <div className="text-xl font-black">{approvalRate}%</div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${approvalRate}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-accent to-accent/70 rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="h-px bg-white/10"></div>
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">Demandes approuvées</div>
              <div className="text-xl font-black">{stats?.approved || 0}</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Link href="/insurer/applications" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-accent/5 hover:text-accent transition-all group">
              <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div className="font-bold text-sm">Dossiers assurance</div>
                <div className="text-xs text-gray-400">{stats?.total || 0} demandes RC Pro</div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-300 ml-auto"></i>
            </Link>
            <Link href="/contact" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-accent/5 hover:text-accent transition-all group">
              <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                <i className="fa-solid fa-headset"></i>
              </div>
              <div>
                <div className="font-bold text-sm">Contacter Finassur</div>
                <div className="text-xs text-gray-400">Support dédié assureur</div>
              </div>
              <i className="fa-solid fa-chevron-right text-gray-300 ml-auto"></i>
            </Link>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-primary mb-4">Répartition</h3>
          {stats?.total > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'En attente', count: stats?.pending || 0, color: 'bg-slate-500' },
                { label: 'Approuvées', count: stats?.approved || 0, color: 'bg-green-500' },
                { label: 'Refusées', count: stats?.rejected || 0, color: 'bg-red-500' },
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
