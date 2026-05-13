'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/admin', icon: 'fa-chart-pie', label: 'Tableau de bord' },
  { key: 'demandes', href: '/admin/demandes', icon: 'fa-folder-open', label: 'Demandes' },
  { key: 'devis', href: '/admin/devis', icon: 'fa-file-signature', label: 'Devis' },
  { key: 'factures', href: '/admin/factures', icon: 'fa-file-invoice', label: 'Factures' },
  { key: 'offers', href: '/admin/offers', icon: 'fa-file-invoice-dollar', label: 'Offres prêt' },
  { key: 'users', href: '/admin/users', icon: 'fa-users', label: 'Utilisateurs' },
  { key: 'partners', href: '/admin/partners', icon: 'fa-handshake', label: 'Partenaires' },
  { key: 'logs', href: '/admin/logs', icon: 'fa-clock-rotate-left', label: 'Logs d\'activité' },
  { key: 'faq', href: '/admin/faq', icon: 'fa-circle-question', label: 'FAQ' },
  { key: 'testimonials', href: '/admin/testimonials', icon: 'fa-comment-dots', label: 'Témoignages' },
  { key: 'settings', href: '/admin/settings', icon: 'fa-gear', label: 'Paramètres' },
];

export default function AdminSidebar({
  email,
  isOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className={`flex items-center border-b border-gray-100 h-20 shrink-0 ${collapsed ? 'justify-center px-2' : 'px-6 gap-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-primary truncate">Admin Finarent</div>
              <div className="text-[10px] text-gray-400 truncate">{email}</div>
            </div>
          )}
          <div className="flex items-center gap-1">
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors shrink-0"
                title={collapsed ? 'Développer la sidebar' : 'Rétracter la sidebar'}
                aria-label={collapsed ? 'Développer le menu' : 'Rétracter le menu'}
              >
                <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden flex items-center justify-center w-8 h-8 text-gray-400 hover:text-primary p-1"
              aria-label="Fermer le menu"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Nav scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-sm font-medium transition-all ${
                  collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center shrink-0`}></i>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className={`shrink-0 border-t border-slate-100 space-y-1 ${collapsed ? 'p-2' : 'p-3'}`}>
          <a
            href="/api/admin/export?format=csv"
            download
            title={collapsed ? 'Exporter CSV' : undefined}
            className={`flex items-center rounded-xl text-sm font-medium text-secondary hover:bg-secondary/5 transition-all ${
              collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
            }`}
          >
            <i className="fa-solid fa-file-csv w-5 text-center shrink-0"></i>
            {!collapsed && <span>Exporter CSV</span>}
          </a>
          <a
            href="/api/auth/logout?returnTo=/"
            title={collapsed ? 'Déconnexion' : undefined}
            className={`flex items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all ${
              collapsed ? 'justify-center px-0 py-3' : 'gap-3 px-4 py-3'
            }`}
          >
            <i className="fa-solid fa-power-off w-5 text-center shrink-0"></i>
            {!collapsed && <span>Déconnexion</span>}
          </a>
        </div>
      </aside>
    </>
  );
}
