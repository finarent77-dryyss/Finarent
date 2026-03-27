import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Récapitulatif Dossier - ${app.companyName || app.equipmentType || app.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; color: #0A2540; padding: 40px; max-width: 800px; margin: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6366F1; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: 900; color: #0A2540; }
    .logo span { color: #6366F1; }
    .badge { background: #6366F1; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #6366F1; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .field { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .field-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .field-value { font-size: 14px; font-weight: 600; }
    .amount { font-size: 24px; font-weight: 900; color: #10B981; }
    .timeline { border-left: 2px solid #e2e8f0; padding-left: 16px; }
    .timeline-item { position: relative; margin-bottom: 12px; padding: 8px 0; }
    .timeline-item::before { content: ''; position: absolute; left: -21px; top: 12px; width: 10px; height: 10px; background: #6366F1; border-radius: 50%; }
    .timeline-date { font-size: 10px; color: #94a3b8; font-weight: 600; }
    .timeline-status { font-size: 13px; font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    .doc-list { list-style: none; }
    .doc-list li { padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 4px; font-size: 13px; border: 1px solid #e2e8f0; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
    .print-btn { background: #6366F1; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; margin-bottom: 24px; }
    .print-btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">
    Imprimer / Télécharger PDF
  </button>

  <div class="header">
    <div class="logo">Fin<span>assur</span></div>
    <div class="badge">${statusLabels[app.status] || app.status}</div>
  </div>

  <div class="section">
    <div class="section-title">Informations du dossier</div>
    <div class="grid">
      <div class="field">
        <div class="field-label">Entreprise</div>
        <div class="field-value">${app.companyName || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Type de produit</div>
        <div class="field-value">${productLabels[app.productType] || app.productType}</div>
      </div>
      <div class="field">
        <div class="field-label">SIREN</div>
        <div class="field-value">${app.siren || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Secteur</div>
        <div class="field-value">${app.sector || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Équipement</div>
        <div class="field-value">${app.equipmentType || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Durée</div>
        <div class="field-value">${app.duration ? app.duration + ' mois' : '-'}</div>
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
        <div class="field-value">${app.user.name || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Email</div>
        <div class="field-value">${app.user.email}</div>
      </div>
      <div class="field">
        <div class="field-label">Téléphone</div>
        <div class="field-value">${app.user.phone || '-'}</div>
      </div>
      <div class="field">
        <div class="field-label">Société</div>
        <div class="field-value">${app.user.company || '-'}</div>
      </div>
    </div>
  </div>

  ${app.documents.length > 0 ? `
  <div class="section">
    <div class="section-title">Documents joints (${app.documents.length})</div>
    <ul class="doc-list">
      ${app.documents.map(d => `<li>${d.fileName} (${(d.fileSize / 1024 / 1024).toFixed(1)} MB)</li>`).join('')}
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
          <div class="timeline-status">${statusLabels[h.fromStatus] || h.fromStatus} → ${statusLabels[h.toStatus] || h.toStatus}</div>
          ${h.comment ? `<div style="font-size:12px;color:#64748b;margin-top:2px">${h.comment}</div>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${app.description ? `
  <div class="section">
    <div class="section-title">Description</div>
    <p style="font-size:14px;line-height:1.6;color:#334155">${app.description}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Finassur — Courtier en financement professionnel</p>
    <p>Document généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <p>Réf: ${app.id}</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
