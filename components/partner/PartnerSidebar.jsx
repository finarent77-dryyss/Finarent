'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/partner', icon: 'fa-chart-pie', label: 'Tableau de bord' },
  { key: 'applications', href: '/partner/applications', icon: 'fa-folder-open', label: 'Dossiers' },
];

export default function PartnerSidebar({ email, partnerName }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-0 pt-20 hidden lg:block">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-primary truncate">{partnerName}</div>
              <div className="text-[10px] text-gray-400 truncate">{email}</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/partner' ? pathname === '/partner' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <a href="/api/auth/logout?returnTo=/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <i className="fa-solid fa-power-off w-5 text-center"></i>
            Déconnexion
          </a>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/partner' ? pathname === '/partner' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all ${isActive ? 'text-purple-600' : 'text-gray-400'}`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              {item.label}
            </Link>
          );
        })}
        <a href="/api/auth/logout?returnTo=/" className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-red-400">
          <i className="fa-solid fa-power-off"></i>
          Quitter
        </a>
      </div>
    </>
  );
}
