'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STAT_CARDS = [
  { key: 'totalApplications', label: 'Total dossiers', icon: 'fa-folder-open', gradient: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-500/20' },
  { key: 'pendingApplications', label: 'En attente', icon: 'fa-hourglass-half', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
  { key: 'activeApplications', label: 'En cours', icon: 'fa-spinner', gradient: 'from-violet-500 to-purple-700', shadow: 'shadow-violet-500/20' },
  { key: 'completedApplications', label: 'Finalisés', icon: 'fa-circle-check', gradient: 'from-emerald-500 to-green-700', shadow: 'shadow-emerald-500/20' },
  { key: 'totalUsers', label: 'Utilisateurs', icon: 'fa-users', gradient: 'from-cyan-500 to-cyan-700', shadow: 'shadow-cyan-500/20' },
  { key: 'totalPartners', label: 'Partenaires', icon: 'fa-handshake', gradient: 'from-pink-500 to-rose-700', shadow: 'shadow-pink-500/20' },
];

const STATUS_COLORS = {
  PENDING: { bg: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  REVIEWING: { bg: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  DOCUMENTS_NEEDED: { bg: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  QUOTE_SENT: { bg: 'bg-cyan-100 text-cyan-800', dot: 'bg-cyan-500' },
  QUOTE_ACCEPTED: { bg: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  PENDING_SIGNATURE: { bg: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  SIGNED: { bg: 'bg-teal-100 text-teal-800', dot: 'bg-teal-500' },
  TRANSMITTED: { bg: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500' },
  APPROVED: { bg: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  REJECTED: { bg: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  COMPLETED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

export default function AdminDashboardClient() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
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
          <Link href="/admin/demandes" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-200 hover:bg-amber-100 transition-all">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            {pendingCount} dossier{pendingCount > 1 ? 's' : ''} en attente
          </Link>
        )}
      </motion.div>

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
                { label: 'En attente', count: stats?.pendingApplications || 0, color: 'bg-amber-500' },
                { label: 'En cours', count: stats?.activeApplications || 0, color: 'bg-violet-500' },
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
