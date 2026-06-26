# Intégration centre d'appels — SL Formations → Finarent

> Portage du module centre d'appels (Ringover, prospects, équipes) depuis **slformations** vers **finassur** (Finarent).

## État d'avancement

### ✅ Intégré (juin 2026)

| Fonctionnalité SL Formations | Équivalent Finarent |
|------------------------------|---------------------|
| Accès OWNER/ADMIN + agents | `ADMIN` + `CallCenterMember` (MANAGER/AGENT) |
| Espace `/call-center` | `app/call-center/*` |
| Click-to-call Ringover | `RingoverProspectActions` + `/api/call-center/ringover` |
| SMS sortant Ringover | même API |
| Liaison agent ↔ Ringover par e-mail | `lib/ringover/team-users.js` |
| Numéros Ringover par centre | `CallCenter.ringoverPhoneNumbers` |
| Sync webhook appels | déjà présent (`lib/ringover/process-call-event.js`) |
| Admin centres | `/admin/call-centers` (existant, enrichi PATCH) |
| File d'appels | `/admin/centre-appel` (existant) |
| Prospects par centre | `Prospect.callCenterId` + `assignedAgentId` |

### 🔜 À porter (phases suivantes)

| SL Formations | Priorité | Notes |
|---------------|----------|-------|
| Brevo emails prospection | Haute | Finarent utilise SMTP/EmailJS — ajouter `BREVO_API_KEY` + module envoi |
| Sync contacts Ringover API | Moyenne | `ringoverContactId` sur Prospect (champ ajouté) |
| Prospection B2B / B2C | Moyenne | Adapter aux simulateurs Finarent |
| Pipeline kanban prospects | Moyenne | Réutiliser logique `/admin/demandes/kanban` |
| Invitations agents Auth0 | Moyenne | Script type `setup-call-center-agent.js` |
| Commissions agent (profil) | Basse | Finarent : commission au **centre** sur `Application` signée |
| Export SEPA / payouts | Basse | Déjà partiel sur `/admin/call-centers/[id]` |

## Architecture Finarent vs SL Formations

| | SL Formations | Finarent |
|---|---------------|----------|
| Rôles agents | `CALL_CENTER_MANAGER` / `SECRETARY` sur `User` | `CallCenterMember.role` MANAGER / AGENT |
| Admin | `ADMIN` + `OWNER` | `User.role = ADMIN` |
| Prospect | CRM formation | Simulateurs + `Prospect` cookie |
| Dossier signé | `Order` | `Application` status `SIGNED` |

## Fichiers ajoutés

```
lib/call-center-access.js
lib/ringover/api-client.js
lib/ringover/team-users.js
lib/ringover/center-numbers.js
app/call-center/layout.jsx
app/call-center/page.jsx
app/call-center/prospects/page.jsx
app/call-center/prospects/[prospectId]/page.jsx
app/call-center/interactions/page.jsx
app/call-center/team/page.jsx
app/api/call-center/ringover/route.js
components/call-center/CallCenterLayoutClient.jsx
components/call-center/CallCenterSidebar.jsx
components/call-center/RingoverProspectActions.jsx
prisma/migrations/20260623220000_call_center_ringover_fields/
```

## Configuration

### Variables `.env`

```env
RINGOVER_WEBHOOK_KEY=...
RINGOVER_API_KEY=...
RINGOVER_SMS_FROM_NUMBER=+33XXXXXXXXX
```

### Ringover Dashboard

- **Calls Write** + **Monitoring** ON (click-to-call multi-agents)
- Webhook → `https://votre-domaine/api/webhooks/ringover`

### Migration base

```bash
cd finassur
npx prisma migrate deploy
# ou en dev :
npm run db:migrate
```

### Rattacher un agent

1. Admin → **Centres d'appel** → créer ou ouvrir un centre
2. Ajouter un utilisateur comme **MANAGER** ou **AGENT**
3. L'agent se connecte → `/call-center`
4. E-mail SL = e-mail Ringover (obligatoire pour click-to-call)

### Numéros SMS du centre

PATCH `/api/admin/call-centers/[id]` avec :

```json
{
  "ringoverPhoneNumbers": "+33745893128\n+33123456789"
}
```

Ou via l'admin (éditeur à ajouter dans `AdminCallCenterDetailClient`).

## Tests manuels

1. Agent membre → `/call-center` (pas admin)
2. Liste prospects filtrée par centre / assignation
3. Fiche prospect → **Appeler via Ringover** (softphone ouvert)
4. Webhook → interaction badge **RINGOVER** dans historique
5. Admin → `/admin/call-centers` inchangé

## Référence SL Formations

Guides détaillés dans le dépôt `slformations` :

- `docs/GUIDE_TESTS_OWNER_CENTRE_MEMBRE.md`
- `docs/PLAN_ET_TUTO_TEST_CALL_CENTER_RINGOVER.md`
- `docs/SETUP_CALL_CENTER_AUTH0.md`
