import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
  try {
    const body = await request.json();
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
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
  }
}
