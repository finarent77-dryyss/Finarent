import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_STATUSES = ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REFUSED', 'EXPIRED', 'SIGNED'];

/**
 * GET /api/admin/offers/[id]
 * Détail d'une offre.
 */
export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          documents: true,
        },
      },
      partner: { select: { id: true, name: true, type: true, contactEmail: true } },
    },
  });

  if (!offer) return NextResponse.json({ error: 'Offre introuvable' }, { status: 404 });

  return NextResponse.json(offer);
}

/**
 * PATCH /api/admin/offers/[id]
 * Met à jour le statut ou d'autres champs d'une offre.
 */
export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    data.status = body.status;
    const now = new Date();
    if (body.status === 'SENT' && !body.sentAt) data.sentAt = now;
    if (body.status === 'VIEWED') data.viewedAt = now;
    if (body.status === 'ACCEPTED') data.acceptedAt = now;
    if (body.status === 'SIGNED') data.signedAt = now;
  }
  if (body.conditions !== undefined) data.conditions = body.conditions;
  if (body.partnerId !== undefined) data.partnerId = body.partnerId || null;
  if (body.signatureUrl !== undefined) data.signatureUrl = body.signatureUrl;
  if (body.expiresAt !== undefined) data.expiresAt = new Date(body.expiresAt);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Aucune modification' }, { status: 400 });
  }

  const offer = await prisma.offer.update({
    where: { id },
    data,
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          productType: true,
          amount: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      partner: { select: { id: true, name: true, type: true } },
    },
  });

  return NextResponse.json(offer);
}

/**
 * DELETE /api/admin/offers/[id]
 */
export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  await prisma.offer.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
