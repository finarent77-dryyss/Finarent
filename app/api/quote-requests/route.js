import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { ipClient, ipClientOuNull } from '@/lib/ip-client';
import { lireCorpsJson, reponseCorpsInvalide, reponseErreurPrisma } from '@/lib/reponses-api';

const RE_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Rend la chaîne nettoyée, ou `null` si la valeur n'est pas du texte. */
function texteOuNull(valeur, taille = 200) {
  return typeof valeur === 'string' && valeur.trim()
    ? valeur.trim().slice(0, taille)
    : null;
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
    const ip = ipClient(request);
    if (!(await checkRateLimit(ip, { bucket: 'devis' })).allowed) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez plus tard.' }, { status: 429 });
    }

    // `await request.json()` levait sur un corps vide ou un JSON tronqué,
    // et le catch générique répondait 500. Le garde-fou qui suivait
    // (`typeof data !== 'object'`) ne rattrapait rien : `typeof null` et
    // `typeof []` valent tous deux `'object'`. `lireCorpsJson` écarte les
    // quatre cas d'un coup.
    const data = await lireCorpsJson(request);
    if (!data) {
      return reponseCorpsInvalide(
        'Corps de requête JSON absent ou invalide : un objet est attendu.',
      );
    }

    // Honeypot anti-bot : champ invisible rempli = bot → succès silencieux
    if (data.website) {
      return NextResponse.json({ ok: true, message: 'Votre demande a bien été enregistrée.' }, { status: 200 });
    }
    // Contrôle de type explicite : `RE_EMAIL.test(12345)` convertirait le
    // nombre en chaîne et pourrait le valider, puis l'écrire en base.
    if (typeof data.email !== 'string' || !RE_EMAIL.test(data.email.trim())) {
      return NextResponse.json({ error: 'Email manquant ou invalide' }, { status: 400 });
    }
    // `product` est concaténé plus bas dans `devis-${data.product}` : un objet
    // y écrirait la chaîne « [object Object] » en base.
    if (typeof data.product !== 'string' || !data.product.trim()) {
      return NextResponse.json({ error: 'Produit manquant ou invalide' }, { status: 400 });
    }
    // reCAPTCHA : vérifié SANS CONDITION. La garde "if (data.recaptchaToken)"
    // qui figurait ici rendait la protection contournable en omettant simplement
    // le champ — et le restait une fois la clé posée en production. C'est
    // lib/recaptcha.js qui décide de laisser passer ou non, selon que la clé est
    // configurée ; l'appelant se contente d'appliquer le verdict.
    const rc = await verifyRecaptcha(texteOuNull(data.recaptchaToken, 4000) || '');
    if (!rc.skipped && !rc.success) {
      return NextResponse.json({ error: 'Vérification de sécurité échouée.' }, { status: 400 });
    }

    const email = data.email.trim().toLowerCase();
    const produit = data.product.trim().slice(0, 60);
    const name = [texteOuNull(data.firstName, 100), texteOuNull(data.lastName, 100)]
      .filter(Boolean)
      .join(' ')
      .trim() || null;
    const phone = texteOuNull(data.phone, 30);
    const company = texteOuNull(data.companyName, 150);

    // Extraction centralisée : voir `lib/ip-client.js`. Variante `…OuNull`
    // parce que la valeur alimente une colonne de traçabilité — y écrire la
    // sentinelle « inconnue » ferait passer une absence pour une information.
    const ipAddress = ipClientOuNull(request);
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
        simulatorSlug: `devis-${produit}`,
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
    // Les entrées malformées sont désormais écartées plus haut en 400 : ce
    // filet ne couvre plus que les incidents réels (base injoignable, contrainte
    // violée), et distingue au passage les codes Prisma qui méritent un 404/409.
    return reponseErreurPrisma(err, {
      contexte: 'POST /api/quote-requests',
      conflit: 'Une demande identique est déjà enregistrée.',
    });
  }
}
