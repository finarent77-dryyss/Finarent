/**
 * Génère un aperçu HTML de tous les templates de mailing Finarent.
 *
 *   node scripts/preview-emails.mjs
 *   → .email-preview/index.html  (ouvrir dans le navigateur)
 *
 * Sert à relire la charte sans envoyer un seul email. Le navigateur reste
 * cependant plus permissif que les clients mail : avant une campagne réelle,
 * envoyer un test à une boîte Gmail ET une boîte Outlook (cf. sendCampaignTest
 * dans lib/brevo/send-campaign.js).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  templateConfirmationDemande,
  templateDocumentRecu,
  templateDocumentsManquants,
  templateAlerteAdmin,
  templateBienvenueNewsletter,
  templateCampagne,
  templateProspection,
  templateInvitationAffilie,
  templateStatutDemande,
  templateRapportInterne,
  templateDocumentGenere,
} from '../lib/email/templates.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sortie = path.join(racine, '.email-preview');

// Les aperçus pointent vers le site en ligne pour que le logo s'affiche.
const baseUrl = process.env.APP_BASE_URL || 'https://finarent.com';
const destinataireTest = 'client@exemple.fr';

const exemples = [
  {
    fichier: 'transactionnel-confirmation-demande',
    libelle: 'Confirmation de demande',
    famille: 'Transactionnel',
    mail: templateConfirmationDemande({ reference: 'FIN-2026-0412', companyName: 'Dupont Travaux SARL', baseUrl }),
  },
  {
    fichier: 'transactionnel-document-recu',
    libelle: 'Document reçu',
    famille: 'Transactionnel',
    mail: templateDocumentRecu({
      reference: 'FIN-2026-0412',
      fileName: 'kbis-dupont-travaux.pdf',
      documentType: 'Extrait Kbis',
      baseUrl,
    }),
  },
  {
    fichier: 'transactionnel-documents-manquants',
    libelle: 'Pièces manquantes',
    famille: 'Transactionnel',
    mail: templateDocumentsManquants({
      reference: 'FIN-2026-0412',
      missingDocs: ['Extrait Kbis de moins de 3 mois', 'Dernier bilan comptable', 'RIB professionnel'],
      baseUrl,
    }),
  },
  {
    fichier: 'transactionnel-alerte-admin',
    libelle: 'Alerte interne',
    famille: 'Transactionnel',
    mail: templateAlerteAdmin({
      reference: 'FIN-2026-0412',
      companyName: 'Dupont Travaux SARL',
      productType: 'Crédit-bail matériel',
      amount: '48 000 €',
      email: 'contact@dupont-travaux.fr',
      baseUrl,
    }),
  },
  {
    fichier: 'commercial-bienvenue-newsletter',
    libelle: 'Bienvenue newsletter',
    famille: 'Commercial',
    mail: templateBienvenueNewsletter({ to: destinataireTest, baseUrl }),
  },
  {
    fichier: 'commercial-campagne',
    libelle: 'Campagne (coquille générique)',
    famille: 'Commercial',
    mail: templateCampagne({
      to: destinataireTest,
      subject: 'LLD, LOA ou crédit : quel montage pour votre flotte en 2026 ?',
      preheader: 'Trois montages comparés sur un même véhicule à 32 000 € HT.',
      eyebrow: 'Lettre Finarent · Mars 2026',
      titre: 'LLD, LOA ou crédit : le bon arbitrage',
      intro:
        'Le choix du montage change la trésorerie, le bilan et la fiscalité de votre entreprise. Nous avons comparé les trois sur un cas réel : un utilitaire à 32 000 € HT sur 48 mois.',
      stats: [
        { valeur: '389 €', label: 'LLD — loyer mensuel' },
        { valeur: '412 €', label: 'LOA — loyer mensuel' },
        { valeur: '698 €', label: 'Crédit — échéance' },
      ],
      sections: [
        {
          heading: 'Ce que change chaque montage',
          bullets: [
            'LLD : aucun capital immobilisé, entretien inclus, pas d\'option d\'achat.',
            'LOA : loyers déductibles et option d\'achat en fin de contrat.',
            'Crédit : le véhicule entre à l\'actif, la charge d\'intérêts est déductible.',
          ],
        },
        {
          heading: 'Notre recommandation',
          text:
            'En dessous de 4 véhicules et avec un usage supérieur à 25 000 km par an, la LLD reste le montage le plus lisible. Au-delà, l\'arbitrage dépend de votre capacité d\'autofinancement.',
        },
      ],
      temoignage: {
        texte: 'Finarent a comparé 6 offres en 48 h, on a signé 220 € de moins par mois que notre concessionnaire.',
        auteur: 'Karim B., dirigeant, BTP (Seine-et-Marne)',
      },
      cta: { href: `${baseUrl}/simulateurs`, label: 'Simuler mon financement' },
      baseUrl,
    }),
  },
  {
    fichier: 'commercial-prospection',
    libelle: 'Prospection centre d\'appels',
    famille: 'Commercial',
    mail: templateProspection({
      to: destinataireTest,
      recipientName: 'Madame Lefèvre',
      subject: 'Votre projet de renouvellement de flotte',
      messageHtml:
        'Suite à notre échange, je vous confirme que nous pouvons étudier le renouvellement de vos 3 utilitaires. '
        + 'Je vous propose un point de 15 minutes cette semaine pour cadrer le budget.',
      trackingCode: 'CC-PARIS-042',
      senderName: 'Sonia',
      baseUrl,
    }),
  },
  {
    fichier: 'commercial-invitation-affilie',
    libelle: 'Recommandation affilié',
    famille: 'Commercial',
    mail: templateInvitationAffilie({
      to: destinataireTest,
      recipientName: 'Thomas',
      affiliateName: 'Julien Moreau',
      affiliateCode: 'JM2026',
      message: 'Ils m\'ont trouvé un crédit-bail 1,4 point sous ma banque, ça vaut le coup de les appeler.',
      baseUrl,
    }),
  },
  ...['QUOTE_SENT', 'PENDING_SIGNATURE', 'APPROVED', 'REJECTED'].map((statut) => ({
    fichier: 'dossier-' + statut.toLowerCase().replace('_', '-'),
    libelle: 'Statut : ' + statut,
    famille: 'Cycle de vie du dossier',
    mail: templateStatutDemande({
      statut,
      reference: 'FIN-2026-0412',
      companyName: 'Dupont Travaux SARL',
      amount: 48000,
      baseUrl,
    }),
  })),
  {
    fichier: 'interne-rapport-recette',
    libelle: 'Rapport de recette',
    famille: 'Interne',
    mail: templateRapportInterne({
      titre: 'Recette end-to-end Finarent',
      intro: 'Rapport automatique de <code>scripts/test-e2e.js</code>.',
      lignes: ['Comptes créés : 3 / 3', 'Tables DB contrôlées : 12', 'Routes testées : 28 (28 OK)'],
      reussis: 43,
      total: 43,
      baseUrl,
    }),
  },
  ...[
    { kind: 'FACTURE', numeroDocument: 'FAC-2026-0007', montant: '2 400 € TTC' },
    { kind: 'DEVIS', numeroDocument: 'DEV-2026-0031', montant: '48 000 € TTC' },
    { kind: 'CONTRAT', numeroDocument: null, montant: '48 000 €' },
  ].map((d) => ({
    fichier: 'document-' + d.kind.toLowerCase(),
    libelle: 'Envoi : ' + d.kind,
    famille: 'Documents',
    mail: templateDocumentGenere({
      ...d,
      reference: 'FIN-2026-00412',
      fileName: (d.numeroDocument || 'contrat-signe') + '.pdf',
      baseUrl,
    }),
  })),
];

fs.mkdirSync(sortie, { recursive: true });

for (const ex of exemples) {
  fs.writeFileSync(path.join(sortie, `${ex.fichier}.html`), ex.mail.html, 'utf8');
  fs.writeFileSync(path.join(sortie, `${ex.fichier}.txt`), ex.mail.text, 'utf8');
}

const familles = [...new Set(exemples.map((e) => e.famille))];
const index = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aperçu des mailings Finarent</title>
<style>
  body { margin:0; background:#F2F5F4; color:#404040; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
  header { background:#10253C; color:#fff; padding:26px 32px; }
  header h1 { margin:0; font-size:20px; }
  header p { margin:6px 0 0; font-size:13px; color:#9FB3C8; }
  main { padding:28px 32px; }
  h2 { font-size:13px; text-transform:uppercase; letter-spacing:.1em; color:#58B794; margin:28px 0 12px; }
  ul { list-style:none; margin:0; padding:0; display:grid; gap:10px; max-width:720px; }
  li { background:#fff; border:1px solid #E4E8EC; border-radius:12px; padding:14px 18px; display:flex;
       align-items:center; justify-content:space-between; gap:16px; }
  a { color:#3E9D7A; text-decoration:none; font-weight:600; font-size:14px; }
  .obj { font-size:13px; color:#737D8C; }
  .nom { font-weight:700; color:#10253C; font-size:15px; }
</style></head>
<body>
<header><h1>Aperçu des mailings Finarent</h1><p>Généré le ${new Date().toLocaleString('fr-FR')} — charte lib/email/charter.js</p></header>
<main>
${familles
  .map(
    (f) => `<h2>${f}</h2><ul>${exemples
      .filter((e) => e.famille === f)
      .map(
        (e) => `<li><span><span class="nom">${e.libelle}</span><br><span class="obj">${e.mail.subject}</span></span>
        <span><a href="./${e.fichier}.html">HTML</a> &nbsp; <a href="./${e.fichier}.txt">texte</a></span></li>`,
      )
      .join('')}</ul>`,
  )
  .join('')}
</main></body></html>`;

fs.writeFileSync(path.join(sortie, 'index.html'), index, 'utf8');

console.log(`${exemples.length} templates générés dans ${path.relative(racine, sortie)}/`);
console.log(`Ouvrir : ${path.join(sortie, 'index.html')}`);
