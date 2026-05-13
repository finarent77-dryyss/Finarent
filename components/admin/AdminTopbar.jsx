'use client';

import Link from 'next/link';

export default function AdminTopbar({ isOpen, onToggle, email }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-10 h-10 flex items-center justify-center text-primary hover:bg-gray-50 rounded-xl transition-colors"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
      </button>

      <Link href="/admin" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xs">
          A
        </div>
        <span className="text-sm font-black text-primary">Admin Finassur</span>
      </Link>

      <div className="w-10" aria-hidden="true" />
    </div>
  );
}
