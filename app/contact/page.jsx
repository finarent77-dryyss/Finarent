import { Suspense } from 'react';
import ContactClient from '@/components/pages/ContactClient';

export const metadata = {
  title: 'Contact | Finarent',
  description: 'Contactez Finarent pour une demande de financement ou d\'assurance professionnelle. Réponse sous 48h.',
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 flex justify-center">...</div>}>
      <ContactClient />
    </Suspense>
  );
}
