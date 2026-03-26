'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/admin', icon: 'fa-chart-pie', label: 'Dashboard' },
  { key: 'demandes', href: '/admin/demandes', icon: 'fa-folder-open', label: 'Demandes' },
  { key: 'users', href: '/admin/users', icon: 'fa-users', label: 'Users' },
  { key: 'partners', href: '/admin/partners', icon: 'fa-handshake', label: 'Partenaires' },
];

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-20 left-4 z-50 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg"
      >
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-bars'}`}></i>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-64 bg-white h-full pt-20 p-4" onClick={(e) => e.stopPropagation()}>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
