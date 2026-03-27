import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
