'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS = {
  PENDING: 'En attente',
  REVIEWING: 'En cours d\'analyse',
  DOCUMENTS_NEEDED: 'Documents manquants',
  QUOTE_SENT: 'Devis envoyé',
  QUOTE_ACCEPTED: 'Devis accepté',
  PENDING_SIGNATURE: 'Signature en attente',
  SIGNED: 'Signé',
  TRANSMITTED: 'Transmis',
  APPROVED: 'Validé',
  REJECTED: 'Refusé',
  COMPLETED: 'Finalisé',
};

const STATUS_COLORS = {
  PENDING: 'text-slate-600',
  REVIEWING: 'text-secondary',
  DOCUMENTS_NEEDED: 'text-red-600',
  QUOTE_SENT: 'text-secondary',
  QUOTE_ACCEPTED: 'text-emerald-600',
  PENDING_SIGNATURE: 'text-secondary',
  SIGNED: 'text-emerald-600',
  TRANSMITTED: 'text-secondary',
  APPROVED: 'text-emerald-600',
  REJECTED: 'text-red-600',
  COMPLETED: 'text-emerald-600',
};

const PERIODS = [
  { key: 'today', label: 'Aujourd\'hui' },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: 'all', label: 'Tout' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function AdminLogsClient() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [period]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/logs?${params}`);
      if (!res.ok) throw new Error('Erreur lors du chargement des logs');
      setLogs(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-slate-400">Chargement des logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3">
        <i className="fa-solid fa-circle-exclamation text-xl"></i>
        <span className="font-medium">{error}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">
            <i className="fa-solid fa-clock-rotate-left mr-3 text-secondary"></i>
            Logs d&apos;activit&eacute;
          </h1>
          <p className="text-slate-400 text-sm mt-1">{logs.length} entr&eacute;e{logs.length > 1 ? 's' : ''}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Period tabs */}
          <div className="flex items-center gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  period === p.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
            <input
              type="text"
              placeholder="Rechercher par entreprise, commentaire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={fetchLogs}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </form>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">R&eacute;f&eacute;rence</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modifi&eacute; par</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Changement</th>
                <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <i className="fa-solid fa-inbox text-4xl text-slate-200 mb-3 block"></i>
                      <p className="text-sm text-slate-400">Aucun log pour cette p&eacute;riode</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      variants={itemVariants}
                      layout
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-secondary">
                            {log.applicationId?.slice(-8).toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[160px]">
                            {log.application?.companyName || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-primary text-xs">
                            {log.changedBy?.name || 'Inconnu'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {log.changedBy?.email || ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${STATUS_COLORS[log.fromStatus] || 'text-slate-500'}`}>
                            {STATUS_LABELS[log.fromStatus] || log.fromStatus}
                          </span>
                          <i className="fa-solid fa-arrow-right text-[10px] text-slate-300"></i>
                          <span className={`text-xs font-bold ${STATUS_COLORS[log.toStatus] || 'text-slate-500'}`}>
                            {STATUS_LABELS[log.toStatus] || log.toStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[200px] truncate">
                        {log.comment || <span className="italic text-slate-300">—</span>}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
