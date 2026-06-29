# Intégration centre d'appels — SL Formations → Finarent

> Portage complet du module centre d'appels (Ringover, Brevo, prospects, équipes, affiliation fiscal) depuis **slformations** vers **finassur** (Finarent).

## État d'avancement — juin 2026

### ✅ Intégré et fonctionnel

| Fonctionnalité SL Formations | Équivalent Finarent |
|------------------------------|---------------------|
| Espace `/call-center` | `app/call-center/*` |
| Click-to-call + SMS Ringover | `RingoverProspectActions` + `/api/call-center/ringover` |
| Webhook appels + SMS | `/api/webhooks/ringover` + `process-sms-event.js` |
| Sync contacts Ringover API | `lib/ringover/sync-contact.js` + admin sync |
| Emails prospection Brevo | `/call-center/emails` + `lib/brevo/*` |
| Webhook Brevo (tracking) | `/api/webhooks/brevo` |
| Sync contacts Brevo marketing | `lib/brevo/sync-prospect.js` |
| Admin centres | `/admin/call-centers` |
| Commissions centre (auto SIGNED) | `CallCenterCommission` |
| Affiliation tracking + commissions | `/admin/affiliates` |
| Onboarding fiscal affilié | `/affiliate/[code]/onboarding` |
| Versements + auto-factures PDF | `/admin/affiliates/payouts` |
| Export SEPA XML | `/api/admin/affiliates/sepa` |
| Export DAS2 | `/api/admin/affiliates/das2` |
| Journal audit affiliation | `AffiliateAuditLog` |
| EmailLog tracking | modèle `EmailLog` |

### 🔜 Améliorations futures (non bloquantes)

| SL Formations | Notes |
|---------------|-------|
| Pipeline kanban prospects call-center | Réutiliser `/admin/demandes/kanban` |
| Prospection B2B PhantomBuster | Spécifique formations |
| Invitations agents Auth0 auto | Script manuel pour l'instant |
| Commissions par agent individuel | Finarent : commission au **centre** |
| Dashboard affilié graphiques avancés | Stats basiques sur page publique |

## Architecture Finarent vs SL Formations

| | SL Formations | Finarent |
|---|---------------|----------|
| Rôles agents | `CALL_CENTER_MANAGER` / `SECRETARY` | `CallCenterMember` MANAGER / AGENT |
| Affilié | `AffiliateProfile` + User | Modèle `Affiliate` autonome |
| Dossier signé | `Order` | `Application` status `SIGNED` |
| Email call-center | Brevo | Brevo (identique) |
| Email affiliation | Resend | SMTP Nodemailer (invitations) |

## Cycle commission affiliation

```
?ref=CODE → cookie 90j → Prospect/Application
    → SIGNED → AffiliateCommission PENDING
    → Admin valide → VALIDATED
    → Admin verse (/admin/affiliates/payouts) → PAID + auto-facture PDF
    → Export SEPA pour virement banque
```

## Fichiers ajoutés (juin 2026)

```
lib/brevo/client.js, config.js, send-transactional.js, sync-prospect.js
lib/email/outbound-attribution.js, prepare-content.js
lib/ringover/contacts-api.js, sync-contact.js, process-sms-event.js
lib/sepa-xml.js, affiliate-mandate.js, affiliate-fiscal.js
lib/affiliate-payouts.js, affiliate-invoice-numbering.js
lib/pdf/affiliate-invoice.js, prospect-utils.js
app/call-center/emails/page.jsx
app/api/call-center/emails/route.js
app/api/webhooks/brevo/route.js
app/api/admin/affiliates/sepa/route.js
app/api/admin/affiliates/das2/route.js
app/api/admin/affiliates/payouts/route.js
app/api/admin/affiliates/invoices/[id]/pdf/route.js
app/api/affiliate/[code]/onboarding/route.js
app/api/admin/call-centers/[id]/ringover-sync/route.js
app/admin/affiliates/payouts/page.jsx
app/affiliate/[code]/onboarding/*
components/call-center/OutboundEmailForm.jsx, BulkProspectEmailPanel.jsx
components/admin/AdminAffiliatePayoutsClient.jsx
prisma/migrations/20260627120000_brevo_affiliate_fiscal/
```

## Configuration

### Variables `.env`

```env
# Ringover
RINGOVER_WEBHOOK_KEY=...
RINGOVER_API_KEY=...
RINGOVER_SMS_FROM_NUMBER=+33XXXXXXXXX

# Brevo
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=ne-pas-repondre@finarent.fr
BREVO_SENDER_NAME=Finarent — Centre d'appels
BREVO_MARKETING_LIST_ID=123
BREVO_WEBHOOK_TOKEN=...
```

### Webhooks à configurer

| Service | URL |
|---------|-----|
| Ringover | `https://votre-domaine/api/webhooks/ringover` |
| Brevo | `https://votre-domaine/api/webhooks/brevo?token=VOTRE_TOKEN` |

### Migration base

```bash
cd finassur
npx prisma migrate deploy
# ou en dev :
npm run db:migrate
```

## Tests manuels

1. Agent → `/call-center/emails` → envoi unitaire Brevo
2. Admin centre → sync Ringover contacts
3. Webhook appel → interaction + sync Brevo/Ringover prospect
4. Dossier SIGNED → commission PENDING
5. Admin → valider → VALIDATED
6. Affilié → `/affiliate/CODE/onboarding` → IBAN + mandat
7. Admin → `/admin/affiliates/payouts` → verser + PDF
8. Export SEPA → import banque
