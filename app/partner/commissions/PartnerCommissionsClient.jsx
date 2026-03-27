'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

const STATUS_BADGES = {
  PENDING: 'bg-slate-100 text-slate-700',
  PAID: 'bg-emerald-100 text-emerald-800',
};

const FILTERS = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'PAID', label: 'Payées' },
];

export default function PartnerCommissionsClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch('/api/partner/commissions')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-slate-400">Chargement...</span>
        </div>
      </div>
    );
  }

  const commissions = data?.commissions || [];
  const filtered = filter === 'ALL' ? commissions : commissions.filter(c => c.status === filter);
  const totalPaid = data?.totalPaid || 0;
  const totalPending = data?.totalPending || 0;
  const avgRate = commissions.length > 0
    ? (commissions.reduce((s, c) => s + c.rate, 0) / commissions.length)
    : 0;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-primary">Commissions</h1>
        <p className="text-slate-400 text-sm mt-1">Suivi de vos commissions sur les dossiers traités</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-accent">{totalPaid.toLocaleString('fr-FR')}€</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Total perçu</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-secondary">{totalPending.toLocaleString('fr-FR')}€</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">En attente</div>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-700">{avgRate.toFixed(1)}%</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Taux moyen</div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f.key
                ? 'bg-secondary text-white shadow-lg'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Commissions Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase">Dossier</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase hidden sm:table-cell">Montant dossier</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase">Taux</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase">Commission</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase">Statut</th>
                  <th className="text-left py-3 px-2 text-xs font-bold text-slate-400 uppercase hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="font-bold text-primary">
                        {c.application?.companyName || c.application?.equipmentType || '-'}
                      </div>
                      <div className="text-[10px] text-slate-400">{c.applicationId.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-primary hidden sm:table-cell">
                      {c.application?.amount ? `${c.application.amount.toLocaleString('fr-FR')}€` : '-'}
                    </td>
                    <td className="py-3 px-2 text-slate-600">{c.rate}%</td>
                    <td className="py-3 px-2 font-bold text-primary">{c.amount.toLocaleString('fr-FR')}€</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGES[c.status] || 'bg-slate-100 text-slate-600'}`}>
                        {c.status === 'PAID' ? 'Payée' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400 hidden md:table-cell">
                      {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <i className="fa-solid fa-coins text-4xl mb-3 block"></i>
            <p className="text-sm">Aucune commission pour le moment</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
