# Intégrations Finarent — Setup (Brevo, reCAPTCHA, Stripe)

> ⚠️ Toutes ces variables doivent être ajoutées **dans la console Clever Cloud**
> (app finarent → Variables d'environnement), pas seulement dans le `.env` local.
> Après ajout : **Update Changes + redéploie**. Le `.env` local ne sert qu'au dev.

---

## 1. Brevo — canal d'envoi principal (API)

Brevo porte **tous** les emails Finarent : transactionnels (confirmations,
relances), prospection centre d'appels et campagnes de masse.
Code : `lib/brevo/` + `lib/email/send.js`. Charte et templates : `docs/CHARTE_EMAIL.md`.

**Étapes :**
1. Compte sur [brevo.com](https://www.brevo.com)
2. **Senders, Domains & IPs → Domains** → ajoute `finarent.fr` → ajoute les
   enregistrements **DKIM + SPF** fournis dans le DNS Hostinger → attends la
   validation ✅ (sans domaine authentifié, Gmail classe en spam)
3. Ajoute aussi un **DMARC** : TXT sur `_dmarc.finarent.fr` →
   `v=DMARC1; p=none; rua=mailto:contact@finarent.fr`
4. **SMTP & API → API Keys** → crée une clé (`xkeysib-...`)
5. **Contacts** → crée la liste marketing → note son **ID** (un nombre)
6. **Transactional → Settings → Webhook** → URL
   `https://finarent.fr/api/webhooks/brevo`, en-tête `x-brevo-token` =
   `BREVO_WEBHOOK_TOKEN` (remonte les ouvertures et bounces dans `EmailLog`)
7. **Security → Authorized IPs** : si l'option est active, autorise l'IP de
   sortie Clever Cloud, sinon l'API refuse les envois (le code bascule alors
   automatiquement sur le repli SMTP)

**Variables :**
```
BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
BREVO_SENDER_EMAIL=ne-pas-repondre@finarent.fr   # doit être sur le domaine authentifié
BREVO_SENDER_NAME=Finarent — Centre d'appels     # nom affiché en prospection
BREVO_MARKETING_LIST_ID=12                       # l'ID de ta liste
BREVO_WEBHOOK_TOKEN=<chaîne aléatoire>           # ex: openssl rand -hex 16
ADMIN_EMAIL=admin@finarent.fr                    # destinataire des alertes internes
APP_BASE_URL=https://finarent.fr                 # base des liens et du logo des emails
UNSUBSCRIBE_SECRET=<chaîne aléatoire>            # signe les liens de désabonnement
```

> `UNSUBSCRIBE_SECRET` est optionnel : à défaut le code réutilise
> `ENCRYPTION_KEY` puis `CRON_SECRET`. Si aucun n'est présent, le lien de
> désabonnement retombe sur un `mailto:` — conforme, mais moins confortable.

---

## 2. SMTP — canal de repli

`lib/email/send.js` bascule sur SMTP si Brevo n'est pas configuré ou refuse
l'envoi. N'importe quel relais convient (le relais SMTP de Brevo lui-même,
Resend, un SMTP OVH…). Sans ces variables, il n'y a simplement pas de repli.

**Variables :**
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<login SMTP Brevo>
SMTP_PASS=<clé SMTP Brevo>
SMTP_FROM=ne-pas-repondre@finarent.fr    # doit être sur le domaine authentifié
```

---

## 3. reCAPTCHA v3 — anti-spam formulaires

Vérifié dans `lib/recaptcha.js` (route `/api/financement`). La clé actuelle est la clé de **test Google** (à remplacer).

**Étapes :**
1. [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) → **+** nouvelle clé
2. Type **reCAPTCHA v3**
3. Domaines : `finarent.com`, `finarent.fr`, `finarent.org` (+ `localhost` pour le dev)
4. Récupère **Site Key** (publique) + **Secret Key**

**Variables :**
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxx    # publique (rebuild requis)
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxx               # secrète
```

> `NEXT_PUBLIC_*` est figée au build → à mettre AVANT le redéploiement.

---

## 4. Stripe — paiement des factures

Client lazy `lib/stripe.js`, webhook `app/api/webhooks/stripe/route.js` (écoute `checkout.session.completed`).

**Étapes :**
1. Compte sur [stripe.com](https://stripe.com) → active le compte (mode Live)
2. **Developers → API keys** → **Secret key** (`sk_live_...`)
3. **Developers → Webhooks** → **Add endpoint** :
   - URL : `https://finarent.com/api/webhooks/stripe`
   - Événement : **`checkout.session.completed`**
   - → récupère le **Signing secret** (`whsec_...`)

**Variables :**
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

> Commence en mode **Test** (`sk_test_` / webhook test) pour valider, puis bascule en **Live**.

---

## Checklist de déploiement

- [ ] Variables ajoutées dans **Clever Cloud** (pas juste `.env` local)
- [ ] DNS Brevo (DKIM/SPF/DMARC) vérifiés dans Hostinger
- [ ] Webhook Brevo pointant sur `https://finarent.fr/api/webhooks/brevo`
- [ ] Templates relus : `node scripts/preview-emails.mjs` + test Gmail/Outlook
- [ ] Webhook Stripe pointant sur `https://finarent.com/api/webhooks/stripe`
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` mise AVANT le build
- [ ] **Redéploiement** Clever effectué après ajout des variables
