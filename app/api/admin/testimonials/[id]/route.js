import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const data = {};
  if ('authorName' in body) data.authorName = body.authorName;
  if ('initials' in body) data.initials = body.initials;
  if ('position' in body) data.position = body.position;
  if ('company' in body) data.company = body.company;
  if ('sector' in body) data.sector = body.sector;
  if ('rating' in body) data.rating = Math.max(1, Math.min(5, parseInt(body.rating, 10) || 5));
  if ('text' in body) data.text = body.text;
  if ('amount' in body) data.amount = body.amount;
  if ('isPublished' in body) data.isPublished = !!body.isPublished;

  if (body.action === 'approve') {
    data.isApproved = true;
    data.isPublished = true;
    data.rejectedAt = null;
    data.approvedAt = new Date();
  } else if (body.action === 'reject') {
    data.isApproved = false;
    data.isPublished = false;
    data.rejectedAt = new Date();
    data.approvedAt = null;
  } else if (body.action === 'unpublish') {
    data.isPublished = false;
  } else if (body.action === 'publish') {
    data.isPublished = true;
    if (!body.skipApprove) {
      data.isApproved = true;
      data.approvedAt = new Date();
      data.rejectedAt = null;
    }
  }

  const t = await prisma.testimonial.update({ where: { id }, data });
  return NextResponse.json(t);
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
