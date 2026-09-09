import type { ProductType, ApplicationStatus } from '@prisma/client';

// ─── DATES ────────────────────────────────────────────────
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', options ?? { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysSince(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── MONNAIE ──────────────────────────────────────────────
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── PRODUITS ─────────────────────────────────────────────
export const PRODUCT_LABELS: Record<ProductType, string> = {
  PRET_PRO: 'Prêt Professionnel',
  CREDIT_BAIL: 'Crédit-Bail',
  LOA: 'LOA',
  LLD: 'LLD',
  LEASING_OPS: 'Leasing Opérationnel',
  RC_PRO: 'RC Professionnelle',
};

export const PRODUCT_ICONS: Record<ProductType, string> = {
  PRET_PRO: 'fa-coins',
  CREDIT_BAIL: 'fa-handshake',
  LOA: 'fa-file-contract',
  LLD: 'fa-calendar-days',
  LEASING_OPS: 'fa-rotate',
  RC_PRO: 'fa-shield-check',
};

// ─── STATUTS ──────────────────────────────────────────────
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'Reçu',
  REVIEWING: 'En analyse',
  DOCUMENTS_NEEDED: 'Documents requis',
  QUOTE_SENT: 'Devis envoyé',
  QUOTE_ACCEPTED: 'Devis accepté',
  PENDING_SIGNATURE: 'En attente signature',
  SIGNED: 'Signé',
  TRANSMITTED: 'Transmis',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  COMPLETED: 'Finalisé',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  REVIEWING: 'bg-blue-100 text-blue-800',
  DOCUMENTS_NEEDED: 'bg-orange-100 text-orange-800',
  QUOTE_SENT: 'bg-cyan-100 text-cyan-800',
  QUOTE_ACCEPTED: 'bg-indigo-100 text-indigo-800',
  PENDING_SIGNATURE: 'bg-purple-100 text-purple-800',
  SIGNED: 'bg-teal-100 text-teal-800',
  TRANSMITTED: 'bg-sky-100 text-sky-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

export const STATUS_ICONS: Record<ApplicationStatus, string> = {
  PENDING: 'fa-clock',
  REVIEWING: 'fa-magnifying-glass',
  DOCUMENTS_NEEDED: 'fa-file-circle-exclamation',
  QUOTE_SENT: 'fa-file-invoice',
  QUOTE_ACCEPTED: 'fa-check',
  PENDING_SIGNATURE: 'fa-pen',
  SIGNED: 'fa-signature',
  TRANSMITTED: 'fa-paper-plane',
  APPROVED: 'fa-circle-check',
  REJECTED: 'fa-circle-xmark',
  COMPLETED: 'fa-flag-checkered',
};

// ─── SECTEURS ─────────────────────────────────────────────
export const SECTORS = [
  'BTP & Construction',
  'Médical & Santé',
  'Informatique & Tech',
  'Transport & Logistique',
  'Industrie',
  'Services',
  'Commerce & Retail',
  'Restauration',
  'Agriculture',
  'Autre',
] as const;

export type Sector = (typeof SECTORS)[number];

// ─── SIMULATEUR ───────────────────────────────────────────
// `calculateMonthlyPayment` a été supprimée : sans appelant, elle constituait
// une troisième implémentation concurrente de la mensualité, attendant un taux
// en décimal (0.05) là où le reste du code raisonne en pourcentage (3.5), et
// divisant par zéro sur une durée nulle. La référence unique est
// `monthlyPayment` de lib/simulators/calculations/pret.js.

// ─── RÉFÉRENCES ───────────────────────────────────────────
// `generateReference` a été supprimée : sans appelant, et la numérotation
// réelle des dossiers est produite ailleurs.

// ─── SIREN ────────────────────────────────────────────────
export function formatSiren(siren: string): string {
  return siren.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
}

// ─── FICHIERS ─────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
