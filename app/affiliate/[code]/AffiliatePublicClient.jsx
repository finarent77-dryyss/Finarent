'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PageTransition from '@/components/animations/PageTransition';

export default function AffiliatePublicClient({ code }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/affiliate/${code}/stats`)
      .then(async (r) => {
        if (r.ok) {
          setData(await r.json());
        } else {
          setError('Stats non disponibles');
        }
      })
      .catch(() => setError('Erreur réseau'))
      .finally(() => setLoading(false));
  }, [code]);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://finarent.fr';
  const trackingLink = `${baseUrl}/?ref=${code}`;

  const copy = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-secondary"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <i className="fa-solid fa-circle-exclamation text-5xl text-gray-300 mb-4"></i>
          <h1 className="text-2xl font-black text-primary mb-2">Page non disponible</h1>
          <p className="text-gray-500 mb-6">
            Ce code d'affiliation n'existe pas ou les statistiques publiques sont désactivées.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-4">
              <span className="text-secondary font-semibold text-xs uppercase tracking-widest">
                Espace apporteur d'affaires
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-primary mb-3 tracking-tight">
              Bonjour <span className="gradient-text">{data.name}</span>
            </h1>
            <p className="text-sm text-gray-500">
              Apporteur d'affaires Finarent depuis {new Date(data.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Lien d'affiliation */}
          <div className="bg-gradient-to-br from-secondary/5 to-accent/5 border border-secondary/20 rounded-3xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <i className="fa-solid fa-link text-secondary"></i>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">Votre lien de tracking</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <code className="flex-1 bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono break-all">
                {trackingLink}
              </code>
              <button
                type="button"
                onClick={copy}
                className="px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-bold text-sm whitespace-nowrap transition-colors"
              >
                <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'} mr-1.5`}></i>
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              Partagez ce lien : chaque visiteur qui clique est suivi pendant 90 jours. Toute demande
              déposée dans ce délai est attribuée à votre compte et génère une commission de{' '}
              <strong className="text-primary">
                {data.commission.type === 'FIXED'
                  ? `${data.commission.value} € par dossier signé`
                  : `${data.commission.value} % du montant financé`}
              </strong>.
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <PublicKpi icon="fa-mouse-pointer" label="Clics" value={data.stats.clicks} color="sky" />
            <PublicKpi icon="fa-user-plus" label="Leads générés" value={data.stats.leads} color="violet" />
            <PublicKpi icon="fa-folder-open" label="Dossiers" value={data.stats.applications} color="emerald" />
            <PublicKpi
              icon="fa-euro-sign"
              label="Gains totaux"
              value={`${data.stats.totalEarnings.toFixed(0)} €`}
              color="amber"
            />
          </div>

          {/* Funnel */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-8 shadow-sm">
            <h2 className="font-bold text-primary mb-4">Votre tunnel de conversion</h2>
            <Funnel label="Clics → Leads" from={data.stats.clicks} to={data.stats.leads} />
            <Funnel label="Leads → Dossiers" from={data.stats.leads} to={data.stats.applications} />
            <Funnel
              label="Dossiers → Commissions"
              from={data.stats.applications}
              to={data.stats.commissionsPending + data.stats.commissionsPaid}
            />
          </div>

          {/* Commissions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-hourglass-half text-amber-600"></i>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">À verser</span>
              </div>
              <div className="text-3xl font-black text-primary tabular-nums">
                {(data.stats.totalEarnings - data.stats.paidAmount).toFixed(0)} €
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data.stats.commissionsPending} commission{data.stats.commissionsPending > 1 ? 's' : ''} en attente
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-circle-check text-emerald-600"></i>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Déjà versé</span>
              </div>
              <div className="text-3xl font-black text-primary tabular-nums">
                {data.stats.paidAmount.toFixed(0)} €
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {data.stats.commissionsPaid} commission{data.stats.commissionsPaid > 1 ? 's' : ''} payée{data.stats.commissionsPaid > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Form invitation */}
          <InviteForm code={code} affiliateName={data.name} />

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center leading-relaxed mt-8">
            <i className="fa-solid fa-shield-halved mr-1"></i>
            Cette page est accessible via votre code unique. Les statistiques sont anonymisées et
            n'exposent aucune donnée personnelle de prospect.
            Pour toute question, contactez <a className="underline" href="mailto:contact@finarent.fr">contact@finarent.fr</a>.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}

const SESSION_LIMIT = 5;
const SESSION_KEY = 'finarent_affiliate_invites';

function InviteForm({ code, affiliateName }) {
  const [form, setForm] = useState({ email: '', name: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [count, setCount] = useState(0);

  useState(() => {
    if (typeof window === 'undefined') return;
    setCount(parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10));
  });

  const submit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const sent = parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);
    if (sent >= SESSION_LIMIT) {
      setFeedback({ type: 'error', text: `Limite de ${SESSION_LIMIT} invitations par session atteinte. Reconnectez-vous plus tard.` });
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch(`/api/affiliate/${code}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: form.email,
          recipientName: form.name || undefined,
          message: form.message || undefined,
        }),
      });
      const data = await r.json();
      if (r.ok) {
        const next = sent + 1;
        sessionStorage.setItem(SESSION_KEY, String(next));
        setCount(next);
        setFeedback({ type: data.skipped ? 'info' : 'success', text: data.message });
        setForm({ email: '', name: '', message: '' });
      } else {
        setFeedback({ type: 'error', text: data.error || "Échec d'envoi" });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Erreur réseau' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <div>
          <h2 className="font-bold text-primary text-xl">Inviter un prospect par email</h2>
          <p className="text-sm text-gray-500 mt-1">
            L'email part en votre nom avec votre lien de tracking auto-injecté. Réponses dirigées vers Finarent.
          </p>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {count} / {SESSION_LIMIT} envoyés cette session
        </div>
      </div>

      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 mt-5">
        <label className="block">
          <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email destinataire *</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="dirigeant@entreprise.fr"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Prénom (optionnel)</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Marie"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Message personnel (optionnel)</span>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={`Hello, je travaille avec Finarent pour mon financement pro et c'est top, je te partage le lien.`}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-secondary focus:outline-none"
          />
          <span className="text-[10px] text-gray-400 mt-1 block">{form.message.length}/500</span>
        </label>

        {feedback && (
          <div
            className={`sm:col-span-2 text-sm p-3 rounded-xl ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : feedback.type === 'info'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <i className={`fa-solid ${
              feedback.type === 'success' ? 'fa-check-circle' :
              feedback.type === 'info' ? 'fa-circle-info' : 'fa-circle-exclamation'
            } mr-2`}></i>
            {feedback.text}
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || count >= SESSION_LIMIT}
            className="px-6 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            {submitting ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Envoi en cours…</>
            ) : (
              <><i className="fa-solid fa-paper-plane mr-2"></i>Envoyer l'invitation</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function PublicKpi({ icon, label, value, color }) {
  const map = {
    sky: 'bg-sky-50 text-sky-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${map[color]} flex items-center justify-center mb-3`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-black text-primary tabular-nums">{value}</div>
    </div>
  );
}

function Funnel({ label, from, to }) {
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
