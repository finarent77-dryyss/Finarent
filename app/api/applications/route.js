import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { syncUser } from '@/lib/users';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';
import { generateReference } from '@/lib/reference';
import { calculateScore } from '@/lib/scoring';

/**
 * GET /api/applications
 * Liste les demandes (applications) de l'utilisateur connecté.
 * Lie les demandes anonymes (même email) à l'utilisateur à la première connexion.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const dbUser = await syncUser(session.user);
    if (!dbUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Lier les demandes anonymes (même email) à l'utilisateur
    await prisma.application.updateMany({
      where: {
        email: dbUser.email,
        userId: null,
      },
      data: { userId: dbUser.id },
    });

    const applications = await prisma.application.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: { documents: true },
    });

    const formatted = applications.map((a) => ({
      id: a.id,
      reference: a.reference,
      productType: a.productType,
      status: STATUS_TO_LEGACY[a.status] || a.status,
      companyName: a.companyName,
      amount: a.amount != null ? `${a.amount.toLocaleString()}€` : null,
      sector: a.sector,
      createdAt: a.createdAt,
      documents: (a.documents || []).map((d) => ({
        id: d.id,
        path: d.fileUrl,
        originalName: d.fileName,
        type: d.type,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error('GET /api/applications error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/applications
 * Crée une nouvelle demande depuis le wizard de l'espace client.
 */
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const dbUser = await syncUser(session.user);
    if (!dbUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const body = await request.json();

    // Validation
    const validProductTypes = ['PRET_PRO', 'CREDIT_BAIL', 'LOA', 'LLD', 'LEASING_OPS', 'RC_PRO'];
    if (!body.productType || !validProductTypes.includes(body.productType)) {
      return NextResponse.json({ error: 'Type de produit invalide' }, { status: 400 });
    }
    if (!body.companyName?.trim()) {
      return NextResponse.json({ error: 'Raison sociale requise' }, { status: 400 });
    }
    if (!body.siren || !/^\d{9}$/.test(body.siren.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'SIREN invalide (9 chiffres)' }, { status: 400 });
    }

    // Generate unique reference
    let reference;
    let attempts = 0;
    do {
      reference = generateReference();
      const existing = await prisma.application.findFirst({
        where: { description: { contains: reference } },
      });
      if (!existing) break;
      attempts++;
    } while (attempts < 5);

    // Pré-qualification automatique (scoring 0-100)
    const applicationDraft = {
      userId: dbUser.id,
      productType: body.productType,
      companyName: body.companyName.trim(),
      siren: body.siren.replace(/\s/g, ''),
      legalForm: body.legalForm || null,
      sector: body.sector || null,
      description: body.description?.trim() || null,
      amount: body.amount ? Number(body.amount) : null,
      duration: body.duration ? Number(body.duration) : null,
      equipmentType: body.equipmentType?.trim() || null,
    };
    const { score: scorePreQual, label: scoreLabel } = calculateScore(applicationDraft, []);

    // Traçabilité du simulateur d'origine (si présent) dans quoteDetails
    const quoteDetails = body.sourceSimulator && typeof body.sourceSimulator === 'object'
      ? {
          source: {
            kind: 'simulator',
            slug: String(body.sourceSimulator.slug || '').slice(0, 80) || null,
            category: String(body.sourceSimulator.category || '').slice(0, 80) || null,
            label: String(body.sourceSimulator.label || '').slice(0, 200) || null,
            params: body.sourceSimulator.params && typeof body.sourceSimulator.params === 'object'
              ? Object.fromEntries(
                  Object.entries(body.sourceSimulator.params)
                    .slice(0, 30)
                    .map(([k, v]) => [String(k).slice(0, 40), String(v).slice(0, 200)]),
                )
              : {},
            capturedAt: new Date().toISOString(),
          },
        }
      : null;

    const application = await prisma.application.create({
      data: {
        ...applicationDraft,
        scorePreQual,
        scoreLabel,
        ...(quoteDetails ? { quoteDetails } : {}),
      },
    });

    // Update user profile if name/phone provided
    const profileUpdate = {};
    if (body.name && !dbUser.name) profileUpdate.name = body.name.trim();
    if (body.phone && !dbUser.phone) profileUpdate.phone = body.phone.trim();
    if (body.companyName && !dbUser.company) profileUpdate.company = body.companyName.trim();
    if (body.legalForm && !dbUser.legalForm) profileUpdate.legalForm = body.legalForm;

    if (Object.keys(profileUpdate).length > 0) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: profileUpdate,
      });
    }

    return NextResponse.json({
      success: true,
      id: application.id,
      message: 'Demande créée avec succès',
    });
  } catch (err) {
    console.error('POST /api/applications error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
