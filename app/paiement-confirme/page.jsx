import Link from 'next/link';

export const metadata = {
  title: 'Paiement confirmé — Finarent',
  robots: 'noindex',
};

export default function PaiementConfirmePage({ searchParams }) {
  const ref = searchParams?.ref;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-check text-emerald-600 text-4xl"></i>
        </div>
        <h1 className="text-2xl font-black text-primary mb-3">Paiement reçu !</h1>
        <p className="text-gray-500 mb-2">
          Votre règlement a bien été enregistré.{' '}
          {ref && <span className="font-mono font-bold text-primary">({ref})</span>}
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Vous recevrez une confirmation par e-mail sous peu.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all text-sm"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Retour au site
        </Link>
      </div>
    </div>
  );
}
