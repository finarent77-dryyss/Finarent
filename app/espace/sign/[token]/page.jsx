import SignClient from './SignClient';

export const metadata = {
  title: 'Signature du contrat | Finarent',
  robots: { index: false, follow: false },
};

export default async function SignPage({ params }) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
        <header className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent mb-2">
            Signature électronique
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Signature de votre contrat
          </h1>
        </header>
        <SignClient token={token} />
      </div>
    </main>
  );
}
