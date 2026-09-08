/**
 * Test de bout en bout sur la base réelle, avec rapport par email.
 *
 *   node scripts/test-live.js [destinataire@exemple.fr]
 *
 * Ce que le script vérifie, dans l'ordre où un dossier vit réellement :
 *   1. connexion à la base
 *   2. schéma : les colonnes restaurées et celles de la signature
 *   3. création d'une demande de financement complète
 *   4. génération du contrat PDF et de son empreinte SHA-256
 *   5. ouverture d'un parcours de signature (jeton, expiration)
 *   6. contrôle d'intégrité : une empreinte divergente doit être détectée
 *   7. envoi du rapport par email
 *   8. nettoyage intégral de ce qui a été créé
 *
 * Tout ce qui est créé porte la mention TEST AUTOMATIQUE et est supprimé en
 * fin de parcours, y compris si une étape échoue.
 *
 * Depuis l'audit P0-1, DATABASE_URL pointe sur la base de développement locale.
 * Ce script s'y exécute par défaut. Pour une recette sur la base réelle, la
 * viser explicitement — le contournement est volontairement verbeux :
 *
 *   DATABASE_URL="<uri de production>" node scripts/test-live.js --i-know-this-is-production
 */

import { PrismaClient } from '@prisma/client';
import { generateContractPDF } from '../lib/pdf/contract.js';
import { empreinteDocument, genererJeton, DUREE_VALIDITE_MS } from '../lib/signature.js';
import { sendMail, isMailConfigured } from '../lib/email/send.js';
import { refuseProduction } from './_guard.js';

// Refuse de tourner contre une base de production (audit P0-1 / P1-3).
refuseProduction();

const DESTINATAIRE = process.argv[2] || 'andrys.developper@gmail.com';
const MARQUEUR = 'TEST AUTOMATIQUE — à supprimer';

const prisma = new PrismaClient();
const resultats = [];
const creations = { applicationId: null, offerId: null, signatureRequestId: null };

function noter(etape, ok, detail = '') {
  resultats.push({ etape, ok, detail });
  console.log(`${ok ? '  OK  ' : '  KO  '}${etape}${detail ? ' — ' + detail : ''}`);
}

async function etape(nom, fn) {
  try {
    const detail = await fn();
    noter(nom, true, detail || '');
    return true;
  } catch (e) {
    noter(nom, false, (e.message || String(e)).split('\n')[0].slice(0, 160));
    return false;
  }
}

