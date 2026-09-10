import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { genererReferenceDossier } from '@/lib/reference';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { checkRateLimit } from '@/lib/rateLimit';
import { ipClient } from '@/lib/ip-client';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';
import { validateEmail, validatePhone, validateSIREN } from '@/utils/validation';
import { getSession } from '@auth0/nextjs-auth0';
import { syncUser } from '@/lib/users';
import { sendConfirmationDemande, sendAlerteAdmin } from '@/lib/email';

const AMOUNTS = [
  '3 000€ - 10 000€',
  '10 000€ - 30 000€',
  '30 000€ - 50 000€',
  '50 000€ - 100 000€',
  '100 000€ - 200 000€',
  '200 000€ - 500 000€',
  'Plus de 500 000€',
];

const SECTORS = [
  'BTP & Construction',
  'Médical & Santé',
  'Informatique & Tech',
  'Transport & Logistique',
  'Industrie',
  'Services',
  'Autre',
];

function parseAmountFromLabel(label) {
  const match = label?.match(/[\d\s]+/);
  if (!match) return null;
  const num = parseInt(match[0].replace(/\s/g, ''), 10);
  return isNaN(num) ? null : num;
}

/** Champs obligatoires attendus sous forme de chaîne non vide. */
const CHAMPS_TEXTE_REQUIS = [
  'requestType',
  'companyName',
  'siren',
  'sector',
  'amount',
  'firstName',
  'lastName',
  'email',
  'phone',
];

/** Champs facultatifs recopiés en base : ils doivent aussi être du texte. */
const CHAMPS_TEXTE_FACULTATIFS = ['message', 'equipmentType'];

/**
 * Rend la valeur si c'est une chaîne non vide, `null` sinon.
 * Ni `String(valeur)` ni le chaînage optionnel ne conviennent ici : le premier
 * transformerait `{}` en `"[object Object]"` et l'écrirait en base, le second
 * laisse passer un nombre jusqu'au `.trim()` qui lève.
 */
function texteOuNull(valeur) {
  return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null;
}

/**
 * Valide présence ET type.
 *
 * Le contrôle de type est le point corrigé (RUN-01/RUN-02) : l'ancienne
 * version ne testait que la présence, si bien qu'un `companyName` numérique
 * traversait la validation puis levait sur `.trim()` au moment de l'écriture
 * — 500 sur une entrée que la route aurait dû refuser en 400.
 */
function validateBody(body) {
  const errors = {};

  for (const field of CHAMPS_TEXTE_REQUIS) {
    const valeur = body[field];
    if (typeof valeur === 'string') {
      if (!valeur.trim()) errors[field] = 'Ce champ est requis';
    } else if (valeur === undefined || valeur === null) {
      errors[field] = 'Ce champ est requis';
    } else {
      errors[field] = 'Ce champ doit être du texte';
    }
  }

  for (const field of CHAMPS_TEXTE_FACULTATIFS) {
    const valeur = body[field];
    if (valeur !== undefined && valeur !== null && typeof valeur !== 'string') {
      errors[field] = 'Ce champ doit être du texte';
    }
  }

  if (!body.consent) errors.consent = 'Vous devez accepter la politique de confidentialité';

  if (typeof body.email === 'string' && !validateEmail(body.email)) errors.email = 'Email invalide';
  if (typeof body.phone === 'string' && !validatePhone(body.phone)) {
    errors.phone = 'Numéro de téléphone invalide';
  }
  if (typeof body.siren === 'string' && !validateSIREN(body.siren)) {
    errors.siren = 'SIREN invalide (9 chiffres requis)';
  }
  if (typeof body.requestType === 'string' && !['financement', 'assurance'].includes(body.requestType)) {
    errors.requestType = 'Type invalide';
  }
  if (typeof body.amount === 'string' && !AMOUNTS.includes(body.amount)) {
    errors.amount = 'Montant invalide';
  }
  if (typeof body.sector === 'string' && !SECTORS.includes(body.sector)) {
    errors.sector = 'Secteur invalide';
  }

  if (body.website) errors._spam = 'Requête rejetée';

  return errors;
}

export async function POST(request) {
  try {
    const ip = ipClient(request);
    const rateLimit = await checkRateLimit(ip, { bucket: 'financement' });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans 1 heure.' },
        { status: 429 }
      );
    }

    // `await request.json()` levait sur un corps vide, un JSON tronqué ou le
    // littéral `null` ; l'exception remontait au catch générique qui répondait
    // 500. `lireCorpsJson` rend `null` dans ces trois cas, et aussi sur un
    // tableau — que `validateBody` aurait déréférencé sans broncher.
    const body = await lireCorpsJson(request);
    if (!body) {
      return reponseCorpsInvalide(
        'Corps de requête JSON absent ou invalide : un objet est attendu.',
      );
    }

    const session = await getSession();
    let userId = null;

    if (session?.user) {
      const dbUser = await syncUser(session.user);
      userId = dbUser?.id;
    }

    const errors = validateBody(body);
    if (Object.keys(errors).length > 0) {
      if (errors._spam) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ errors }, { status: 400 });
    }

    const recaptchaResult = await verifyRecaptcha(texteOuNull(body.recaptchaToken) || '');
    if (!recaptchaResult.skipped && !recaptchaResult.success) {
      return NextResponse.json(
        { error: 'Vérification de sécurité échouée. Réessayez.' },
        { status: 400 }
      );
    }

    // Numérotation séquentielle : `genererReferenceDossier` garantit déjà
    // l'unicité, la boucle de tirage aléatoire n'a plus lieu d'être.
    const reference = await genererReferenceDossier();

    const productType = body.requestType === 'assurance' ? 'RC_PRO' : 'PRET_PRO';
    const amountNum = body.requestType === 'financement' ? parseAmountFromLabel(body.amount) : null;

    // `validateBody` a garanti le type de tous les champs requis : les appels
    // à `.trim()` / `.replace()` ci-dessous ne peuvent plus lever.
    const email = body.email.trim();
    const companyName = body.companyName.trim();

    try {
      await prisma.application.create({
        data: {
          reference,
          userId,
          productType,
          siren: body.siren.replace(/\s/g, ''),
          companyName,
          sector: body.sector,
          description: texteOuNull(body.message),
          email,
          phone: body.phone.trim(),
          firstName: texteOuNull(body.firstName),
          lastName: texteOuNull(body.lastName),
          amount: amountNum,
          equipmentType: texteOuNull(body.equipmentType),
        },
      });
    } catch (err) {
      return reponseErreurPrisma(err, {
        contexte: 'POST /api/financement',
        conflit: 'Une demande identique a déjà été enregistrée.',
      });
    }

    // Emails (non bloquant si SMTP non configuré)
    sendConfirmationDemande({
      to: email,
      reference,
      companyName,
    }).catch((e) => console.error('Email confirmation:', e));
    sendAlerteAdmin({
      reference,
      companyName,
      productType,
      amount: body.amount,
      email,
    }).catch((e) => console.error('Email alerte admin:', e));

    return NextResponse.json({
      success: true,
      reference,
      message: `Votre demande ${reference} a été enregistrée. Nous vous recontacterons sous 48h.`,
    });
  } catch (err) {
    console.error('API financement error:', err);
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
