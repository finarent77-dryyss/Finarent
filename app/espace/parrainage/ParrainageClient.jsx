'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const STATUS_BADGES = {
  PENDING: { bg: 'bg-slate-100 text-slate-700', label: 'En attente' },
  SIGNED_UP: { bg: 'bg-secondary/10 text-secondary', label: 'Inscrit' },
  CONVERTED: { bg: 'bg-emerald-100 text-emerald-800', label: 'Converti' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export default function ParrainageClient({ dbUser }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/espace?ref=${dbUser.referralCode || dbUser.id.slice(-6).toUpperCase()}`
    : '';

  useEffect(() => {
    fetch('/api/referrals').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setReferrals(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refereeEmail: email, refereeName: name }),
      });
      const data = await res.json();
      if (data.id) {
        setReferrals(prev => [data, ...prev]);
        setEmail('');
        setName('');
      }
    } catch {}
    finally { setSending(false); }
  };

  const stats = {
    total: referrals.length,
    signedUp: referrals.filter(r => r.status === 'SIGNED_UP').length,
    converted: referrals.filter(r => r.status === 'CONVERTED').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-32 pb-12 sm:pb-20">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <motion.div variants={itemVariants} className="mb-6">
          <Link href="/espace" className="inline-flex items-center gap-2 text-slate-500 hover:text-secondary font-medium text-sm">
            <i className="fa-solid fa-arrow-left"></i> {t('espace.referral.back') || 'Retour'}
          </Link>
        </motion.div>

        {/* Hero */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white mb-8 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black mb-3">
              <i className="fa-solid fa-gift text-accent mr-2"></i>
              Parrainez et gagnez
            </h1>
            <p className="text-white/60 max-w-lg mb-8">Invitez un professionnel à découvrir Finarent. Quand il souscrit, vous êtes récompensé.</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: 'fa-paper-plane', step: '1', label: 'Invitez' },
                { icon: 'fa-user-plus', step: '2', label: 'Il souscrit' },
                { icon: 'fa-coins', step: '3', label: 'Vous gagnez' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2 border border-white/10">
                    <i className={`fa-solid ${s.icon} text-accent`}></i>
                  </div>
                  <div className="text-xs font-bold text-white/80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Share link */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <i className="fa-solid fa-link text-secondary"></i> Votre lien de parrainage
          </h3>
          <div className="flex items-center gap-2">
            <input readOnly value={referralLink} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 font-mono truncate" />
            <button onClick={handleCopy} className={`px-5 py-3 font-bold rounded-xl text-sm transition-all flex items-center gap-2 ${copied ? 'bg-accent text-white' : 'bg-secondary text-white hover:bg-secondary/90'}`}>
              <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <a href={`mailto:?subject=Découvrez Finarent&body=Je vous recommande Finarent pour vos financements professionnels : ${referralLink}`} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5">
              <i className="fa-solid fa-envelope"></i> Email
            </a>
            <a href={`https://wa.me/?text=Découvrez Finarent pour vos financements : ${referralLink}`} target="_blank" className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5">
              <i className="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          </div>
        </motion.div>

        {/* Invite form */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-100 shadow-sm mb-6">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <i className="fa-solid fa-user-plus text-accent"></i> Inviter par email
          </h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom (optionnel)" className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm sm:w-40" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email du filleul" required className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-secondary focus:outline-none text-sm" />
            <button type="submit" disabled={sending || !email} className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all text-sm disabled:opacity-50 flex items-center gap-2">
              <i className={`fa-solid ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
              {sending ? 'Envoi...' : 'Inviter'}
            </button>
          </form>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Invitations', value: stats.total, color: 'text-primary' },
            { label: 'Inscrits', value: stats.signedUp, color: 'text-secondary' },
            { label: 'Convertis', value: stats.converted, color: 'text-accent' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Referrals list */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-primary mb-4">Mes parrainages</h3>
          {loading ? (
            <div className="py-8 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-secondary"></i></div>
          ) : referrals.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <i className="fa-solid fa-users text-3xl mb-2 block"></i>
              <p className="text-sm">Aucun parrainage pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map(r => {
                const badge = STATUS_BADGES[r.status] || STATUS_BADGES.PENDING;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div>
                      <div className="text-sm font-bold text-primary">{r.refereeName || r.refereeEmail}</div>
                      {r.refereeName && <div className="text-xs text-slate-400">{r.refereeEmail}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.bg}`}>{badge.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
