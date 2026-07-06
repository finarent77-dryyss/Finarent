import { prisma } from '@/lib/prisma';
import { nextAffiliateInvoiceNumber } from '@/lib/affiliate-invoice-numbering.js';
import { generateAffiliateInvoicePdf } from '@/lib/pdf/affiliate-invoice.js';
import {
  logAffiliateAction,
  computeAffiliatePayoutTTC,
  affiliateDisplayName,
} from '@/lib/affiliate-fiscal.js';
import { MANDATE_VERSION } from '@/lib/affiliate-mandate.js';
import { decryptString, maskIban } from '@/lib/crypto.js';

/**
 * Valide une commission PENDING → VALIDATED.
 */
export async function validateAffiliateCommission(commissionId, actorId) {
  const commission = await prisma.affiliateCommission.findUnique({
    where: { id: commissionId },
    include: { affiliate: { select: { id: true, code: true } } },
  });
  if (!commission) throw new Error('Commission introuvable');
  if (commission.status !== 'PENDING') throw new Error('Seule une commission PENDING peut être validée');

  const updated = await prisma.affiliateCommission.update({
    where: { id: commissionId },
    data: { status: 'VALIDATED', validatedAt: new Date() },
  });

  await logAffiliateAction({
    affiliateId: commission.affiliateId,
    actorId,
    entityType: 'COMMISSION',
    entityId: commission.id,
    action: 'VALIDATED',
    before: { status: 'PENDING' },
    after: { status: 'VALIDATED' },
  });

  return updated;
}

/**
 * Crée un versement groupé pour toutes les commissions VALIDATED d'un affilié.
 */
export async function createAffiliatePayout(affiliateId, actorId) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: {
      commissions: {
        where: { status: 'VALIDATED', payoutId: null },
        include: {
          application: { select: { id: true, companyName: true, productType: true, createdAt: true } },
        },
      },
    },
  });

  if (!affiliate) throw new Error('Affilié introuvable');
  if (!affiliate.onboardingCompletedAt || !affiliate.mandateSignedAt) {
    throw new Error('Onboarding fiscal incomplet');
  }
  if (!affiliate.iban) throw new Error('IBAN manquant');

  const commissions = affiliate.commissions;
  if (!commissions.length) throw new Error('Aucune commission VALIDATED à verser');

  const amountHT = Math.round(commissions.reduce((s, c) => s + c.amount, 0) * 100) / 100;
  if (amountHT < (affiliate.payoutMinAmount || 20)) {
    throw new Error(`Seuil minimum non atteint (${affiliate.payoutMinAmount || 20} €)`);
  }

  const { vatRate, vatAmount, amountTTC } = computeAffiliatePayoutTTC(amountHT, affiliate.tvaApplicable);
  const invoiceNumber = await nextAffiliateInvoiceNumber();
  const now = new Date();
  const reference = `PAY-${affiliate.code}-${now.toISOString().slice(0, 10)}`;

  const periodStart = commissions.reduce(
    (min, c) => (c.createdAt < min ? c.createdAt : min),
    commissions[0].createdAt,
  );
  const periodEnd = now;

  const fiscalSnapshot = {
    legalName: affiliate.legalName,
    fiscalStatus: affiliate.fiscalStatus,
    siret: affiliate.siret,
    tvaNumber: affiliate.tvaNumber,
    tvaApplicable: affiliate.tvaApplicable,
    // Snapshot d'archive : IBAN masqué (jamais de clair persisté)
    iban: affiliate.iban ? maskIban(decryptString(affiliate.iban)) : null,
    mandateVersion: affiliate.mandateVersion || MANDATE_VERSION,
    mandateSignedAt: affiliate.mandateSignedAt,
  };

  const pdfBuffer = generateAffiliateInvoicePdf({
    invoiceNumber,
    invoiceDate: now,
    periodStart,
    periodEnd,
    affiliate: {
      legalName: affiliateDisplayName(affiliate),
      name: affiliate.name,
      fiscalStatus: affiliate.fiscalStatus,
      siret: affiliate.siret,
      tvaApplicable: affiliate.tvaApplicable,
      fiscalAddress: affiliate.fiscalAddress,
      fiscalPostalCode: affiliate.fiscalPostalCode,
      fiscalCity: affiliate.fiscalCity,
      email: affiliate.email,
    },
    commissions: commissions.map((c) => ({
      date: new Date(c.application?.createdAt || c.createdAt).toLocaleDateString('fr-FR'),
      applicationRef: c.applicationId.slice(0, 8).toUpperCase(),
      description: `${c.application?.productType || 'Dossier'} — ${c.application?.companyName || 'Client'}`,
      amount: c.amount,
    })),
    amountHT,
    vatRate,
    vatAmount,
    amountTTC,
    mandateSignedAt: affiliate.mandateSignedAt,
    mandateVersion: affiliate.mandateVersion || MANDATE_VERSION,
    paymentReference: reference,
    paidAt: now,
  });

  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

  const payout = await prisma.$transaction(async (tx) => {
    const p = await tx.affiliatePayout.create({
      data: {
        affiliateId,
        amount: amountHT,
        amountTTC,
        reference,
        paidAt: now,
        status: 'COMPLETED',
      },
    });

    await tx.affiliateInvoice.create({
      data: {
        affiliateId,
        payoutId: p.id,
        invoiceNumber,
        amountHT,
        vatRate,
        vatAmount,
        amountTTC,
        fiscalSnapshot,
        pdfPath: pdfBase64,
        status: 'ISSUED',
      },
    });

    await tx.affiliateCommission.updateMany({
      where: { id: { in: commissions.map((c) => c.id) } },
      data: { status: 'PAID', paidAt: now, payoutId: p.id },
    });

    return p;
  });

  await logAffiliateAction({
    affiliateId,
    actorId,
    entityType: 'PAYOUT',
    entityId: payout.id,
    action: 'CREATED',
    after: { amountHT, amountTTC, reference, commissionCount: commissions.length },
  });

  return { payout, invoiceNumber, amountHT, amountTTC, pdfBase64 };
}

/**
 * Liste affiliés prêts pour versement.
 */
export async function listAffiliatesReadyForPayout() {
  const affiliates = await prisma.affiliate.findMany({
    where: {
      onboardingCompletedAt: { not: null },
      mandateSignedAt: { not: null },
      iban: { not: null },
      isActive: true,
    },
    include: {
      commissions: {
        where: { status: 'VALIDATED', payoutId: null },
        select: { amount: true },
      },
    },
  });

  return affiliates
    .map((a) => {
      const totalValidated = a.commissions.reduce((s, c) => s + c.amount, 0);
      return {
        id: a.id,
        code: a.code,
        name: affiliateDisplayName(a),
        email: a.email,
        // Liste d'affichage admin : IBAN masqué
        iban: a.iban ? maskIban(decryptString(a.iban)) : null,
        totalValidated: Math.round(totalValidated * 100) / 100,
        payoutMinAmount: a.payoutMinAmount || 20,
        eligible: totalValidated >= (a.payoutMinAmount || 20),
        commissionCount: a.commissions.length,
      };
    })
    .filter((a) => a.totalValidated > 0)
    .sort((a, b) => b.totalValidated - a.totalValidated);
}
