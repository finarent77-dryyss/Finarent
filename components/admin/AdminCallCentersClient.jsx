'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TYPE_LABELS = {
  INTERNAL: { label: 'Interne', cls: 'bg-sky-100 text-sky-700' },
  EXTERNAL: { label: 'Externe', cls: 'bg-amber-100 text-amber-700' },
};

export default function AdminCallCentersClient() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const url = typeFilter === 'all' ? '/api/admin/call-centers' : `/api/admin/call-centers?type=${typeFilter}`;
      const r = await fetch(url);
      if (r.ok) setList(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [typeFilter]);

  const totals = list.reduce(
    (acc, c) => ({
      members: acc.members + c.counts.members,
      applications: acc.applications + c.counts.applications,
      interactions: acc.interactions + c.counts.interactions,
      pending: acc.pending + c.commissions.pendingAmount,
      paid: acc.paid + c.commissions.paidAmount,
    }),
    { members: 0, applications: 0, interactions: 0, pending: 0, paid: 0 },
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight mb-1">
            <i className="fa-solid fa-headset mr-3 text-secondary"></i>
            Centres d'appel
          </h1>
          <p className="text-sm text-gray-500">
            Équipes internes Finarent ou prestataires externes. Commission auto à la signature des dossiers attribués.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 text-sm shrink-0"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Nouveau centre
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'INTERNAL', label: 'Internes' },
          { key: 'EXTERNAL', label: 'Externes' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              typeFilter === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <Kpi icon="fa-people-group" label="Membres" value={totals.members} color="sky" />
        <Kpi icon="fa-folder-open" label="Dossiers attribués" value={totals.applications} color="violet" />
        <Kpi icon="fa-phone" label="Interactions" value={totals.interactions} color="emerald" />
        <Kpi icon="fa-hourglass-half" label="À verser" value={`${totals.pending.toFixed(0)} €`} color="amber" />
        <Kpi icon="fa-check-circle" label="Versé" value={`${totals.paid.toFixed(0)} €`} color="green" />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-primary text-sm">{list.length} centre{list.length > 1 ? 's' : ''}</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <i className="fa-solid fa-headset text-4xl mb-3 block opacity-40"></i>
            <p className="text-sm">Aucun centre d'appel pour le moment.</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 text-secondary font-bold text-sm hover:underline">
              Créer le premier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Centre</th>
                  <th className="text-center px-5 py-3">Type</th>
                  <th className="text-right px-5 py-3">Membres</th>
                  <th className="text-right px-5 py-3">Dossiers</th>
                  <th className="text-right px-5 py-3">Comm. à verser</th>
                  <th className="text-right px-5 py-3">Comm. versées</th>
                  <th className="text-center px-5 py-3">État</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((c) => {
                  const t = TYPE_LABELS[c.type] || TYPE_LABELS.INTERNAL;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/admin/call-centers/${c.id}`} className="block">
                          <div className="font-bold text-primary">{c.name}</div>
                          <div className="text-xs text-gray-400">
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded">{c.code}</code>
                            {c.email && <span className="ml-2">{c.email}</span>}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.cls}`}>
                          {t.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{c.counts.members}</td>
                      <td className="px-5 py-3 text-right tabular-nums">{c.counts.applications}</td>
                      <td className="px-5 py-3 text-right tabular-nums font-bold text-amber-600">
                        {c.commissions.pendingAmount.toFixed(0)} €
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-bold text-emerald-600">
                        {c.commissions.paidAmount.toFixed(0)} €
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          c.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {c.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/admin/call-centers/${c.id}`} className="text-secondary hover:text-secondary/80">
                          <i className="fa-solid fa-chevron-right"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function Kpi({ icon, label, value, color }) {
  const map = {
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className={`w-9 h-9 rounded-xl ${map[color]} flex items-center justify-center mb-2`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black text-primary tabular-nums">{value}</div>
    </div>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'INTERNAL',
    address: '',
    phone: '',
    email: '',
    iban: '',
    commissionType: 'PERCENT',
    commissionValue: 5,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/call-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (r.ok) onCreated();
      else {
        const d = await r.json();
        setError(d.error || 'Erreur lors de la création');
      }
    } catch { setError('Erreur réseau'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-black text-primary">Nouveau centre d'appel</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4">{error}</div>}

          <div className="space-y-4">
            <Field label="Nom du centre *" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Centre Paris ou Société CallZone"
                className="input"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Code (auto si vide)">
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="CC-PARIS"
                  maxLength={32}
                  className="input font-mono"
                />
              </Field>
              <Field label="Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                  <option value="INTERNAL">Interne Finarent</option>
                  <option value="EXTERNAL">Externe (partenaire)</option>
                </select>
              </Field>
            </div>

            <Field label="Adresse">
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Téléphone">
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
              </Field>
            </div>

            {form.type === 'EXTERNAL' && (
              <Field label="IBAN (pour virement commissions)">
                <input type="text" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="FR76..." className="input font-mono" />
              </Field>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type commission">
                <select value={form.commissionType} onChange={(e) => setForm({ ...form, commissionType: e.target.value })} className="input">
                  <option value="PERCENT">Pourcentage (%)</option>
                  <option value="FIXED">Montant fixe (€)</option>
                </select>
              </Field>
              <Field label={`Valeur (${form.commissionType === 'PERCENT' ? '%' : '€/dossier'})`}>
                <input
                  type="number"
                  value={form.commissionValue}
                  onChange={(e) => setForm({ ...form, commissionValue: e.target.value })}
                  min={0}
                  step={form.commissionType === 'PERCENT' ? 0.1 : 1}
                  className="input"
                />
              </Field>
            </div>

            <Field label="Notes internes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="input min-h-[60px]"
              />
            </Field>
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-sm">
              Annuler
            </button>
            <button type="submit" disabled={submitting} className="flex-1 px-5 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-50 text-sm">
              {submitting ? 'Création…' : 'Créer le centre'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid rgb(228 228 231);
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
        :global(.input:focus) { outline: none; border-color: var(--secondary, #6366f1); }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
