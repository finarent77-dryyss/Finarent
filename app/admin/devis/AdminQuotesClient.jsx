'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS = {
  DRAFT:    { label: 'Brouillon', cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  SENT:     { label: 'Envoyé',    cls: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  ACCEPTED: { label: 'Accepté',   cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  REFUSED:  { label: 'Refusé',    cls: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
  EXPIRED:  { label: 'Expiré',    cls: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
};

const eur = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
const frDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

export default function AdminQuotesClient() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quotes?status=${f}`);
      const data = await res.json();
      setQuotes(data.items || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load(filter);
  };

  const filtered = quotes.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return q.quoteNumber.toLowerCase().includes(s) ||
           (q.contactName || '').toLowerCase().includes(s) ||
           (q.companyName || '').toLowerCase().includes(s);
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Devis</h1>
          <p className="text-gray-400 text-sm mt-1">{quotes.length} devis</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Nouveau devis
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-6">
        <div className="relative mb-4">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"></i>
          <input
            type="text"
            placeholder="Rechercher par n°, contact, entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {['all', 'DRAFT', 'SENT', 'ACCEPTED', 'REFUSED', 'EXPIRED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                filter === f ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Tous' : STATUS_LABELS[f]?.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="py-16 text-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i></div>}
      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
          <i className="fa-solid fa-file-signature text-4xl text-gray-200 mb-3 block"></i>
          <p className="text-sm text-gray-400">Aucun devis</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                <th className="text-left px-5 py-3">N°</th>
                <th className="text-left px-5 py-3">Contact</th>
                <th className="text-left px-5 py-3">Entreprise</th>
                <th className="text-left px-5 py-3">Valide jusqu'au</th>
                <th className="text-right px-5 py-3">Total TTC</th>
                <th className="text-center px-5 py-3">Statut</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const status = STATUS_LABELS[q.status] || STATUS_LABELS.DRAFT;
                return (
                  <tr key={q.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-secondary">{q.quoteNumber}</td>
                    <td className="px-5 py-3">
                      <div className="font-semibold text-primary">{q.contactName}</div>
                      {q.contactEmail && <div className="text-xs text-gray-400">{q.contactEmail}</div>}
                    </td>
                    <td className="px-5 py-3 text-sm">{q.companyName || '—'}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{frDate(q.validUntil)}</td>
                    <td className="px-5 py-3 text-right font-bold text-primary">{eur(q.totalTTC)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${status.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <a href={`/api/admin/quotes/${q.id}/pdf`} target="_blank" className="text-xs text-secondary hover:underline mr-2">
                        <i className="fa-solid fa-file-pdf"></i> PDF
                      </a>
                      {q.status === 'DRAFT' && (
                        <button onClick={() => updateStatus(q.id, 'SENT')} className="text-xs text-blue-600 hover:underline mr-2">
                          Envoyer
                        </button>
                      )}
                      {q.status === 'SENT' && (
                        <>
                          <button onClick={() => updateStatus(q.id, 'ACCEPTED')} className="text-xs text-emerald-600 hover:underline mr-2">
                            Accepter
                          </button>
                          <button onClick={() => updateStatus(q.id, 'REFUSED')} className="text-xs text-rose-500 hover:underline">
                            Refuser
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateQuoteModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(filter); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateQuoteModal({ onClose, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyName: '',
    companyAddress: '',
    companySiret: '',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    taxRate: 20,
    paymentTerms: 'À réception',
    notes: '',
    items: [{ description: 'Honoraires de courtage Finarent', quantity: 1, unitPriceHT: 0 }],
  });

  const updateItem = (i, patch) => setForm((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, ...patch } : it) }));
  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPriceHT: 0 }] }));
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotalHT = form.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPriceHT) || 0), 0);
  const taxAmount = subtotalHT * (Number(form.taxRate) / 100);
  const totalTTC = subtotalHT + taxAmount;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur');
      onCreated();
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden"
      >
        <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black">Nouveau devis</h2>
          <button type="button" onClick={onClose}><i className="fa-solid fa-xmark text-xl text-white/70"></i></button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contact</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Nom du contact *" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input required type="email" placeholder="Email *" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Téléphone" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Entreprise" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Adresse" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} className="sm:col-span-2 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="SIRET" value={form.companySiret} onChange={(e) => setForm({ ...form, companySiret: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Postes</div>
              <button type="button" onClick={addItem} className="text-xs font-bold text-secondary hover:underline">
                <i className="fa-solid fa-plus mr-1"></i>Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input placeholder="Description" value={it.description} onChange={(e) => updateItem(i, { description: e.target.value })} className="col-span-6 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-secondary focus:outline-none" />
                  <input type="number" placeholder="Qté" value={it.quantity} onChange={(e) => updateItem(i, { quantity: e.target.value })} className="col-span-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
                  <input type="number" placeholder="PU HT" value={it.unitPriceHT} step="0.01" onChange={(e) => updateItem(i, { unitPriceHT: e.target.value })} className="col-span-3 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
                  <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-rose-500"><i className="fa-solid fa-trash text-sm"></i></button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-500">Sous-total HT</span><span className="font-bold">{eur(subtotalHT)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">TVA ({form.taxRate}%)</span><span className="font-bold">{eur(taxAmount)}</span></div>
            <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
              <span className="font-bold text-primary">Total TTC</span>
              <span className="text-lg font-black text-primary">{eur(totalTTC)}</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Valide jusqu'au</label>
              <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Conditions</label>
              <input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notes</label>
            <textarea rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none resize-none" />
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl">Annuler</button>
          <button type="submit" disabled={submitting || !form.contactName || !form.contactEmail} className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Création...' : 'Créer le devis'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
