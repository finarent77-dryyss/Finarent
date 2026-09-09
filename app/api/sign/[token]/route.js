import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@auth0/nextjs-auth0';
import { syncUser } from '@/lib/users';
import { uploadFile } from '@/lib/storage';
import { sendMail } from '@/lib/email/send.js';
import { templateDocumentGenere } from '@/lib/email/templates.js';
import { generateContractPDF, MENTION_CONSENTEMENT } from '@/lib/pdf/contract';
import {
  empreinteDocument,
  ipClient,
  validerSignatureImage,
  etatDemande,
  MESSAGES_ETAT,
} from '@/lib/signature';

export const dynamic = 'force-dynamic';

/** Charge la demande et le dossier associé. */
async function chargerDemande(token) {
  const demande = await prisma.signatureRequest.findUnique({ where: { token } });
  if (!demande) return { demande: null };
  const offer = await prisma.offer.findUnique({
    where: { id: demande.documentId },
    include: { application: { include: { user: true } } },
  });
  return { demande, offer };
}

/**
 * GET /api/sign/[token]
 * Renvoie de quoi afficher la page de signature. Le jeton seul ne suffit pas :
 * le signataire doit être connecté et être le destinataire de la demande.
 */
export async function GET(request, { params }) {
  const { token } = await params;
  const { demande, offer } = await chargerDemande(token);

  const etat = etatDemande(demande);
  if (!etat.utilisable) {
    return NextResponse.json(
      { error: MESSAGES_ETAT[etat.raison] || 'Lien invalide', raison: etat.raison },
      { status: etat.raison === 'introuvable' ? 404 : 410 },
    );
  }

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Connexion requise', raison: 'non_connecte' }, { status: 401 });
  }
  const dbUser = await syncUser(session.user);
  if (dbUser.id !== demande.requestedToId) {
    return NextResponse.json(
      { error: "Ce document n'est pas destiné à votre compte." },
      { status: 403 },
    );
  }

  if (!offer) {
    return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
  }

  return NextResponse.json({
    signataire: dbUser.name || dbUser.email,
    societe: offer.application?.companyName || null,
    montant: offer.amount,
    duree: offer.durationMonths,
    mensualite: offer.monthlyPayment,
    taux: offer.rate,
    coutTotal: offer.totalCost,
    expireLe: demande.expiresAt,
    mentionConsentement: MENTION_CONSENTEMENT,
    urlDocument: `/api/sign/${token}/document`,
  });
}

/**
 * POST /api/sign/[token]
 * Recueille la signature et fige la preuve.
 *
 * L'ordre compte : on regénère le PDF exactement tel qu'il a été présenté pour
 * en vérifier l'empreinte AVANT d'accepter la signature. Sans ce contrôle, un
 * document modifié entre l'envoi et la signature passerait inaperçu.
 */
