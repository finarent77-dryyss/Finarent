'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OUTCOMES = [
  { id: 'reached',   label: 'Décroché',           icon: 'fa-phone-volume',      active: 'bg-emerald-50 border-emerald-400 text-emerald-700' },
  { id: 'voicemail', label: 'Répondeur',          icon: 'fa-voicemail',         active: 'bg-sky-50 border-sky-400 text-sky-700' },
  { id: 'no_answer', label: 'Pas de réponse',     icon: 'fa-phone-slash',       active: 'bg-gray-100 border-gray-400 text-gray-700' },
  { id: 'callback',  label: 'À rappeler',         icon: 'fa-clock-rotate-left', active: 'bg-amber-50 border-amber-400 text-amber-700' },
  { id: 'qualified', label: 'Qualifié',           icon: 'fa-circle-check',      active: 'bg-violet-50 border-violet-400 text-violet-700' },
  { id: 'converted', label: 'Converti',           icon: 'fa-trophy',            active: 'bg-emerald-50 border-emerald-400 text-emerald-700' },
  { id: 'refused',   label: 'Refus',              icon: 'fa-circle-xmark',      active: 'bg-rose-50 border-rose-400 text-rose-700' },
];

const STATUS_BADGE = {
  NEW: 'bg-sky-100 text-sky-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  QUALIFIED: 'bg-violet-100 text-violet-700',
  CONVERTED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-gray-100 text-gray-500',
  PENDING: 'bg-slate-100 text-slate-700',
  REVIEWING: 'bg-sky-100 text-sky-700',
  DOCUMENTS_NEEDED: 'bg-red-100 text-red-700',
  QUOTE_SENT: 'bg-secondary/10 text-secondary',
  QUOTE_ACCEPTED: 'bg-accent/10 text-accent',
  REJECTED: 'bg-rose-100 text-rose-700',
};

const FILTERS = [
  { id: 'all',       label: "Tout",       icon: 'fa-list' },
  { id: 'prospects', label: 'Prospects',  icon: 'fa-user-tag' },
  { id: 'demandes',  label: 'Demandes',   icon: 'fa-folder-open' },
  { id: 'rappels',   label: 'Rappels',    icon: 'fa-bell' },
];

function fmtPhone(p) {
  if (!p) return '';
  const digits = p.replace(/\D/g, '');
  if (digits.startsWith('33') && digits.length === 11) {
    const r = digits.slice(2);
    return `+33 ${r.slice(0, 1)} ${r.slice(1, 3)} ${r.slice(3, 5)} ${r.slice(5, 7)} ${r.slice(7, 9)}`;
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }
  return p;
}

