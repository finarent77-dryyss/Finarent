// Seed démo Finarent — données réalistes pour rendez-vous client
// Usage : node scripts/seed-demo.js
//
// Idempotent : nettoie d'abord la donnée démo, puis recrée.
// Les vrais users Auth0 (admin/client/partner/insurer @demo.fr) sont préservés
// et leur ligne DB est upsert avec le bon rôle.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Auth0 IDs des 4 comptes démo (créés via Management API) ───
// Tenant: dev-44jsict2grc7s0jn.eu.auth0.com
const AUTH0 = {
  admin: 'auth0|6a025639a8352bcd01f1e289',
  client: 'auth0|6a025639cbde62d766cfef79',
  partner: 'auth0|6a025639cbde62d766cfef7a',
  insurer: 'auth0|6a02563a065428472e9c5a79',
};

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000);
}

async function main() {
  console.log('🧹  Nettoyage des données démo existantes...');
  // Ordre inverse des FK
  await prisma.commission.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.newsletter.deleteMany({});
  await prisma.invoicePayment.deleteMany({});
  await prisma.invoiceLine.deleteMany({});
  await prisma.creditNote.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.quoteItem.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.signatureRequest.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { contains: '@demo' } } });
  await prisma.partner.deleteMany({});

  // ─── 1. PARTNERS ─────────────────────────────────────────────
  console.log('🤝  Création des partenaires...');
  const partners = await Promise.all([
    prisma.partner.create({ data: { name: 'BNP Paribas Leasing Solutions', type: 'BANK', contactEmail: 'leasing@bnpp.fr', notes: 'Tickets > 50k€' } }),
    prisma.partner.create({ data: { name: 'Société Générale Equipment Finance', type: 'BANK', contactEmail: 'sgef@socgen.fr' } }),
    prisma.partner.create({ data: { name: 'Crédit Agricole Leasing & Factoring', type: 'BANK', contactEmail: 'cal@ca.fr' } }),
    prisma.partner.create({ data: { name: 'AXA Entreprises', type: 'INSURANCE', contactEmail: 'pro@axa.fr', notes: 'RC Pro, multirisque' } }),
    prisma.partner.create({ data: { name: 'Generali Pro', type: 'INSURANCE', contactEmail: 'pro@generali.fr' } }),
    prisma.partner.create({ data: { name: 'Arval (BNP)', type: 'LEASING', contactEmail: 'contact@arval.fr', notes: 'Flotte véhicules' } }),
  ]);

  // ─── 2. USERS ────────────────────────────────────────────────
  console.log('👤  Création des users démo + clients fictifs...');
  const userAdmin = await prisma.user.create({
    data: { auth0Id: AUTH0.admin, email: 'admin@demo.fr', name: 'Sophie Martin', role: 'ADMIN' },
  });
  const userClient = await prisma.user.create({
    data: { auth0Id: AUTH0.client, email: 'client@demo.fr', name: 'Jean Dubois', role: 'CLIENT', company: 'Dubois Constructions', phone: '+33612345678' },
  });
  const userPartner = await prisma.user.create({
    data: { auth0Id: AUTH0.partner, email: 'partenaire@demo.fr', name: 'Marc Leroy', role: 'PARTNER', partnerId: partners[0].id },
  });
  const userInsurer = await prisma.user.create({
    data: { auth0Id: AUTH0.insurer, email: 'assureur@demo.fr', name: 'Claire Petit', role: 'INSURER', partnerId: partners[3].id },
  });

  // Clients fictifs pour remplir le pipeline admin (ils n'ont pas de compte Auth0)
  const fakeClients = await Promise.all([
    prisma.user.create({ data: { auth0Id: 'demo|c001', email: 'philippe.bernard@demo-btp.fr', name: 'Philippe Bernard', role: 'CLIENT', company: 'Bernard BTP', phone: '+33611111111' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c002', email: 'marie.lefebvre@demo-medical.fr', name: 'Dr Marie Lefebvre', role: 'CLIENT', company: 'Cabinet Dr Lefebvre', phone: '+33622222222' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c003', email: 'antoine.moreau@demo-it.fr', name: 'Antoine Moreau', role: 'CLIENT', company: 'Moreau IT Services', phone: '+33633333333' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c004', email: 'isabelle.roux@demo-transport.fr', name: 'Isabelle Roux', role: 'CLIENT', company: 'Roux Logistique', phone: '+33644444444' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c005', email: 'thomas.simon@demo-industrie.fr', name: 'Thomas Simon', role: 'CLIENT', company: 'Simon Mécanique', phone: '+33655555555' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c006', email: 'camille.michel@demo-services.fr', name: 'Camille Michel', role: 'CLIENT', company: 'Michel Conseil', phone: '+33666666666' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c007', email: 'lucas.garcia@demo-btp.fr', name: 'Lucas Garcia', role: 'CLIENT', company: 'Garcia Couverture', phone: '+33677777777' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c008', email: 'sophie.lambert@demo-medical.fr', name: 'Dr Sophie Lambert', role: 'CLIENT', company: 'Clinique Lambert', phone: '+33688888888' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c009', email: 'nicolas.fontaine@demo-it.fr', name: 'Nicolas Fontaine', role: 'CLIENT', company: 'Fontaine Digital', phone: '+33699999999' } }),
    prisma.user.create({ data: { auth0Id: 'demo|c010', email: 'emma.rousseau@demo-transport.fr', name: 'Emma Rousseau', role: 'CLIENT', company: 'Rousseau Transports', phone: '+33610101010' } }),
  ]);

  // ─── 3. APPLICATIONS (15 dossiers, statuts variés) ──────────
  console.log('📋  Création des dossiers...');
  const apps = [];
  const applicationSeeds = [
    // Pipeline frais (PENDING / REVIEWING)
    { client: fakeClients[0], product: 'CREDIT_BAIL',  status: 'PENDING',           amount: 85000,  duration: 48, sector: 'BTP',       equipment: 'Pelle hydraulique 12T', siren: '809123456', company: 'Bernard BTP',         score: 72, days: 1 },
    { client: fakeClients[1], product: 'LOA',          status: 'REVIEWING',         amount: 45000,  duration: 36, sector: 'Médical',   equipment: 'Échographe haute gamme',  siren: '812345678', company: 'Cabinet Dr Lefebvre', score: 88, days: 2 },
    { client: fakeClients[2], product: 'PRET_PRO',     status: 'DOCUMENTS_NEEDED',  amount: 30000,  duration: 24, sector: 'IT',        equipment: 'Serveurs Dell PowerEdge', siren: '821345671', company: 'Moreau IT Services',  score: 65, days: 3 },
    // Cycle devis
    { client: fakeClients[3], product: 'LLD',          status: 'QUOTE_SENT',        amount: 120000, duration: 60, sector: 'Transport', equipment: 'Flotte 4 utilitaires',     siren: '834567812', company: 'Roux Logistique',     score: 81, days: 5 },
    { client: fakeClients[4], product: 'CREDIT_BAIL',  status: 'QUOTE_ACCEPTED',    amount: 220000, duration: 60, sector: 'Industrie', equipment: 'Tour CN Mazak',           siren: '845678123', company: 'Simon Mécanique',     score: 92, days: 7 },
    { client: fakeClients[5], product: 'PRET_PRO',     status: 'PENDING_SIGNATURE', amount: 18000,  duration: 24, sector: 'Services',  equipment: 'Aménagement bureaux',     siren: '856781234', company: 'Michel Conseil',      score: 76, days: 9 },
    { client: fakeClients[6], product: 'LOA',          status: 'SIGNED',            amount: 35000,  duration: 48, sector: 'BTP',       equipment: 'Camion benne 7,5T',       siren: '867812345', company: 'Garcia Couverture',   score: 84, days: 12 },
    // Transmission partenaire
    { client: fakeClients[7], product: 'CREDIT_BAIL',  status: 'TRANSMITTED',       amount: 450000, duration: 84, sector: 'Médical',   equipment: 'IRM 1.5T + installation', siren: '878123456', company: 'Clinique Lambert',    score: 95, days: 18 },
    { client: fakeClients[8], product: 'LEASING_OPS',  status: 'APPROVED',          amount: 28000,  duration: 36, sector: 'IT',        equipment: 'Parc 30 MacBook Pro',     siren: '889234567', company: 'Fontaine Digital',    score: 79, days: 25 },
    // Finalisé
    { client: fakeClients[9], product: 'LLD',          status: 'COMPLETED',         amount: 95000,  duration: 48, sector: 'Transport', equipment: 'Camion frigorifique 19T', siren: '891234567', company: 'Rousseau Transports', score: 88, days: 40 },
    // Refusé
    { client: fakeClients[0], product: 'PRET_PRO',     status: 'REJECTED',          amount: 600000, duration: 84, sector: 'BTP',       equipment: 'Démarrage activité',     siren: '809123456', company: 'Bernard BTP',         score: 38, days: 60 },
    // Quelques dossiers du vrai client démo
    { client: userClient,     product: 'CREDIT_BAIL',  status: 'REVIEWING',         amount: 75000,  duration: 48, sector: 'BTP',       equipment: 'Mini-pelle Bobcat E35',   siren: '901234567', company: 'Dubois Constructions',score: 80, days: 4 },
    { client: userClient,     product: 'RC_PRO',       status: 'QUOTE_SENT',        amount: 0,      duration: 12, sector: 'BTP',       equipment: 'RC Pro BTP',              siren: '901234567', company: 'Dubois Constructions',score: 85, days: 6 },
    { client: userClient,     product: 'LOA',          status: 'COMPLETED',         amount: 42000,  duration: 36, sector: 'BTP',       equipment: 'Renault Master L3H2',     siren: '901234567', company: 'Dubois Constructions',score: 89, days: 90 },
    // Pour partner et insurer
    { client: fakeClients[1], product: 'CREDIT_BAIL',  status: 'TRANSMITTED',       amount: 65000,  duration: 48, sector: 'Médical',   equipment: 'Échographe portable',     siren: '812345678', company: 'Cabinet Dr Lefebvre', score: 87, days: 14 },
  ];

  for (const s of applicationSeeds) {
    const a = await prisma.application.create({
      data: {
        userId: s.client.id,
        productType: s.product,
        status: s.status,
        amount: s.amount,
        duration: s.duration,
        equipmentType: s.equipment,
        siren: s.siren,
        companyName: s.company,
        sector: s.sector,
        scorePreQual: s.score,
        scoreLabel: s.score >= 85 ? 'Excellent' : s.score >= 70 ? 'Bon' : s.score >= 50 ? 'Moyen' : 'Faible',
        partnerId: ['TRANSMITTED', 'APPROVED', 'COMPLETED'].includes(s.status) ? partners[s.sector === 'Médical' ? 1 : s.sector === 'Transport' ? 5 : 0].id : null,
        transmittedAt: ['TRANSMITTED', 'APPROVED', 'COMPLETED'].includes(s.status) ? daysAgo(s.days - 2) : null,
        createdAt: daysAgo(s.days),
      },
    });
    apps.push({ ...a, _seed: s });
  }

  // ─── 4. STATUS HISTORY (progression réaliste) ───────────────
  console.log('📜  Historique des statuts...');
  const transitions = {
    PENDING: [],
    REVIEWING: [['PENDING', 'REVIEWING']],
    DOCUMENTS_NEEDED: [['PENDING', 'REVIEWING'], ['REVIEWING', 'DOCUMENTS_NEEDED']],
    QUOTE_SENT: [['PENDING', 'REVIEWING'], ['REVIEWING', 'QUOTE_SENT']],
    QUOTE_ACCEPTED: [['PENDING', 'REVIEWING'], ['REVIEWING', 'QUOTE_SENT'], ['QUOTE_SENT', 'QUOTE_ACCEPTED']],
    PENDING_SIGNATURE: [['PENDING', 'REVIEWING'], ['REVIEWING', 'QUOTE_SENT'], ['QUOTE_SENT', 'QUOTE_ACCEPTED'], ['QUOTE_ACCEPTED', 'PENDING_SIGNATURE']],
    SIGNED: [['PENDING', 'REVIEWING'], ['REVIEWING', 'QUOTE_SENT'], ['QUOTE_SENT', 'QUOTE_ACCEPTED'], ['QUOTE_ACCEPTED', 'PENDING_SIGNATURE'], ['PENDING_SIGNATURE', 'SIGNED']],
    TRANSMITTED: [['PENDING', 'REVIEWING'], ['REVIEWING', 'QUOTE_SENT'], ['QUOTE_SENT', 'QUOTE_ACCEPTED'], ['QUOTE_ACCEPTED', 'PENDING_SIGNATURE'], ['PENDING_SIGNATURE', 'SIGNED'], ['SIGNED', 'TRANSMITTED']],
    APPROVED: [['PENDING', 'REVIEWING'], ['REVIEWING', 'QUOTE_SENT'], ['QUOTE_SENT', 'QUOTE_ACCEPTED'], ['QUOTE_ACCEPTED', 'PENDING_SIGNATURE'], ['PENDING_SIGNATURE', 'SIGNED'], ['SIGNED', 'TRANSMITTED'], ['TRANSMITTED', 'APPROVED']],
    COMPLETED: [['PENDING', 'REVIEWING'], ['REVIEWING', 'QUOTE_SENT'], ['QUOTE_SENT', 'QUOTE_ACCEPTED'], ['QUOTE_ACCEPTED', 'PENDING_SIGNATURE'], ['PENDING_SIGNATURE', 'SIGNED'], ['SIGNED', 'TRANSMITTED'], ['TRANSMITTED', 'APPROVED'], ['APPROVED', 'COMPLETED']],
    REJECTED: [['PENDING', 'REVIEWING'], ['REVIEWING', 'REJECTED']],
  };
  for (const app of apps) {
    const trail = transitions[app.status] || [];
    for (let i = 0; i < trail.length; i++) {
      const [from, to] = trail[i];
      await prisma.statusHistory.create({
        data: {
          applicationId: app.id,
          changedById: userAdmin.id,
          fromStatus: from,
          toStatus: to,
          comment: i === trail.length - 1 ? null : 'Étape automatique',
          createdAt: daysAgo(app._seed.days - i),
        },
      });
    }
  }

  // ─── 5. OFFERS ──────────────────────────────────────────────
  console.log('💰  Création des offres...');
  for (const app of apps) {
    if (!['QUOTE_SENT', 'QUOTE_ACCEPTED', 'PENDING_SIGNATURE', 'SIGNED', 'TRANSMITTED', 'APPROVED', 'COMPLETED'].includes(app.status)) continue;
    if (app.amount === 0) continue;
    const rate = 3.2 + Math.random() * 2.5; // 3.2% à 5.7%
    const months = app.duration;
    const monthlyRate = rate / 100 / 12;
    const monthly = Math.round((app.amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
    const total = monthly * months;
    const isSigned = ['SIGNED', 'TRANSMITTED', 'APPROVED', 'COMPLETED'].includes(app.status);
    const isAccepted = ['QUOTE_ACCEPTED', 'PENDING_SIGNATURE', ...['SIGNED', 'TRANSMITTED', 'APPROVED', 'COMPLETED']].includes(app.status);
    await prisma.offer.create({
      data: {
        applicationId: app.id,
        amount: app.amount,
        durationMonths: months,
        monthlyPayment: monthly,
        rate,
        totalCost: total,
        partnerId: app.partnerId || partners[0].id,
        status: isSigned ? 'SIGNED' : isAccepted ? 'ACCEPTED' : 'SENT',
        expiresAt: daysAgo(-30),
        sentAt: daysAgo(app._seed.days - 1),
        viewedAt: daysAgo(app._seed.days - 1),
        acceptedAt: isAccepted ? daysAgo(app._seed.days - 2) : null,
        signedAt: isSigned ? daysAgo(app._seed.days - 3) : null,
        createdBy: userAdmin.id,
      },
    });
  }

  // ─── 6. COMMISSIONS (pour dossiers transmis/approuvés/complétés) ────
  console.log('💶  Commissions...');
  for (const app of apps) {
    if (!['TRANSMITTED', 'APPROVED', 'COMPLETED'].includes(app.status)) continue;
    if (!app.partnerId || app.amount === 0) continue;
    const rate = 0.025; // 2.5%
    await prisma.commission.create({
      data: {
        applicationId: app.id,
        partnerId: app.partnerId,
        amount: Math.round(app.amount * rate),
        rate,
        status: app.status === 'COMPLETED' ? 'PAID' : 'PENDING',
        paidAt: app.status === 'COMPLETED' ? daysAgo(app._seed.days - 5) : null,
      },
    });
  }

  // ─── 7. MESSAGES (conversation client ↔ admin) ──────────────
  console.log('💬  Messages...');
  for (const app of apps.slice(0, 8)) {
    await prisma.message.create({
      data: { applicationId: app.id, senderId: app._seed.client.id, content: `Bonjour, j'ai bien reçu votre demande de pièces. Je vous transmets cela dans la journée.`, readAt: daysAgo(app._seed.days - 1), createdAt: daysAgo(app._seed.days) },
    });
    await prisma.message.create({
      data: { applicationId: app.id, senderId: userAdmin.id, content: `Merci, dossier complet reçu. Je traite et reviens vers vous sous 48h avec une proposition.`, readAt: null, createdAt: daysAgo(app._seed.days - 1) },
    });
  }

  // ─── 8. TESTIMONIALS ────────────────────────────────────────
  console.log('⭐  Témoignages...');
  const testimonials = [
    { authorName: 'Philippe Bernard', initials: 'PB', position: 'Gérant', company: 'Bernard BTP',         sector: 'BTP',        rating: 5, text: 'Service impeccable, dossier monté en 48h. Je recommande Finarent à tous les artisans du BTP.', amount: '85 000€' },
    { authorName: 'Dr Marie Lefebvre', initials: 'ML', position: 'Médecin radiologue', company: 'Cabinet Dr Lefebvre', sector: 'Médical', rating: 5, text: 'Accompagnement très professionnel pour le financement de mon échographe. Conseils précieux sur l\'optimisation fiscale.', amount: '45 000€' },
    { authorName: 'Antoine Moreau', initials: 'AM', position: 'CEO', company: 'Moreau IT', sector: 'IT', rating: 4, text: 'Process clair, équipe disponible. J\'ai pu équiper mes 30 collaborateurs sans toucher à ma trésorerie.', amount: '180 000€' },
    { authorName: 'Isabelle Roux', initials: 'IR', position: 'Directrice', company: 'Roux Logistique', sector: 'Transport', rating: 5, text: 'Renouvellement de flotte en LLD, tout s\'est fait à distance. Très satisfaite.', amount: '120 000€' },
    { authorName: 'Thomas Simon', initials: 'TS', position: 'Dirigeant', company: 'Simon Mécanique', sector: 'Industrie', rating: 5, text: 'Pour ma nouvelle machine, Finarent a négocié un taux 0,8 point en-dessous de ce que ma banque me proposait.', amount: '220 000€' },
    { authorName: 'Camille Michel', initials: 'CM', position: 'Consultant', company: 'Michel Conseil', sector: 'Services', rating: 4, text: 'Solution sur-mesure pour l\'aménagement de mes bureaux. Bonne disponibilité du conseiller.', amount: '18 000€' },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: { ...t, isPublished: true, isApproved: true, approvedAt: daysAgo(30) },
    });
  }

  // ─── 8b. DEVIS ─────────────────────────────────────────────
  console.log('📑  Devis...');
  const quoteSeeds = [
    {
      number: `DEV-${new Date().getFullYear()}-0001`,
      status: 'SENT',
      contactName: 'Jean Dubois', contactEmail: 'client@demo.fr', contactPhone: '+33612345678',
      companyName: 'Dubois Constructions', companySiret: '901234567',
      items: [
        { description: 'Honoraires courtage — Crédit-bail mini-pelle Bobcat E35', quantity: 1, unitPriceHT: 1500 },
        { description: 'Frais de dossier', quantity: 1, unitPriceHT: 250 },
      ],
      sentDays: 3,
    },
    {
      number: `DEV-${new Date().getFullYear()}-0002`,
      status: 'ACCEPTED',
      contactName: 'Dr Marie Lefebvre', contactEmail: 'marie.lefebvre@demo-medical.fr',
      companyName: 'Cabinet Dr Lefebvre', companySiret: '812345678',
      items: [
        { description: 'Honoraires courtage — LOA échographe', quantity: 1, unitPriceHT: 900 },
        { description: 'Conseil fiscal & optimisation', quantity: 1, unitPriceHT: 350 },
      ],
      sentDays: 8, acceptedDays: 5,
    },
    {
      number: `DEV-${new Date().getFullYear()}-0003`,
      status: 'DRAFT',
      contactName: 'Antoine Moreau', contactEmail: 'antoine.moreau@demo-it.fr',
      companyName: 'Moreau IT Services', companySiret: '821345671',
      items: [
        { description: 'Honoraires courtage — Prêt pro serveurs', quantity: 1, unitPriceHT: 600 },
      ],
      sentDays: null,
    },
  ];
  const quotes = [];
  for (const q of quoteSeeds) {
    const subtotalHT = q.items.reduce((s, it) => s + it.quantity * it.unitPriceHT, 0);
    const taxAmount = subtotalHT * 0.20;
    const totalTTC = Math.round((subtotalHT + taxAmount) * 100) / 100;
    const created = await prisma.quote.create({
      data: {
        quoteNumber: q.number,
        contactName: q.contactName, contactEmail: q.contactEmail, contactPhone: q.contactPhone,
        companyName: q.companyName, companySiret: q.companySiret,
        status: q.status,
        validUntil: daysAgo(-30),
        subtotalHT, taxRate: 20, taxAmount, totalTTC,
        paymentTerms: 'À réception',
        sentAt: q.sentDays ? daysAgo(q.sentDays) : null,
        acceptedAt: q.acceptedDays ? daysAgo(q.acceptedDays) : null,
        items: {
          create: q.items.map((it, i) => ({
            description: it.description,
            quantity: it.quantity,
            unitPriceHT: it.unitPriceHT,
            totalHT: it.quantity * it.unitPriceHT,
            position: i,
          })),
        },
      },
    });
    quotes.push(created);
  }

  // ─── 8c. FACTURES ──────────────────────────────────────────
  console.log('💸  Factures...');
  const invoiceSeeds = [
    {
      number: `FAC-${new Date().getFullYear()}-0001`,
      status: 'PAID',
      client: { name: 'Dubois Constructions', email: 'client@demo.fr', address: '14 rue de la République', postal: '75011', city: 'Paris', siret: '901234567' },
      lines: [
        { description: 'Honoraires courtage — LOA Renault Master', quantity: 1, unitPrice: 850, vatRate: 20 },
      ],
      issuedDays: 60, dueDays: 30, paidDays: 28, paymentMethod: 'virement',
    },
    {
      number: `FAC-${new Date().getFullYear()}-0002`,
      status: 'PARTIAL',
      client: { name: 'Roux Logistique', email: 'isabelle.roux@demo-transport.fr', address: '4 av. des Champs', postal: '69003', city: 'Lyon', siret: '834567812' },
      lines: [
        { description: 'Honoraires courtage — LLD flotte 4 utilitaires', quantity: 1, unitPrice: 2400, vatRate: 20 },
        { description: 'Frais de dossier', quantity: 1, unitPrice: 250, vatRate: 20 },
      ],
      issuedDays: 25, dueDays: 5, payments: [{ amount: 1500, method: 'virement', daysAgo: 10 }],
    },
    {
      number: `FAC-${new Date().getFullYear()}-0003`,
      status: 'ISSUED',
      client: { name: 'Cabinet Dr Lefebvre', email: 'marie.lefebvre@demo-medical.fr', address: '22 rue des Médecins', postal: '13001', city: 'Marseille', siret: '812345678' },
      lines: [
        { description: 'Honoraires courtage — LOA échographe', quantity: 1, unitPrice: 900, vatRate: 20 },
        { description: 'Conseil fiscal & optimisation', quantity: 1, unitPrice: 350, vatRate: 20 },
      ],
      issuedDays: 5, dueDays: -25, // pas encore due
    },
  ];
  for (const inv of invoiceSeeds) {
    let totalHT = 0, totalTVA = 0;
    for (const l of inv.lines) {
      const ht = l.quantity * l.unitPrice;
      totalHT += ht;
      totalTVA += ht * (l.vatRate / 100);
    }
    const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100;
    const paidAmount = (inv.payments || []).reduce((s, p) => s + p.amount, 0)
      + (inv.status === 'PAID' ? totalTTC - (inv.payments || []).reduce((s, p) => s + p.amount, 0) : 0);

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber: inv.number,
        status: inv.status,
        issueDate: daysAgo(inv.issuedDays),
        dueDate: daysAgo(inv.dueDays),
        paidAt: inv.status === 'PAID' ? daysAgo(inv.paidDays || 0) : null,
        paymentMethod: inv.paymentMethod,
        clientName: inv.client.name,
        clientEmail: inv.client.email,
        clientAddress: inv.client.address,
        clientPostal: inv.client.postal,
        clientCity: inv.client.city,
        clientSiret: inv.client.siret,
        totalHT: Math.round(totalHT * 100) / 100,
        totalTVA: Math.round(totalTVA * 100) / 100,
        totalTTC,
        paidAmount,
        paymentTerms: 'Paiement à 30 jours',
        lines: {
          create: inv.lines.map((l, i) => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            vatRate: l.vatRate,
            position: i,
          })),
        },
      },
    });

    // Versements détaillés (pour PARTIAL et PAID complets)
    if (inv.payments) {
      for (const p of inv.payments) {
        await prisma.invoicePayment.create({
          data: {
            invoiceId: created.id,
            amount: p.amount,
            paymentMethod: p.method,
            paidAt: daysAgo(p.daysAgo),
            reference: `VIR-2026-${Math.floor(Math.random() * 10000)}`,
          },
        });
      }
    }
    if (inv.status === 'PAID') {
      await prisma.invoicePayment.create({
        data: {
          invoiceId: created.id,
          amount: totalTTC,
          paymentMethod: inv.paymentMethod,
          paidAt: daysAgo(inv.paidDays),
          reference: `VIR-2026-${Math.floor(Math.random() * 10000)}`,
        },
      });
    }
  }

  // ─── 9. FAQ ─────────────────────────────────────────────────
  console.log('❓  FAQ...');
  const faqs = [
    { question: 'Combien de temps pour avoir une réponse ?',            answer: 'Vous recevez une réponse de principe sous 48h ouvrées après envoi de votre dossier complet. Le déblocage des fonds intervient ensuite sous 5 à 10 jours.', category: 'process', order: 1 },
    { question: 'Quels documents fournir ?',                            answer: 'Pour une première demande : KBIS de moins de 3 mois, derniers comptes annuels, RIB et pièce d\'identité du dirigeant. D\'autres documents peuvent être demandés selon le montant.', category: 'process', order: 2 },
    { question: 'Quel est le montant minimum / maximum ?',              answer: 'Nous finançons de 3 000€ à 2 000 000€ selon votre profil, votre activité et la nature de l\'équipement.', category: 'process', order: 3 },
    { question: 'Faut-il un apport ?',                                  answer: 'Non. Nos solutions de crédit-bail, LOA et LLD sont sans apport. Pour le prêt professionnel, un apport peut renforcer votre dossier mais n\'est pas obligatoire.', category: 'financement', order: 4 },
    { question: 'Quelle différence entre crédit-bail, LOA et LLD ?',    answer: 'Crédit-bail et LOA permettent de devenir propriétaire de l\'équipement en fin de contrat (option d\'achat). La LLD est une location pure, sans option d\'achat, avec services inclus.', category: 'financement', order: 5 },
    { question: 'Les loyers sont-ils déductibles ?',                    answer: 'Oui, les loyers de crédit-bail, LOA et LLD sont 100% déductibles du résultat imposable de votre entreprise. C\'est un avantage fiscal majeur par rapport à un achat comptant.', category: 'fiscalite', order: 6 },
    { question: 'Que se passe-t-il en cas de difficulté de paiement ?', answer: 'Contactez votre conseiller dès les premiers signes. Nous étudions toutes les solutions : report d\'échéances, allongement de durée, restructuration. Un suivi humain et personnalisé.', category: 'support', order: 7 },
    { question: 'Travaillez-vous avec des sociétés en création ?',      answer: 'Oui, nous accompagnons les jeunes entreprises (moins de 3 ans) avec des solutions adaptées, notamment via nos partenaires spécialisés.', category: 'eligibilite', order: 8 },
    { question: 'Mes données sont-elles protégées ?',                   answer: 'Absolument. Nous sommes conformes au RGPD, vos données sont hébergées en France et chiffrées de bout en bout. Vous pouvez à tout moment demander leur suppression.', category: 'rgpd', order: 9 },
    { question: 'Comment fonctionne le parrainage ?',                   answer: 'Parrainez une entreprise depuis votre espace client. Si elle finalise un dossier avec nous, vous recevez une commission de 1% du montant financé (max. 5 000€).', category: 'parrainage', order: 10 },
  ];
  for (const f of faqs) await prisma.fAQ.create({ data: { ...f, isActive: true } });

  // ─── 10. REFERRALS ──────────────────────────────────────────
  console.log('🎁  Parrainages...');
  await prisma.referral.create({ data: { referrerId: userClient.id, refereeEmail: 'amis.demo1@example.fr', refereeName: 'Jean Voisin',     status: 'CONVERTED', code: 'DEMO-001', convertedAt: daysAgo(15) } });
  await prisma.referral.create({ data: { referrerId: userClient.id, refereeEmail: 'amis.demo2@example.fr', refereeName: 'Sophie Voisine',  status: 'PENDING',   code: 'DEMO-002' } });
  await prisma.referral.create({ data: { referrerId: userClient.id, refereeEmail: 'amis.demo3@example.fr', refereeName: 'Marc Confrère',   status: 'PENDING',   code: 'DEMO-003' } });

  // ─── 11. NEWSLETTER ─────────────────────────────────────────
  console.log('📧  Newsletter...');
  for (const e of ['marie.demo@example.com', 'paul.demo@example.com', 'sophie.demo@example.com', 'thomas.demo@example.com']) {
    await prisma.newsletter.create({ data: { email: e } });
  }

  console.log('');
  console.log('✅  Seed terminé.');
  console.log(`   ${partners.length} partenaires, ${apps.length} dossiers, ${testimonials.length} témoignages, ${faqs.length} FAQs`);
  console.log(`   3 devis (1 DRAFT, 1 SENT, 1 ACCEPTED), 3 factures (1 ISSUED, 1 PARTIAL, 1 PAID)`);
}

main()
  .catch((e) => { console.error('❌  Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
