import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { genererReferenceDossier } from '@/lib/reference';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { checkRateLimit } from '@/lib/rateLimit';
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

function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function validateBody(body) {
  const errors = {};
  const required = [
    'requestType',
    'companyName',
    'siren',
    'sector',
    'amount',
    'firstName',
    'lastName',
    'email',
    'phone',
    'consent',
  ];

  for (const field of required) {
    if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
      if (field === 'recaptchaToken') continue;
      if (field === 'consent') {
        if (!body.consent) errors.consent = 'Vous devez accepter la politique de confidentialité';
      } else {
        errors[field] = 'Ce champ est requis';
      }
    }
  }

  if (body.email && !validateEmail(body.email)) errors.email = 'Email invalide';
  if (body.phone && !validatePhone(body.phone)) errors.phone = 'Numéro de téléphone invalide';
  if (body.siren && !validateSIREN(body.siren)) errors.siren = 'SIREN invalide (9 chiffres requis)';
  if (body.requestType && !['financement', 'assurance'].includes(body.requestType)) {
    errors.requestType = 'Type invalide';
  }
  if (body.amount && !AMOUNTS.includes(body.amount)) errors.amount = 'Montant invalide';
  if (body.sector && !SECTORS.includes(body.sector)) errors.sector = 'Secteur invalide';

  if (body.website) errors._spam = 'Requête rejetée';

  return errors;
}

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip, { bucket: 'financement' });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans 1 heure.' },
        { status: 429 }
      );
    }

    const body = await request.json();
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

    const recaptchaResult = await verifyRecaptcha(body.recaptchaToken || '');
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

    await prisma.application.create({
      data: {
        reference,
        userId,
        productType,
        siren: body.siren.replace(/\s/g, ''),
        companyName: body.companyName.trim(),
        sector: body.sector,
        description: body.message?.trim() || null,
        email: body.email.trim(),
        phone: body.phone.trim(),
        firstName: body.firstName?.trim() || null,
        lastName: body.lastName?.trim() || null,
        amount: amountNum,
        equipmentType: body.equipmentType || null,
      },
    });

    // Emails (non bloquant si SMTP non configuré)
    sendConfirmationDemande({
      to: body.email.trim(),
      reference,
      companyName: body.companyName.trim(),
    }).catch((e) => console.error('Email confirmation:', e));
    sendAlerteAdmin({
      reference,
      companyName: body.companyName.trim(),
      productType,
      amount: body.amount,
      email: body.email.trim(),
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
