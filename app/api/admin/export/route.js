import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ligneCsv } from '@/lib/csv.js';

export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const applications = await prisma.application.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const STATUS_LABELS = {
    PENDING: 'En attente',
    REVIEWING: 'En cours d\'analyse',
    DOCUMENTS_NEEDED: 'Documents manquants',
    QUOTE_SENT: 'Devis envoyé',
    QUOTE_ACCEPTED: 'Devis accepté',
    PENDING_SIGNATURE: 'Signature en attente',
    SIGNED: 'Signé',
    TRANSMITTED: 'Transmis',
    APPROVED: 'Validé',
    REJECTED: 'Refusé',
    COMPLETED: 'Finalisé',
  };

  const headers = ['Référence', 'Entreprise', 'Contact', 'Email', 'Montant', 'Statut', 'Date', 'Type produit'];

  // `companyName` et le nom de l'utilisateur sont des saisies libres : elles
  // passent, comme le reste, par l'échappement centralisé de `lib/csv.js`.
  const rows = applications.map((app) => [
    app.id.slice(-8).toUpperCase(),
    app.companyName || '',
    app.user?.name || '',
    app.user?.email || '',
    app.amount != null ? app.amount : '',
    STATUS_LABELS[app.status] || app.status,
    new Date(app.createdAt).toLocaleDateString('fr-FR'),
    app.productType || '',
  ]);

  const csv = [ligneCsv(headers), ...rows.map((r) => ligneCsv(r))].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="finarent-export.csv"',
    },
  });
}