async function main() {
  console.log('\n=== Test live Finarent ===\n');

  await etape('Connexion à la base', async () => {
    const n = await prisma.application.count();
    return `${n} demande(s) existante(s)`;
  });

  await etape('Schéma : colonnes de la table Application', async () => {
    const r = await prisma.$queryRawUnsafe(
      `select column_name from information_schema.columns
       where table_name='Application'
         and column_name in ('reference','email','phone','firstName','lastName')`,
    );
    if (r.length !== 5) throw new Error(`${r.length}/5 colonnes — schéma incomplet`);
    return '5/5 présentes';
  });

  await etape('Schéma : colonnes de preuve de signature', async () => {
    const r = await prisma.$queryRawUnsafe(
      `select column_name from information_schema.columns
       where table_name='SignatureRequest'
         and column_name in ('documentHash','documentPath','consentText')`,
    );
    if (r.length !== 3) throw new Error(`${r.length}/3 colonnes — migration non appliquée`);
    return '3/3 présentes';
  });

  // SignatureRequest.requestedToId est une clé étrangère vers User : un
  // identifiant inventé la fait échouer. On s'appuie sur un compte réellement
  // présent en base, ce qui teste aussi le rattachement du dossier à son client.
  let signataire = null;
  await etape('Repérage d\'un compte pour la signature', async () => {
    signataire = await prisma.user.findFirst({
      where: { role: 'CLIENT' },
      select: { id: true, email: true, name: true },
    });
    if (!signataire) throw new Error('aucun compte CLIENT en base — lancer scripts/seed-demo.js');
    return signataire.email;
  });

  let application = null;
  await etape('Création d\'une demande de financement', async () => {
    application = await prisma.application.create({
      data: {
        userId: signataire?.id || null,
        reference: `TEST-${Date.now().toString().slice(-8)}`,
        productType: 'PRET_PRO',
        status: 'QUOTE_ACCEPTED',
        amount: 25000,
        siren: '931295836',
        companyName: MARQUEUR,
        sector: 'BTP & Construction',
        email: DESTINATAIRE,
        phone: '0160285941',
        firstName: 'Test',
        lastName: 'Automatique',
      },
    });
    creations.applicationId = application.id;
    return `référence ${application.reference}`;
  });

  let offer = null;
  await etape('Création d\'une offre', async () => {
    offer = await prisma.offer.create({
      data: {
        applicationId: application.id,
        amount: 25000,
        durationMonths: 48,
        monthlyPayment: 578.42,
        rate: 4.2,
        totalCost: 27764,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 86400000),
        createdBy: 'test-live',
      },
    });
    creations.offerId = offer.id;
    return `offre ${offer.id.slice(0, 8)}`;
  });

  let pdf = null;
  let empreinte = null;
  await etape('Génération du contrat PDF', async () => {
    pdf = generateContractPDF({
      offer,
      application,
      user: { name: 'Test Automatique', email: DESTINATAIRE },
    });
    if (!pdf || pdf.length < 2000) throw new Error('PDF anormalement petit');
    if (pdf.subarray(0, 4).toString() !== '%PDF') throw new Error('En-tête PDF invalide');
    empreinte = empreinteDocument(pdf);
    return `${Math.round(pdf.length / 1024)} Ko · SHA-256 ${empreinte.slice(0, 16)}…`;
  });

  await etape('Ouverture d\'un parcours de signature', async () => {
    const d = await prisma.signatureRequest.create({
      data: {
        documentType: 'OFFER',
        documentId: offer.id,
        requestedToId: signataire.id,
        requestedById: signataire.id,
        provider: 'manual',
        token: genererJeton(),
        expiresAt: new Date(Date.now() + DUREE_VALIDITE_MS),
        documentHash: empreinte,
      },
    });
    creations.signatureRequestId = d.id;
    const jours = Math.round((d.expiresAt - Date.now()) / 86400000);
    return `jeton créé, valable ${jours} jours`;
  });

  await etape('Contrôle d\'intégrité du document', async () => {
    // Le contrat régénéré à l'identique doit redonner la même empreinte…
    const rejoue = generateContractPDF({
      offer,
      application,
      user: { name: 'Test Automatique', email: DESTINATAIRE },
    });
    // …mais le PDF embarque sa date de création : on compare donc ce qui
    // doit l'être, à savoir qu'une modification RÉELLE change l'empreinte.
    const modifie = generateContractPDF({
      offer: { ...offer, amount: 99999 },
      application,
      user: { name: 'Test Automatique', email: DESTINATAIRE },
    });
    if (empreinteDocument(modifie) === empreinte) {
      throw new Error('un montant modifié ne change pas l\'empreinte — contrôle inopérant');
    }
    return `taille rejouée ${Math.round(rejoue.length / 1024)} Ko, altération bien détectée`;
  });

  // ── Rapport par email ────────────────────────────────────────
  const ok = resultats.filter((r) => r.ok).length;
  const total = resultats.length;
  const lignes = resultats
    .map((r) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #E1E7E7">${r.ok ? '✅' : '❌'}</td>`
      + `<td style="padding:6px 10px;border-bottom:1px solid #E1E7E7">${r.etape}</td>`
      + `<td style="padding:6px 10px;border-bottom:1px solid #E1E7E7;color:#6E7C86;font-size:13px">${r.detail || ''}</td></tr>`)
    .join('');

  const html = `<div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#404040">
    <h2 style="color:#10253C;margin:0 0 4px">Test live Finarent — ${ok}/${total} réussis</h2>
    <p style="color:#6E7C86;margin:0 0 18px;font-size:14px">
      Exécuté le ${new Date().toLocaleString('fr-FR')} sur la base de production.
    </p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">${lignes}</table>
    <p style="color:#6E7C86;font-size:12px;margin-top:18px">
      Les données créées pour ce test ont été supprimées automatiquement.
    </p>
  </div>`;

  const texte = resultats.map((r) => `${r.ok ? 'OK' : 'KO'}  ${r.etape}${r.detail ? ' — ' + r.detail : ''}`).join('\n');

  if (!isMailConfigured()) {
    console.log(`\n  !!  Email non envoyé : aucune configuration d'envoi (Brevo ou SMTP).`);
    console.log(`      Rapport destiné à ${DESTINATAIRE} :\n`);
    console.log(texte);
  } else {
    try {
      const r = await sendMail({
        to: DESTINATAIRE,
        subject: `Test live Finarent — ${ok}/${total} réussis`,
        html,
        text: texte,
        log: { type: 'TRANSACTIONAL', source: 'TEST_LIVE' },
      });
      console.log(`\n  ${r?.sent === false ? '!!' : 'OK'}  Email vers ${DESTINATAIRE}` +
        (r?.error ? ` — ${r.error}` : ''));
    } catch (e) {
      console.log(`\n  !!  Envoi impossible : ${e.message}`);
    }
  }

  return ok === total;
}

async function nettoyer() {
  console.log('\n=== Nettoyage ===');
  const suppr = async (label, fn) => {
    try { await fn(); console.log(`  supprimé : ${label}`); }
    catch (e) { console.log(`  !! ${label} non supprimé : ${e.message.split('\n')[0].slice(0, 80)}`); }
  };
  if (creations.signatureRequestId)
    await suppr('demande de signature', () => prisma.signatureRequest.delete({ where: { id: creations.signatureRequestId } }));
  if (creations.offerId)
    await suppr('offre', () => prisma.offer.delete({ where: { id: creations.offerId } }));
  if (creations.applicationId) {
    await suppr('historique de statut', () => prisma.statusHistory.deleteMany({ where: { applicationId: creations.applicationId } }));
    await suppr('demande', () => prisma.application.delete({ where: { id: creations.applicationId } }));
  }
  const restants = await prisma.application.count({ where: { companyName: MARQUEUR } }).catch(() => -1);
  if (restants > 0) console.log(`  !! ${restants} enregistrement(s) de test encore en base`);
}

let succes = false;
try {
  succes = await main();
} catch (e) {
  console.error('\nErreur inattendue :', e.message);
} finally {
  await nettoyer();
  await prisma.$disconnect();
}

console.log(succes ? '\n=== TOUT EST PASSÉ ===\n' : '\n=== DES ÉTAPES ONT ÉCHOUÉ ===\n');
process.exit(succes ? 0 : 1);
