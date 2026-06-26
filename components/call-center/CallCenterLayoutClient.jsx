'use client';

import { useState } from 'react';
import CallCenterSidebar from './CallCenterSidebar';

export default function CallCenterLayoutClient({ children, isManager, userName }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CallCenterSidebar isManager={isManager} isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="md:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            className="md:hidden p-2 rounded-lg bg-gray-100"
            onClick={() => setIsOpen(true)}
            aria-label="Menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <p className="text-sm font-medium text-gray-600 hidden md:block">
            {isManager ? 'Vue responsable' : 'Vue agent'} — {userName || 'Utilisateur'}
          </p>
          <a
            href="/api/auth/logout"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 ml-auto"
          >
            <i className="fa-solid fa-right-from-bracket mr-1" />
            Déconnexion
          </a>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
