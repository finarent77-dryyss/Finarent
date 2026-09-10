import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';
import { ipClient } from '@/lib/ip-client';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

const BAD_WORDS = ['putain', 'merde', 'connard', 'salope', 'fuck', 'shit', 'asshole'];

function sanitize(s) {
  return String(s || '').trim().replace(/<[^>]*>/g, '');
}

function deriveInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export async function GET() {
  try {
    const list = await prisma.testimonial.findMany({
      where: { isPublished: true, isApproved: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        initials: true,
        position: true,
        company: true,
        sector: true,
        rating: true,
        text: true,
        amount: true,
      },
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  // Dépôt public : rare par nature, quota serré pour éviter le flood.
  if (!(await checkRateLimit(ipClient(request), { bucket: 'temoignages', max: 5 })).allowed) {
    return NextResponse.json({ error: 'Trop de dépôts. Réessayez plus tard.' }, { status: 429 });
  }

  // Corps vide ou JSON malformé : 400, pas le 500 que produisait le catch
  // générique quand `request.json()` levait.
  const body = await lireCorpsJson(request);
  if (!body) {
    return reponseCorpsInvalide('Corps de requête JSON absent ou invalide.');
  }

  try {
    const authorName = sanitize(body.authorName);
    const text = sanitize(body.text);

    if (!authorName || !text) {
      return NextResponse.json({ error: 'Nom et témoignage requis' }, { status: 400 });
    }
    if (text.length < 30 || text.length > 1000) {
      return NextResponse.json({ error: 'Le témoignage doit faire entre 30 et 1000 caractères' }, { status: 400 });
    }
    const lower = `${text} ${authorName}`.toLowerCase();
    if (BAD_WORDS.some((w) => lower.includes(w))) {
      return NextResponse.json({ error: 'Contenu inapproprié détecté' }, { status: 400 });
    }
    const rating = Math.max(1, Math.min(5, parseInt(body.rating, 10) || 5));

    const t = await prisma.testimonial.create({
      data: {
        authorName,
        initials: sanitize(body.initials) || deriveInitials(authorName),
        position: sanitize(body.position) || null,
        company: sanitize(body.company) || null,
        sector: sanitize(body.sector) || null,
        rating,
        text,
        amount: sanitize(body.amount) || null,
        isPublished: false,
        isApproved: false,
      },
    });

    return NextResponse.json({ id: t.id, success: true, message: 'Témoignage envoyé pour modération' });
  } catch (e) {
    return reponseErreurPrisma(e, { contexte: 'POST /api/testimonials' });
  }
}
