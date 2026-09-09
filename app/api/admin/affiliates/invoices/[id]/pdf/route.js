import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/users';
import { archiverEtEnvoyerEnFond } from '@/lib/documents/deliver';

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const adminAccess = await isAdmin(session.user);
  if (!adminAccess) return NextResponse.json({ error: 'Accès admin requis' }, { status: 403 });

  const { id } = await params;
  const invoice = await prisma.affiliateInvoice.findUnique({
    where: { id },
    select: {
      id: true,
      pdfPath: true,
      invoiceNumber: true,
      amountTTC: true,
      affiliateId: true,
      affiliate: { select: { email: true } },
    },
  });

  if (!invoice?.pdfPath) {
    return NextResponse.json({ error: 'PDF introuvable' }, { status: 404 });
  }

  const buffer = Buffer.from(invoice.pdfPath, 'base64');

  // La facture de commission est adressée à l'apporteur d'affaires lui-même :
  // c'est sa pièce comptable, il doit la recevoir sans dépendre d'un admin.
  archiverEtEnvoyerEnFond({
    buffer,
    fileName: `${invoice.invoiceNumber}.pdf`,
    kind: 'FACTURE_AFFILIE',
    to: invoice.affiliate?.email || null,
    numeroDocument: invoice.invoiceNumber,
    montant: `${invoice.amountTTC.toLocaleString('fr-FR')} € TTC`,
    messageComplementaire:
      'Votre facture de commission est en pièce jointe. Elle correspond au versement en cours de traitement.',
    invoiceId: invoice.id,
    affiliateId: invoice.affiliateId,
  });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
