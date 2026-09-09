import { NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  configurationManagement,
  definirRoleUtilisateur,
  ErreurAuth0Management,
} from '@/lib/auth0-management';

export async function GET(_request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      partner: { select: { id: true, name: true, type: true } },
      applications: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          productType: true,
          status: true,
          amount: true,
          duration: true,
          companyName: true,
          createdAt: true,
        },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, invoiceNumber: true, totalTTC: true, status: true, issueDate: true },
      },
      quotes: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, quoteNumber: true, totalTTC: true, status: true, createdAt: true },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, content: true, createdAt: true, applicationId: true },
      },
      referralsMade: {
        select: { id: true, status: true, refereeEmail: true, createdAt: true },
      },
      _count: {
        select: {
          applications: true,
          invoices: true,
          quotes: true,
          messages: true,
          referralsMade: true,
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = ['role', 'partnerId'];
  const data = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  if (data.role && !['CLIENT', 'ADMIN', 'PARTNER', 'INSURER'].includes(data.role)) {
    return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
  }

  // ── Changement de rôle : Auth0 d'abord, la base ensuite (constat P1-8) ──
  //
  // Le rôle applicatif est porté par le claim Auth0, que `syncUser()` recopie
  // en base à chaque requête authentifiée. Écrire ici en base sans propager
  // vers Auth0 donne une promotion qui retombe à la première navigation :
  // l'écran annoncerait un succès démenti quelques secondes plus tard.
  // On refuse donc franchement plutôt que de mentir.
  if (data.role !== undefined) {
    const { configuree, manquantes } = configurationManagement();
    if (!configuree) {
      return NextResponse.json(
        {
          error:
            'Changement de rôle indisponible : la Management API Auth0 n\'est pas configurée '
            + `(${manquantes.join(', ')}). Le rôle vient du claim Auth0 ; l'écrire en base seule `
            + 'serait effacé dès la requête suivante. Procédure : AUTH0_SETUP.md.',
        },
        { status: 503 },
      );
    }

    const cible = await prisma.user.findUnique({
      where: { id },
      select: { auth0Id: true },
    });
    if (!cible) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    try {
      await definirRoleUtilisateur(cible.auth0Id, data.role);
    } catch (erreur) {
      const detail = erreur instanceof ErreurAuth0Management ? erreur.message : 'erreur inattendue';
      console.error('[admin/users] propagation du rôle vers Auth0 refusée :', detail);
      return NextResponse.json(
        { error: `Rôle inchangé — Auth0 a refusé la mise à jour. ${detail}` },
        { status: 502 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { partner: { select: { id: true, name: true } } },
  });

  return NextResponse.json(user);
}
