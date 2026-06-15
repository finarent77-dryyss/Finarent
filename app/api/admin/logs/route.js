import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { fetchJournalRows } from '@/lib/journal-query';

/**
 * GET /api/admin/logs
 * Journal d'activité OWNER unifié : actions admin + audits RGPD + historique
 * des statuts de demandes.
 *
 * Query : ?module=...&period=today|7d|30d|all&search=...&page=1&pageSize=50
 */
export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const result = await fetchJournalRows({
    module: searchParams.get('module') || '',
    period: searchParams.get('period') || 'all',
    search: searchParams.get('search') || '',
    page: Number(searchParams.get('page')) || 1,
    pageSize: Number(searchParams.get('pageSize')) || 50,
  });

  return NextResponse.json(result);
}
