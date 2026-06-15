'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PERIODS = [
  { key: 'today', label: 'Aujourd\'hui' },
  { key: '7d', label: '7 jours' },
  { key: '30d', label: '30 jours' },
  { key: 'all', label: 'Tout' },
];

// tone (lib/admin-activity-log) → classes Tailwind
const TONE_CLASSES = {
  red: 'bg-red-100 text-red-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  purple: 'bg-purple-100 text-purple-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  pink: 'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  slate: 'bg-slate-100 text-slate-700',
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { y: 8, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminLogsClient() {
  const [data, setData] = useState({ rows: [], total: 0, modules: [], page: 1, pageSize: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period, page: String(page) });
      if (moduleFilter) params.set('module', moduleFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/logs?${params}`);
      if (!res.ok) throw new Error('Erreur lors du chargement du journal');
      setData(await res.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period, moduleFilter, search, page]);

  useEffect(() => { fetchLogs(); }, [period, moduleFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / (data.pageSize || 50)));

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">
            <i className="fa-solid fa-clock-rotate-left mr-3 text-secondary"></i>
            Journal d&apos;activit&eacute;
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {data.total} &eacute;v&eacute;nement{data.total > 1 ? 's' : ''} · actions admin, RGPD &amp; demandes
          </p>
        </div>
      </motion.div>

      {/* Filtres modules */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setModuleFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${moduleFilter === '' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tous
        </button>
        {(data.modules || []).map((m) => (
          <button
            key={m.code}
            onClick={() => { setModuleFilter(m.code); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${moduleFilter === m.code ? 'bg-primary text-white' : `${TONE_CLASSES[m.tone] || TONE_CLASSES.slate} hover:opacity-80`}`}
          >
            {m.label} <span className="opacity-60">({m.count})</span>
          </button>
        ))}
      </motion.div>

      {/* Période + recherche */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPeriod(p.key); setPage(1); }}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${period === p.key ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchLogs(); }} className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-sm"></i>
            <input
              type="text"
              placeholder="Rechercher par résumé, acteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => { setPage(1); fetchLogs(); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </form>
        </div>
      </motion.div>

      {/* Table */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-xl"></i>
          <span className="font-medium">{error}</span>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Module</th>
                  <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Détail</th>
                  <th className="text-left px-5 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acteur</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {data.rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <i className="fa-solid fa-inbox text-4xl text-slate-200 mb-3 block"></i>
                        <p className="text-sm text-slate-400">Aucun événement pour ces filtres</p>
                      </td>
                    </tr>
                  ) : (
                    data.rows.map((r) => {
                      const isOpen = expanded === r.id;
                      const hasDetails = r.details && Object.keys(r.details).length > 0;
                      return (
                        <motion.tr
                          key={r.id}
                          variants={itemVariants}
                          layout
                          onClick={() => hasDetails && setExpanded(isOpen ? null : r.id)}
                          className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${hasDetails ? 'cursor-pointer' : ''}`}
                        >
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap align-top">{formatDate(r.createdAt)}</td>
                          <td className="px-5 py-3.5 align-top">
                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${TONE_CLASSES[r.moduleTone] || TONE_CLASSES.slate}`}>
                              {r.moduleLabel}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 align-top">
                            <span className="font-bold text-primary text-xs">{r.actionLabel}</span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 text-xs align-top max-w-[360px]">
                            <div className={isOpen ? '' : 'truncate'}>{r.summary}</div>
                            {r.ipAddress && <div className="text-[10px] text-slate-300 mt-0.5">IP {r.ipAddress}</div>}
                            {isOpen && hasDetails && (
                              <pre className="mt-2 bg-slate-50 rounded-lg p-2 text-[10px] text-slate-500 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(r.details, null, 2)}
                              </pre>
                            )}
                          </td>
                          <td className="px-5 py-3.5 align-top">
                            <div className="flex flex-col">
                              <span className="font-medium text-primary text-xs">{r.actorName || r.actorEmail || 'Système'}</span>
                              {r.actorEmail && r.actorName && <span className="text-[10px] text-slate-400">{r.actorEmail}</span>}
                              {r.actorRole && <span className="text-[10px] text-slate-300 uppercase">{r.actorRole}</span>}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">Page {data.page} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={data.page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
