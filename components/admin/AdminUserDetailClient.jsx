'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const ROLE_COLORS = {
  CLIENT: { bg: 'bg-secondary/10 text-secondary', dot: 'bg-secondary' },
  ADMIN: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  PARTNER: { bg: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  INSURER: { bg: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
};
const ROLES = ['CLIENT', 'ADMIN', 'PARTNER', 'INSURER'];

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_REVIEW: 'bg-sky-100 text-sky-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  SENT: 'bg-sky-100 text-sky-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  OVERDUE: 'bg-rose-100 text-rose-700',
};

function fmtEUR(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminUserDetailClient({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`)
      .then((r) => { if (!r.ok) throw new Error('404'); return r.json(); })
      .then(setUser)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const updateRole = async (role) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUser((prev) => ({ ...prev, ...updated }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <i className="fa-solid fa-user-slash text-4xl text-gray-300 mb-4 block"></i>
        <h1 className="text-2xl font-black text-primary mb-2">Utilisateur introuvable</h1>
        <p className="text-gray-500 mb-6">Cet utilisateur n'existe pas ou a été supprimé.</p>
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-secondary font-bold hover:gap-3 transition-all">
          <i className="fa-solid fa-arrow-left"></i> Retour à la liste
        </Link>
      </div>
    );
  }

  const rc = ROLE_COLORS[user.role] || ROLE_COLORS.CLIENT;
  const initials = (user.name || user.email || '?').slice(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-mono text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-primary transition">Admin</Link>
        <span>/</span>
        <Link href="/admin/users" className="hover:text-primary transition">Utilisateurs</Link>
        <span>/</span>
        <span className="text-primary font-semibold normal-case">{user.name || user.email}</span>
      </nav>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 ${rc.bg}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-primary">{user.name || 'Sans nom'}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${rc.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`}></span>
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-envelope text-gray-400 text-xs"></i> {user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5"><i className="fa-solid fa-phone text-gray-400 text-xs"></i> {user.phone}</span>}
              {user.company && <span className="flex items-center gap-1.5"><i className="fa-solid fa-building text-gray-400 text-xs"></i> {user.company}{user.legalForm && ` (${user.legalForm})`}</span>}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Inscrit le {fmtDate(user.createdAt)}
              {user.lastLoginAt && <> · dernière connexion {fmtDate(user.lastLoginAt)}</>}
              {user.partner && <> · partenaire <Link href={`/admin/partners`} className="text-secondary hover:underline">{user.partner.name}</Link></>}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <label className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">Rôle</label>
            <select
              value={user.role}
              onChange={(e) => updateRole(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase border-0 cursor-pointer ${rc.bg} focus:outline-none focus:ring-2 focus:ring-secondary/20`}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard icon="fa-file-lines" label="Dossiers" value={user._count?.applications || 0} color="indigo" />
        <StatCard icon="fa-file-invoice" label="Factures" value={user._count?.invoices || 0} color="emerald" />
        <StatCard icon="fa-file-signature" label="Devis" value={user._count?.quotes || 0} color="violet" />
        <StatCard icon="fa-message" label="Messages" value={user._count?.messages || 0} color="sky" />
        <StatCard icon="fa-user-group" label="Parrainages" value={user._count?.referralsMade || 0} color="amber" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: 'fa-chart-pie' },
            { id: 'applications', label: `Dossiers (${user._count?.applications || 0})`, icon: 'fa-file-lines' },
            { id: 'invoices', label: `Factures (${user._count?.invoices || 0})`, icon: 'fa-file-invoice' },
            { id: 'quotes', label: `Devis (${user._count?.quotes || 0})`, icon: 'fa-file-signature' },
            { id: 'messages', label: `Messages (${user._count?.messages || 0})`, icon: 'fa-message' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                tab === t.id ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-primary'
              }`}
            >
              <i className={`fa-solid ${t.icon} mr-2 text-xs`}></i>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'overview' && <OverviewTab user={user} />}
          {tab === 'applications' && <ApplicationsTab user={user} />}
          {tab === 'invoices' && <InvoicesTab user={user} />}
          {tab === 'quotes' && <QuotesTab user={user} />}
          {tab === 'messages' && <MessagesTab user={user} />}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400">{label}</div>
          <div className="text-2xl font-black text-primary tabular-nums">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function OverviewTab({ user }) {
  const totalAppliedAmount = user.applications?.reduce((s, a) => s + (a.amount || 0), 0) || 0;
  const totalInvoiced = user.invoices?.reduce((s, i) => s + (i.total || 0), 0) || 0;
  const recent = [...(user.applications || []).slice(0, 3), ...(user.invoices || []).slice(0, 3)]
    .sort((a, b) => new Date(b.createdAt || b.issuedAt) - new Date(a.createdAt || a.issuedAt))
    .slice(0, 5);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">Volumétrie</div>
        <dl className="space-y-3">
          <Row label="Montant total demandé" value={fmtEUR(totalAppliedAmount)} />
          <Row label="Montant total facturé" value={fmtEUR(totalInvoiced)} />
          <Row label="Code parrainage" value={user.referralCode || '—'} mono />
          <Row label="Auth0 ID" value={user.auth0Id || '—'} mono small />
        </dl>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">Activité récente</div>
        <ul className="space-y-2">
          {recent.length === 0 && <li className="text-sm text-gray-400">Aucune activité.</li>}
          {recent.map((item) => {
            const isApp = !!item.productType;
            return (
              <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <i className={`fa-solid ${isApp ? 'fa-file-lines text-indigo-500' : 'fa-file-invoice text-emerald-500'} text-xs`}></i>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary truncate">
                      {isApp ? item.productType : `Facture ${item.number}`}
                    </div>
                    <div className="text-[10px] text-gray-400">{fmtDate(item.createdAt || item.issuedAt)}</div>
                  </div>
                </div>
                <StatusPill status={item.status} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Row({ label, value, mono, small }) {
  return (
    <div className="flex justify-between items-baseline border-b border-gray-50 pb-2">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className={`font-semibold text-primary ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-sm'} truncate ml-3 max-w-[60%] text-right`}>{value}</dd>
    </div>
  );
}

function ApplicationsTab({ user }) {
  if (!user.applications?.length) return <Empty icon="fa-file-lines" label="Aucun dossier" />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400">
          <th className="py-3">Produit</th><th>Société</th><th>Montant</th><th>Durée</th><th>Statut</th><th>Créé le</th><th></th>
        </tr>
      </thead>
      <tbody>
        {user.applications.map((a) => (
          <tr key={a.id} className="border-b border-gray-50">
            <td className="py-3 font-semibold text-primary">{a.productType}</td>
            <td className="text-gray-600">{a.companyName || '—'}</td>
            <td className="font-semibold tabular-nums">{fmtEUR(a.amount)}</td>
            <td className="text-gray-500">{a.duration ? `${a.duration} mois` : '—'}</td>
            <td><StatusPill status={a.status} /></td>
            <td className="text-gray-400 text-xs">{fmtDate(a.createdAt)}</td>
            <td className="text-right">
              <Link href={`/admin/demandes`} className="text-secondary text-xs font-bold hover:underline">Voir →</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InvoicesTab({ user }) {
  if (!user.invoices?.length) return <Empty icon="fa-file-invoice" label="Aucune facture" />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400">
          <th className="py-3">Numéro</th><th>Total TTC</th><th>Statut</th><th>Émise le</th><th></th>
        </tr>
      </thead>
      <tbody>
        {user.invoices.map((i) => (
          <tr key={i.id} className="border-b border-gray-50">
            <td className="py-3 font-mono font-semibold text-primary">{i.number}</td>
            <td className="font-semibold tabular-nums">{fmtEUR(i.total)}</td>
            <td><StatusPill status={i.status} /></td>
            <td className="text-gray-400 text-xs">{fmtDate(i.issuedAt)}</td>
            <td className="text-right">
              <Link href={`/admin/factures/${i.id}`} className="text-secondary text-xs font-bold hover:underline">Voir →</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function QuotesTab({ user }) {
  if (!user.quotes?.length) return <Empty icon="fa-file-signature" label="Aucun devis" />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-widest text-gray-400">
          <th className="py-3">Numéro</th><th>Total TTC</th><th>Statut</th><th>Émis le</th>
        </tr>
      </thead>
      <tbody>
        {user.quotes.map((q) => (
          <tr key={q.id} className="border-b border-gray-50">
            <td className="py-3 font-mono font-semibold text-primary">{q.number}</td>
            <td className="font-semibold tabular-nums">{fmtEUR(q.total)}</td>
            <td><StatusPill status={q.status} /></td>
            <td className="text-gray-400 text-xs">{fmtDate(q.issuedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MessagesTab({ user }) {
  if (!user.messages?.length) return <Empty icon="fa-message" label="Aucun message" />;
  return (
    <ul className="space-y-3">
      {user.messages.map((m) => (
        <li key={m.id} className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
              Dossier {m.applicationId?.slice(0, 8) || '—'}
            </span>
            <span className="text-xs text-gray-400">{fmtDate(m.createdAt)}</span>
          </div>
          <p className="text-sm text-primary whitespace-pre-wrap">{m.content}</p>
        </li>
      ))}
    </ul>
  );
}

function Empty({ icon, label }) {
  return (
    <div className="py-12 text-center text-gray-400">
      <i className={`fa-solid ${icon} text-3xl mb-3 block text-gray-200`}></i>
      {label}
    </div>
  );
}
