# Questions à poser au client — Finarent

> Checklist consolidée des informations, validations et accès nécessaires pour finaliser et mettre en production le site finarent.fr.
> Date : Mai 2026 — à mettre à jour au fil des réponses.

---

## 1. Statut juridique & mentions légales

L'app affiche actuellement *"Société en cours de constitution"*. Tant que ce n'est pas validé, la page `/legal` reste incomplète.

- [ ] **Raison sociale** exacte (ex : `Finarent SAS`)
- [ ] **Forme juridique** définitive (SAS / SARL / SA / EURL…)
- [ ] **Capital social** (montant en €)
- [ ] **N° SIREN / SIRET** (dès enregistrement RCS)
- [ ] **RCS** : ville d'immatriculation + numéro
- [ ] **N° TVA intracommunautaire**
- [ ] **Adresse du siège social** (utilisée dans footer, factures, mentions légales)
- [ ] **Nom du directeur de publication** (pour les mentions légales du site)

## 2. Immatriculation ORIAS & conformité ACPR

Obligatoire pour le statut de courtier mentionné partout sur le site.

- [x] **Numéro ORIAS** (IOBSP — financement) : 24005698
- [x] **Numéro ORIAS** (IAS — assurance) : 24005698
- [ ] **Niveau de capacité professionnelle** (I, II ou III) + justificatif
- [ ] **Attestation RC Pro courtier** (assureur + numéro de police + plafond garantie)
- [ ] **Garantie financière** (montant + organisme garant)
- [ ] **Procédure réclamations clients** (texte légal à intégrer)
- [ ] **Médiateur de la consommation** désigné (nom + coordonnées + lien web)

## 3. DPO & RGPD

La page `/privacy` mentionne `dpo@finarent.fr` en placeholder.

