'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAffiliatesClient() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/affiliates');
      if (r.ok) setList(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totals = list.reduce(
    (acc, a) => ({
      clicks: acc.clicks + a.counts.clicks,
      prospects: acc.prospects + a.counts.prospects,
      applications: acc.applications + a.counts.applications,
      pending: acc.pending + a.commissions.pendingAmount,
      paid: acc.paid + a.commissions.paidAmount,
    }),
    { clicks: 0, prospects: 0, applications: 0, pending: 0, paid: 0 },
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight mb-1">
            <i className="fa-solid fa-share-nodes mr-3 text-secondary"></i>
            Affiliation
          </h1>
          <p className="text-sm text-gray-500">
            Commerciaux & apporteurs d'affaires Finarent. Liens trackés avec cookie 90 jours, commissions calculées sur signature.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href="/admin/affiliates/payouts"
            className="px-5 py-2.5 bg-white border border-gray-200 text-primary font-bold rounded-xl hover:border-secondary text-sm"
          >
            <i className="fa-solid fa-euro-sign mr-2"></i>
            Versements & SEPA
          </Link>
          <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm shrink-0"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Nouvel affilié
        </button>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <KpiCard icon="fa-mouse-pointer" label="Clics" value={totals.clicks} color="sky" />
        <KpiCard icon="fa-user-plus" label="Leads" value={totals.prospects} color="violet" />
        <KpiCard icon="fa-folder-open" label="Dossiers" value={totals.applications} color="emerald" />
        <KpiCard icon="fa-hourglass-half" label="À verser" value={`${totals.pending.toFixed(0)} €`} color="amber" />
        <KpiCard icon="fa-check-circle" label="Versé" value={`${totals.paid.toFixed(0)} €`} color="green" />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-primary text-sm">{list.length} affilié{list.length > 1 ? 's' : ''}</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Chargement…</div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <i className="fa-solid fa-share-nodes text-4xl mb-3 block opacity-40"></i>
            <p className="text-sm">Aucun affilié pour le moment.</p>
            <button onClick={() => setShowCreate(true)} className="mt-4 text-secondary font-bold text-sm hover:underline">
              Créer le premier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-5 py-3">Nom / Code</th>
                  <th className="text-left px-5 py-3">Commission</th>
                  <th className="text-right px-5 py-3">Clics</th>
                  <th className="text-right px-5 py-3">Leads</th>
                  <th className="text-right px-5 py-3">Dossiers</th>
                  <th className="text-right px-5 py-3">À verser</th>
                  <th className="text-right px-5 py-3">Versé</th>
                  <th className="text-center px-5 py-3">État</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/affiliates/${a.id}`} className="block">
                        <div className="font-bold text-primary">{a.name}</div>
                        <div className="text-xs text-gray-400">
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded">?ref={a.code}</code>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {a.commissionType === 'FIXED'
                        ? `${a.commissionValue} € / dossier`
                        : `${a.commissionValue} % du financé`}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{a.counts.clicks}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{a.counts.prospects}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{a.counts.applications}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-bold text-amber-600">
                      {a.commissions.pendingAmount.toFixed(0)} €
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-bold text-emerald-600">
                      {a.commissions.paidAmount.toFixed(0)} €
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          a.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {a.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/affiliates/${a.id}`}
                        className="text-secondary hover:text-secondary/80"
                        title="Détail"
                      >
                        <i className="fa-solid fa-chevron-right"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color }) {
  const colorMap = {
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className={`w-9 h-9 rounded-xl ${colorMap[color]} flex items-center justify-center mb-2`}>
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
    email: '',
    phone: '',
    code: '',
    commissionType: 'FIXED',
    commissionValue: 100,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (r.ok) {
        onCreated();
      } else {
        const data = await r.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-black text-primary">Nouvel affilié</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl mb-4">{error}</div>
          )}

          <div className="space-y-4">
            <Field label="Nom complet *" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input"
                placeholder="Jean Dupont"
              />
            </Field>
            <Field label="Email *" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="input"
                placeholder="jean@example.com"
              />
            </Field>
            <Field label="Téléphone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="06 12 34 56 78"
              />
            </Field>
            <Field label="Code d'affiliation (laisser vide pour génération auto)">
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="input font-mono"
                placeholder="JDUPONT"
                maxLength={32}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type de commission">
                <select
                  value={form.commissionType}
                  onChange={(e) => setForm({ ...form, commissionType: e.target.value })}
                  className="input"
                >
                  <option value="FIXED">Montant fixe (€)</option>
                  <option value="PERCENT">Pourcentage (%)</option>
                </select>
              </Field>
              <Field label={`Valeur (${form.commissionType === 'FIXED' ? '€/dossier' : '% du financé'})`}>
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
                className="input min-h-[80px]"
                placeholder="Contexte, accord particulier…"
              />
            </Field>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-5 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-50 text-sm"
            >
              {submitting ? 'Création…' : "Créer l'affilié"}
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
          transition: border-color 0.2s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: var(--secondary, #6366f1);
        }
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
