'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const STATUS_COLORS = {
  en_attente: { bg: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  en_cours: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  documents_manquants: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  devis_envoye: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  devis_accepte: { bg: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  signature_en_attente: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  signe: { bg: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  transmis: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  validee: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  refusee: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  finalise: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
};

const ALL_STATUSES = ['en_attente', 'en_cours', 'documents_manquants', 'devis_envoye', 'devis_accepte', 'signature_en_attente', 'signe', 'transmis', 'validee', 'refusee', 'finalise'];

const STATUS_GROUPS = {
  all: ALL_STATUSES,
  pending: ['en_attente', 'documents_manquants'],
  active: ['en_cours', 'devis_envoye', 'devis_accepte', 'signature_en_attente', 'signe'],
  transmitted: ['transmis'],
  done: ['validee', 'refusee', 'finalise'],
};

const SCORE_BADGES = {
  excellent: { cls: 'bg-emerald-100 text-emerald-800', icon: 'fa-trophy' },
  bon:       { cls: 'bg-accent/10 text-accent',        icon: 'fa-circle-check' },
  moyen:     { cls: 'bg-secondary/10 text-secondary',  icon: 'fa-circle-half-stroke' },
  faible:    { cls: 'bg-slate-100 text-slate-700',     icon: 'fa-triangle-exclamation' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export default function DemandesClient() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const { t, locale } = useTranslation();

  useEffect(() => { fetchDemandes(); }, []);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/demandes');
      if (!res.ok) throw new Error(t('admin.loadingError'));
      setDemandes(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/demandes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(t('admin.updateError'));
      const updated = await res.json();
      setDemandes(prev => prev.map(d => d.id === id ? updated : d));
    } catch (err) { alert(err.message); }
  };

  const updateNotes = async (id) => {
    try {
      const res = await fetch(`/api/admin/demandes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: editNotes }),
      });
      if (!res.ok) throw new Error(t('admin.updateError'));
      const updated = await res.json();
      setDemandes(prev => prev.map(d => d.id === id ? updated : d));
      setEditingId(null);
      setEditNotes('');
    } catch (err) { alert(err.message); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const filtered = demandes.filter(d => {
    const matchesStatus = statusFilter === 'all' || STATUS_GROUPS[statusFilter]?.includes(d.status);
    if (!matchesStatus) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (d.companyName || '').toLowerCase().includes(s) ||
           (d.firstName || '').toLowerCase().includes(s) ||
           (d.lastName || '').toLowerCase().includes(s) ||
           (d.email || '').toLowerCase().includes(s) ||
           (d.reference || '').toLowerCase().includes(s) ||
           (d.siren || '').includes(s);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-gray-400">Chargement des demandes...</span>
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

  const statusCounts = {
    all: demandes.length,
    pending: demandes.filter(d => STATUS_GROUPS.pending.includes(d.status)).length,
    active: demandes.filter(d => STATUS_GROUPS.active.includes(d.status)).length,
    transmitted: demandes.filter(d => STATUS_GROUPS.transmitted.includes(d.status)).length,
    done: demandes.filter(d => STATUS_GROUPS.done.includes(d.status)).length,
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">{t('admin.financingRequests')}</h1>
          <p className="text-gray-400 text-sm mt-1">{demandes.length} demande{demandes.length > 1 ? 's' : ''} au total</p>
        </div>

        {/* View toggle: Liste / Kanban */}
        <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1 self-start sm:self-auto">
          <span className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-primary shadow-sm">
            <i className="fa-solid fa-list text-[10px] mr-1.5"></i>
            Liste
          </span>
          <Link
            href="/admin/demandes/kanban"
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary transition-all"
          >
            <i className="fa-solid fa-table-columns text-[10px] mr-1.5"></i>
            Kanban
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
            <input
              type="text"
              placeholder="Rechercher par nom, email, SIREN, référence..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
          {Object.entries({ all: 'Tous', pending: 'En attente', active: 'En cours', transmitted: 'Transmis', done: 'Terminés' }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              {label} ({statusCounts[key]})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
            <i className="fa-solid fa-inbox text-4xl text-gray-200 mb-3 block"></i>
            <p className="text-sm text-gray-400">{search ? 'Aucun résultat pour cette recherche' : t('admin.noRequests')}</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {filtered.map((d) => {
            const sc = STATUS_COLORS[d.status] || { bg: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
            const isExpanded = expandedId === d.id;

            return (
              <motion.div
                key={d.id}
                layout
                variants={itemVariants}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header row */}
                <div
                  className="p-4 sm:p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : d.id)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded">{d.reference}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {t(`status.${d.status}`) || d.status}
                        </span>
                        {d.scoreLabel && SCORE_BADGES[d.scoreLabel] && (
                          <span
                            title={`Score de pré-qualification : ${d.scorePreQual ?? 0}/100`}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${SCORE_BADGES[d.scoreLabel].cls}`}
                          >
                            <i className={`fa-solid ${SCORE_BADGES[d.scoreLabel].icon} text-[10px]`}></i>
                            {d.scoreLabel} · {d.scorePreQual ?? 0}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-gray-300 uppercase">{t(`requestType.${d.requestType}`) || d.requestType}</span>
                        {d.quoteDetails?.source?.kind === 'simulator' && (
                          <span
                            title={`Source : simulateur ${d.quoteDetails.source.label || d.quoteDetails.source.slug}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-violet-100 text-violet-700"
                          >
                            <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                            Simulateur · {d.quoteDetails.source.label || d.quoteDetails.source.slug}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-primary text-lg">{d.companyName}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                        <span><i className="fa-solid fa-user text-[10px] text-gray-300 mr-1.5"></i>{d.firstName} {d.lastName}</span>
                        <span><i className="fa-solid fa-envelope text-[10px] text-gray-300 mr-1.5"></i>{d.email}</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="text-lg font-black text-primary">{d.amount || '-'}</div>
                      <div className="text-xs text-gray-400">{formatDate(d.createdAt)}</div>
                      {d.user ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg">
                          <i className="fa-solid fa-circle-check"></i> Authentifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg">
                          <i className="fa-solid fa-ghost"></i> Prospect
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-3">
                    <i className={`fa-solid fa-chevron-down text-xs text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
                        {/* Info grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'SIREN', value: d.siren },
                            { label: t('contact.sector'), value: d.sector },
                            { label: t('contact.amount'), value: d.amount },
                            { label: t('contact.equipmentType'), value: d.equipmentType || '-' },
                          ].map((item, i) => (
                            <div key={i} className="bg-gray-50 rounded-xl p-3">
                              <div className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{item.label}</div>
                              <div className="text-sm font-bold text-primary">{item.value}</div>
                            </div>
                          ))}
                        </div>

                        {d.phone && (
                          <div className="text-sm text-gray-500">
                            <i className="fa-solid fa-phone text-gray-300 mr-2"></i>{d.phone}
                          </div>
                        )}

                        {d.quoteDetails?.source?.kind === 'simulator' && (
                          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="fa-solid fa-wand-magic-sparkles text-violet-600"></i>
                              <div className="text-xs font-bold uppercase tracking-wider text-violet-700">
                                Issue du simulateur « {d.quoteDetails.source.label || d.quoteDetails.source.slug} »
                              </div>
                            </div>
                            {d.quoteDetails.source.category && d.quoteDetails.source.slug && (
                              <Link
                                href={`/simulateurs/${d.quoteDetails.source.category}/${d.quoteDetails.source.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 underline-offset-2 hover:underline mb-3"
                              >
                                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                Ouvrir le simulateur dans un onglet
                              </Link>
                            )}
                            {d.quoteDetails.source.params && Object.keys(d.quoteDetails.source.params).length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {Object.entries(d.quoteDetails.source.params).map(([k, v]) => (
                                  <div key={k} className="bg-white rounded-lg p-2 border border-violet-100">
                                    <div className="text-[10px] font-bold text-violet-400 uppercase">{k}</div>
                                    <div className="text-xs font-semibold text-primary truncate" title={String(v)}>{String(v)}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {d.quoteDetails.source.capturedAt && (
                              <div className="text-[10px] text-violet-400 mt-3">
                                Capturée le {formatDate(d.quoteDetails.source.capturedAt)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Documents */}
                        {d.documents?.length > 0 && (
                          <div>
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Pièces jointes ({d.documents.length})</div>
                            <div className="flex flex-wrap gap-2">
                              {d.documents.map(doc => (
                                <a
                                  key={doc.id}
                                  href={doc.path}
                                  target="_blank"
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs hover:bg-secondary/10 hover:text-secondary transition-all group"
                                >
                                  <i className="fa-solid fa-file-pdf text-red-400 group-hover:text-secondary"></i>
                                  <span className="font-medium truncate max-w-[140px]">{doc.originalName}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Message */}
                        {d.message && (
                          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4">
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Message du prospect</div>
                            <p className="text-sm text-gray-600 italic">&ldquo;{d.message}&rdquo;</p>
                          </div>
                        )}

                        {/* Status change */}
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase mb-2">{t('admin.changeStatus')}</div>
                          <select
                            value={d.status}
                            onChange={(e) => updateStatus(d.id, e.target.value)}
                            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all w-full sm:w-auto"
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>{t(`status.${s}`)}</option>
                            ))}
                          </select>
                        </div>

                        {/* Admin notes */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-xs font-bold text-gray-400 uppercase mb-2">{t('admin.notes')}</div>
                          {editingId === d.id ? (
                            <div>
                              <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                placeholder={t('admin.internalNotes')}
                                rows="3"
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 mb-2 resize-none"
                              />
                              <div className="flex gap-2">
                                <button onClick={() => updateNotes(d.id)} className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-lg hover:bg-secondary/90 transition-all">
                                  {t('admin.save')}
                                </button>
                                <button onClick={() => { setEditingId(null); setEditNotes(''); }} className="px-4 py-2 bg-white text-gray-500 text-xs font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                                  {t('admin.cancel')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm text-gray-600">{d.adminNotes || <span className="italic text-gray-400">{t('admin.none')}</span>}</p>
                              <button
                                onClick={() => { setEditingId(d.id); setEditNotes(d.adminNotes || ''); }}
                                className="text-xs font-bold text-secondary hover:underline flex-shrink-0"
                              >
                                <i className="fa-solid fa-pen text-[10px] mr-1"></i>{t('admin.edit')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