- [ ] **Nom et coordonnées du DPO** (interne ou externe)
- [ ] **Email RGPD dédié** (actif et relevé)
- [ ] **Registre des traitements** (article 30 RGPD) — qui le tient ?
- [ ] **Procédure de notification de violation** (CNIL sous 72 h) — qui pilote ?
- [ ] **Sous-traitants** : confirmer les contrats RGPD signés
  > Liste corrigée le 10 septembre 2026. La précédente citait Vercel, Neon,
  > Supabase et YouSign — **aucun n'est utilisé**. La politique de confidentialité
  > portait la même erreur ; elle a été corrigée et **doit être relue par votre
  > conseil juridique**.
  - [ ] **Clever Cloud** (hébergement, base de données PostgreSQL, stockage Cellar des pièces justificatives)
  - [ ] **Auth0** (comptes et authentification)
  - [ ] **Brevo** (emails de suivi de dossier et communications commerciales)
  - [ ] **Google reCAPTCHA** (protection anti-robot des formulaires publics — analyse l'adresse IP et le comportement de navigation ; transfert hors Union européenne à encadrer)
  - Non utilisés aujourd'hui, à ajouter seulement s'ils sont activés : Sentry, PostHog, Microsoft Clarity, Stripe, Ringover, Twilio.

## 4. Identité visuelle & branding

- [ ] **Logo SVG** : version actuelle (`finarent-logo.svg`) définitive ? Variantes (mono, blanc/dark) ?
- [ ] **Palette couleurs** validée (bleu marine `#10253C`, vert menthe `#58B794`)
- [ ] **Police** : Plus Jakarta Sans validée ou autre choix ?
- [ ] **Favicon** : pastille SVG actuelle OK ?
- [ ] **Image Open Graph** (partage réseaux sociaux) : photo équipe ou montage logo ?
- [ ] **Charte ton/voix** : tutoyer / vouvoyer le visiteur ? (le site utilise actuellement le vouvoiement)

## 5. Contacts publics (footer + page contact)

- [x] **Téléphone public** : 01 60 28 59 41 (placeholder `tel:0123456789` remplacé — source unique `lib/contact.js`)
- [x] **Email contact général** : contact@finarent.fr
- [ ] **Email commercial / RDV**
- [ ] **Horaires d'ouverture**
- [ ] **Adresse présentation (rendez-vous physique)** si différente du siège
- [ ] **Réseaux sociaux** (placeholders `#` à remplacer)
  - [ ] LinkedIn (URL)
  - [ ] Facebook (URL)
  - [ ] Twitter / X (URL)
  - [ ] Instagram (URL)

## 6. Domaine & hébergement

- [ ] **Domaine final** : `finarent.fr` acheté/à acheter ? Qui détient les DNS ?
- [ ] **Compte Clever Cloud** : email propriétaire + organisation
- [ ] **Facture d'hébergement** : la production est sous le coup d'une suspension pour impayé — à régler en priorité, elle conditionne tout le reste
- [ ] **Plan de l'addon PostgreSQL** : actuellement `DEV` (palier gratuit) pour une base qui stocke des dossiers clients — à revoir
- [ ] **Bucket Cellar** `finarent-docs-kyc` : créé et identifiants déclarés sur l'application ?
- [ ] **Sous-domaines** prévus (admin.finarent.fr ? api.finarent.fr ?)
- [ ] **Email pro** sur le domaine (Google Workspace ? OVH ?) → adresses prévues

## 7. Auth0 (authentification)

- [ ] **Tenant Auth0** finalisé : URL `your-tenant.auth0.com`
- [ ] **Client ID + Client Secret** prod
- [ ] **Auth0 Application URLs** configurées (callbacks, logout, allowed origins)
- [ ] **Rôles métier** validés : CLIENT, ADMIN, PARTNER, INSURER (cf. Prisma enum `Role`)
- [ ] **Politique mots de passe** (longueur, complexité, MFA obligatoire ?)
- [ ] **Connexions sociales** : Google ? LinkedIn ? À activer ?

## 8. SMTP / emails transactionnels

Le site envoie : confirmation demande, alerte admin, document reçu, relance documents manquants.

- [ ] **Provider** : SendGrid / Mailgun / Postmark / SMTP générique ?
- [ ] **Email expéditeur** (`SMTP_FROM`) : `no-reply@finarent.fr` ? `contact@` ?
- [ ] **Email admin** qui reçoit les alertes nouvelles demandes (`ADMIN_EMAIL`)
- [ ] **Email DPO** pour les notifications RGPD
- [ ] **SPF / DKIM / DMARC** configurés sur le domaine (anti-spam)
- [ ] **Templates** : design email finalisé (couleurs, logo, signature) ?

## 9. Stockage documents (Cellar)

> Corrigé le 10 septembre 2026 : le stockage n'est pas Supabase mais **Cellar**, l'addon S3 de Clever Cloud.

- [ ] **Bucket Cellar** `finarent-docs-kyc` créé et les trois identifiants déclarés sur l'application
      (sans eux, `lib/storage.js` bascule **silencieusement** sur le disque de l'instance : les pièces justificatives seraient perdues à chaque redéploiement)
- [ ] **Région** : EU (RGPD) ✅ à confirmer
- [ ] **Tailles max** : 10 Mo / fichier actuel — OK pour bilans PDF ?
- [ ] **Antivirus** : scanner avant insertion en bucket ? (recommandé pour KBIS, bilans, RIB)
- [ ] **Rétention** : 30 jours soft-delete + purge → confirmer la durée

## 10. Signature électronique — tranché

**Décision du 10 septembre 2026 : la signature reste interne**, sans prestataire.
Aucun compte à ouvrir, aucune clé à fournir. Le module YouSign, qui n'avait jamais
été branché, a été supprimé du code.

La signature en service relève de l'**article 1367 du Code civil** — signature
électronique simple. La plateforme recueille et conserve elle-même les éléments
de preuve : tracé, horodatage, adresse IP du signataire, empreinte du document.

- [ ] **Point à valider avec votre conseil juridique** : cette valeur probante
      simple convient-elle à vos contrats ? Une signature **qualifiée** eIDAS est
      présumée fiable en cas de contestation ; une signature simple doit être
      prouvée par celui qui s'en prévaut. Si vous annoncez commercialement une
      signature qualifiée, il faudra rouvrir ce chantier (environ une journée).

## 11. Téléphonie Ringover

Mentionnée dans le PDF *"10 Finarent Integration API Ringover.pdf"*.

> **Côté dev** : l'intégration webhook est implémentée (voir [`docs/SETUP_RINGOVER.md`](./SETUP_RINGOVER.md)).
> Il reste à fournir les accès Ringover prod.

- [ ] **Intégration prévue** ? Si oui :
- [ ] **Compte Ringover** + clé webhook (`RINGOVER_WEBHOOK_KEY`)
- [ ] **Numéros entrants/sortants** Finarent
- [ ] **Emails agents Ringover** = emails comptes Finarent (membres centres d'appel)
- [x] **Logs d'appels** en DB (`CallCenterInteraction`, provider `RINGOVER`)
- [x] **Recherche contacts** depuis Ringover smartdialer (prospects Finarent)

## 12. Partenaires bancaires & assureurs

La page `/partenaires` liste 103 acteurs en cartographie *indicative*.

- [ ] **Partenaires SOUS MANDAT réel** (apport d'affaires signé) : lister
- [ ] **Codes apporteur** par partenaire (pour le suivi commissions)
- [ ] **Conditions commerciales** : taux de commission par partenaire
- [ ] **Documents partenaires** (KBIS, ORIAS, RC Pro à fournir) prêts ?
- [ ] **Mention obligatoire** sur le site : « accord sous mandat de X / Y » ?

## 13. Contenu rédactionnel à valider

- [ ] **Page d'accueil** : claims (« 300+ entreprises », « 95 % d'accords », « 48 h ») — chiffres réels ?
- [ ] **Témoignages clients** (page testimonials) : réels ou à remplacer ?
- [ ] **Études de cas / Logos clients** affichés ? Autorisation écrite ?
- [ ] **Articles de blog** : ligne éditoriale + premiers articles à publier ?
- [ ] **FAQ** (62 questions) : validées telles quelles ou à amender ?
- [ ] **CGV** ([app/cgv/page.jsx](../app/cgv/page.jsx)) : relues par avocat ?
- [ ] **Politique cookies** ([app/privacy/PrivacyClient.jsx](../app/privacy/PrivacyClient.jsx)) : relue ?

## 14. Tarification & modèle commercial

- [ ] **Frais de dossier client** : 0 € (gratuit comme annoncé sur la FAQ) ?
- [ ] **Honoraires de courtage** : grille tarifaire ?
- [ ] **Commissions partenaires** : grille par produit (CB, LOA, LLD, RC Pro…)
- [ ] **Plage de financement** : `3 000 € → 500 000 €` confirmée ?
- [ ] **TVA** : 20 % standard sur les honoraires ?

## 15. Conformité & sécurité production

- [ ] **Clé de chiffrement `ENCRYPTION_KEY`** prod : générée et déclarée dans les variables de l'application Clever Cloud (jamais dans le dépôt)
- [ ] **Sauvegarde de la base** : fréquence et rétention de l'addon Clever Cloud — et surtout **une restauration réellement testée** : une sauvegarde jamais restaurée n'est pas une sauvegarde
- [ ] **Audit pentest** : prévu avant lancement ?
- [ ] **Plan de continuité** (PCA) en cas d'incident
- [ ] **CGU site** : besoin ou couvert par les CGV ?

## 16. Analytics & marketing

- [ ] **PostHog** : compte créé ? Clé prod ? Quels événements tracker ?
- [ ] **Sentry** (error tracking) : compte + DSN
- [ ] **Google Search Console** : à connecter
- [ ] **Google Tag Manager** : si besoin
- [ ] **reCAPTCHA v3** : `RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY` (déjà dans .env.example)
- [ ] **Clearbit Logo API** : free tier OK pour les logos partenaires ou compte payant à prévoir ?
- [ ] **Newsletter** : provider (Brevo / Mailchimp / interne) ?

## 17. Espace admin & workflow métier

- [ ] **Liste des futurs admins** (emails) à créer dans Auth0
- [ ] **Workflow de validation** d'un dossier : qui valide quoi ?
- [ ] **SLA réels par étape** : on annonce 48 h, c'est tenable ?
- [ ] **Notifications admin** : email seul ou aussi SMS ?
- [ ] **Permissions PARTNER / INSURER** : que voient-ils exactement ?
- [ ] **Page admin maquette PDF** (`09 Finarent Maquette Interface Admin.pdf`) : à implémenter telle quelle ou amendée ?

## 18. Intégration site existant

PDF *"11 Finarent Integration Site Existant.pdf"* mentionne un site déjà en place.

- [ ] **Site actuel** : URL ? Que devient-il (redirection, archivage, migration de contenu) ?
- [ ] **Redirections** 301 à mettre en place ? Mapping des anciennes URLs ?
- [ ] **Migration de leads/clients** depuis l'existant ? Quel format export ?
- [ ] **Tracking SEO** : positions actuelles à préserver ?

## 19. Mise en ligne

- [ ] **Date de lancement souhaitée**
- [ ] **Environnement de recette** : une seconde application Clever Cloud avec son propre addon PostgreSQL ? Devenu possible depuis la réparation de l'historique de migrations (10 septembre 2026)
- [ ] **Bêta-testeurs** : qui ?
- [ ] **Plan de communication** lancement (LinkedIn, presse, partenaires) ?

## 20. Variables d'environnement à fournir

Récapitulatif des secrets et réglages de production à déclarer sur l'application **Clever Cloud** :

```env
# Auth0
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_SECRET=
APP_BASE_URL=https://finarent.fr

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Database
DATABASE_URL=

# Chiffrement RGPD — généré avec : node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=

# Stockage Cellar (addon Clever Cloud — les trois premiers sont injectés par l'addon)
CELLAR_ADDON_HOST=
CELLAR_ADDON_KEY_ID=
CELLAR_ADDON_KEY_SECRET=
CELLAR_BUCKET=finarent-docs-kyc
CELLAR_REGION=us-east-1

# Email SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
ADMIN_EMAIL=

# Signature électronique
YOUSIGN_API_KEY=

# Téléphonie (si activée)
RINGOVER_API_KEY=

# Analytics (après consentement utilisateur)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com

# Error tracking
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Comment utiliser ce doc

1. Faire un point client (1 h) sur les sections **1, 2, 3, 5** (légal + identité publique) → bloquant pour le SEO et le footer
2. Faire un point technique (1 h) sur les sections **6, 7, 8, 9, 20** (infra + secrets) → bloquant pour la mise en ligne
3. Faire un point commercial (1 h) sur les sections **12, 13, 14, 17** (partenaires + contenu + workflow) → bloquant pour le lancement opérationnel
4. Cocher au fur et à mesure et noter les réponses inline.

Une fois 90 % des cases cochées, on peut publier en prod.
