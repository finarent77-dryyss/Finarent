import { NextResponse } from 'next/server';
import { lookupSiret } from '@/lib/siren';
import { checkRateLimit } from '@/lib/rateLimit';
import { ipClient } from '@/lib/ip-client';

export async function GET(request, { params }) {
  // Cette route relaie un service externe : sans quota, un tiers peut
  // l'utiliser comme proxy gratuit jusqu'a epuisement de notre quota SIRENE.
  if (!(await checkRateLimit(ipClient(request), { bucket: 'siret', max: 40 })).allowed) {
    return NextResponse.json({ error: 'Trop de recherches. Réessayez plus tard.' }, { status: 429 });
  }

  const { siret } = await params;
  const result = await lookupSiret(siret);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
