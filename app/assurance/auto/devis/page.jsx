'use client';

import QuoteWizard from '@/components/quote/QuoteWizard';
import { autoConfig } from '@/lib/quote/configs';

export default function AutoDevisPage() {
  return (
    <QuoteWizard
      {...autoConfig}
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
