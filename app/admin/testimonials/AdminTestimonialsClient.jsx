'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'rejected', label: 'Refusés' },
  { value: 'published', label: 'Publiés' },
];

const SECTORS = ['BTP', 'Médical', 'IT', 'Transport', 'Industrie', 'Restauration', 'Commerce', 'Services'];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const EMPTY_FORM = { authorName: '', initials: '', position: '', company: '', sector: '', rating: 5, text: '', amount: '', isPublished: true, isApproved: true };

export default function AdminTestimonialsClient() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials?filter=${f}`);
      const data = await res.json();
      setItems(data.items || []);
      const map = {};
      (data.counts || []).forEach((c) => {
        const key = c.isApproved ? (c.isPublished ? 'published' : 'approvedDraft') : 'pending';
        map[key] = (map[key] || 0) + c._count.id;
      });
      setCounts(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const handleSave = async () => {
    const url = editing ? `/api/admin/testimonials/${editing}` : '/api/admin/testimonials';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) {
      setAdding(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      load(filter);
    }
  };

  const handleAction = async (id, action) => {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    load(filter);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce témoignage ?')) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
    load(filter);
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setAdding(true);
    setForm({
      authorName: item.authorName,
      initials: item.initials,
      position: item.position || '',
      company: item.company || '',
      sector: item.sector || '',
      rating: item.rating,
      text: item.text,
      amount: item.amount || '',
      isPublished: item.isPublished,
      isApproved: item.isApproved,
    });
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Témoignages</h1>
          <p className="text-slate-400 text-sm mt-1">
            {(counts.pending || 0)} en attente · {(counts.published || 0)} publiés
          </p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditing(null); setForm(EMPTY_FORM); }}
          className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Ajouter un témoignage
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100 mb-6 overflow-x-auto">
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          const badge = f.value === 'pending' ? (counts.pending || 0) : null;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${isActive ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f.label}
              {badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{badge}</span>
              )}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-bold text-primary mb-4">{editing ? 'Modifier le témoignage' : 'Nouveau témoignage'}</h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.authorName} onChange={(e) => setForm((p) => ({ ...p, authorName: e.target.value }))} placeholder="Nom complet" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
                <input value={form.initials} onChange={(e) => setForm((p) => ({ ...p, initials: e.target.value.toUpperCase() }))} placeholder="Initiales (ex: P.M.)" maxLength={6} className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} placeholder="Poste (ex: Gérant)" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
                <input value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} placeholder="Entreprise (optionnel)" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <select value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm">
                  <option value="">— Secteur —</option>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Montant (ex: 180 000€)" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
                <select value={form.rating} onChange={(e) => setForm((p) => ({ ...p, rating: parseInt(e.target.value) }))} className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</option>)}
                </select>
              </div>
              <textarea value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} placeholder="Texte du témoignage" rows={4} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
              <div className="flex flex-wrap gap-3 items-center">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm((p) => ({ ...p, isApproved: e.target.checked }))} className="rounded" />
                  Approuvé
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))} className="rounded" />
                  Publié sur le site
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={!form.authorName || !form.text} className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all text-sm disabled:opacity-50">
                  {editing ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button onClick={() => { setAdding(false); setEditing(null); }} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm">
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id} variants={itemVariants} layout className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 text-primary font-black flex items-center justify-center text-sm flex-shrink-0">
                      {item.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className="font-bold text-primary text-sm">{item.authorName}</span>
                        {item.position && <span className="text-xs text-slate-500">— {item.position}{item.company ? ` @ ${item.company}` : ''}</span>}
                        {item.sector && <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded">{item.sector}</span>}
                        {item.amount && <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded">{item.amount}</span>}
                        <span className="text-amber-500 text-xs">{'★'.repeat(item.rating)}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{item.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {item.isApproved && item.isPublished && (
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Publié</span>
                        )}
                        {item.isApproved && !item.isPublished && (
                          <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Approuvé (non publié)</span>
                        )}
                        {!item.isApproved && item.rejectedAt && (
                          <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded">Refusé</span>
                        )}
                        {!item.isApproved && !item.rejectedAt && (
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded">En attente</span>
                        )}
                        <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!item.isApproved && (
                      <button onClick={() => handleAction(item.id, 'approve')} title="Approuver et publier" className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center text-xs transition-all">
                        <i className="fa-solid fa-check"></i>
                      </button>
                    )}
                    {item.isApproved && (
                      <button onClick={() => handleAction(item.id, item.isPublished ? 'unpublish' : 'publish')} title={item.isPublished ? 'Dépublier' : 'Publier'} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${item.isPublished ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        <i className={`fa-solid ${item.isPublished ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                      </button>
                    )}
                    {!item.rejectedAt && (
                      <button onClick={() => handleAction(item.id, 'reject')} title="Refuser" className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center text-xs transition-all">
                        <i className="fa-solid fa-ban"></i>
                      </button>
                    )}
                    <button onClick={() => startEdit(item)} title="Éditer" className="w-8 h-8 rounded-lg bg-secondary/5 text-secondary hover:bg-secondary/10 flex items-center justify-center text-xs transition-all">
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button onClick={() => handleDelete(item.id)} title="Supprimer" className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center text-xs transition-all">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <i className="fa-solid fa-comment-dots text-4xl mb-3 block"></i>
              <p className="text-sm">Aucun témoignage dans cette catégorie</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
