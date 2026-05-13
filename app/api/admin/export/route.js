import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const escapeCSV = (value) => {
    if (value == null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = applications.map((app) => [
    app.id.slice(-8).toUpperCase(),
    escapeCSV(app.companyName || ''),
    escapeCSV(app.user?.name || ''),
    escapeCSV(app.user?.email || ''),
    app.amount != null ? app.amount : '',
    STATUS_LABELS[app.status] || app.status,
    new Date(app.createdAt).toLocaleDateString('fr-FR'),
    app.productType || '',
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="finarent-export.csv"',
    },
  });
}
