'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

const COLLAPSED_KEY = 'finassur:admin:sidebarCollapsed';

export default function AdminLayoutClient({ email, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Restore collapse preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored === '1') setCollapsed(true);
    } catch {}
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminSidebar
        email={email}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      <AdminTopbar isOpen={isOpen} onToggle={() => setIsOpen((v) => !v)} email={email} />

      <main
        className={`pt-20 lg:pt-8 pb-12 px-4 sm:px-6 lg:px-8 transition-[margin-left] duration-300 ease-in-out ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
