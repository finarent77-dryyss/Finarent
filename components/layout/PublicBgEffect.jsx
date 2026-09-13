'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { estEspaceConnecte } from '@/lib/routes-privees';

/**
 * Active le wash iridescent vibrant sur <body> pour toutes les pages publiques.
 * Désactivé sur les espaces clients (sidebars + tableaux de bord) qui restent en blanc.
 */
export default function PublicBgEffect() {
  const pathname = usePathname();
  const isPrivate = estEspaceConnecte(pathname);

  useEffect(() => {
    if (isPrivate) {
      document.body.removeAttribute('data-vibrant-bg');
    } else {
      document.body.setAttribute('data-vibrant-bg', '');
    }
  }, [isPrivate]);

  return null;
}
