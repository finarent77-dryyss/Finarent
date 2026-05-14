'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
const STATUS_COLORS = {
  NEW: 'bg-sky-100 text-sky-700',
  CONTACTED: 'bg-amber-100 text-amber-700',
  QUALIFIED: 'bg-violet-100 text-violet-700',
  CONVERTED: 'bg-emerald-100 text-emerald-700',
  LOST: 'bg-gray-100 text-gray-500',
};
const STATUS_LABEL = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  QUALIFIED: 'Qualifié',
  CONVERTED: 'Converti',
  LOST: 'Perdu',
};

function fmtRelative(date) {
  if (!date) return '—';
  const d = new Date(date);
  const diff = Math.round((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) return `il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString('fr-FR');
}

function fmtParam(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'number') {
    if (value > 1000) return new Intl.NumberFormat('fr-FR').format(value);
    return String(value);
  }
  if (typeof value === 'boolean') return value ? 'oui' : 'non';
  return String(value);
}

export default function AdminProspectsClient() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/prospects')
      .then((r) => r.json())
      .then(setProspects)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => prospects.filter((p) => {
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return ((p.email || '') + (p.name || '') + (p.company || '') + (p.phone || '')).toLowerCase().includes(s);
  }), [prospects, filter, search]);

  const stats = useMemo(() => {
    const out = { ALL: prospects.length };
    STATUSES.forEach((s) => { out[s] = prospects.filter((p) => p.status === s).length; });
    return out;
  }, [prospects]);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/prospects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProspects((prev) => prev.map((p) => p.id === id ? { ...p, ...updated } : p));
      if (selected?.id === id) setSelected((s) => ({ ...s, ...updated }));
    }
  };

  const deleteProspect = async (id) => {
    if (!confirm('Supprimer ce prospect et son historique ?')) return;
    const res = await fetch(`/api/admin/prospects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Prospection</h1>
          <p className="text-sm text-gray-400 mt-1">
            Leads issus des simulateurs · {prospects.length} prospects · cookie tracking anonyme
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-primary hover:bg-gray-50 transition"
        >
          <i className="fa-solid fa-arrows-rotate"></i> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: 'ALL', label: 'Total', color: 'indigo' },
          { key: 'NEW', label: 'Nouveau', color: 'sky' },
          { key: 'CONTACTED', label: 'Contacté', color: 'amber' },
          { key: 'QUALIFIED', label: 'Qualifié', color: 'violet' },
          { key: 'CONVERTED', label: 'Converti', color: 'emerald' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`text-left rounded-2xl border p-4 transition ${filter === s.key ? 'border-secondary shadow-md bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}`}
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">{s.label}</div>
            <div className={`text-2xl font-black tabular-nums mt-1 text-${s.color}-600`}>{stats[s.key] || 0}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input
            type="text"
            placeholder="Rechercher par email, nom, société, téléphone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <i className="fa-solid fa-user-tag text-4xl mb-3 block text-gray-200"></i>
            Aucun prospect pour le moment. Dès qu'un visiteur utilise un simulateur, il apparaîtra ici.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400">
                  <th className="py-3 px-4">Prospect</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Dernier simulateur</th>
                  <th className="py-3 px-4">Activité</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Vu</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p) => {
                    const last = p.events?.[0];
                    return (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                          if (e.target.closest('select, button')) return;
                          setSelected(p);
                        }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-primary">{p.name || p.company || <span className="text-gray-300 italic">Anonyme</span>}</div>
                          <div className="text-[10px] text-gray-400 font-mono truncate max-w-[140px]">{p.anonId.slice(0, 12)}…</div>
                        </td>
                        <td className="py-3 px-4">
                          {p.email ? <div className="text-primary">{p.email}</div> : <div className="text-gray-300 text-xs italic">aucun email</div>}
                          {p.phone && <div className="text-xs text-gray-500">{p.phone}</div>}
                        </td>
                        <td className="py-3 px-4">
                          {last ? (
                            <>
                              <div className="font-semibold text-primary">{last.simulatorSlug}</div>
                              <div className="text-[10px] text-gray-400">{last.category || ''}</div>
                            </>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs font-bold text-gray-600">
                            <i className="fa-solid fa-bolt text-amber-500"></i>
                            {p._count?.events || 0} évèn.
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={p.status}
                            onChange={(e) => updateStatus(p.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border-0 cursor-pointer ${STATUS_COLORS[p.status]} focus:outline-none focus:ring-2 focus:ring-secondary/20`}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{fmtRelative(p.lastSeenAt)}</td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer détail */}
      <AnimatePresence>
        {selected && (
          <ProspectDrawer
            prospect={selected}
            onClose={() => setSelected(null)}
            onUpdate={(updated) => { setProspects((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p)); setSelected((s) => ({ ...s, ...updated })); }}
            onDelete={() => deleteProspect(selected.id)}
            onChangeStatus={(status) => updateStatus(selected.id, status)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProspectDrawer({ prospect, onClose, onUpdate, onDelete, onChangeStatus }) {
  const [notes, setNotes] = useState(prospect.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [fullProspect, setFullProspect] = useState(prospect);
  const [tab, setTab] = useState('events');

  useEffect(() => {
    fetch(`/api/admin/prospects/${prospect.id}`)
      .then((r) => r.json())
      .then(setFullProspect)
      .catch(() => {});
  }, [prospect.id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    const res = await fetch(`/api/admin/prospects/${prospect.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
    }
    setSavingNotes(false);
  };

  const events = fullProspect.events || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 flex justify-end"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl bg-white h-full overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">Prospect</div>
            <h2 className="text-xl font-black text-primary">
              {prospect.name || prospect.company || 'Anonyme'}
            </h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identité */}
          <section>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">Identité</div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <Field label="Email" value={prospect.email} icon="fa-envelope" />
              <Field label="Téléphone" value={prospect.phone} icon="fa-phone" />
              <Field label="Société" value={prospect.company} icon="fa-building" />
              <Field label="Source" value={prospect.source} icon="fa-arrow-right-arrow-left" />
              <Field label="IP" value={prospect.ipAddress} icon="fa-globe" mono />
              <Field label="Cookie ID" value={prospect.anonId} icon="fa-cookie-bite" mono small />
            </div>
          </section>

          {/* Statut */}
          <section>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">Statut</div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${prospect.status === s ? `${STATUS_COLORS[s]} border-transparent shadow-sm` : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </section>

          {/* Tabs */}
          <section>
            <div className="flex border-b border-gray-100 mb-4">
              {[
                { id: 'events', label: `Évènements (${events.length})` },
                { id: 'notes', label: 'Notes' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2 text-xs font-bold transition border-b-2 ${tab === t.id ? 'border-secondary text-secondary' : 'border-transparent text-gray-500'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'events' && (
              <ol className="space-y-3">
                {events.length === 0 && <li className="text-sm text-gray-400">Aucun évènement.</li>}
                {events.map((e) => (
                  <li key={e.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <div>
                        <div className="font-bold text-primary">{e.simulatorSlug}</div>
                        <div className="text-[10px] text-gray-400">{e.category}</div>
                      </div>
                      <div className="text-xs text-gray-500">{fmtRelative(e.createdAt)}</div>
                    </div>
                    {e.params && Object.keys(e.params).length > 0 && (
                      <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {Object.entries(e.params).slice(0, 8).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <dt className="text-gray-500">{k}</dt>
                            <dd className="text-primary font-semibold truncate max-w-[60%] text-right">{fmtParam(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </li>
                ))}
              </ol>
            )}

            {tab === 'notes' && (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes commerciales, suivi de relance, point bloquant…"
                  rows={6}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
                  >
                    <i className="fa-solid fa-floppy-disk"></i>
                    {savingNotes ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="pt-6 border-t border-gray-100 flex justify-between gap-3">
            <button
              onClick={onDelete}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition"
            >
              <i className="fa-solid fa-trash mr-1"></i> Supprimer
            </button>
            {prospect.email && (
              <a
                href={`mailto:${prospect.email}?subject=${encodeURIComponent('Finarent — Votre simulation')}`}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
              >
                <i className="fa-solid fa-paper-plane"></i> Contacter par email
              </a>
            )}
          </section>
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Field({ label, value, icon, mono, small }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-1">
        {icon && <i className={`fa-solid ${icon} mr-1.5`}></i>}
        {label}
      </div>
      <div className={`${mono ? 'font-mono' : ''} ${small ? 'text-xs' : ''} ${value ? 'text-primary font-semibold' : 'text-gray-300 italic'} truncate`}>
        {value || '—'}
      </div>
    </div>
  );
}
