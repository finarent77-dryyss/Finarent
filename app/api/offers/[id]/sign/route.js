import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSignatureProcedure } from '@/lib/yousign';

export async function POST(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { application: { include: { user: true } } },
  });

  if (!offer) return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });
  if (offer.application.userId !== auth.dbUser.id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Generate a simple HTML contract
  const contractHtml = `<html><body><h1>Contrat Finarent</h1><p>Offre ${offer.id}</p><p>Montant: ${offer.amount}€</p></body></html>`;
  const buffer = Buffer.from(contractHtml);

  try {
    const result = await createSignatureProcedure({
      documentBuffer: buffer,
      filename: `contrat-${offer.id}.html`,
      signer: {
        firstName: offer.application.user.name?.split(' ')[0],
        lastName: offer.application.user.name?.split(' ').slice(1).join(' '),
        email: offer.application.user.email,
        phone: offer.application.user.phone,
      },
      offerId: offer.id,
    });

    await prisma.offer.update({
      where: { id },
      data: { signatureUrl: result.signUrl, sentAt: new Date() },
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('YouSign error:', err);
    return NextResponse.json({ error: 'Erreur lors de la création de la signature' }, { status: 500 });
  }
}
