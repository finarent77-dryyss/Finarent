'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import ActiveFileTimeline from './ActiveFileTimeline';

const ACTIVE_STATUSES = ['en_attente', 'documents_manquants', 'en_cours', 'devis_envoye', 'devis_accepte', 'signature_en_attente', 'signe', 'transmis'];

function pickActiveDossier(demandes) {
  if (!demandes || demandes.length === 0) return null;
  const active = demandes.filter((d) => ACTIVE_STATUSES.includes(d.status));
  if (active.length === 0) return null;
  return active.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];
}

// Extrait un nombre depuis "75 000€", "75000", 75000, null, etc.
function parseAmount(amount) {
  if (amount == null) return 0;
  if (typeof amount === 'number') return Number.isFinite(amount) ? amount : 0;
  const cleaned = String(amount).replace(/[^\d.,-]/g, '').replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function computeSavings(demandes) {
  // Estimation simple : pour chaque dossier validé, on chiffre une économie de 100% mensualités
  // déductible (vs amortissement comptable d'un achat) = ~33% IS sur la durée du contrat.
  return demandes
    .filter((d) => ['validee', 'finalise', 'signe', 'transmis'].includes(d.status))
    .reduce((sum, d) => sum + parseAmount(d.amount) * 0.33, 0);
}

const STATUS_COLORS = {
  en_attente: { color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500', icon: 'fa-regular fa-clock' },
  en_cours: { color: 'bg-secondary/10 text-secondary', dot: 'bg-secondary', icon: 'fa-solid fa-magnifying-glass' },
  documents_manquants: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: 'fa-solid fa-file' },
  devis_envoye: { color: 'bg-secondary/10 text-secondary', dot: 'bg-secondary', icon: 'fa-solid fa-file-invoice' },
  devis_accepte: { color: 'bg-accent/10 text-accent', dot: 'bg-accent', icon: 'fa-solid fa-check' },
  signature_en_attente: { color: 'bg-secondary/10 text-secondary', dot: 'bg-secondary', icon: 'fa-solid fa-pen' },
  signe: { color: 'bg-accent/10 text-accent', dot: 'bg-accent', icon: 'fa-solid fa-signature' },
  transmis: { color: 'bg-secondary/10 text-secondary', dot: 'bg-secondary', icon: 'fa-solid fa-paper-plane' },
  validee: { color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', icon: 'fa-solid fa-check-circle' },
  refusee: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: 'fa-solid fa-xmark-circle' },
  finalise: { color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', icon: 'fa-solid fa-flag-checkered' },
};

const STAT_CARDS = [
  { key: 'total', icon: 'fa-folder-open', gradient: 'from-primary to-primary/80', shadow: 'shadow-primary/25' },
  { key: 'pending', icon: 'fa-hourglass-half', gradient: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-500/25' },
  { key: 'active', icon: 'fa-spinner', gradient: 'from-secondary to-secondary/80', shadow: 'shadow-secondary/25' },
  { key: 'completed', icon: 'fa-circle-check', gradient: 'from-accent to-emerald-700', shadow: 'shadow-accent/25' },
];

const QUICK_ACTIONS = [
  { key: 'newRequest', icon: 'fa-plus', href: '/espace/demande', color: 'bg-secondary text-white hover:bg-secondary/90' },
  { key: 'simulate', icon: 'fa-calculator', href: '/simulator', color: 'bg-accent text-white hover:bg-accent/90' },
  { key: 'referral', icon: 'fa-gift', href: '/espace/parrainage', color: 'bg-primary text-white hover:bg-primary/90' },
];

export default function DashboardClient({ user, dbUser, initialDemandes }) {
  const [demandes, setDemandes] = useState(initialDemandes);
  const [uploadingId, setUploadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const { t, locale } = useTranslation();
  const [greeting, setGreeting] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: dbUser.name || '',
    phone: dbUser.phone || '',
    company: dbUser.company || '',
    legalForm: dbUser.legalForm || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentDbUser, setCurrentDbUser] = useState(dbUser);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('espace.greeting.morning'));
    else if (hour < 18) setGreeting(t('espace.greeting.afternoon'));
    else setGreeting(t('espace.greeting.evening'));
  }, [t]);

  const stats = {
    total: demandes.length,
    pending: demandes.filter(d => ['en_attente', 'documents_manquants'].includes(d.status)).length,
    active: demandes.filter(d => ['en_cours', 'devis_envoye', 'devis_accepte', 'signature_en_attente', 'signe', 'transmis'].includes(d.status)).length,
    completed: demandes.filter(d => ['validee', 'finalise'].includes(d.status)).length,
  };

  const filteredDemandes = activeTab === 'all' ? demandes :
    activeTab === 'pending' ? demandes.filter(d => ['en_attente', 'documents_manquants'].includes(d.status)) :
    activeTab === 'active' ? demandes.filter(d => ['en_cours', 'devis_envoye', 'devis_accepte', 'signature_en_attente', 'signe', 'transmis'].includes(d.status)) :
    demandes.filter(d => ['validee', 'finalise', 'refusee'].includes(d.status));

  const completionScore = (() => {
    let score = 30;
    if (currentDbUser.email) score += 20;
    if (currentDbUser.name) score += 10;
    if (currentDbUser.phone) score += 10;
    if (currentDbUser.company) score += 10;
    const hasKbis = demandes.some(d => d.documents?.some(doc => doc.type === 'KBIS'));
    if (hasKbis) score += 20;
    return Math.min(score, 100);
  })();

  const handleFileUpload = async (demandeId, file, type) => {
    if (!file) return;
    setUploadingId(demandeId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', demandeId);
    formData.append('demandeId', demandeId);
    formData.append('type', type);

    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setDemandes(prev => prev.map(d => {
          if (d.id === demandeId) return { ...d, documents: [...(d.documents || []), data.document] };
          return d;
        }));
      } else {
        alert(data.error || t('espace.uploadError'));
      }
    } catch {
      alert(t('espace.technicalError'));
    } finally {
      setUploadingId(null);
    }
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentDbUser(prev => ({ ...prev, ...data }));
        setShowProfileModal(false);
      } else {
        alert(data.error || t('espace.technicalError'));
      }
    } catch {
      alert(t('espace.technicalError'));
    } finally {
      setSavingProfile(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-32 pb-12 sm:pb-20">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="container mx-auto px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary via-accent to-secondary rounded-full blur opacity-40 group-hover:opacity-80 transition duration-500"></div>
                <img
                  src={user.picture || '/finarent-logo.jpg'}
                  alt={user.name}
                  className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-full border-3 border-white shadow-xl object-cover"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-primary tracking-tight">
                  {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent">{user.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-gray-400 font-semibold text-[10px] sm:text-xs tracking-widest uppercase mt-0.5">
                  {t('espace.clientSpace')} • ID #{dbUser.id.slice(-4).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/contact" className="px-5 sm:px-7 py-2.5 sm:py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2">
                <i className="fa-solid fa-plus text-xs"></i>
                {t('espace.newRequest')}
              </Link>
              <Link href="/espace/notifications" className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-slate-50 text-slate-500 rounded-xl hover:bg-secondary/10 hover:text-secondary transition-all shadow-sm border border-slate-100">
                <i className="fa-solid fa-bell"></i>
              </Link>
              <a href="/api/auth/logout?returnTo=/" className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100">
                <i className="fa-solid fa-power-off"></i>
              </a>
            </div>
          </motion.div>

          {/* ── Active File Timeline ── */}
          {(() => {
            const active = pickActiveDossier(demandes);
            return active ? <ActiveFileTimeline dossier={active} dateLocale={dateLocale} /> : null;
          })()}

          {/* ── Stat Cards (Digital Nova style) ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10">
            {STAT_CARDS.map((card, i) => (
              <motion.div
                key={card.key}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white cursor-default overflow-hidden shadow-xl ${card.shadow}`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                    <i className={`fa-solid ${card.icon} text-lg sm:text-xl`}></i>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">{stats[card.key]}</div>
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/70 mt-1">
                    {t(`espace.stats.${card.key}`)}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
            {/* ── Main Content ── */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">

              {/* Quick Start Banner (only if no demandes) */}
              {demandes.length === 0 && (
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-[#0A2540] rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black mb-3 leading-tight">{t('espace.readyToLaunch')}</h2>
                      <p className="text-white/60 mb-6 max-w-md text-sm sm:text-base">{t('espace.readyToLaunchDesc')}</p>
                      <Link href="/simulator" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg">
                        <i className="fa-solid fa-rocket"></i>
                        {t('espace.simulateProject')}
                      </Link>
                    </div>
                    <div className="hidden md:flex w-32 h-32 bg-white/10 rounded-3xl items-center justify-center border border-white/10">
                      <i className="fa-solid fa-file-invoice-dollar text-5xl text-accent/40"></i>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 sm:gap-4">
                {QUICK_ACTIONS.map(action => (
                  <Link
                    key={action.key}
                    href={action.href}
                    className={`${action.color} rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <i className={`fa-solid ${action.icon} text-lg sm:text-2xl mb-1 sm:mb-2 block`}></i>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide block">{t(`espace.actions.${action.key}`)}</span>
                  </Link>
                ))}
              </motion.div>

              {/* Dossiers Section */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <h2 className="text-lg sm:text-xl font-black text-primary flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                      <i className="fa-solid fa-folder-tree"></i>
                    </div>
                    {t('espace.myOngoingFiles')}
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 mb-6 overflow-x-auto">
                  {['all', 'pending', 'active', 'completed'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        activeTab === tab
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {t(`espace.tabs.${tab}`)} ({tab === 'all' ? stats.total : stats[tab]})
                    </button>
                  ))}
                </div>

                {/* Dossier List */}
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredDemandes.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-12 text-center"
                      >
                        <i className="fa-solid fa-inbox text-4xl text-gray-200 mb-3 block"></i>
                        <p className="text-sm text-gray-400 font-medium">{t('espace.noFiles')}</p>
                      </motion.div>
                    ) : filteredDemandes.map(d => (
                      <motion.div
                        key={d.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="group border border-gray-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all hover:border-gray-200 bg-white"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider bg-secondary/5 px-2 py-0.5 rounded">{d.reference}</span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${STATUS_COLORS[d.status]?.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[d.status]?.dot}`}></span>
                                {t(`status.${d.status}`)}
                              </span>
                            </div>
                            <Link href={`/espace/${d.id}`} className="block group/link">
                              <h3 className="font-bold text-primary text-base sm:text-lg group-hover/link:text-secondary transition-colors">{d.equipmentType || d.companyName}</h3>
                            </Link>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">
                              {d.amount && <span className="font-semibold text-primary">{d.amount}</span>}
                              {d.amount && ' • '}
                              {new Date(d.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href={`/espace/${d.id}`} className="px-4 py-2 bg-gray-50 text-primary text-xs font-bold rounded-lg hover:bg-secondary hover:text-white transition-all flex items-center gap-1.5">
                              {t('espace.viewDetail')} <i className="fa-solid fa-arrow-right text-[10px]"></i>
                            </Link>
                            <label className={`cursor-pointer px-4 py-2 bg-gray-50 text-primary text-xs font-bold rounded-lg hover:bg-accent hover:text-white transition-all flex items-center gap-1.5 ${uploadingId === d.id ? 'opacity-50 pointer-events-none' : ''}`}>
                              <i className="fa-solid fa-cloud-arrow-up"></i>
                              {uploadingId === d.id ? '...' : t('espace.upload')}
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(d.id, e.target.files[0], 'autre')}
                                accept=".pdf,.jpg,.jpeg,.png"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Documents progress */}
                        {(() => {
                          const REQUIRED = ['KBIS', 'RIB', 'CNI', 'BILAN'];
                          const provided = new Set((d.documents || []).map((doc) => (doc.type || '').toUpperCase()));
                          const got = REQUIRED.filter((r) => provided.has(r)).length;
                          const pct = (got / REQUIRED.length) * 100;
                          const allDone = got === REQUIRED.length;
                          return (
                            <div className="pt-3 mt-3 border-t border-gray-50">
                              <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                                <span className={allDone ? 'text-emerald-600' : 'text-slate-500'}>
                                  <i className={`fa-solid ${allDone ? 'fa-circle-check' : 'fa-folder-open'} mr-1.5`}></i>
                                  Documents requis : {got}/{REQUIRED.length}
                                </span>
                                {!allDone && (
                                  <span className="text-amber-600">
                                    {REQUIRED.filter((r) => !provided.has(r)).join(' · ')}
                                  </span>
                                )}
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${allDone ? 'bg-emerald-500' : 'bg-secondary'}`}
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Documents list */}
                        {d.documents?.length > 0 && (
                          <div className="pt-3 mt-3 border-t border-gray-50 flex flex-wrap gap-2">
                            {d.documents.map(doc => (
                              <a
                                key={doc.id}
                                href={doc.path}
                                target="_blank"
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs hover:bg-secondary/10 hover:text-secondary transition-all group/doc"
                              >
                                <i className="fa-solid fa-file-pdf text-red-400 group-hover/doc:text-secondary"></i>
                                <span className="font-medium text-gray-600 truncate max-w-[120px]">{doc.originalName}</span>
                                <span className="text-gray-300 text-[10px]">{(doc.fileSize / 1024 / 1024).toFixed(1)}MB</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* ── Sidebar ── */}
            <div className="lg:col-span-4 space-y-6">

              {/* Profile Completion */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base sm:text-lg font-black text-primary">{t('espace.profileSecurity')}</h3>
                  <span className={`text-lg font-black ${completionScore >= 80 ? 'text-accent' : completionScore >= 50 ? 'text-secondary' : 'text-red-500'}`}>
                    {completionScore}%
                  </span>
                </div>

                <div className="h-2.5 w-full bg-gray-100 rounded-full mb-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionScore}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className={`h-full rounded-full ${completionScore >= 80 ? 'bg-gradient-to-r from-accent to-emerald-700' : completionScore >= 50 ? 'bg-gradient-to-r from-secondary to-secondary/70' : 'bg-gradient-to-r from-red-400 to-red-600'}`}
                  ></motion.div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-shield-check"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-primary">{t('espace.identityValidated')}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{t('espace.viaAuth0')}</div>
                    </div>
                    <i className="fa-solid fa-circle-check text-green-500 ml-auto"></i>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${completionScore > 80 ? 'bg-emerald-50 text-accent' : 'bg-secondary/5 text-secondary'}`}>
                      <i className={`fa-solid ${completionScore > 80 ? 'fa-building-circle-check' : 'fa-circle-exclamation'}`}></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-primary">{t('espace.kbisFile')}</div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {completionScore > 80 ? t('espace.documentVerified') : t('espace.actionRequired')}
                      </div>
                    </div>
                    {completionScore > 80 ? (
                      <i className="fa-solid fa-circle-check text-green-500 ml-auto"></i>
                    ) : (
                      <i className="fa-solid fa-circle-exclamation text-secondary ml-auto"></i>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${currentDbUser.phone ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-primary">{t('espace.phoneNumber')}</div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        {currentDbUser.phone || t('espace.notProvided')}
                      </div>
                    </div>
                    {currentDbUser.phone ? (
                      <i className="fa-solid fa-circle-check text-green-500 ml-auto"></i>
                    ) : (
                      <i className="fa-solid fa-circle-plus text-gray-300 ml-auto"></i>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <Link
                    href="/espace/profile"
                    className="flex-1 py-3 bg-gray-50 text-gray-500 font-bold rounded-xl border border-gray-100 hover:border-secondary hover:bg-secondary/5 hover:text-secondary transition-all text-xs uppercase tracking-wider block text-center"
                  >
                    {t('espace.editInfo')}
                  </Link>
                  <Link
                    href="/espace/security"
                    className="flex-1 py-3 bg-secondary/5 text-secondary font-bold rounded-xl border border-secondary/20 hover:bg-secondary hover:text-white transition-all text-xs uppercase tracking-wider block text-center flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-shield-halved text-[10px]"></i>
                    {t('espace.security.title')}
                  </Link>
                </div>
              </motion.div>

              {/* Advisor Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="bg-gradient-to-br from-[#0A2540] to-primary rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white relative shadow-xl overflow-hidden"
              >
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-sm">
                      <i className="fa-solid fa-headset text-2xl text-accent"></i>
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg">{t('espace.dedicatedExpert')}</h3>
                      <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">{t('espace.riskAnalyst')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 mb-6 leading-relaxed italic">
                    &ldquo;{t('espace.expertMessage')}&rdquo;
                  </p>
                  <Link href="/contact" className="w-full py-3 bg-accent hover:bg-accent/80 text-white font-bold rounded-xl transition-all block text-center text-sm shadow-lg">
                    {t('espace.contactAdvisor')}
                  </Link>
                </div>
              </motion.div>

              {/* Recent Activity */}
              {demandes.length > 0 && (
                <motion.div variants={itemVariants} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100">
                  <h3 className="text-base font-black text-primary mb-4">{t('espace.recentActivity')}</h3>
                  <div className="space-y-3">
                    {demandes.slice(0, 4).map(d => (
                      <Link key={d.id} href={`/espace/${d.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${STATUS_COLORS[d.status]?.color}`}>
                          <i className={STATUS_COLORS[d.status]?.icon}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-primary truncate">{d.equipmentType || d.companyName}</div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(d.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        <i className="fa-solid fa-chevron-right text-[10px] text-gray-300"></i>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Économies fiscales estimées */}
              {(() => {
                const savings = computeSavings(demandes);
                if (savings <= 0) return null;
                return (
                  <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                        <i className="fa-solid fa-piggy-bank text-lg"></i>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-primary">Économies estimées</h3>
                        <p className="text-[10px] text-emerald-700/70 uppercase tracking-wider font-bold">Avantage fiscal leasing</p>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-600 tabular-nums">
                      ~{Math.round(savings).toLocaleString('fr-FR')}€
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Estimation basée sur la déductibilité 100% des mensualités vs amortissement comptable d'un achat (taux IS 33%).
                    </p>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-primary">{t('espace.editInfo')}</h3>
                <button onClick={() => setShowProfileModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                  <i className="fa-solid fa-xmark text-gray-400"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t('espace.profile.name')}</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t('espace.profile.phone')}</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="06 12 34 56 78"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t('espace.profile.company')}</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData(p => ({ ...p, company: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">{t('espace.profile.legalForm')}</label>
                  <select
                    value={profileData.legalForm}
                    onChange={(e) => setProfileData(p => ({ ...p, legalForm: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                  >
                    <option value="">{t('espace.profile.selectForm')}</option>
                    <option value="SAS">SAS</option>
                    <option value="SARL">SARL</option>
                    <option value="EURL">EURL</option>
                    <option value="SA">SA</option>
                    <option value="EI">EI</option>
                    <option value="SASU">SASU</option>
                    <option value="SCI">SCI</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  {t('espace.profile.cancel')}
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className="flex-1 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingProfile && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {t('espace.profile.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