function fmtRelative(date) {
  if (!date) return '—';
  const d = new Date(date);
  const diff = Math.round((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString('fr-FR');
}

export default function AdminCentreAppelClient() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, prospects: 0, demandes: 0, rappels: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [callsLoggedToday, setCallsLoggedToday] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/centre-appel', window.location.origin);
      url.searchParams.set('filter', filter);
      if (search) url.searchParams.set('q', search);
      const r = await fetch(url);
      const data = await r.json();
      setItems(data.items || []);
      setStats(data.stats || { total: 0, prospects: 0, demandes: 0, rappels: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onLogged = () => {
    setCallsLoggedToday((n) => n + 1);
    setSelected(null);
    load();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary flex items-center gap-3">
            <i className="fa-solid fa-headset text-secondary"></i>
            Centre d'appel
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            File unifiée prospects + demandes · {stats.total} contact{stats.total > 1 ? 's' : ''} à traiter
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
            <span className="font-bold text-emerald-700">{callsLoggedToday}</span>
            <span className="text-emerald-600 ml-1">appel{callsLoggedToday > 1 ? 's' : ''} loggué{callsLoggedToday > 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-primary hover:bg-gray-50 transition"
          >
            <i className="fa-solid fa-arrows-rotate"></i> Actualiser
          </button>
        </div>
      </div>

      {/* Stats / filtres */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-left rounded-2xl border p-4 transition ${filter === f.id ? 'border-secondary shadow-md bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}`}
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 flex items-center gap-1.5">
              <i className={`fa-solid ${f.icon}`}></i>
              {f.label}
            </div>
            <div className="text-2xl font-black tabular-nums mt-1 text-primary">
              {f.id === 'all' ? stats.total : stats[f.id] || 0}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email, société…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Queue */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <i className="fa-solid fa-mug-hot text-4xl mb-3 block text-gray-200"></i>
            File vide. Plus personne à appeler — bonne pause !
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {items.map((it) => (
              <li
                key={`${it.kind}-${it.id}`}
                className="px-4 sm:px-5 py-4 hover:bg-gray-50/50 transition flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${it.kind === 'prospect' ? 'bg-violet-100 text-violet-700' : 'bg-secondary/10 text-secondary'}`}>
                      <i className={`fa-solid ${it.kind === 'prospect' ? 'fa-user-tag' : 'fa-folder-open'}`}></i>
                      {it.kind}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_BADGE[it.status] || 'bg-gray-100 text-gray-500'}`}>
                      {it.status}
                    </span>
                    {/\[RAPPEL/i.test(it.notes || '') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                        <i className="fa-solid fa-bell"></i> rappel programmé
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-primary truncate">
                    {it.name || it.company || <span className="italic text-gray-400">Anonyme</span>}
                    {it.company && it.name && <span className="text-gray-400 font-normal text-sm"> · {it.company}</span>}
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                    {it.email && <span><i className="fa-solid fa-envelope text-gray-300 mr-1"></i>{it.email}</span>}
                    {it.sector && <span><i className="fa-solid fa-industry text-gray-300 mr-1"></i>{it.sector}</span>}
                    {it.productType && <span><i className="fa-solid fa-tag text-gray-300 mr-1"></i>{it.productType}</span>}
                    {it.amount && <span><i className="fa-solid fa-euro-sign text-gray-300 mr-1"></i>{Number(it.amount).toLocaleString('fr-FR')} €</span>}
                    {it.lastEvent && <span><i className="fa-solid fa-wand-magic-sparkles text-violet-300 mr-1"></i>{it.lastEvent.simulatorSlug}</span>}
                    <span className="text-gray-400">· {fmtRelative(it.lastTouchAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${(it.phone || '').replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
                    title="Appeler"
                  >
                    <i className="fa-solid fa-phone"></i>
                    <span className="hidden sm:inline tabular-nums">{fmtPhone(it.phone)}</span>
                  </a>
                  <button
                    onClick={() => setSelected(it)}
                    className="inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 hover:border-secondary hover:text-secondary text-primary font-bold rounded-xl text-sm transition"
                    title="Logger un appel"
                  >
                    <i className="fa-solid fa-note-sticky"></i>
                    <span className="hidden sm:inline">Logger</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <CallLogModal item={selected} onClose={() => setSelected(null)} onLogged={onLogged} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CallLogModal({ item, onClose, onLogged }) {
  const [outcome, setOutcome] = useState('reached');
  const [comment, setComment] = useState('');
  const [callbackAt, setCallbackAt] = useState('');
  const [duration, setDuration] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();
    const interval = setInterval(() => {
      setDuration(Math.round((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/centre-appel/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: item.kind,
          id: item.id,
          outcome,
          comment: comment.trim() || null,
          callbackAt: outcome === 'callback' && callbackAt ? new Date(callbackAt).toISOString() : null,
          durationSec: duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      onLogged(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        <form onSubmit={submit}>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Logger un appel</div>
              <h2 className="font-black text-primary text-lg leading-tight">
                {item.name || item.company || 'Anonyme'}
              </h2>
              <div className="text-xs text-gray-500 tabular-nums">{fmtPhone(item.phone)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Durée</div>
              <div className="font-mono font-bold text-secondary tabular-nums">
                {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-2">Résultat</label>
              <div className="grid grid-cols-2 gap-2">
                {OUTCOMES.map((o) => (
                  <button
                    type="button"
                    key={o.id}
                    onClick={() => setOutcome(o.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition ${
                      outcome === o.id
                        ? o.active
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <i className={`fa-solid ${o.icon}`}></i>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {outcome === 'callback' && (
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-2">
                  Rappeler le
                </label>
                <input
                  type="datetime-local"
                  value={callbackAt}
                  onChange={(e) => setCallbackAt(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-gray-400 block mb-2">
                Compte-rendu
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Objection rencontrée, besoin exprimé, prochaine action…"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary resize-none"
              />
            </div>

            {item.notes && (
              <details className="bg-gray-50 rounded-xl p-3">
                <summary className="text-[10px] font-mono uppercase tracking-widest text-gray-400 cursor-pointer">
                  Historique
                </summary>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap mt-2 font-mono">{item.notes}</pre>
              </details>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm">
                <i className="fa-solid fa-circle-exclamation mr-2"></i>{error}
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-bold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
            >
              <i className={`fa-solid ${saving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
              {saving ? 'Enregistrement…' : "Enregistrer l'appel"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
