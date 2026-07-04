import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip).allowed) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
    }

    // Honeypot : champ invisible rempli = bot → succès silencieux
    if (body?.website) {
      return NextResponse.json({ success: true, message: 'Inscription réussie' });
    }

    const email = body?.email?.trim()?.toLowerCase();

    if (!email || email.length > 254) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    // Regex stricte : lettres/chiffres/. + - _ ; pas de < > pour éviter HTML injection
    if (!/^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Déjà inscrit' });
    }

    await prisma.newsletter.create({ data: { email } });
    return NextResponse.json({ success: true, message: 'Inscription réussie' });
  } catch (err) {
    console.error('Newsletter error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
