import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { prisma } from '@/lib/prisma';
import { syncUser } from '@/lib/users';
import { STATUS_TO_LEGACY } from '@/lib/statusMap';
import { genererReferenceDossier } from '@/lib/reference';
import { sendConfirmationDemande, sendAlerteAdmin } from '@/lib/email';
import { calculateScore } from '@/lib/scoring';
import { protect } from '@/lib/sensitive';
import { currentAffiliateId } from '@/lib/affiliate';
import { peutRattacherDossiersAnonymes } from '@/lib/acces-dossier';

/**
 * Texte exact présenté au client au moment de cocher l'acceptation, conservé
 * avec la demande pour être opposable.
 *
 * Il reconstitue le libellé affiché par `app/espace/demande/etapes/EtapeContact.jsx`,
 * assemblé côté navigateur à partir des clés `espace.wizard.termsLabel`,
 * `termsLink`, `termsAnd` et `privacyLink` (messages/fr.json). Conserver un
 * simple booléen ne prouverait rien : c'est le libellé accepté qui fait foi.
 * Si ces clés changent, cette constante doit suivre.
 */
const TEXTE_CONSENTEMENT =
  "J'accepte les conditions générales et la politique de confidentialité";

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

    // Rattachement des demandes anonymes portant la même adresse.
    //
    // Cette adresse a été saisie sur le formulaire public /api/financement sans
    // aucune preuve de possession : la seule égalité des chaînes ne prouve rien.
    // Sans le contrôle ci-dessous, ouvrir un compte Auth0 avec l'adresse d'un
    // tiers suffisait à récupérer son dossier complet — raison sociale, SIREN,
    // montant, téléphone, pièces jointes et messagerie. Le rattachement n'a donc
    // lieu que si Auth0 atteste la possession de l'adresse (`email_verified`).
    // Un compte non vérifié voit ses propres dossiers, jamais ceux d'un autre.
    if (peutRattacherDossiersAnonymes(session.user, dbUser)) {
      await prisma.application.updateMany({
        where: {
          email: dbUser.email,
          userId: null,
        },
        data: { userId: dbUser.id },
      });
    }

    const applications = await prisma.application.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: { documents: { where: { deletedAt: null } } },
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
    // Le formulaire annonce « SIREN 9 chiffres ou SIRET 14 chiffres » et sa
    // validation accepte les deux ; le serveur n'acceptait que 9. Un client
    // saisissant son SIRET parcourait les cinq étapes pour être refusé à la
    // dernière. Un SIRET contient le SIREN en préfixe : on le normalise.
    const identifiant = String(body.siren || '').replace(/\D/g, '');
    if (!/^\d{9}$/.test(identifiant) && !/^\d{14}$/.test(identifiant)) {
      return NextResponse.json(
        { error: 'SIREN (9 chiffres) ou SIRET (14 chiffres) invalide' },
        { status: 400 },
      );
    }
    const siren = identifiant.slice(0, 9);

    // Acceptation des CGU : elle n'était contrôlée que par le navigateur, donc
    // contournable avec les outils de développement. La route publique
    // /api/financement la vérifie déjà côté serveur.
    if (body.consent !== true) {
      return NextResponse.json(
        { error: 'Vous devez accepter les conditions générales.' },
        { status: 400 },
      );
    }

    // Numéro de dossier — il manquait purement et simplement ici : la référence
    // était calculée puis jamais écrite, et l'unicité était vérifiée sur la
    // colonne `description` au lieu de `reference`. Les dossiers ouverts depuis
    // l'espace client repartaient donc sans numéro.
    const reference = await genererReferenceDossier();

    // Le formulaire ne collecte qu'un champ « nom complet », le modèle stocke
    // prénom et nom séparément : on coupe au premier espace, le reste formant
    // le nom de famille (« Jean-Pierre De La Tour » → « Jean-Pierre » / « De La Tour »).
    const nomComplet = (body.name || dbUser.name || '').trim();
    const separateur = nomComplet.indexOf(' ');
    const prenomNom = separateur === -1
      ? { prenom: nomComplet || null, nom: null }
      : { prenom: nomComplet.slice(0, separateur), nom: nomComplet.slice(separateur + 1) };

    // Pré-qualification automatique (scoring 0-100)
    const applicationDraft = {
      reference,
      userId: dbUser.id,
      productType: body.productType,
      companyName: body.companyName.trim(),
      siren,
      legalForm: body.legalForm || null,
      // Coordonnées du dossier. Elles n'étaient écrites nulle part : les
      // colonnes `email`/`phone` restaient nulles, alors que la route publique
      // les renseigne. Conséquence en chaîne — la notification de changement de
      // statut (`sendStatutDemande`) et la conversion de parrainage visent
      // `application.email` et ne partaient donc jamais pour un dossier ouvert
      // depuis l'espace client, et le bloc « Coordonnées » du détail restait
      // vide.
      email: dbUser.email || null,
      phone: body.phone?.trim() || dbUser.phone || null,
      firstName: prenomNom.prenom,
      lastName: prenomNom.nom,
      sector: body.sector || null,
      description: body.description?.trim() || null,
      amount: body.amount ? Number(body.amount) : null,
      duration: body.duration ? Number(body.duration) : null,
      equipmentType: body.equipmentType?.trim() || null,
    };
    const { score: scorePreQual, label: scoreLabel } = calculateScore(applicationDraft, []);

    // Traçabilité du simulateur d'origine (si présent) dans quoteDetails
    const source = body.sourceSimulator && typeof body.sourceSimulator === 'object'
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

    // Trace horodatée de l'acceptation des CGU.
    //
    // Le contrôle `body.consent !== true` ci-dessus refuse la demande, mais il
    // jetait ensuite le booléen : rien ne restait de l'acceptation une fois la
    // demande créée. Or c'est précisément ce qu'il faut pouvoir produire en cas
    // de contestation — la date, et le texte exact présenté au moment de cocher.
    // Le précédent du dépôt est `SignatureRequest.consentText`
    // (prisma/schema.prisma) : on suit la même idée, en conservant le libellé
    // plutôt qu'un simple `true`.
    //
    // La trace est écrite dans `quoteDetails`, colonne `Json?` déjà rédigée par
    // cette route et déjà chiffrée au repos (lib/sensitive.js déclare
    // `quoteDetails` en type `json` pour le modèle Application). Ce choix évite
    // une migration de schéma : voir la note du compte rendu — `schema.prisma`
    // porte en ce moment les modifications non validées d'autres chantiers
    // (`StripeWebhookEvent`, `RateLimitCounter`), et un `migrate dev` lancé
    // maintenant embarquerait leurs tables dans ma migration.
    const consentement = {
      accepte: true,
      accepteLe: new Date().toISOString(),
      texte: TEXTE_CONSENTEMENT,
      origine: 'espace-client/demande',
    };

    const quoteDetails = { ...(source || {}), consentement };

    // Affiliation : attribue la demande à l'apporteur si cookie présent
    const affiliateId = await currentAffiliateId();

    const application = await prisma.application.create({
      data: protect('Application', {
        ...applicationDraft,
        scorePreQual,
        scoreLabel,
        quoteDetails,
        ...(affiliateId ? { affiliateId } : {}),
      }),
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

    // Mêmes notifications que la route publique /api/financement : un dossier
    // ouvert depuis l'espace client ne partait jusqu'ici ni en confirmation au
    // client, ni en alerte à l'équipe.
    const emailClient = dbUser.email || body.email;
    if (emailClient) {
      sendConfirmationDemande({
        to: emailClient,
        reference,
        companyName: applicationDraft.companyName,
      }).catch((e) => console.error('Email confirmation:', e.message));
    }
    sendAlerteAdmin({
      reference,
      companyName: applicationDraft.companyName,
      productType: applicationDraft.productType,
      amount: applicationDraft.amount,
      email: emailClient,
    }).catch((e) => console.error('Email alerte admin:', e.message));

    return NextResponse.json({
      success: true,
      id: application.id,
      reference,
      message: `Demande ${reference} créée avec succès`,
    });
  } catch (err) {
    console.error('POST /api/applications error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
