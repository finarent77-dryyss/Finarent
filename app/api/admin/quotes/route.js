import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nextQuoteNumber } from '@/lib/invoicing/numbering';

export async function GET(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const quotes = await prisma.quote.findMany({
    where: status && status !== 'all' ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { items: true } },
      user: { select: { id: true, name: true, email: true } },
      application: { select: { id: true, companyName: true } },
    },
  });

  return NextResponse.json({ items: quotes });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const body = await request.json();

  const {
    userId, applicationId,
    companyName, companyAddress, companySiret,
    contactName, contactEmail, contactPhone,
    validUntil, taxRate = 20, discountPercent, discountAmount,
    paymentTerms, notes,
    items = [],
  } = body;

  if (!contactName || !contactEmail) {
    return NextResponse.json({ error: 'contactName et contactEmail requis' }, { status: 400 });
  }

  // Calculs
  let subtotalHT = 0;
  const processed = items.map((it, i) => {
    const totalHT = (Number(it.quantity) || 1) * (Number(it.unitPriceHT) || 0);
    subtotalHT += totalHT;
    return {
      description: it.description,
      quantity: Number(it.quantity) || 1,
      unitPriceHT: Number(it.unitPriceHT) || 0,
      totalHT: Math.round(totalHT * 100) / 100,
      position: i,
    };
  });

  let discount = 0;
  if (discountPercent) discount = (subtotalHT * Number(discountPercent)) / 100;
  if (discountAmount) discount = Number(discountAmount);
  const baseHT = subtotalHT - discount;
  const taxAmount = baseHT * (Number(taxRate) / 100);
  const totalTTC = Math.round((baseHT + taxAmount) * 100) / 100;

  const quoteNumber = await nextQuoteNumber();

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      userId: userId || null,
      applicationId: applicationId || null,
      companyName, companyAddress, companySiret,
      contactName, contactEmail, contactPhone,
      status: 'DRAFT',
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 86400000),
      subtotalHT: Math.round(subtotalHT * 100) / 100,
      taxRate: Number(taxRate),
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalTTC,
      discountPercent: discountPercent ? Number(discountPercent) : null,
      discountAmount: discountAmount ? Number(discountAmount) : null,
      paymentTerms, notes,
      items: { create: processed },
    },
    include: { items: true },
  });

  return NextResponse.json(quote, { status: 201 });
}
