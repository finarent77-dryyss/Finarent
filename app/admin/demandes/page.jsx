import DemandesClient from './DemandesClient';

export const metadata = {
  title: 'Demandes de financement | Admin Finassur',
  description: 'Gérer les demandes de financement',
};

export default function AdminDemandesPage() {
  return (
    <div>
      <DemandesClient />
    </div>
  );
}
