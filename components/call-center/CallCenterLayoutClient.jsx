'use client';

import { useState } from 'react';
import CallCenterSidebar from './CallCenterSidebar';

export default function CallCenterLayoutClient({ children, isManager, userName }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <CallCenterSidebar isManager={isManager} isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <div className="lg:ml-64 min-h-screen flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg bg-gray-100"
            onClick={() => setIsOpen(true)}
            aria-label="Menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <p className="text-sm font-medium text-gray-600 hidden sm:block truncate min-w-0">
            {isManager ? 'Vue responsable' : 'Vue agent'} — {userName || 'Utilisateur'}
          </p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Auth0 : /api/auth/* exige une navigation complète. Un <Link> ferait une navigation côté client et la connexion échouerait silencieusement. */}
          <a
            href="/api/auth/logout"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 ml-auto shrink-0 whitespace-nowrap"
          >
            <i className="fa-solid fa-right-from-bracket mr-1" />
            Déconnexion
          </a>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full min-w-0 mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
