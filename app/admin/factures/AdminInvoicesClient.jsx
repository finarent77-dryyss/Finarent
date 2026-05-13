'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS = {
  DRAFT:     { label: 'Brouillon',  cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  ISSUED:    { label: 'Émise',      cls: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  PARTIAL:   { label: 'Partielle',  cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  PAID:      { label: 'Payée',      cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Annulée',    cls: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
};

const FILTERS = ['all', 'DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'CANCELLED'];
const FILTER_LABELS = { all: 'Toutes', DRAFT: 'Brouillons', ISSUED: 'Émises', PARTIAL: 'Partielles', PAID: 'Payées', CANCELLED: 'Annulées' };

const eur = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
const frDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

export default function AdminInvoicesClient() {
  const [invoices, setInvoices] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async (f) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices?status=${f}`);
      const data = await res.json();
      setInvoices(data.items || []);
      setCounts(data.counts || {});
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const filtered = invoices.filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return i.invoiceNumber.toLowerCase().includes(s) ||
           (i.clientName || '').toLowerCase().includes(s) ||
           (i.clientEmail || '').toLowerCase().includes(s);
  });

  const totalAmount = filtered.reduce((s, i) => s + (i.totalTTC || 0), 0);
  const totalPaid = filtered.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const totalOutstanding = totalAmount - totalPaid;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Factures</h1>
          <p className="text-gray-400 text-sm mt-1">{invoices.length} facture{invoices.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-sm"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Nouvelle facture
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total facturé</div>
          <div className="text-2xl font-black text-primary">{eur(totalAmount)}</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Encaissé</div>
          <div className="text-2xl font-black text-emerald-700">{eur(totalPaid)}</div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">En attente</div>
          <div className="text-2xl font-black text-amber-700">{eur(totalOutstanding)}</div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-6">
        <div className="relative mb-4">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input
            type="text"
            placeholder="Rechercher par numéro, client, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
                filter === f ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50'
              }`}
            >
              {FILTER_LABELS[f]} ({f === 'all' ? invoices.length : (counts[f] || 0)})
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading && (
        <div className="py-16 text-center">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
          <i className="fa-solid fa-file-invoice text-4xl text-gray-200 mb-3 block"></i>
          <p className="text-sm text-gray-400">{search ? 'Aucun résultat' : 'Aucune facture'}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  <th className="text-left px-5 py-3">N°</th>
                  <th className="text-left px-5 py-3">Client</th>
                  <th className="text-left px-5 py-3">Émise le</th>
                  <th className="text-left px-5 py-3">Échéance</th>
                  <th className="text-right px-5 py-3">Total TTC</th>
                  <th className="text-right px-5 py-3">Payé</th>
                  <th className="text-center px-5 py-3">Statut</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const status = STATUS_LABELS[inv.status] || STATUS_LABELS.DRAFT;
                  const isOverdue = inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== 'PAID' && inv.status !== 'CANCELLED';
                  return (
                    <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-secondary">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-primary">{inv.clientName}</div>
                        {inv.clientEmail && <div className="text-xs text-gray-400">{inv.clientEmail}</div>}
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{frDate(inv.issueDate)}</td>
                      <td className={`px-5 py-3 text-xs ${isOverdue ? 'text-rose-600 font-bold' : 'text-gray-600'}`}>
                        {frDate(inv.dueDate)}
                        {isOverdue && <i className="fa-solid fa-triangle-exclamation ml-1"></i>}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-primary">{eur(inv.totalTTC)}</td>
                      <td className="px-5 py-3 text-right text-emerald-600 font-semibold">{eur(inv.paidAmount)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${status.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <a
                          href={`/api/admin/invoices/${inv.id}/pdf`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-secondary hover:underline mr-2"
                          title="Télécharger PDF"
                        >
                          <i className="fa-solid fa-file-pdf"></i> PDF
                        </a>
                        <Link
                          href={`/admin/factures/${inv.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-primary hover:underline"
                        >
                          Détails <i className="fa-solid fa-arrow-right text-[10px]"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal création */}
      <AnimatePresence>
        {showCreate && (
          <CreateInvoiceModal
            onClose={() => setShowCreate(false)}
            onCreated={() => { setShowCreate(false); load(filter); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modal de création ──────────────────────────────────────
function CreateInvoiceModal({ onClose, onCreated }) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientPostal: '',
    clientCity: '',
    clientSiret: '',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    paymentTerms: 'Paiement à 30 jours',
    notes: '',
    lines: [{ description: 'Frais de dossier Finassur', quantity: 1, unitPrice: 0, vatRate: 20 }],
  });

  const updateLine = (i, patch) => {
    setForm((f) => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, ...patch } : l) }));
  };
  const addLine = () => setForm((f) => ({ ...f, lines: [...f.lines, { description: '', quantity: 1, unitPrice: 0, vatRate: 20 }] }));
  const removeLine = (i) => setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));

  const totalHT = form.lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0), 0);
  const totalTVA = form.lines.reduce((s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0) * ((Number(l.vatRate) || 0) / 100), 0);
  const totalTTC = totalHT + totalTVA;

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur');
      onCreated();
    } catch (err) {
      alert(err.message);
    } finally { setSubmitting(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden"
      >
        <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black">Nouvelle facture</h2>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Client */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Client</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input required placeholder="Nom du client *" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input type="email" placeholder="Email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Adresse" value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} className="sm:col-span-2 px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Code postal" value={form.clientPostal} onChange={(e) => setForm({ ...form, clientPostal: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Ville" value={form.clientCity} onChange={(e) => setForm({ ...form, clientCity: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="SIRET" value={form.clientSiret} onChange={(e) => setForm({ ...form, clientSiret: e.target.value })} className="px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
            </div>
          </div>

          {/* Lignes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Lignes</div>
              <button type="button" onClick={addLine} className="text-xs font-bold text-secondary hover:underline">
                <i className="fa-solid fa-plus mr-1"></i>Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {form.lines.map((l, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input placeholder="Description" value={l.description} onChange={(e) => updateLine(i, { description: e.target.value })} className="col-span-5 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-secondary focus:outline-none" />
                  <input type="number" placeholder="Qté" value={l.quantity} step="1" onChange={(e) => updateLine(i, { quantity: e.target.value })} className="col-span-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
                  <input type="number" placeholder="PU HT" value={l.unitPrice} step="0.01" onChange={(e) => updateLine(i, { unitPrice: e.target.value })} className="col-span-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
                  <input type="number" placeholder="TVA %" value={l.vatRate} step="0.5" onChange={(e) => updateLine(i, { vatRate: e.target.value })} className="col-span-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm text-right focus:border-secondary focus:outline-none" />
                  <button type="button" onClick={() => removeLine(i)} className="col-span-1 text-rose-500 hover:text-rose-600">
                    <i className="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total HT</span><span className="font-bold">{eur(totalHT)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">TVA</span><span className="font-bold">{eur(totalTVA)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="font-bold text-primary">Total TTC</span>
              <span className="text-lg font-black text-primary">{eur(totalTTC)}</span>
            </div>
          </div>

          {/* Échéance + conditions */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Échéance</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none" />
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
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl">
            Annuler
          </button>
          <button type="submit" disabled={submitting || !form.clientName} className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Création...' : 'Créer la facture'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
