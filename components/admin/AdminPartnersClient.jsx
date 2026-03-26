'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_LABELS = { BANK: 'Banque', INSURANCE: 'Assurance', LEASING: 'Leasing' };
const TYPE_COLORS = {
  BANK: { bg: 'bg-blue-100 text-blue-800', icon: 'fa-building-columns' },
  INSURANCE: { bg: 'bg-teal-100 text-teal-800', icon: 'fa-shield-halved' },
  LEASING: { bg: 'bg-purple-100 text-purple-800', icon: 'fa-handshake' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export default function AdminPartnersClient() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'BANK', contactEmail: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/admin/partners');
      setPartners(await res.json());
    } catch {} finally { setLoading(false); }
  };

  const createPartner = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const partner = await res.json();
      setPartners(prev => [partner, ...prev]);
      resetForm();
    } catch { alert('Erreur lors de la création'); }
    finally { setSaving(false); }
  };

  const updatePartner = async (e) => {
    e.preventDefault();
    if (!editingPartner) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/partners/${editingPartner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPartners(prev => prev.map(p => p.id === editingPartner.id ? { ...p, ...updated } : p));
      resetForm();
    } catch { alert('Erreur lors de la mise à jour'); }
    finally { setSaving(false); }
  };

  const deletePartner = async (id, name) => {
    if (!confirm(`Supprimer le partenaire "${name}" ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch { alert('Erreur lors de la suppression'); }
  };

  const toggleActive = async (id, isActive) => {
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPartners(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    } catch { alert('Erreur'); }
  };

  const startEdit = (p) => {
    setEditingPartner(p);
    setForm({ name: p.name, type: p.type, contactEmail: p.contactEmail, notes: p.notes || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPartner(null);
    setForm({ name: '', type: 'BANK', contactEmail: '', notes: '' });
  };

  const filtered = partners.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.contactEmail.toLowerCase().includes(s) || (p.notes || '').toLowerCase().includes(s);
  });

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

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Partenaires</h1>
          <p className="text-sm text-gray-400 mt-1">{partners.length} partenaires enregistrés</p>
        </div>
        <button
          onClick={() => { if (showForm && !editingPartner) { resetForm(); } else { resetForm(); setShowForm(true); } }}
          className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`}></i>
          {showForm ? 'Annuler' : 'Nouveau partenaire'}
        </button>
      </motion.div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={editingPartner ? updatePartner : createPartner}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 overflow-hidden"
          >
            <h3 className="font-bold text-primary mb-4">
              {editingPartner ? `Modifier : ${editingPartner.name}` : 'Nouveau partenaire'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Nom</label>
                <input
                  required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Type</label>
                <select
                  value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                >
                  <option value="BANK">Banque</option>
                  <option value="INSURANCE">Assurance</option>
                  <option value="LEASING">Leasing</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Email de contact</label>
                <input
                  type="email" required value={form.contactEmail} onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Notes</label>
                <input
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Optionnel..."
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit" disabled={saving}
                className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <i className="fa-solid fa-spinner fa-spin"></i>}
                {editingPartner ? 'Mettre à jour' : 'Créer le partenaire'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all">
                Annuler
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
          />
        </div>
      </motion.div>

      {/* Partners Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((p) => {
            const tc = TYPE_COLORS[p.type] || TYPE_COLORS.BANK;
            return (
              <motion.div
                key={p.id}
                layout
                variants={itemVariants}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${p.isActive ? 'border-gray-100' : 'border-red-200'}`}
              >
                <div className={`p-5 ${!p.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tc.bg}`}>
                        <i className={`fa-solid ${tc.icon}`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-primary">{p.name}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tc.bg}`}>
                          {TYPE_LABELS[p.type]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 space-y-1 mb-4">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-envelope text-gray-300 w-4"></i>
                      <span className="truncate">{p.contactEmail}</span>
                    </div>
                    {p.notes && (
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-note-sticky text-gray-300 w-4"></i>
                        <span className="truncate">{p.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 py-3 border-t border-gray-50">
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-primary">{p._count?.applications || 0}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Dossiers</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-primary">{p._count?.users || 0}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Users</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-lg font-bold text-primary">{p._count?.commissions || 0}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Commissions</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-50">
                  <button
                    onClick={() => startEdit(p)}
                    className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:bg-secondary/5 hover:text-secondary transition-all flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-pen text-[10px]"></i> Modifier
                  </button>
                  <button
                    onClick={() => toggleActive(p.id, p.isActive)}
                    className={`flex-1 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${p.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                  >
                    <i className={`fa-solid ${p.isActive ? 'fa-pause' : 'fa-play'} text-[10px]`}></i>
                    {p.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => deletePartner(p.id, p.name)}
                    className="flex-1 py-2.5 text-xs font-bold text-red-400 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-trash text-[10px]"></i> Supprimer
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            <i className="fa-solid fa-handshake text-4xl text-gray-200 mb-3 block"></i>
            <p className="text-sm">{search ? 'Aucun résultat' : 'Aucun partenaire. Cliquez sur "Nouveau" pour en créer un.'}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
