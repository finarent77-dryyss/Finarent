'use client';

import QuoteWizard from '@/components/quote/QuoteWizard';
import {
  autoConfig,
  motoConfig,
  habitationConfig,
  santeConfig,
  rcProConfig,
} from '@/lib/quote/configs';

/**
 * Enveloppe client des 5 tunnels de devis assurance (auto, moto, habitation,
 * santé, RC Pro).
 *
 * Elle existe pour que les pages `app/assurance/<produit>/devis/page.jsx`
 * restent des composants serveur : une page `'use client'` ne peut pas exporter
 * `metadata`, et les cinq tunnels héritaient de ce fait du titre générique du
 * site (constat PAGE-05). L'envoi vers /api/quote-requests, jusqu'ici recopié
 * à l'identique dans les cinq pages, est centralisé ici.
 *
 * On reçoit un identifiant de produit, jamais la configuration elle-même : les
 * étapes portent des fonctions `validate`, qui ne peuvent pas franchir la
 * frontière serveur → client (« Functions cannot be passed directly to Client
 * Components »). La correspondance se fait donc côté client.
 */
const CONFIGS = {
  auto: autoConfig,
  moto: motoConfig,
  habitation: habitationConfig,
  sante: santeConfig,
  'rc-pro': rcProConfig,
};

export default function QuoteWizardPage({ product }) {
  const config = CONFIGS[product];
  if (!config) return null;

  return (
    <QuoteWizard
      {...config}
      onSubmit={async (values) => {
        const res = await fetch('/api/quote-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error('Erreur lors de l\'envoi. Réessayez ou contactez-nous.');
      }}
    />
  );
}
