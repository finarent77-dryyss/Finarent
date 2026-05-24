'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/espace', icon: 'fa-folder-open', label: 'Mes demandes', exact: true },
  { href: '/espace/profile', icon: 'fa-user', label: 'Mon profil' },
  { href: '/espace/notifications', icon: 'fa-bell', label: 'Notifications' },
  { href: '/espace/parrainage', icon: 'fa-share-nodes', label: 'Parrainage' },
  { href: '/espace/security', icon: 'fa-shield-halved', label: 'Sécurité' },
];

/**
 * Sidebar fixe à gauche pour la navigation entre les pages de /espace.
 * Cachée sur mobile (Header dropdown couvre).
 */
export default function EspaceSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block fixed left-4 xl:left-8 top-24 w-56 z-10">
      <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
          Mon espace
        </div>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`}
                >
                  <i className={`fa-solid ${item.icon} w-4 text-center`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-gray-100 mt-3 pt-3">
          <a
            href="/api/auth/logout?returnTo=/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket w-4 text-center"></i>
            <span>Se déconnecter</span>
          </a>
        </div>
      </nav>
    </aside>
  );
}