export async function POST(request, { params }) {
  const { token } = await params;

  try {
    const { demande, offer } = await chargerDemande(token);

    const etat = etatDemande(demande);
    if (!etat.utilisable) {
      return NextResponse.json(
        { error: MESSAGES_ETAT[etat.raison] || 'Lien invalide' },
        { status: etat.raison === 'introuvable' ? 404 : 410 },
      );
    }

    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Connexion requise' }, { status: 401 });
    }
    const dbUser = await syncUser(session.user);
    if (dbUser.id !== demande.requestedToId) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    if (!offer) {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    }

    const body = await request.json();

    if (body.refus) {
      await prisma.signatureRequest.update({
        where: { id: demande.id },
        data: {
          status: 'REFUSED',
          refusalReason: String(body.motif || '').slice(0, 500) || 'Non précisé',
        },
      });
      return NextResponse.json({ ok: true, status: 'REFUSED' });
    }

    const verif = validerSignatureImage(body.signature);
    if (!verif.ok) return NextResponse.json({ error: verif.error }, { status: 400 });

    if (body.consentement !== true) {
      return NextResponse.json(
        { error: 'Vous devez accepter les termes pour signer.' },
        { status: 400 },
      );
    }

    // Le document non signé est régénéré à l'identique : son empreinte doit
    // correspondre à celle enregistrée lors de l'envoi.
    const pdfPresente = generateContractPDF({
      offer,
      application: offer.application,
      user: offer.application?.user || dbUser,
    });
    const empreinte = empreinteDocument(pdfPresente);

    if (demande.documentHash && demande.documentHash !== empreinte) {
      console.error(
        `[signature] empreinte divergente pour la demande ${demande.id} — signature refusée`,
      );
      return NextResponse.json(
        { error: 'Le document a changé depuis son envoi. Demandez un nouveau lien à votre conseiller.' },
        { status: 409 },
      );
    }

    const signedAt = new Date();
    const ip = ipClient(request);
    const userAgent = (request.headers.get('user-agent') || '').slice(0, 300);

    // PDF final : contrat + signature manuscrite + bloc de preuve.
    const pdfSigne = generateContractPDF({
      offer,
      application: offer.application,
      user: offer.application?.user || dbUser,
      signature: { dataUrl: body.signature, signedAt, ip, userAgent, documentHash: empreinte },
    });

    let cheminArchive = null;
    try {
      const stocke = await uploadFile(
        pdfSigne,
        `contrat-signe-${offer.id}.pdf`,
        'application/pdf',
        offer.applicationId,
      );
      cheminArchive = stocke.path;
    } catch (e) {
      // L'archivage échoue : on refuse la signature plutôt que d'enregistrer
      // une signature dont le document ne serait conservé nulle part.
      console.error('[signature] archivage impossible :', e.message);
      return NextResponse.json(
        { error: "L'archivage du document a échoué. Réessayez dans quelques instants." },
        { status: 503 },
      );
    }

    await prisma.$transaction([
      prisma.signatureRequest.update({
        where: { id: demande.id },
        data: {
          status: 'SIGNED',
          signatureData: body.signature,
          signedAt,
          signedByIp: ip,
          signedByUserAgent: userAgent,
          documentHash: empreinte,
          documentPath: cheminArchive,
          consentText: MENTION_CONSENTEMENT,
        },
      }),
      // Le contrat signé rejoint les pièces du dossier : sans cela il resterait
      // archivé mais invisible, et ni le client ni l'administrateur ne pourraient
      // le retrouver. Le type CONTRAT le rend non supprimable.
      prisma.document.create({
        data: {
          applicationId: offer.applicationId,
          uploadedById: dbUser.id,
          type: 'CONTRAT',
          fileName: `Contrat signé — ${new Intl.DateTimeFormat('fr-FR').format(signedAt)}.pdf`,
          fileUrl: cheminArchive,
          fileSize: pdfSigne.length,
          mimeType: 'application/pdf',
        },
      }),
      prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'SIGNED', signedAt },
      }),
      prisma.application.update({
        where: { id: offer.applicationId },
        data: { status: 'SIGNED' },
      }),
      prisma.statusHistory.create({
        data: {
          applicationId: offer.applicationId,
          changedById: dbUser.id,
          fromStatus: 'PENDING_SIGNATURE',
          toStatus: 'SIGNED',
          comment: `Signature électronique simple — IP ${ip} — empreinte ${empreinte.slice(0, 16)}…`,
        },
      }),
    ]);

    // Le signataire repart avec son exemplaire. Ce chemin ne passe pas par le
    // PATCH admin : sans cet envoi, un client signait et ne recevait plus rien.
    // Détaché de la réponse — une signature valide ne doit jamais être
    // invalidée par un incident d'email.
    const destinataire = offer.application?.email || offer.application?.user?.email || dbUser.email;
    if (destinataire) {
      const message = templateDocumentGenere({
        kind: 'CONTRAT',
        reference: offer.application?.reference || null,
        fileName: `contrat-signe-${offer.id}.pdf`,
        montant: offer.amount ? `${offer.amount.toLocaleString('fr-FR')} €` : null,
        messageComplementaire:
          'Votre contrat signé est en pièce jointe. Conservez-le : il fait foi, '
          + `et son empreinte SHA-256 (${empreinte.slice(0, 16)}…) est enregistrée de notre côté.`,
      });
      void sendMail({
        to: destinataire,
        subject: message.subject,
        html: message.html,
        text: message.text,
        attachments: [{ name: `contrat-signe-${offer.id}.pdf`, content: pdfSigne }],
        log: {
          type: 'TRANSACTIONAL',
          source: 'DOCUMENT_CONTRAT',
          metadata: { reference: offer.application?.reference, empreinte, offerId: offer.id },
        },
      }).catch((e) => console.error('[signature] envoi du contrat signé échoué :', e.message));
    }

    return NextResponse.json({ ok: true, status: 'SIGNED', signedAt, empreinte });
  } catch (error) {
    console.error('[signature] erreur POST /api/sign :', error);
    return NextResponse.json(
      { error: 'La signature n\'a pas pu être enregistrée. Réessayez.' },
      { status: 500 },
    );
  }
}
