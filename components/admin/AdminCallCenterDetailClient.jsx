'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const ROLE_LABELS = {
  MANAGER: { label: 'Manager', cls: 'bg-violet-100 text-violet-700', icon: 'fa-crown' },
  AGENT: { label: 'Agent', cls: 'bg-sky-100 text-sky-700', icon: 'fa-headset' },
};

export default function AdminCallCenterDetailClient({ centerId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/call-centers/${centerId}`);
      if (r.ok) setData(await r.json());
      else setError('Centre introuvable');
    } finally { setLoading(false); }
  }, [centerId]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async () => {
    await fetch(`/api/admin/call-centers/${centerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !data.isActive }),
    });
    load();
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement…</div>;
  if (error || !data) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/call-centers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-3">
          <i className="fa-solid fa-arrow-left"></i>
          Retour aux centres d'appel
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">
              {data.name}
              <span className="ml-3 text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-600 align-middle">
                {data.type === 'INTERNAL' ? 'Interne' : 'Externe'}
              </span>
            </h1>
            <div className="text-sm text-gray-500 mt-1">
              <code className="bg-gray-100 px-1.5 py-0.5 rounded">{data.code}</code>
              {data.email && <span className="ml-2">· {data.email}</span>}
              {data.phone && <span className="ml-2">· {data.phone}</span>}
            </div>
          </div>
          <button
            onClick={toggleActive}
            className={`px-4 py-2 rounded-xl font-bold text-sm ${
              data.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className={`fa-solid ${data.isActive ? 'fa-check-circle' : 'fa-circle-pause'} mr-1.5`}></i>
            {data.isActive ? 'Actif' : 'Inactif'}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Kpi icon="fa-people-group" label="Membres" value={data.stats.members} color="sky" />
        <Kpi icon="fa-folder-open" label="Dossiers" value={data.stats.applications} color="violet" />
        <Kpi icon="fa-phone" label="Interactions" value={data.stats.interactions} color="emerald" />
        <Kpi icon="fa-hourglass-half" label="À verser" value={`${data.stats.totalPending.toFixed(0)} €`} color="amber" />
        <Kpi icon="fa-check-circle" label="Versé" value={`${data.stats.totalPaid.toFixed(0)} €`} color="green" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: 'fa-chart-line' },
            { id: 'members', label: 'Membres', icon: 'fa-people-group' },
            { id: 'applications', label: 'Dossiers', icon: 'fa-folder-open' },
            { id: 'interactions', label: 'Interactions', icon: 'fa-phone' },
            { id: 'commissions', label: 'Commissions', icon: 'fa-euro-sign' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === t.id ? 'text-secondary border-secondary' : 'text-gray-500 border-transparent hover:text-primary'
              }`}
            >
              <i className={`fa-solid ${t.icon} mr-1.5`}></i>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-primary mb-3">Configuration</h3>
            <dl className="text-sm space-y-2">
              <Row label="Type" value={data.type === 'INTERNAL' ? 'Interne Finarent' : 'Externe (partenaire)'} />
              <Row label="Commission" value={`${data.commissionValue} ${data.commissionType === 'PERCENT' ? '%' : '€/dossier'}`} />
              <Row label="Adresse" value={data.address || '—'} />
              <Row label="IBAN" value={data.iban ? `${data.iban.slice(0, 4)}…${data.iban.slice(-4)}` : '—'} />
              <Row label="Créé le" value={new Date(data.createdAt).toLocaleDateString('fr-FR')} />
            </dl>
            {data.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase mb-1">Notes</div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-primary mb-3">Aperçu équipe</h3>
            {data.members.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun membre. Ajoutez-en depuis l'onglet Membres.</p>
            ) : (
              <ul className="space-y-2">
                {data.members.slice(0, 5).map((m) => {
                  const r = ROLE_LABELS[m.role];
                  return (
                    <li key={m.id} className="flex items-center justify-between text-sm">
                      <span>
                        <i className={`fa-solid ${r.icon} text-gray-400 mr-2`}></i>
                        {m.user?.name || m.user?.email || m.userId}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${r.cls}`}>{r.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && <MembersTab centerId={centerId} members={data.members} onChange={load} />}
      {activeTab === 'applications' && (
        <DataTable
          rows={data.recentApplications}
          empty="Aucun dossier attribué pour le moment."
          columns={[
            { label: 'Date', render: (a) => new Date(a.createdAt).toLocaleDateString('fr-FR') },
            { label: 'Société', render: (a) => a.companyName || '—' },
            { label: 'Produit', render: (a) => a.productType },
            { label: 'Montant', render: (a) => a.amount != null ? `${a.amount.toLocaleString()} €` : '—' },
            { label: 'Statut', render: (a) => a.status },
            { label: '', render: (a) => <Link href={`/admin/demandes/${a.id}`} className="text-xs font-bold text-secondary">Voir →</Link> },
          ]}
        />
      )}
      {activeTab === 'interactions' && (
        <DataTable
          rows={data.recentInteractions}
          empty="Aucune interaction enregistrée."
          columns={[
            { label: 'Date', render: (i) => new Date(i.createdAt).toLocaleString('fr-FR') },
            { label: 'Agent', render: (i) => i.agent?.name || i.agent?.email || '—' },
            { label: 'Canal', render: (i) => <Badge label={i.channel} /> },
            { label: 'Issue', render: (i) => i.outcome || '—' },
            { label: 'Cible', render: (i) => i.prospect?.name || i.application?.companyName || '—' },
            { label: 'Durée', render: (i) => i.durationSec ? `${i.durationSec}s` : '—' },
          ]}
        />
      )}
      {activeTab === 'commissions' && (
        <DataTable
          rows={data.commissions}
          empty="Aucune commission. Une commission est calculée automatiquement à la signature d'un dossier rattaché au centre."
          columns={[
            { label: 'Date', render: (c) => new Date(c.createdAt).toLocaleDateString('fr-FR') },
            { label: 'Dossier', render: (c) => c.application?.companyName || '—' },
            { label: 'Financé', render: (c) => c.application?.amount != null ? `${c.application.amount.toLocaleString()} €` : '—' },
            { label: 'Commission', render: (c) => <strong className="text-primary">{c.amount.toFixed(2)} €</strong> },
            { label: 'Statut', render: (c) => <Badge label={c.status} type={c.status === 'PAID' ? 'green' : c.status === 'CANCELLED' ? 'gray' : 'amber'} /> },
          ]}
        />
      )}
    </div>
  );
}

function MembersTab({ centerId, members, onChange }) {
  const [showAdd, setShowAdd] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [users, setUsers] = useState([]);
  const [newRole, setNewRole] = useState('AGENT');

  useEffect(() => {
    if (!showAdd) return;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/users?search=${encodeURIComponent(searchUsers)}`);
        if (r.ok) {
          const data = await r.json();
          setUsers(data.items || data || []);
        }
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [searchUsers, showAdd]);

  const addMember = async (userId) => {
    const r = await fetch(`/api/admin/call-centers/${centerId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (r.ok) {
      setShowAdd(false);
      setSearchUsers('');
      onChange();
    } else {
      alert('Erreur : ' + ((await r.json()).error || 'inconnue'));
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Retirer ce membre du centre ?')) return;
    const r = await fetch(`/api/admin/call-centers/${centerId}/members?userId=${userId}`, { method: 'DELETE' });
    if (r.ok) onChange();
  };

  const changeRole = async (userId, role) => {
    const r = await fetch(`/api/admin/call-centers/${centerId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    if (r.ok) onChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary/90"
        >
          <i className="fa-solid fa-plus mr-1.5"></i>
          Ajouter un membre
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
          Aucun membre. Cliquez sur "Ajouter un membre" pour commencer.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-5 py-3">Nom</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-center px-5 py-3">Rôle dans le centre</th>
                <th className="text-left px-5 py-3">Rôle global</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => {
                const r = ROLE_LABELS[m.role];
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-primary">{m.user?.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{m.user?.email}</td>
                    <td className="px-5 py-3 text-center">
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.user.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border-0 cursor-pointer ${r.cls}`}
                      >
                        <option value="AGENT">Agent</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{m.user?.role}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => removeMember(m.user.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-bold"
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-black text-primary">Ajouter un membre</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-700">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={searchUsers}
                onChange={(e) => setSearchUsers(e.target.value)}
                placeholder="Rechercher un utilisateur (nom ou email)..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm"
              />
              <div className="flex gap-2 items-center">
                <span className="text-xs font-bold text-gray-600 uppercase">Rôle :</span>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
                  <option value="AGENT">Agent</option>
                  <option value="MANAGER">Manager (1 seul / centre)</option>
                </select>
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl">
                {users.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-400">
                    {searchUsers ? 'Aucun utilisateur trouvé.' : 'Tapez pour rechercher un utilisateur.'}
                  </p>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => addMember(u.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                    >
                      <div className="font-bold text-primary">{u.name || u.email}</div>
                      <div className="text-xs text-gray-400">{u.email} · {u.role}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ icon, label, value, color }) {
  const map = {
    sky: 'bg-sky-50 text-sky-600', violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl ${map[color]} flex items-center justify-center mb-2`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black text-primary tabular-nums">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-primary">{value}</dd>
    </div>
  );
}

function Badge({ label, type }) {
  const map = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[type] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

function DataTable({ rows, columns, empty }) {
  if (!rows || rows.length === 0) {
    return <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">{empty}</div>;
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>{columns.map((c, i) => <th key={i} className="text-left px-5 py-3 whitespace-nowrap">{c.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50">
                {columns.map((c, i) => <td key={i} className="px-5 py-3">{c.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
