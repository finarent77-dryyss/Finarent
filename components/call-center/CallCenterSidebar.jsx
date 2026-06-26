'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/call-center', label: 'Tableau de bord', icon: 'fa-gauge-high', exact: true },
  { href: '/call-center/prospects', label: 'Prospects', icon: 'fa-users' },
  { href: '/call-center/interactions', label: 'Appels & SMS', icon: 'fa-phone-volume' },
];

const MANAGER_NAV = [
  { href: '/call-center/team', label: 'Équipe', icon: 'fa-people-group' },
  { href: '/admin/call-centers', label: 'Admin centres', icon: 'fa-headset' },
];

export default function CallCenterSidebar({ isManager, isOpen, onClose }) {
  const pathname = usePathname();
  const items = isManager ? [...NAV, ...MANAGER_NAV] : NAV;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
          aria-label="Fermer le menu"
        />
      )}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-primary text-white flex flex-col transition-transform md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 border-b border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Finarent</p>
          <p className="text-lg font-black">Centre d&apos;appels</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active ? 'bg-secondary text-white' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-4 text-center`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-white/60">
          <Link href="/admin/centre-appel" className="hover:text-white">File d&apos;appels admin</Link>
        </div>
      </aside>
    </>
  );
}
