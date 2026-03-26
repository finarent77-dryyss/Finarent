'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800',
  REVIEWING: 'bg-blue-100 text-blue-800',
  DOCUMENTS_NEEDED: 'bg-orange-100 text-orange-800',
  QUOTE_SENT: 'bg-cyan-100 text-cyan-800',
  QUOTE_ACCEPTED: 'bg-indigo-100 text-indigo-800',
  PENDING_SIGNATURE: 'bg-purple-100 text-purple-800',
  SIGNED: 'bg-teal-100 text-teal-800',
  TRANSMITTED: 'bg-sky-100 text-sky-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

export default function PartnerApplicationsClient() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/partner/applications')
      .then(r => r.json())
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (a.companyName || '').toLowerCase().includes(s) ||
           (a.user?.company || '').toLowerCase().includes(s) ||
           (a.equipmentType || '').toLowerCase().includes(s);
  });

  if (loading) {
    return <div className="flex justify-center py-20"><i className="fa-solid fa-spinner fa-spin text-4xl text-purple-500"></i></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black text-primary">Dossiers</h1>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 w-full sm:w-64"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[a.status]}`}>
                    {STATUS_TO_LEGACY[a.status] || a.status}
                  </span>
                  <span className="text-xs text-gray-400">{a.productType}</span>
                </div>
                <h3 className="font-bold text-primary text-lg">{a.companyName || a.equipmentType || '-'}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {a.user?.name && <span>{a.user.name} • </span>}
                  {a.user?.email}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-primary">{a.amount ? `${a.amount.toLocaleString()}€` : '-'}</div>
                <div className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>

            {/* Documents */}
            {a.documents?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                {a.documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs hover:bg-purple-50 hover:text-purple-600 transition-all"
                  >
                    <i className="fa-solid fa-file-pdf text-red-400"></i>
                    <span className="font-medium truncate max-w-[120px]">{doc.fileName}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <i className="fa-solid fa-inbox text-4xl mb-3 block"></i>
            <p>Aucun dossier trouvé</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
