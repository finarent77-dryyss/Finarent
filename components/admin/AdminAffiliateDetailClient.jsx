'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAffiliateDetailClient({ affiliateId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/affiliates/${affiliateId}`);
      if (r.ok) {
        setData(await r.json());
      } else {
        setError('Affilié introuvable');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [affiliateId]);

  const markPaid = async (commissionId) => {
    if (!confirm('Marquer cette commission comme payée ?')) return;
    const r = await fetch(`/api/admin/affiliates/commissions/${commissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID' }),
    });
    if (r.ok) load();
  };

  const toggleActive = async () => {
    await fetch(`/api/admin/affiliates/${affiliateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !data.isActive }),
    });
    load();
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement…</div>;
  if (error || !data) return <div className="p-10 text-center text-red-600">{error}</div>;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const trackingLink = `${baseUrl}/?ref=${data.code}`;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/affiliates" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-3">
          <i className="fa-solid fa-arrow-left"></i>
          Retour aux affiliés
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">{data.name}</h1>
            <div className="text-sm text-gray-500 mt-1">
              {data.email} {data.phone && <span>· {data.phone}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggleActive}
              className={`px-4 py-2 rounded-xl font-bold text-sm ${
                data.isActive
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`fa-solid ${data.isActive ? 'fa-check-circle' : 'fa-circle-pause'} mr-1.5`}></i>
              {data.isActive ? 'Actif' : 'Inactif'}
            </button>
          </div>
        </div>
      </div>

      {/* Tracking link */}
      <div className="bg-gradient-to-br from-secondary/5 to-accent/5 border border-secondary/20 rounded-2xl p-5 mb-6">
        <div className="text-xs uppercase tracking-widest text-secondary font-bold mb-2">Lien de tracking</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <code className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono break-all">
            {trackingLink}
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(trackingLink)}
            className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 text-sm font-bold whitespace-nowrap"
          >
            <i className="fa-solid fa-copy mr-1.5"></i>
            Copier
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Commission : {data.commissionType === 'FIXED'
            ? `${data.commissionValue} € par dossier signé`
            : `${data.commissionValue} % du montant financé`}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Kpi icon="fa-mouse-pointer" label="Clics" value={data.stats.clicks} color="sky" />
        <Kpi icon="fa-user-plus" label="Leads" value={data.stats.prospects} color="violet" />
        <Kpi icon="fa-folder-open" label="Dossiers" value={data.stats.applications} color="emerald" />
        <Kpi icon="fa-hourglass-half" label="À verser" value={`${data.stats.totalPending.toFixed(0)} €`} color="amber" />
        <Kpi icon="fa-check-circle" label="Versé" value={`${data.stats.totalPaid.toFixed(0)} €`} color="green" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: 'fa-chart-line' },
            { id: 'commissions', label: 'Commissions', icon: 'fa-euro-sign' },
            { id: 'leads', label: 'Leads', icon: 'fa-user-plus' },
            { id: 'applications', label: 'Dossiers', icon: 'fa-folder-open' },
            { id: 'clicks', label: 'Clics', icon: 'fa-mouse-pointer' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'text-secondary border-secondary'
                  : 'text-gray-500 border-transparent hover:text-primary'
              }`}
            >
              <i className={`fa-solid ${t.icon} mr-1.5`}></i>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-primary mb-3">Configuration</h3>
            <dl className="text-sm space-y-2">
              <Row label="Code" value={<code className="bg-gray-100 px-1.5 py-0.5 rounded">{data.code}</code>} />
              <Row label="Type commission" value={data.commissionType === 'FIXED' ? 'Montant fixe' : 'Pourcentage'} />
              <Row label="Valeur" value={data.commissionType === 'FIXED' ? `${data.commissionValue} €` : `${data.commissionValue} %`} />
              <Row label="Stats publiques" value={data.publicStatsEnabled ? `Activées` : 'Désactivées'} />
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
            <h3 className="font-bold text-primary mb-3">Taux de conversion</h3>
            <FunnelRow label="Clics → Leads" from={data.stats.clicks} to={data.stats.prospects} />
            <FunnelRow label="Leads → Dossiers" from={data.stats.prospects} to={data.stats.applications} />
            <FunnelRow
              label="Dossiers → Commissions"
              from={data.stats.applications}
              to={data.commissions.filter((c) => c.status !== 'CANCELLED').length}
            />
          </div>
        </div>
      )}

      {activeTab === 'commissions' && (
        <DataTable
          rows={data.commissions}
          empty="Aucune commission. Une commission est calculée automatiquement à la signature d'un dossier."
          columns={[
            { label: 'Date', render: (c) => new Date(c.createdAt).toLocaleDateString('fr-FR') },
            { label: 'Dossier', render: (c) => c.application?.companyName || '—' },
            { label: 'Produit', render: (c) => c.application?.productType || '—' },
            { label: 'Financé', render: (c) => c.application?.amount != null ? `${c.application.amount.toLocaleString()} €` : '—' },
            { label: 'Commission', render: (c) => <strong className="text-primary">{c.amount.toFixed(2)} €</strong> },
            {
              label: 'Statut',
              render: (c) => (
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    c.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-700'
                      : c.status === 'CANCELLED'
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {c.status}
                </span>
              ),
            },
            {
              label: '',
              render: (c) =>
                c.status === 'PENDING' && (
                  <button
                    onClick={() => markPaid(c.id)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Marquer payé
                  </button>
                ),
            },
          ]}
        />
      )}

      {activeTab === 'leads' && (
        <DataTable
          rows={data.recentProspects}
          empty="Aucun lead pour le moment."
          columns={[
            { label: 'Date', render: (p) => new Date(p.createdAt).toLocaleDateString('fr-FR') },
            { label: 'Nom', render: (p) => p.name || '—' },
            { label: 'Email', render: (p) => p.email || '—' },
            { label: 'Société', render: (p) => p.company || '—' },
            { label: 'Statut', render: (p) => p.status },
          ]}
        />
      )}

      {activeTab === 'applications' && (
        <DataTable
          rows={data.recentApplications}
          empty="Aucun dossier pour le moment."
          columns={[
            { label: 'Date', render: (a) => new Date(a.createdAt).toLocaleDateString('fr-FR') },
            { label: 'Société', render: (a) => a.companyName || '—' },
            { label: 'Produit', render: (a) => a.productType },
            { label: 'Montant', render: (a) => a.amount != null ? `${a.amount.toLocaleString()} €` : '—' },
            { label: 'Statut', render: (a) => a.status },
            {
              label: '',
              render: (a) => (
                <Link href={`/admin/demandes/${a.id}`} className="text-xs font-bold text-secondary hover:text-secondary/80">
                  Voir →
                </Link>
              ),
            },
          ]}
        />
      )}

      {activeTab === 'clicks' && (
        <DataTable
          rows={data.recentClicks}
          empty="Aucun clic enregistré."
          columns={[
            { label: 'Date', render: (c) => new Date(c.createdAt).toLocaleString('fr-FR') },
            { label: 'Page', render: (c) => c.landingPath || '—' },
            { label: 'Référent', render: (c) => c.referer || '—' },
          ]}
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
    <div className="flex justify-between items-center py-1">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-primary">{value}</dd>
    </div>
  );
}

function FunnelRow({ label, from, to }) {
  const pct = from > 0 ? (to / from) * 100 : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold text-primary tabular-nums">
          {to} / {from} ({pct.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-secondary to-accent rounded-full"
          style={{ width: `${Math.min(100, pct)}%` }}
        ></div>
      </div>
    </div>
  );
}

function DataTable({ rows, columns, empty }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
        {empty}
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              {columns.map((c, i) => (
                <th key={i} className="text-left px-5 py-3 whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50">
                {columns.map((c, i) => (
                  <td key={i} className="px-5 py-3">{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
