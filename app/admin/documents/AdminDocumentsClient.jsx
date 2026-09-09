'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const KINDS = [
  { key: '', label: 'Tous' },
  { key: 'FACTURE', label: 'Factures' },
  { key: 'DEVIS', label: 'Devis' },
  { key: 'CONTRAT', label: 'Contrats' },
  { key: 'FACTURE_AFFILIE', label: 'Commissions' },
  { key: 'RECAP_DOSSIER', label: 'Récapitulatifs' },
  { key: 'AUTRE', label: 'Autres' },
];

const KIND_STYLE = {
  FACTURE: { classes: 'bg-blue-100 text-blue-700', icon: 'fa-file-invoice', label: 'Facture' },
  DEVIS: { classes: 'bg-purple-100 text-purple-700', icon: 'fa-file-signature', label: 'Devis' },
  CONTRAT: { classes: 'bg-emerald-100 text-emerald-700', icon: 'fa-file-contract', label: 'Contrat' },
  FACTURE_AFFILIE: { classes: 'bg-amber-100 text-amber-700', icon: 'fa-share-nodes', label: 'Commission' },
  RECAP_DOSSIER: { classes: 'bg-cyan-100 text-cyan-700', icon: 'fa-folder-open', label: 'Récapitulatif' },
  AUTRE: { classes: 'bg-slate-100 text-slate-700', icon: 'fa-file', label: 'Autre' },
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const itemVariants = { hidden: { y: 8, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatTaille(octets) {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
}

export default function AdminDocumentsClient() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kind, setKind] = useState('');
  const [recherche, setRecherche] = useState('');
  const [requete, setRequete] = useState('');

  const charger = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (kind) params.set('kind', kind);
      if (requete) params.set('q', requete);
      const res = await fetch(`/api/admin/documents?${params}`);
      if (!res.ok) throw new Error('Erreur lors du chargement du registre');
      const data = await res.json();
      setDocuments(data.documents || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [kind, requete]);

  useEffect(() => { charger(); }, [charger]);

  const nonTransmis = documents.filter((d) => !d.transmis && d.recipientEmail).length;

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-primary">
          <i className="fa-solid fa-box-archive mr-3 text-secondary"></i>
          Documents émis
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {documents.length} pièce{documents.length > 1 ? 's' : ''} archivée{documents.length > 1 ? 's' : ''}
          {nonTransmis > 0 && ` · ${nonTransmis} non transmise${nonTransmis > 1 ? 's' : ''}`}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-4">
        {KINDS.map((k) => (
          <button
            key={k.key || 'tous'}
            onClick={() => setKind(k.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              kind === k.key ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {k.label}
          </button>
        ))}
      </motion.div>

      <motion.form
        variants={itemVariants}
        onSubmit={(e) => { e.preventDefault(); setRequete(recherche.trim()); }}
        className="flex gap-2 mb-6"
      >
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Numéro de dossier, de facture ou email du destinataire…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
          Rechercher
        </button>
      </motion.form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm mb-4">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">
          <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>Chargement…
        </div>
      ) : documents.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <i className="fa-solid fa-box-open text-3xl mb-3 block"></i>
          <p className="text-sm">Aucun document ne correspond.</p>
          <p className="text-xs mt-1">
            Le registre se remplit dès qu&apos;une facture, un devis ou un contrat est généré.
          </p>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Date</th>
                  <th className="text-left font-semibold px-4 py-3">Type</th>
                  <th className="text-left font-semibold px-4 py-3">Dossier</th>
                  <th className="text-left font-semibold px-4 py-3">Fichier</th>
                  <th className="text-left font-semibold px-4 py-3">Destinataire</th>
                  <th className="text-left font-semibold px-4 py-3">Transmis</th>
                  <th className="text-right font-semibold px-4 py-3">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => {
                  const style = KIND_STYLE[d.kind] || KIND_STYLE.AUTRE;
                  return (
                    <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${style.classes}`}>
                          <i className={`fa-solid ${style.icon}`}></i>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-primary">{d.reference || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-700">{d.fileName}</span>
                        <span className="text-gray-400 text-xs ml-2">{formatTaille(d.fileSize)}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{d.recipientEmail || '—'}</td>
                      <td className="px-4 py-3">
                        {d.transmis ? (
                          <span className="text-emerald-600 text-xs font-semibold" title={formatDate(d.emailSentAt)}>
                            <i className="fa-solid fa-circle-check mr-1"></i>
                            {formatDate(d.emailSentAt)}
                          </span>
                        ) : d.recipientEmail ? (
                          <span className="text-amber-600 text-xs font-semibold">
                            <i className="fa-solid fa-clock mr-1"></i>en attente
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">archivé seul</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={d.urlTelechargement}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                          <i className="fa-solid fa-download"></i>
                          Télécharger
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
