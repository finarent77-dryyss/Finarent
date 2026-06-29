'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MANDATE_TEXT, MANDATE_VERSION } from '@/lib/affiliate-mandate.js';

export default function AffiliateOnboardingClient({ code }) {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    fiscalStatus: 'PARTICULIER',
    legalName: '',
    siret: '',
    tvaNumber: '',
    tvaApplicable: false,
    fiscalAddress: '',
    fiscalPostalCode: '',
    fiscalCity: '',
    fiscalCountry: 'France',
    iban: '',
    bic: '',
    payoutHolder: '',
    acceptMandate: false,
  });

  useEffect(() => {
    fetch(`/api/affiliate/${code}/onboarding`)
      .then((r) => r.json())
      .then((d) => {
        if (d.completed) setCompleted(true);
        if (d.affiliate?.legalName) {
          setForm((f) => ({ ...f, legalName: d.affiliate.legalName || '' }));
        }
      })
      .finally(() => setLoading(false));
  }, [code]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const r = await fetch(`/api/affiliate/${code}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setCompleted(true);
      setSuccess('Profil fiscal enregistré. Vous pouvez recevoir vos commissions.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p className="p-8 text-gray-400">Chargement…</p>;

  if (completed) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <i className="fa-solid fa-circle-check text-5xl text-secondary mb-4" />
        <h1 className="text-2xl font-black text-primary">Profil fiscal complet</h1>
        <p className="text-gray-500 mt-2">Vos commissions pourront être versées une fois validées par Finarent.</p>
        <Link href={`/affiliate/${code}`} className="inline-block mt-6 text-secondary font-bold hover:underline">
          Retour à mon espace affilié
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10">
      <Link href={`/affiliate/${code}`} className="text-sm text-gray-500 hover:text-secondary">← Retour</Link>
      <h1 className="text-3xl font-black text-primary mt-4 mb-2">Onboarding fiscal</h1>
      <p className="text-sm text-gray-500 mb-8">
        Obligatoire avant tout versement de commission. Mandat {MANDATE_VERSION}.
      </p>

      <form onSubmit={submit} className="space-y-4 bg-white rounded-2xl border p-6 shadow-sm">
        <label className="block text-sm">
          <span className="font-semibold">Statut fiscal *</span>
          <select
            value={form.fiscalStatus}
            onChange={(e) => setForm({ ...form, fiscalStatus: e.target.value })}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          >
            <option value="PARTICULIER">Particulier</option>
            <option value="MICRO">Micro-entrepreneur</option>
            <option value="SOCIETE">Société</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-semibold">Nom légal *</span>
          <input required value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
        </label>
        {(form.fiscalStatus === 'MICRO' || form.fiscalStatus === 'SOCIETE') && (
          <label className="block text-sm">
            <span className="font-semibold">SIRET</span>
            <input value={form.siret} onChange={(e) => setForm({ ...form, siret: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
          </label>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="font-semibold">IBAN *</span>
            <input required value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">BIC</span>
            <input value={form.bic} onChange={(e) => setForm({ ...form, bic: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-semibold">Adresse fiscale</span>
          <input value={form.fiscalAddress} onChange={(e) => setForm({ ...form, fiscalAddress: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <input placeholder="Code postal" value={form.fiscalPostalCode} onChange={(e) => setForm({ ...form, fiscalPostalCode: e.target.value })} className="border rounded-xl px-3 py-2 text-sm" />
          <input placeholder="Ville" value={form.fiscalCity} onChange={(e) => setForm({ ...form, fiscalCity: e.target.value })} className="border rounded-xl px-3 py-2 text-sm" />
        </div>

        <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto text-xs text-gray-600 whitespace-pre-wrap border">
          {MANDATE_TEXT}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={form.acceptMandate} onChange={(e) => setForm({ ...form, acceptMandate: e.target.checked })} className="mt-1" />
          <span>J&apos;accepte le mandat de facturation ({MANDATE_VERSION})</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <button type="submit" className="w-full py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90">
          Enregistrer mon profil fiscal
        </button>
      </form>
    </div>
  );
}
