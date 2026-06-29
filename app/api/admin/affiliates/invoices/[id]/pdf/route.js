import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const { id } = await params;
  const invoice = await prisma.affiliateInvoice.findUnique({
    where: { id },
    select: { pdfPath: true, invoiceNumber: true },
  });

  if (!invoice?.pdfPath) {
    return NextResponse.json({ error: 'PDF introuvable' }, { status: 404 });
  }

  const buffer = Buffer.from(invoice.pdfPath, 'base64');
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
