'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const STATUS_LABELS = {
  DRAFT:     { label: 'Brouillon',  cls: 'bg-slate-100 text-slate-700' },
  ISSUED:    { label: 'Émise',      cls: 'bg-blue-100 text-blue-700' },
  PARTIAL:   { label: 'Partielle',  cls: 'bg-amber-100 text-amber-700' },
  PAID:      { label: 'Payée',      cls: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Annulée',    cls: 'bg-red-100 text-red-700' },
};

const eur = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
const frDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const frDateTime = (d) => d ? new Date(d).toLocaleString('fr-FR') : '—';

export default function InvoiceDetailClient({ id }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingPayment, setAddingPayment] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'virement', reference: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}`);
      if (res.ok) setInvoice(await res.json());
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (status) => {
    const res = await fetch(`/api/admin/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, sentAt: status === 'ISSUED' ? new Date().toISOString() : undefined }),
    });
    if (res.ok) load();
  };

  const addPayment = async (e) => {
    e.preventDefault();
    setAddingPayment(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payForm, amount: Number(payForm.amount) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur');
      setPayForm({ amount: '', paymentMethod: 'virement', reference: '', notes: '' });
      load();
    } catch (err) { alert(err.message); }
    finally { setAddingPayment(false); }
  };

  if (loading) return <div className="py-16 text-center"><i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i></div>;
  if (!invoice) return <div className="py-16 text-center text-gray-400">Facture introuvable</div>;

  const status = STATUS_LABELS[invoice.status] || STATUS_LABELS.DRAFT;
  const remaining = invoice.totalTTC - invoice.paidAmount;
  const pctPaid = invoice.totalTTC > 0 ? (invoice.paidAmount / invoice.totalTTC) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/admin/factures" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4">
        <i className="fa-solid fa-arrow-left text-xs"></i> Toutes les factures
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-primary font-mono">{invoice.invoiceNumber}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${status.cls}`}>{status.label}</span>
          </div>
          <div className="text-sm text-gray-500">Émise le {frDate(invoice.issueDate)} · Échéance {frDate(invoice.dueDate)}</div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/admin/invoices/${id}/pdf`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-primary font-bold rounded-xl hover:border-secondary text-sm">
            <i className="fa-solid fa-file-pdf"></i> Voir PDF
          </a>
          {invoice.status === 'DRAFT' && (
            <button onClick={() => updateStatus('ISSUED')} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 text-sm">
              <i className="fa-solid fa-paper-plane"></i> Émettre
            </button>
          )}
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button onClick={() => updateStatus('CANCELLED')} className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-rose-500 font-bold rounded-xl hover:border-rose-300 text-sm">
              <i className="fa-solid fa-ban"></i> Annuler
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total TTC</div>
          <div className="text-2xl font-black text-primary">{eur(invoice.totalTTC)}</div>
          <div className="text-xs text-gray-400 mt-1">HT {eur(invoice.totalHT)} + TVA {eur(invoice.totalTVA)}</div>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Encaissé</div>
          <div className="text-2xl font-black text-emerald-700">{eur(invoice.paidAmount)}</div>
          <div className="text-xs text-emerald-600 mt-1">{pctPaid.toFixed(0)}% du total</div>
        </div>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">Reste à payer</div>
          <div className="text-2xl font-black text-amber-700">{eur(remaining)}</div>
        </div>
      </div>

      {/* Barre progression */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Avancement paiement</span>
          <span className="font-bold">{pctPaid.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" style={{ width: `${pctPaid}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Détails */}
        <div className="space-y-6">
          {/* Client */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Client</h2>
            <div className="font-bold text-primary text-lg">{invoice.clientName}</div>
            {invoice.clientEmail && <div className="text-sm text-gray-500">{invoice.clientEmail}</div>}
            {(invoice.clientAddress || invoice.clientCity) && (
              <div className="text-sm text-gray-500 mt-1">
                {invoice.clientAddress}<br />
                {invoice.clientPostal} {invoice.clientCity}
              </div>
            )}
            {invoice.clientSiret && <div className="text-xs text-gray-400 mt-2">SIRET : {invoice.clientSiret}</div>}
          </div>

          {/* Lignes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest p-5 border-b border-gray-50">Lignes de facturation</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                  <th className="text-left px-5 py-2">Description</th>
                  <th className="text-right px-3 py-2 w-16">Qté</th>
                  <th className="text-right px-3 py-2 w-24">PU HT</th>
                  <th className="text-right px-3 py-2 w-16">TVA</th>
                  <th className="text-right px-5 py-2 w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l) => (
                  <tr key={l.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-primary">{l.description}</td>
                    <td className="px-3 py-3 text-right">{l.quantity}</td>
                    <td className="px-3 py-3 text-right">{eur(l.unitPrice)}</td>
                    <td className="px-3 py-3 text-right">{l.vatRate}%</td>
                    <td className="px-5 py-3 text-right font-bold">{eur(l.quantity * l.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paiements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Paiements ({invoice.payments.length})</h2>
            </div>
            {invoice.payments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                <i className="fa-solid fa-credit-card text-2xl mb-2 block text-gray-200"></i>
                Aucun versement enregistré
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                    <th className="text-left px-5 py-2">Date</th>
                    <th className="text-left px-3 py-2">Méthode</th>
                    <th className="text-left px-3 py-2">Réf.</th>
                    <th className="text-right px-5 py-2">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="border-t border-gray-50">
                      <td className="px-5 py-3 text-xs">{frDateTime(p.paidAt)}</td>
                      <td className="px-3 py-3 capitalize">{p.paymentMethod}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{p.reference || '—'}</td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-600">{eur(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Ajouter paiement */}
        <div className="space-y-6">
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <form onSubmit={addPayment} className="bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-sm">
              <h2 className="text-sm font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-plus-circle"></i>
                Enregistrer un paiement
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Montant</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      max={remaining}
                      value={payForm.amount}
                      onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                      className="w-full pl-3 pr-8 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPayForm({ ...payForm, amount: remaining.toFixed(2) })}
                    className="text-xs text-secondary hover:underline mt-1"
                  >
                    Solder ({eur(remaining)})
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Méthode</label>
                  <select
                    value={payForm.paymentMethod}
                    onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm bg-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="virement">Virement</option>
                    <option value="CB">Carte bancaire</option>
                    <option value="cheque">Chèque</option>
                    <option value="especes">Espèces</option>
                    <option value="avoir">Avoir</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Référence (optionnel)</label>
                  <input
                    type="text"
                    placeholder="N° chèque, ref virement..."
                    value={payForm.reference}
                    onChange={(e) => setPayForm({ ...payForm, reference: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingPayment || !payForm.amount}
                  className="w-full py-2.5 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 disabled:opacity-50"
                >
                  {addingPayment ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}

          {invoice.notes && (
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
