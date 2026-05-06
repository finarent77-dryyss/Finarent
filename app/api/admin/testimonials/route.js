import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function deriveInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all';
  const where = {};
  if (filter === 'pending') Object.assign(where, { isApproved: false, rejectedAt: null });
  else if (filter === 'approved') Object.assign(where, { isApproved: true });
  else if (filter === 'rejected') Object.assign(where, { rejectedAt: { not: null } });
  else if (filter === 'published') Object.assign(where, { isPublished: true });

  const list = await prisma.testimonial.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const counts = await prisma.testimonial.groupBy({
    by: ['isApproved', 'isPublished'],
    _count: { id: true },
  });

  return NextResponse.json({ items: list, counts });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  if (!body.authorName || !body.text) {
    return NextResponse.json({ error: 'Nom et texte requis' }, { status: 400 });
  }

  const t = await prisma.testimonial.create({
    data: {
      authorName: body.authorName,
      initials: body.initials || deriveInitials(body.authorName),
      position: body.position || null,
      company: body.company || null,
      sector: body.sector || null,
      rating: Math.max(1, Math.min(5, parseInt(body.rating, 10) || 5)),
      text: body.text,
      amount: body.amount || null,
      isPublished: !!body.isPublished,
      isApproved: !!body.isApproved,
      approvedAt: body.isApproved ? new Date() : null,
    },
  });
  return NextResponse.json(t);
}
