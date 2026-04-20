import { NextResponse } from 'next/server';
import { lookupSiret } from '@/lib/siren';

export async function GET(request, { params }) {
  const { siret } = await params;
  const result = await lookupSiret(siret);
  if (result.error) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
