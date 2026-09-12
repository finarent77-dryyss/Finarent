import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { fetchJournalRows } from '@/lib/journal-query';
import { reponseErreurPrisma } from '@/lib/reponses-api';

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

  // `fetchJournalRows` interroge trois modèles et fusionne leurs résultats :
  // une erreur sur l'un d'eux faisait tomber toute la requête en 500 nu, sans
  // rien dire de la cause. L'écran affichait « une erreur est survenue » et le
  // diagnostic demandait de lire les journaux du serveur. Le reste de l'API a
  // été durci avec `reponseErreurPrisma` ; cette route avait été oubliée.
  try {
    const result = await fetchJournalRows({
      module: searchParams.get('module') || '',
      period: searchParams.get('period') || 'all',
      search: searchParams.get('search') || '',
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 50,
    });

    return NextResponse.json(result);
  } catch (err) {
    return reponseErreurPrisma(err, { contexte: 'GET /api/admin/logs' });
  }
}
