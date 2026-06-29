'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminAffiliatePayoutsClient() {
  const [data, setData] = useState({ ready: [], payouts: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/affiliates/payouts');
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runPayout = async (affiliateId) => {
    if (!confirm('Créer le versement et générer l\'auto-facture ?')) return;
    setBusy(affiliateId);
    try {
      const r = await fetch('/api/admin/affiliates/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'payout', affiliateId }),
      });
      const res = await r.json();
      if (!r.ok) throw new Error(res.error);
      await load();
      alert(`Versement créé — facture ${res.invoiceNumber}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  };

  const exportSepa = () => {
    window.open('/api/admin/affiliates/sepa', '_blank');
  };

  const exportDas2 = () => {
    const year = new Date().getFullYear();
    window.open(`/api/admin/affiliates/das2?year=${year}`, '_blank');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <Link href="/admin/affiliates" className="text-sm text-gray-500 hover:text-secondary">← Affiliation</Link>
          <h1 className="text-3xl font-black text-primary tracking-tight mt-2">Versements & fiscal</h1>
          <p className="text-sm text-gray-500 mt-1">Validation, SEPA XML, auto-factures et export DAS2.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={exportSepa} className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm">
            Export SEPA
          </button>
          <button type="button" onClick={exportDas2} className="px-4 py-2 border border-gray-200 font-bold rounded-xl text-sm">
            Export DAS2
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b font-bold">Affiliés prêts à verser</div>
        {loading ? (
          <p className="p-8 text-gray-400 text-sm">Chargement…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Nom</th>
                <th className="px-5 py-3">Commissions</th>
                <th className="px-5 py-3">Montant</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.ready.map((a) => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="px-5 py-3 font-mono">{a.code}</td>
                  <td className="px-5 py-3">{a.name}</td>
                  <td className="px-5 py-3">{a.commissionCount}</td>
                  <td className="px-5 py-3 font-bold">{a.totalValidated.toFixed(2)} €</td>
                  <td className="px-5 py-3 text-right">
                    {a.eligible ? (
                      <button
                        type="button"
                        disabled={busy === a.id}
                        onClick={() => runPayout(a.id)}
                        className="text-secondary font-bold hover:underline disabled:opacity-50"
                      >
                        Verser
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">Sous seuil ({a.payoutMinAmount} €)</span>
                    )}
                  </td>
                </tr>
              ))}
              {!data.ready.length && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Aucun affilié éligible.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b font-bold">Historique des versements</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Affilié</th>
              <th className="px-5 py-3">Facture</th>
              <th className="px-5 py-3">Montant TTC</th>
              <th className="px-5 py-3">PDF</th>
            </tr>
          </thead>
          <tbody>
            {data.payouts.map((p) => (
              <tr key={p.id} className="border-b border-gray-50">
                <td className="px-5 py-3">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="px-5 py-3">{p.affiliate.code} — {p.affiliate.legalName || p.affiliate.name}</td>
                <td className="px-5 py-3 font-mono text-xs">{p.invoice?.invoiceNumber || '—'}</td>
                <td className="px-5 py-3">{p.amountTTC?.toFixed(2) ?? p.amount.toFixed(2)} €</td>
                <td className="px-5 py-3">
                  {p.invoice && (
                    <a
                      href={`/api/admin/affiliates/invoices/${p.invoice.id}/pdf`}
                      className="text-secondary font-bold hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Télécharger
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
