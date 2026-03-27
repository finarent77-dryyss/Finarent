'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'general', label: 'Général' },
  { value: 'financement', label: 'Financement' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'documents', label: 'Documents' },
  { value: 'compte', label: 'Compte' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export default function AdminFAQClient() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', order: 0 });

  useEffect(() => {
    fetch('/api/admin/faq').then(r => r.json()).then(setFaqs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? faqs : faqs.filter(f => f.category === filter);

  const handleSave = async () => {
    const url = editing ? `/api/admin/faq/${editing}` : '/api/admin/faq';
    const method = editing ? 'PATCH' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (editing) {
      setFaqs(prev => prev.map(f => f.id === editing ? data : f));
    } else {
      setFaqs(prev => [...prev, data]);
    }
    setEditing(null);
    setAdding(false);
    setForm({ question: '', answer: '', category: 'general', order: 0 });
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette question ?')) return;
    await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
    setFaqs(prev => prev.filter(f => f.id !== id));
  };

  const handleToggle = async (faq) => {
    const res = await fetch(`/api/admin/faq/${faq.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    const data = await res.json();
    setFaqs(prev => prev.map(f => f.id === faq.id ? data : f));
  };

  const startEdit = (faq) => {
    setEditing(faq.id);
    setAdding(true);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-5xl mx-auto">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Gestion FAQ</h1>
          <p className="text-slate-400 text-sm mt-1">{faqs.length} questions au total</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditing(null); setForm({ question: '', answer: '', category: 'general', order: 0 }); }}
          className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> Ajouter une question
        </button>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100 mb-6 overflow-x-auto">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-600'}`}>
          Toutes ({faqs.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = faqs.filter(f => f.category === cat.value).length;
          return (
            <button key={cat.value} onClick={() => setFilter(cat.value)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === cat.value ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-600'}`}>
              {cat.label} ({count})
            </button>
          );
        })}
      </motion.div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
            <h3 className="font-bold text-primary mb-4">{editing ? 'Modifier la question' : 'Nouvelle question'}</h3>
            <div className="space-y-4">
              <input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="Question" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
              <textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} placeholder="Réponse" rows={4} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
              <div className="flex gap-4">
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))} placeholder="Ordre" className="w-24 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={!form.question || !form.answer} className="px-6 py-2.5 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all text-sm disabled:opacity-50">
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

      {/* FAQ list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(faq => (
            <motion.div key={faq.id} variants={itemVariants} layout className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/10 text-secondary px-2 py-0.5 rounded">{CATEGORIES.find(c => c.value === faq.category)?.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${faq.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {faq.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <h4 className="font-bold text-primary text-sm mb-1">{faq.question}</h4>
                  <p className="text-slate-500 text-xs line-clamp-2">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(faq)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all ${faq.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                    <i className={`fa-solid ${faq.isActive ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                  <button onClick={() => startEdit(faq)} className="w-8 h-8 rounded-lg bg-secondary/5 text-secondary flex items-center justify-center text-xs hover:bg-secondary/10 transition-all">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button onClick={() => handleDelete(faq.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs hover:bg-red-100 transition-all">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <i className="fa-solid fa-circle-question text-4xl mb-3 block"></i>
            <p className="text-sm">Aucune question dans cette catégorie</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
