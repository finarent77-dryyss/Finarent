'use client';

import { useEffect } from 'react';

/**
 * Active le wash iridescent vibrant sur <body> tant que la home est montée.
 * Retire l'attribut au démontage → tout le reste du site reste blanc.
 * Demande client : design coloré réservé à l'accueil, pages internes en blanc.
 */
export default function HomeBgEffect() {
  useEffect(() => {
    document.body.setAttribute('data-vibrant-bg', '');
    return () => {
      document.body.removeAttribute('data-vibrant-bg');
    };
  }, []);
  return null;
}
