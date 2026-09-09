import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyRecaptcha } from '@/lib/recaptcha';

function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

/**
 * POST /api/quote-requests
 *
 * Réceptionne une demande de devis depuis un tunnel QuoteWizard.
 * Persiste en base via le modèle Prospect + ProspectEvent (réutilise
 * l'infra existante : un devis est tracké comme un événement avec
 * tous les champs saisis dans `params`).
 *
 * Le champ `product` (auto, moto, habitation, sante, rc-pro…) sert
 * de simulatorSlug pour identifier le type de devis dans l'admin.
 */
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    if (!(await checkRateLimit(ip, { bucket: 'devis' })).allowed) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez plus tard.' }, { status: 429 });
    }

    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }
    // Honeypot anti-bot : champ invisible rempli = bot → succès silencieux
    if (data.website) {
      return NextResponse.json({ ok: true, message: 'Votre demande a bien été enregistrée.' }, { status: 200 });
    }
    if (!data.email || !/^[^@]+@[^@]+\.[^@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Email manquant ou invalide' }, { status: 400 });
    }
    if (!data.product) {
      return NextResponse.json({ error: 'Produit manquant' }, { status: 400 });
    }
    // reCAPTCHA : vérifié SANS CONDITION. La garde "if (data.recaptchaToken)"
    // qui figurait ici rendait la protection contournable en omettant simplement
    // le champ — et le restait une fois la clé posée en production. C'est
    // lib/recaptcha.js qui décide de laisser passer ou non, selon que la clé est
    // configurée ; l'appelant se contente d'appliquer le verdict.
    const rc = await verifyRecaptcha(data.recaptchaToken || '');
    if (!rc.skipped && !rc.success) {
      return NextResponse.json({ error: 'Vérification de sécurité échouée.' }, { status: 400 });
    }

    const email = String(data.email).trim().toLowerCase();
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || null;
    const phone = data.phone ? String(data.phone).trim() : null;
    const company = data.companyName ? String(data.companyName).trim() : null;

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;
    const userAgent = request.headers.get('user-agent') || null;
    const source = request.headers.get('referer') || null;

    // 1) Upsert du Prospect (clé : email — un même email = 1 prospect)
    const existing = await prisma.prospect.findFirst({ where: { email } });

    const prospect = existing
      ? await prisma.prospect.update({
          where: { id: existing.id },
          data: {
            name:    existing.name    || name,
            phone:   existing.phone   || phone,
            company: existing.company || company,
            lastSeenAt: new Date(),
          },
        })
      : await prisma.prospect.create({
          data: {
            anonId: randomUUID(),
            email,
            name,
            phone,
            company,
            status: 'NEW',
            source,
            ipAddress,
            userAgent,
          },
        });

    // 2) Créer un ProspectEvent pour traçer la demande
    await prisma.prospectEvent.create({
      data: {
        prospectId: prospect.id,
        simulatorSlug: `devis-${data.product}`,
        category: 'assurance-devis',
        params: data,
        url: source,
      },
    });

    return NextResponse.json({
      ok: true,
      prospectId: prospect.id,
      message: 'Votre demande a bien été enregistrée. Un conseiller vous contactera sous 48h.',
    }, { status: 200 });
  } catch (err) {
    console.error('[quote-request] error', err);
    return NextResponse.json({ error: 'Erreur serveur — réessayez plus tard.' }, { status: 500 });
  }
}
