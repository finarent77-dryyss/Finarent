'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Routes privées qui gardent un fond blanc sobre (sidebars + dashboards)
const PRIVATE_PREFIXES = ['/admin', '/espace', '/partner', '/insurer'];

/**
 * Active le wash iridescent vibrant sur <body> pour toutes les pages publiques.
 * Désactivé sur les espaces clients (sidebars + tableaux de bord) qui restent en blanc.
 */
export default function PublicBgEffect() {
  const pathname = usePathname();
  const isPrivate = PRIVATE_PREFIXES.some(
    (p) => pathname === p || pathname?.startsWith(p + '/'),
  );

  useEffect(() => {
    if (isPrivate) {
      document.body.removeAttribute('data-vibrant-bg');
    } else {
      document.body.setAttribute('data-vibrant-bg', '');
    }
  }, [isPrivate]);

  return null;
}
