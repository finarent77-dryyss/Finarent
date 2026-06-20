# Intégration Ringover — Finarent

> Portage depuis SL Formations (`slformations/src/lib/ringover/` + webhook).

## Configuration

### 1. Variable d'environnement

```env
RINGOVER_WEBHOOK_KEY=xxxxxxxx
```

Ajouter sur Vercel (prod/staging) et dans `.env.local` en dev.

### 2. Webhook Ringover

1. [Ringover Dashboard → Webhooks](https://dashboard.ringover.com/webhooks)
2. URL : `https://finarent.fr/api/webhooks/ringover` (ou URL staging)
3. Événements :
   - Call hangup (`webhook_ended`)
   - Call missed (`missedcalls`)
   - Call voicemail (`webhook_voicemail`)
   - Contact search (`webhook_local_search`)
4. Copier la **clé webhook** → `RINGOVER_WEBHOOK_KEY`
5. Header `Authorization` = clé brute (sans `Bearer`)

### 3. Correspondance agents

L'email de l'utilisateur Ringover doit correspondre à l'email du compte Finarent (admin ou membre d'un centre d'appel).

## Fonctionnement

| Événement Ringover | Action Finarent |
|--------------------|-----------------|
| hangup / missed / voicemail | Crée `CallCenterInteraction` (provider `RINGOVER`) |
| contact search | Retourne les prospects Finarent (smartdialer) |
| contact pendant appel | Affiche fiche prospect avec lien admin |

Les prospects sont retrouvés par numéro de téléphone (matching tolérant +33/0X).

## Pages admin

- `/admin/centre-appel` — file d'appels + bannière Ringover
- `/admin/call-centers` — gestion des centres + interactions sync
- `/admin/call-centers/[id]` — onglet Interactions (badge RINGOVER)

## Test local

```bash
# Terminal 1
npm run dev

# Terminal 2
RINGOVER_WEBHOOK_KEY=your-key node scripts/test-ringover-webhook.js --phone=0612345678 --email=votre@email.com
```

Vérifier dans l'onglet **Interactions** du centre d'appel concerné.

## Santé webhook

```bash
curl https://finarent.fr/api/webhooks/ringover
# → { "service": "Finarent — Ringover webhook", "status": "ready", "configured": true }
```
