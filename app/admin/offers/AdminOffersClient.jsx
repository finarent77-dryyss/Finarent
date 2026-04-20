'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_LABELS = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyée',
  VIEWED: 'Vue',
  ACCEPTED: 'Acceptée',
  REFUSED: 'Refusée',
  EXPIRED: 'Expirée',
  SIGNED: 'Signée',
};

const STATUS_COLORS = {
  DRAFT: { bg: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
  SENT: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  VIEWED: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  ACCEPTED: { bg: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  SIGNED: { bg: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  REFUSED: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  EXPIRED: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function calcMonthly(amount, months, rate) {
  const a = Number(amount);
  const n = Number(months);
  const r = Number(rate);
  if (!a || !n) return 0;
  if (!r) return a / n;
  const i = r / 100 / 12;
  const m = (a * i) / (1 - Math.pow(1 + i, -n));
  return m;
}

export default function AdminOffersClient() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    applicationId: '',
    amount: '',
    durationMonths: '36',
    rate: '3.5',
    partnerId: '',
    expiresInDays: '7',
    conditions: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [oRes, aRes, pRes] = await Promise.all([
          fetch('/api/admin/offers'),
          fetch('/api/admin/demandes'),
          fetch('/api/admin/partners'),
        ]);
        setOffers(await oRes.json());
        setApplications(await aRes.json());
        setPartners(await pRes.json());
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const monthlyPayment = useMemo(
    () => calcMonthly(form.amount, form.durationMonths, form.rate),
    [form.amount, form.durationMonths, form.rate]
  );
  const totalCost = monthlyPayment * Number(form.durationMonths || 0);

  const createOffer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        applicationId: form.applicationId,
        amount: Number(form.amount),
        durationMonths: Number(form.durationMonths),
        monthlyPayment: Number(monthlyPayment.toFixed(2)),
        rate: Number(form.rate),
        totalCost: Number(totalCost.toFixed(2)),
        partnerId: form.partnerId || null,
        conditions: form.conditions ? { note: form.conditions } : null,
        expiresInDays: Number(form.expiresInDays),
      };
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setOffers(prev => [created, ...prev]);
      resetForm();
    } catch { alert('Erreur lors de la création'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setOffers(prev => prev.map(o => o.id === id ? updated : o));
    } catch { alert('Erreur'); }
  };

  const deleteOffer = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return;
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch { alert('Erreur'); }
  };

  const resetForm = () => {
    setShowForm(false);
    setForm({
      applicationId: '', amount: '', durationMonths: '36',
      rate: '3.5', partnerId: '', expiresInDays: '7', conditions: '',
    });
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const in3Days = now + 3 * 24 * 60 * 60 * 1000;
    return offers.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (expiringOnly) {
        const exp = new Date(o.expiresAt).getTime();
        if (!(exp > now && exp <= in3Days && !['ACCEPTED', 'SIGNED', 'REFUSED', 'EXPIRED'].includes(o.status))) return false;
      }
      return true;
    });
  }, [offers, statusFilter, expiringOnly]);

  const statusCounts = useMemo(() => {
    const counts = { all: offers.length };
    ALL_STATUSES.forEach(s => { counts[s] = 0; });
    offers.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [offers]);

  const fmtEur = (n) => Number(n || 0).toLocaleString('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-slate-400">Chargement des offres...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Offres</h1>
          <p className="text-sm text-slate-400 mt-1">{offers.length} offre{offers.length > 1 ? 's' : ''} enregistrée{offers.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`}></i>
          {showForm ? 'Annuler' : 'Nouvelle offre'}
        </button>
      </motion.div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={createOffer}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 overflow-hidden"
          >
            <h3 className="font-bold text-primary mb-4">Nouvelle offre</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Demande</label>
                <select
                  required value={form.applicationId}
                  onChange={e => setForm(p => ({ ...p, applicationId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                >
                  <option value="">— Sélectionner une demande —</option>
                  {applications.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.reference || a.id.slice(0, 8)} · {a.companyName || '—'} · {a.amount || '—'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Montant (€)</label>
                <input
                  type="number" min="0" step="100" required value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Durée (mois)</label>
                <input
                  type="number" min="1" max="120" required value={form.durationMonths}
                  onChange={e => setForm(p => ({ ...p, durationMonths: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Taux (%)</label>
                <input
                  type="number" min="0" max="30" step="0.01" required value={form.rate}
                  onChange={e => setForm(p => ({ ...p, rate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Partenaire</label>
                <select
                  value={form.partnerId}
                  onChange={e => setForm(p => ({ ...p, partnerId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                >
                  <option value="">— Aucun —</option>
                  {partners.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Expire dans (jours)</label>
                <input
                  type="number" min="1" max="90" required value={form.expiresInDays}
                  onChange={e => setForm(p => ({ ...p, expiresInDays: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Conditions particulières</label>
                <textarea
                  rows="2" value={form.conditions}
                  onChange={e => setForm(p => ({ ...p, conditions: e.target.value }))}
                  placeholder="Optionnel..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all resize-none"
                />
              </div>
            </div>

            {/* Calculated values */}
            <div className="grid sm:grid-cols-2 gap-3 mt-4 p-4 bg-primary/5 rounded-xl">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Mensualité calculée</div>
                <div className="text-lg font-black text-primary">
                  {monthlyPayment ? fmtEur(monthlyPayment) : '—'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Coût total</div>
                <div className="text-lg font-black text-primary">
                  {totalCost ? fmtEur(totalCost) : '—'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit" disabled={saving}
                className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <i className="fa-solid fa-spinner fa-spin"></i>}
                Envoyer l'offre
              </button>
              <button
                type="button" onClick={resetForm}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-all"
              >
                Annuler
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            Toutes ({statusCounts.all})
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === s ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {STATUS_LABELS[s]} ({statusCounts[s] || 0})
            </button>
          ))}
          <button
            onClick={() => setExpiringOnly(v => !v)}
            className={`ml-auto px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              expiringOnly ? 'bg-red-100 text-red-700' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <i className="fa-solid fa-clock"></i>
            Expire bientôt
          </button>
        </div>
      </motion.div>

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-16 text-center bg-white rounded-2xl border border-slate-100">
              <i className="fa-solid fa-file-invoice-dollar text-4xl text-slate-200 mb-3 block"></i>
              <p className="text-sm text-slate-400">Aucune offre</p>
            </motion.div>
          ) : filtered.map(o => {
            const sc = STATUS_COLORS[o.status] || STATUS_COLORS.DRAFT;
            const expired = new Date(o.expiresAt) < new Date();
            const app = o.application;
            return (
              <motion.div
                key={o.id} layout variants={itemVariants}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${sc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                        {STATUS_LABELS[o.status]}
                      </span>
                      {expired && o.status !== 'EXPIRED' && o.status !== 'ACCEPTED' && o.status !== 'SIGNED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          Échue
                        </span>
                      )}
                      {o.partner && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          · {o.partner.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-primary text-lg">{app?.companyName || 'Demande #' + o.applicationId.slice(0, 8)}</h3>
                    {app?.user && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        <i className="fa-solid fa-user text-[10px] text-slate-300 mr-1"></i>
                        {app.user.name || app.user.email}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-w-[260px]">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Montant</div>
                      <div className="text-sm font-black text-primary">{fmtEur(o.amount)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Mensualité</div>
                      <div className="text-sm font-black text-secondary">{fmtEur(o.monthlyPayment)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Durée</div>
                      <div className="text-sm font-black text-primary">{o.durationMonths}m · {o.rate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Expire</div>
                      <div className="text-sm font-black text-primary">{fmtDate(o.expiresAt)}</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                  <select
                    value={o.status}
                    onChange={e => updateStatus(o.id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  >
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>

                  <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
                    {o.sentAt && <span><i className="fa-solid fa-paper-plane mr-1"></i>{fmtDate(o.sentAt)}</span>}
                    {o.acceptedAt && <span className="text-accent"><i className="fa-solid fa-circle-check mr-1"></i>{fmtDate(o.acceptedAt)}</span>}
                    <button
                      onClick={() => deleteOffer(o.id)}
                      className="text-red-400 hover:text-red-600 transition-all"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
