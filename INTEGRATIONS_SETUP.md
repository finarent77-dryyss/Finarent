# Intégrations Finarent — Setup (Resend, Brevo, reCAPTCHA, Stripe)

> ⚠️ Toutes ces variables doivent être ajoutées **dans la console Clever Cloud**
> (app finarent → Variables d'environnement), pas seulement dans le `.env` local.
> Après ajout : **Update Changes + redéploie**. Le `.env` local ne sert qu'au dev.

---

## 1. Resend — emails transactionnels (SMTP)

Le code utilise Nodemailer (SMTP) — cf. `lib/email.js`. Resend s'branche en SMTP, sans modif de code.

**Étapes :**
1. Crée un compte sur [resend.com](https://resend.com)
2. **Domains** → ajoute `finarent.com` → Resend te donne des enregistrements **DKIM/SPF** (type TXT/MX/CNAME) → ajoute-les dans **Hostinger** (DNS) → attends la vérification ✅
3. **API Keys** → crée une clé (`re_...`)

**Variables :**
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxxxxx      # ta clé API Resend
SMTP_FROM=noreply@finarent.com          # doit être sur le domaine vérifié
ADMIN_EMAIL=admin@finarent.com
```

> Sans domaine vérifié, Resend n'envoie qu'à ta propre adresse (mode test).

---

## 2. Brevo — prospection centre d'appels (API)

Sert aux emails de prospection + sync contacts — cf. `lib/brevo/`.

**Étapes :**
1. Compte sur [brevo.com](https://www.brevo.com)
2. **SMTP & API** → **API Keys** → crée une clé (`xkeysib-...`)
3. **Contacts** → crée une liste marketing → note son **ID** (un nombre)
4. (Optionnel) valide l'email expéditeur `ne-pas-repondre@finarent.com`

**Variables :**
```
BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
BREVO_SENDER_EMAIL=ne-pas-repondre@finarent.com
BREVO_SENDER_NAME=Finarent — Centre d'appels
BREVO_MARKETING_LIST_ID=12               # l'ID de ta liste
BREVO_WEBHOOK_TOKEN=<chaîne aléatoire>   # ex: openssl rand -hex 16
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
- [ ] DNS Resend (DKIM/SPF) vérifiés dans Hostinger
- [ ] Webhook Stripe pointant sur `https://finarent.com/api/webhooks/stripe`
- [ ] `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` mise AVANT le build
- [ ] **Redéploiement** Clever effectué après ajout des variables
