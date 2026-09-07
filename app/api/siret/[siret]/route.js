import { NextResponse } from 'next/server';
import { lookupSiret } from '@/lib/siren';
import { checkRateLimit } from '@/lib/rateLimit';

function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'inconnue';
}

export async function GET(request, { params }) {
  // Cette route relaie un service externe : sans quota, un tiers peut
  // l'utiliser comme proxy gratuit jusqu'a epuisement de notre quota SIRENE.
  if (!checkRateLimit(getClientIp(request), { bucket: 'siret', max: 40 }).allowed) {
    return NextResponse.json({ error: 'Trop de recherches. Réessayez plus tard.' }, { status: 429 });
  }

  const { siret } = await params;
  const result = await lookupSiret(siret);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
