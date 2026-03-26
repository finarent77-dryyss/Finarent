'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

const STATUS_COLORS = {
  en_attente: { color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500', icon: 'fa-regular fa-clock' },
  en_cours: { color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500', icon: 'fa-solid fa-magnifying-glass' },
  documents_manquants: { color: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', icon: 'fa-solid fa-file' },
  devis_envoye: { color: 'bg-cyan-100 text-cyan-800', dot: 'bg-cyan-500', icon: 'fa-solid fa-file-invoice' },
  devis_accepte: { color: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500', icon: 'fa-solid fa-check' },
  signature_en_attente: { color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500', icon: 'fa-solid fa-pen' },
  signe: { color: 'bg-teal-100 text-teal-800', dot: 'bg-teal-500', icon: 'fa-solid fa-signature' },
  transmis: { color: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500', icon: 'fa-solid fa-paper-plane' },
  validee: { color: 'bg-green-100 text-green-800', dot: 'bg-green-500', icon: 'fa-solid fa-check-circle' },
  refusee: { color: 'bg-red-100 text-red-800', dot: 'bg-red-500', icon: 'fa-solid fa-xmark-circle' },
  finalise: { color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', icon: 'fa-solid fa-flag-checkered' },
};

const STATUS_ORDER = ['en_attente', 'en_cours', 'documents_manquants', 'devis_envoye', 'devis_accepte', 'signature_en_attente', 'signe', 'transmis', 'validee', 'finalise'];

export default function DossierDetailClient({ dossier, user }) {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState(dossier.documents || []);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const { t, locale } = useTranslation();
  const messagesEndRef = useRef(null);

  const dateLocale = locale === 'fr' ? 'fr-FR' : 'en-US';

  // Load messages
  useEffect(() => {
    fetch(`/api/messages?applicationId=${dossier.id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {});
  }, [dossier.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', dossier.id);
    formData.append('type', type);
    try {
      const res = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setDocuments(prev => [...prev, data.document]);
      else alert(data.error || t('dossierDetail.uploadError'));
    } catch { alert(t('dossierDetail.technicalError')); }
    finally { setUploading(false); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: dossier.id, content: newMessage.trim() }),
      });
      const msg = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
      }
    } catch {}
    finally { setSendingMessage(false); }
  };

  // Determine progress
  const currentStepIndex = STATUS_ORDER.indexOf(dossier.status);
  const isRejected = dossier.status === 'refusee';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-32 pb-12 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/espace" className="inline-flex items-center gap-2 text-gray-500 hover:text-secondary font-medium text-sm transition-colors">
              <i className="fa-solid fa-arrow-left"></i>
              {t('dossierDetail.backToFiles')}
            </Link>
          </div>

          {/* Header Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-mono font-bold text-secondary text-sm bg-secondary/5 px-2 py-0.5 rounded">{dossier.reference}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[dossier.status]?.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[dossier.status]?.dot}`}></span>
                      {t(`status.${dossier.status}`) || dossier.status}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-primary">{dossier.companyName}</h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {t(`productType.${dossier.productType}`) || dossier.productType} • {new Date(dossier.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-secondary">{dossier.amount || '-'}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{t('dossierDetail.requestedAmount')}</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {!isRejected && (
              <div className="px-5 sm:px-8 pb-5">
                <div className="flex items-center gap-1">
                  {STATUS_ORDER.slice(0, -1).map((_, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= currentStepIndex ? 'bg-secondary' : 'bg-gray-100'}`}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-gray-400">Soumis</span>
                  <span className="text-[10px] text-gray-400">Finalisé</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm mb-6">
            {[
              { key: 'info', label: 'Informations', icon: 'fa-circle-info' },
              { key: 'documents', label: `Documents (${documents.length})`, icon: 'fa-file-lines' },
              { key: 'messages', label: `Messages (${messages.length})`, icon: 'fa-comments' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.key ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {/* Info Tab */}
            {activeTab === 'info' && (
              <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dossierDetail.company')}</h3>
                    <p className="font-bold text-primary text-lg">{dossier.companyName}</p>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm text-gray-500"><span className="font-medium text-gray-600">SIREN:</span> {dossier.siren}</p>
                      <p className="text-sm text-gray-500"><span className="font-medium text-gray-600">Secteur:</span> {dossier.sector}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('dossierDetail.contactInfo')}</h3>
                    <p className="font-bold text-primary">{dossier.firstName} {dossier.lastName}</p>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <i className="fa-solid fa-envelope text-gray-300 w-4"></i>{dossier.email}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <i className="fa-solid fa-phone text-gray-300 w-4"></i>{dossier.phone}
                      </p>
                    </div>
                  </div>
                  {dossier.equipmentType && (
                    <div className="sm:col-span-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('dossierDetail.equipment')}</h3>
                      <p className="text-primary font-medium">{dossier.equipmentType}</p>
                    </div>
                  )}
                  {dossier.description && (
                    <div className="sm:col-span-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('dossierDetail.messageLabel')}</h3>
                      <p className="text-gray-600 p-4 bg-gray-50 rounded-xl italic">&ldquo;{dossier.description}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Status history */}
                {dossier.statusHistory?.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Historique des statuts</h3>
                    <div className="space-y-3">
                      {dossier.statusHistory.map((h, i) => (
                        <div key={h.id || i} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${STATUS_COLORS[h.toStatus]?.color || 'bg-gray-100 text-gray-500'}`}>
                            <i className={`${STATUS_COLORS[h.toStatus]?.icon || 'fa-solid fa-circle'} text-xs`}></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary">
                              {t(`status.${h.fromStatus}`)} <i className="fa-solid fa-arrow-right text-[10px] text-gray-300 mx-1"></i> {t(`status.${h.toStatus}`)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(h.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              {h.comment && <span className="ml-2 italic">— {h.comment}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-black text-primary">{t('dossierDetail.documents')} ({documents.length})</h3>
                  <label className={`cursor-pointer px-5 py-2.5 bg-secondary text-white font-bold rounded-xl text-sm hover:bg-secondary/90 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    {uploading ? t('dossierDetail.sending') : t('dossierDetail.addDocument')}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileUpload(e.target.files[0], 'AUTRE')} />
                  </label>
                </div>

                {documents.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {documents.map(doc => (
                      <a key={doc.id} href={doc.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-secondary/5 border border-transparent hover:border-secondary/20 transition-all group">
                        <div className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
                          <i className="fa-solid fa-file-pdf text-lg"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-primary text-sm truncate">{doc.originalName}</p>
                          <p className="text-xs text-gray-400">{doc.type} {doc.fileSize ? `• ${(doc.fileSize / 1024 / 1024).toFixed(1)}MB` : ''}</p>
                        </div>
                        <i className="fa-solid fa-external-link text-gray-300 text-xs"></i>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <i className="fa-solid fa-folder-open text-4xl text-gray-300 mb-3 block"></i>
                    <p className="text-gray-500 font-medium">{t('dossierDetail.noDocumentsYet')}</p>
                    <p className="text-sm text-gray-400 mt-1">{t('dossierDetail.addPieces')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Messages list */}
                <div className="p-5 sm:p-8 max-h-[400px] overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="fa-solid fa-comments text-4xl text-gray-200 mb-3 block"></i>
                      <p className="text-gray-400 text-sm">Aucun message. Commencez la conversation avec votre conseiller.</p>
                    </div>
                  ) : messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-secondary text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                          {!isMe && (
                            <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                              {msg.sender?.name || 'Conseiller'}
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Écrire un message..."
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="px-5 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {sendingMessage ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
