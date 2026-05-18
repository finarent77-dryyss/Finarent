import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BRAND_COLORS, BRAND_FONT, COMPANY_INFO, brandPastilleUrl, escapeHtml } from '@/lib/branding';

export async function GET(request, { params }) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  const app = await prisma.application.findFirst({
    where: { id, userId: auth.dbUser.id },
    include: {
      user: { select: { name: true, email: true, phone: true, company: true } },
      documents: true,
      statusHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!app) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  const statusLabels = {
    PENDING: 'En attente', REVIEWING: 'En cours d\'étude', DOCUMENTS_NEEDED: 'Documents manquants',
    QUOTE_SENT: 'Devis envoyé', QUOTE_ACCEPTED: 'Devis accepté', PENDING_SIGNATURE: 'En attente de signature',
    SIGNED: 'Signé', TRANSMITTED: 'Transmis', APPROVED: 'Approuvé', REJECTED: 'Refusé', COMPLETED: 'Finalisé',
  };

  const productLabels = {
    PRET_PRO: 'Prêt professionnel', CREDIT_BAIL: 'Crédit-bail', LOA: 'Location avec option d\'achat',
    LLD: 'Location longue durée', LEASING_OPS: 'Leasing opérationnel', RC_PRO: 'RC Professionnelle',
  };

  const origin = new URL(request.url).origin;
  const pastille = brandPastilleUrl(origin);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Récapitulatif dossier ${escapeHtml(app.companyName || app.equipmentType || app.id)} — Finarent</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${BRAND_FONT}; color: ${BRAND_COLORS.grisTexte}; padding: 40px; max-width: 820px; margin: auto; background: #ffffff; -webkit-font-smoothing: antialiased; }
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; margin-bottom: 30px; border-bottom: 1px solid #E4E8EC; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand img { width: 44px; height: 44px; border-radius: 12px; background: ${BRAND_COLORS.grisDoux}; padding: 6px; }
    .brand .name { font-size: 22px; font-weight: 800; color: ${BRAND_COLORS.marine}; letter-spacing: -0.01em; }
    .brand .tag { font-size: 11px; font-weight: 600; color: ${BRAND_COLORS.acier}; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 2px; }
    .badge { background: ${BRAND_COLORS.menthe}; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.02em; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: ${BRAND_COLORS.acier}; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #E4E8EC; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { background: ${BRAND_COLORS.grisDoux}; padding: 12px 14px; border-radius: 10px; border: 1px solid #E4E8EC; }
    .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${BRAND_COLORS.acier}; margin-bottom: 4px; letter-spacing: 0.06em; }
    .field-value { font-size: 14px; font-weight: 600; color: ${BRAND_COLORS.marine}; }
    .amount { font-size: 28px; font-weight: 800; color: ${BRAND_COLORS.vertProfond}; letter-spacing: -0.01em; }
    .timeline { border-left: 2px solid #E4E8EC; padding-left: 16px; }
    .timeline-item { position: relative; margin-bottom: 14px; padding: 6px 0; }
    .timeline-item::before { content: ''; position: absolute; left: -22px; top: 12px; width: 10px; height: 10px; background: ${BRAND_COLORS.menthe}; border-radius: 50%; box-shadow: 0 0 0 2px #ffffff; }
    .timeline-date { font-size: 10px; color: ${BRAND_COLORS.acier}; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    .timeline-status { font-size: 13px; font-weight: 700; color: ${BRAND_COLORS.marine}; margin-top: 2px; }
    .timeline-comment { font-size: 12px; color: ${BRAND_COLORS.grisTexte}; margin-top: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E4E8EC; text-align: center; font-size: 11px; color: ${BRAND_COLORS.acier}; line-height: 1.6; }
    .footer strong { color: ${BRAND_COLORS.marine}; }
    .doc-list { list-style: none; }
    .doc-list li { padding: 10px 14px; background: ${BRAND_COLORS.grisDoux}; border-radius: 8px; margin-bottom: 6px; font-size: 13px; border: 1px solid #E4E8EC; color: ${BRAND_COLORS.marine}; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
    .print-btn { background: ${BRAND_COLORS.menthe}; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; margin-bottom: 24px; box-shadow: 0 8px 20px rgba(88, 183, 148, 0.32); font-family: inherit; }
    .print-btn:hover { background: ${BRAND_COLORS.vertProfond}; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Imprimer / Télécharger PDF</button>

  <div class="header">
    <div class="brand">
      <img src="${pastille}" alt="Finarent">
      <div>
        <div class="name">${escapeHtml(COMPANY_INFO.name)}</div>
        <div class="tag">Récapitulatif de dossier</div>
      </div>
    </div>
    <div class="badge">${escapeHtml(statusLabels[app.status] || app.status)}</div>
  </div>

  <div class="section">
    <div class="section-title">Informations du dossier</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Entreprise</div>
        <div class="field-value">${escapeHtml(app.companyName || '—')}</div>
      </div>
      <div class="field">
        <div class="field-label">Type de produit</div>
        <div class="field-value">${escapeHtml(productLabels[app.productType] || app.productType)}</div>
      </div>
      <div class="field">
        <div class="field-label">SIREN</div>
        <div class="field-value">${escapeHtml(app.siren || '—')}</div>
      </div>
      <div class="field">
        <div class="field-label">Secteur</div>
        <div class="field-value">${escapeHtml(app.sector || '—')}</div>
      </div>
      <div class="field">
        <div class="field-label">Équipement</div>
        <div class="field-value">${escapeHtml(app.equipmentType || '—')}</div>
      </div>
      <div class="field">
        <div class="field-label">Durée</div>
        <div class="field-value">${app.duration ? escapeHtml(app.duration + ' mois') : '—'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Montant demandé</div>
    <div class="amount">${app.amount ? app.amount.toLocaleString('fr-FR') + ' €' : 'Non spécifié'}</div>
  </div>

  <div class="section">
    <div class="section-title">Contact</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Nom</div>
        <div class="field-value">${escapeHtml(app.user.name || '—')}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${escapeHtml(app.user.email)}</div>
      </div>
      <div class="field">
        <div class="field-label">Téléphone</div>
        <div class="field-value">${escapeHtml(app.user.phone || '—')}</div>
      </div>
      <div class="field">
        <div class="field-label">Société</div>
        <div class="field-value">${escapeHtml(app.user.company || '—')}</div>
      </div>
    </div>
  </div>

  ${app.documents.length > 0 ? `
  <div class="section">
    <div class="section-title">Documents joints (${app.documents.length})</div>
    <ul class="doc-list">
      ${app.documents.map(d => `<li>${escapeHtml(d.fileName)} (${(d.fileSize / 1024 / 1024).toFixed(1)} MB)</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${app.statusHistory.length > 0 ? `
  <div class="section">
    <div class="section-title">Historique du dossier</div>
    <div class="timeline">
      ${app.statusHistory.map(h => `
        <div class="timeline-item">
          <div class="timeline-date">${new Date(h.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          <div class="timeline-status">${escapeHtml(statusLabels[h.fromStatus] || h.fromStatus)} → ${escapeHtml(statusLabels[h.toStatus] || h.toStatus)}</div>
          ${h.comment ? `<div class="timeline-comment">${escapeHtml(h.comment)}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${app.description ? `
  <div class="section">
    <div class="section-title">Description</div>
    <p style="font-size:14px;line-height:1.6;color:${BRAND_COLORS.grisTexte}">${escapeHtml(app.description)}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p><strong>${escapeHtml(COMPANY_INFO.name)} ${escapeHtml(COMPANY_INFO.legalForm)}</strong> · ${escapeHtml(COMPANY_INFO.address)}, ${escapeHtml(COMPANY_INFO.postal)} ${escapeHtml(COMPANY_INFO.city)}</p>
    <p>SIRET ${escapeHtml(COMPANY_INFO.siret)} · ORIAS ${escapeHtml(COMPANY_INFO.orias)} · ${escapeHtml(COMPANY_INFO.phone)} · ${escapeHtml(COMPANY_INFO.email)}</p>
    <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · Réf : ${escapeHtml(app.id)}</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
