'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/admin', icon: 'fa-chart-pie', label: 'Tableau de bord' },
  { key: 'demandes', href: '/admin/demandes', icon: 'fa-folder-open', label: 'Demandes' },
  { key: 'users', href: '/admin/users', icon: 'fa-users', label: 'Utilisateurs' },
  { key: 'partners', href: '/admin/partners', icon: 'fa-handshake', label: 'Partenaires' },
  { key: 'offers', href: '/admin/offers', icon: 'fa-file-invoice-dollar', label: 'Offres' },
  { key: 'logs', href: '/admin/logs', icon: 'fa-clock-rotate-left', label: 'Logs d\'activité' },
  { key: 'faq', href: '/admin/faq', icon: 'fa-circle-question', label: 'FAQ' },
  { key: 'testimonials', href: '/admin/testimonials', icon: 'fa-comment-dots', label: 'Témoignages' },
  { key: 'settings', href: '/admin/settings', icon: 'fa-gear', label: 'Paramètres' },
];

export default function AdminSidebar({ email }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 pt-20 hidden lg:block">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-primary truncate">Admin Finassur</div>
            <div className="text-[10px] text-gray-400 truncate">{email}</div>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 space-y-1">
        <a
          href="/api/admin/export?format=csv"
          download
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary hover:bg-secondary/5 transition-all"
        >
          <i className="fa-solid fa-file-csv w-5 text-center"></i>
          Exporter CSV
        </a>
        <a
          href="/api/auth/logout?returnTo=/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <i className="fa-solid fa-power-off w-5 text-center"></i>
          Déconnexion
        </a>
      </div>
    </aside>
  );
}
