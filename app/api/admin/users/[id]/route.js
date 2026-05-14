import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      partner: { select: { id: true, name: true, type: true } },
      applications: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          productType: true,
          status: true,
          amount: true,
          duration: true,
          companyName: true,
          createdAt: true,
        },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, number: true, total: true, status: true, issuedAt: true },
      },
      quotes: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, number: true, total: true, status: true, issuedAt: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, content: true, createdAt: true, applicationId: true },
      },
      referralsMade: {
        select: { id: true, status: true, referredEmail: true, createdAt: true },
      },
      _count: {
        select: {
          applications: true,
          invoices: true,
          quotes: true,
          messages: true,
          referralsMade: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = ['role', 'partnerId'];
  const data = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (data.role && !['CLIENT', 'ADMIN', 'PARTNER', 'INSURER'].includes(data.role)) {
    return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { partner: { select: { id: true, name: true } } },
  });

  return NextResponse.json(user);
}
