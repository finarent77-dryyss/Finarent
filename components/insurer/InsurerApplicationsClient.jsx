'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STATUS_COLORS = {
  PENDING: 'bg-slate-100 text-slate-700',
  REVIEWING: 'bg-secondary/10 text-secondary',
  QUOTE_SENT: 'bg-secondary/10 text-secondary',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

const INSURER_STATUSES = [
  { value: 'REVIEWING', label: 'En étude', color: 'bg-secondary' },
  { value: 'QUOTE_SENT', label: 'Devis envoyé', color: 'bg-secondary' },
  { value: 'APPROVED', label: 'Approuvé', color: 'bg-green-500' },
  { value: 'REJECTED', label: 'Refusé', color: 'bg-red-500' },
];

export default function InsurerApplicationsClient() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetch('/api/insurer/applications')
      .then(r => r.json())
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await fetch('/api/insurer/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    } catch {
      alert('Erreur lors de la mise à jour');
    } finally { setUpdating(null); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><i className="fa-solid fa-spinner fa-spin text-4xl text-accent"></i></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-black text-primary mb-6">Dossiers d'assurance</h1>

      <div className="space-y-4">
        {applications.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}>
                    {STATUS_TO_LEGACY[a.status] || a.status}
                  </span>
                </div>
                <h3 className="font-bold text-primary text-lg">{a.companyName || a.equipmentType || '-'}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {a.user?.name && <span>{a.user.name} • </span>}
                  {a.user?.email}
                  {a.user?.company && <span> • {a.user.company}</span>}
                </div>
                {a.description && (
                  <p className="text-sm text-gray-400 mt-2 italic">{a.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-primary">{a.amount ? `${a.amount.toLocaleString()}€` : '-'}</div>
                <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</div>
                {a.siren && <div className="text-xs text-gray-300 mt-1">SIREN: {a.siren}</div>}
              </div>
            </div>

            {/* Documents */}
            {a.documents?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {a.documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs hover:bg-accent/5 hover:text-accent transition-all"
                  >
                    <i className="fa-solid fa-file-pdf text-red-400"></i>
                    <span className="font-medium truncate max-w-[120px]">{doc.fileName}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-gray-50">
              <span className="text-xs font-bold text-gray-400 uppercase block mb-2">Changer le statut :</span>
              <div className="flex flex-wrap gap-2">
                {INSURER_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => updateStatus(a.id, s.value)}
                    disabled={updating === a.id || a.status === s.value}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      a.status === s.value
                        ? 'bg-accent text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <i className="fa-solid fa-shield-halved text-4xl mb-3 block"></i>
            <p>Aucune demande d'assurance pour le moment</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
