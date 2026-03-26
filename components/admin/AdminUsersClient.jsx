'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = ['CLIENT', 'ADMIN', 'PARTNER', 'INSURER'];
const ROLE_COLORS = {
  CLIENT: { bg: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  ADMIN: { bg: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
  PARTNER: { bg: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  INSURER: { bg: 'bg-teal-100 text-teal-800', dot: 'bg-teal-500' },
};

const ROLE_ICONS = {
  CLIENT: 'fa-user',
  ADMIN: 'fa-shield-halved',
  PARTNER: 'fa-handshake',
  INSURER: 'fa-building-shield',
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export default function AdminUsersClient() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateRole = async (userId, role) => {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
    } catch {
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u => {
    if (filter !== 'ALL' && u.role !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(s) ||
           (u.email || '').toLowerCase().includes(s) ||
           (u.company || '').toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-secondary"></i>
          <span className="text-sm text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-primary">Utilisateurs</h1>
          <p className="text-sm text-gray-400 mt-1">{users.length} utilisateurs enregistrés</p>
        </div>
        {/* Role stats */}
        <div className="flex gap-2">
          {ROLES.map(role => (
            <div key={role} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${ROLE_COLORS[role].bg}`}>
              <i className={`fa-solid ${ROLE_ICONS[role]} mr-1`}></i>
              {users.filter(u => u.role === role).length}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
            <input
              type="text"
              placeholder="Rechercher par nom, email, entreprise..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
            />
          </div>
          <div className="flex gap-1 bg-gray-50 rounded-xl p-1 overflow-x-auto">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === 'ALL' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Tous ({users.length})
            </button>
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setFilter(role)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === role ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Users list */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-400 uppercase">Utilisateur</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-400 uppercase hidden md:table-cell">Entreprise</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-400 uppercase">Rôle</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-400 uppercase hidden sm:table-cell">Dossiers</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-400 uppercase hidden lg:table-cell">Partenaire</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-gray-400 uppercase hidden md:table-cell">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((u) => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.CLIENT;
                  const initials = (u.name || u.email || '?').slice(0, 2).toUpperCase();
                  return (
                    <motion.tr
                      key={u.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${updatingId === u.id ? 'opacity-50' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${rc.bg}`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-primary truncate">{u.name || '-'}</div>
                            <div className="text-xs text-gray-400 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{u.company || <span className="text-gray-300">-</span>}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                          disabled={updatingId === u.id}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border-0 cursor-pointer ${rc.bg} focus:outline-none focus:ring-2 focus:ring-secondary/20`}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600">
                          {u._count?.applications || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs hidden lg:table-cell">
                        {u.partner?.name || <span className="text-gray-300">-</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs hidden md:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <i className="fa-solid fa-users text-3xl mb-2 block text-gray-200"></i>
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
