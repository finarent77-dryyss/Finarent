# Charte mailing Finarent

Référence unique pour tout email envoyé par la plateforme. Code correspondant :
`lib/email/charter.js` (design), `lib/email/templates.js` (messages),
`lib/email/send.js` (envoi).

---

## 1. Principe

**Aucun email n'écrit son propre HTML.** On assemble des blocs de la charte et
on passe le tout à `renderMailing()`. Un email qui contient du `<div style="…">`
écrit à la main est un bug : il finira décalé sur Outlook et hors charte au
premier changement de couleur.

```js
import { renderMailing, mailTitle, mailText, mailButton } from '@/lib/email/charter.js';

const html = renderMailing({
  title: 'Objet de l\'email',
  preheader: 'Ce que le destinataire lit dans sa boîte, avant d\'ouvrir',
  blocks: [
    mailTitle('Votre demande est enregistrée'),
    mailText('Bonjour,'),
    mailButton('https://finarent.fr/espace', 'Suivre mon dossier'),
  ],
});
```

---

## 2. Couleurs

Reprises de `lib/branding.js` — charte officielle §1. Ne jamais introduire une
couleur hors de cette liste.

| Rôle | Token | Hex | Usage email |
|---|---|---|---|
| Bleu marine | `MAIL.marine` | `#10253C` | Bandeau d'en-tête, titres, valeurs mises en avant |
| Bleu acier | `MAIL.acier` | `#1C3654` | Libellés, mentions légales du pied de page |
| Vert menthe | `MAIL.menthe` | `#58B794` | Bouton principal, puces, sur-titres — **≤ 15 % de la surface** |
| Vert profond | `MAIL.vertProfond` | `#3E9D7A` | Liens dans le corps |
| Gris texte | `MAIL.texte` | `#404040` | Corps de texte |
| Gris doux | `MAIL.fond` | `#F2F5F4` | Fond de page, cartes, pied de page |
| Bordure | `MAIL.bordure` | `#E4E8EC` | Filets, contours de cartes |
| Atténué | `MAIL.attenue` | `#737D8C` | Mentions secondaires, codes de suivi |

Le vert menthe signale l'action. S'il est utilisé pour décorer, le destinataire
ne repère plus le bouton.

## 3. Typographie

`Plus Jakarta Sans` en première intention, repli `Segoe UI, Roboto, Helvetica,
Arial`. **Seuls Apple Mail et iOS chargent réellement la webfont** — le rendu de
référence est donc celui de la pile de repli, pas celui de la maquette.

| Élément | Taille | Graisse |
|---|---|---|
| Titre (`mailTitle`) — un seul par email | 24 px | 800 |
| Sur-titre (`mailEyebrow`) | 11 px, majuscules, interlettrage 0.12em | 700 |
| Intertitre (`mailHeading`) | 17 px | 700 |
| Corps (`mailText`) | 15 px, interligne 1.6 | 400 |
| Mentions (`mailText` muted) | 12–13 px | 400 |
| Pied de page légal | 11 px | 400 |

## 4. Gabarit

- Largeur : **600 px**, centrée sur fond `#F2F5F4`.
- Gouttières : 32 px desktop, 22 px sous 620 px de large.
- En-tête marine : pastille Finarent 44 px + « Finarent » + tagline
  `FINANCEMENT · LOCATION · ASSURANCE PRO`.
- Pied de page gris : raison sociale, SIREN, RCS, ORIAS, téléphone, email,
  mention ACPR, liens mentions légales / confidentialité, puis désabonnement
  pour les emails commerciaux.

## 5. Blocs disponibles

| Fonction | Quand l'utiliser |
|---|---|
| `mailEyebrow(texte)` | Catégoriser un mailing (« Lettre Finarent · Mars 2026 ») |
| `mailTitle(texte)` | Titre principal — **un seul** |
| `mailHeading(texte)` | Découper un contenu long en sections |
| `mailText(html, {muted, size})` | Paragraphe ; `muted` pour une mention secondaire |
| `mailButton(href, label, {secondary})` | Action — **un CTA principal par email** |
| `mailInfoCard([[label, valeur]])` | Données de dossier (référence, montant, entreprise) |
| `mailBullets([...])` | Liste courte (pièces manquantes, avantages) |
| `mailQuote(texte, auteur)` | Verbatim client, message personnel d'un affilié |
| `mailStats([{valeur, label}])` | 3 chiffres clés maximum |
| `mailDivider()` | Séparer le contenu éditorial d'une clôture |
| `mailSignature(prenom)` | Clôture — sans prénom : « L'équipe Finarent » |
| `mailSpacer(px)` | Respiration explicite |

## 6. Contraintes techniques (le « pourquoi » du code)

1. **Outlook Windows rend le HTML avec le moteur de Word.** Pas de flex, pas de
   grid, pas de `border-radius`, pas de `box-shadow`, pas de media query. D'où
   la structure en `<table>` et les boutons VML.
2. **Gmail retire une partie du `<style>`**, notamment après transfert. Tout ce
   qui porte du sens est donc inline ; `<style>` ne sert qu'au confort (mobile,
   quelques ajustements).
3. **Le SVG ne s'affiche pas** dans Gmail, Outlook ni Yahoo. Le logo email est
   `/icon-192.png`. *(C'était le défaut de l'ancien template : il pointait vers
   `finarent-pastille.svg`, invisible chez la majorité des destinataires.)*
4. **~40 % des destinataires bloquent les images par défaut.** Aucun texte
   important dans une image, `alt` toujours rempli.
5. **Toujours une version texte.** Elle est générée par `mailingToText()`. Son
   absence est un signal négatif pour les filtres anti-spam.

## 7. Transactionnel ou commercial

Deux familles à ne jamais mélanger :

| | Transactionnel | Commercial |
|---|---|---|
| Exemples | Confirmation de demande, document reçu, pièces manquantes | Prospection, newsletter, campagne, recommandation d'affilié |
| Déclencheur | Une action du destinataire | Une décision de Finarent |
| Lien de désabonnement | **Non** (Gmail pénalise) | **Oui, obligatoire** |
| Appel dans le code | `sendMail({ … })` | `sendMail({ …, commercial: true })` |

`commercial: true` ajoute les en-têtes `List-Unsubscribe` et
`List-Unsubscribe-Post` : c'est ce qui affiche le bouton « Se désabonner » natif
de Gmail. Gmail l'exige des expéditeurs de volume depuis 2024.

Cadre légal : art. L34-5 CPCE et art. 21 RGPD — le désabonnement doit être
simple, gratuit et sans authentification. D'où la route publique
`/api/newsletter/unsubscribe`, protégée par un jeton HMAC
(`lib/email/unsubscribe.js`) pour empêcher de désabonner l'adresse d'un tiers.

Un désabonnement retire l'adresse de la table `Newsletter` **et** la place en
liste de suppression Brevo (`emailBlacklisted`) : la garantie tient alors même
si un envoi part de l'interface Brevo plutôt que de la plateforme.

## 8. Ton éditorial

- Vouvoiement, phrases courtes, pas de superlatif.
- Un email = un message = une action.
- Objet : 45 caractères maximum, sans majuscules criardes ni emoji.
- Preheader : il complète l'objet, il ne le répète pas.
- Chiffres concrets plutôt qu'adjectifs : « 48 h » plutôt que « très rapide ».
- Mentions réglementaires (courtier, ORIAS, ACPR) : dans le pied de page, jamais
  dans le corps.

## 9. Envoyer

### Un email à une personne

```js
import { sendMail } from '@/lib/email/send.js';
import { templateConfirmationDemande } from '@/lib/email/templates.js';

const { subject, html, text } = templateConfirmationDemande({ reference, companyName });
await sendMail({ to, subject, html, text, log: { source: 'DEMANDE_CONFIRMATION' } });
```

Canal nominal : **API Brevo**. Repli automatique en SMTP si Brevo n'est pas
configuré ou refuse l'envoi (cas courant : IP non autorisée côté Brevo). Chaque
envoi, réussi ou non, est tracé dans `EmailLog` et visible dans l'admin.

### Une campagne à une liste

```js
import { createCampaign, sendCampaignTest, sendCampaignNow } from '@/lib/brevo/send-campaign.js';

const { campaignId } = await createCampaign({
  nom: 'Lettre Finarent — mars 2026',
  contenu: { subject: '…', preheader: '…', titre: '…', intro: '…', sections: [...], cta: {...} },
});
await sendCampaignTest(campaignId, ['contact@finarent.fr']);   // relire d'abord
await sendCampaignNow(campaignId);                             // irréversible
```

`createCampaign` laisse la campagne **en brouillon** dans Brevo. Le HTML vient
de la charte, pas de l'éditeur Brevo — sinon la campagne n'est ni versionnée ni
conforme. Pour une campagne, le désabonnement passe par le tag Brevo
`{{ unsubscribe }}` : un seul HTML est rendu pour toute la liste, on ne peut
donc pas y signer un lien individuel.

## 10. Relire avant d'envoyer

```bash
node scripts/preview-emails.mjs   # → .email-preview/index.html
```

Génère les 8 templates en HTML et en texte. Le navigateur reste plus permissif
que les clients mail : avant une vraie campagne, envoyer un test à **une boîte
Gmail et une boîte Outlook**.

Checklist :

- [ ] Objet < 45 caractères, preheader différent de l'objet
- [ ] Un seul CTA principal
- [ ] Rendu correct images bloquées (le message reste compréhensible)
- [ ] Version texte lisible
- [ ] Lien de désabonnement présent si commercial, absent si transactionnel
- [ ] SPF, DKIM et DMARC valides sur le domaine expéditeur

## 11. Délivrabilité

Le domaine expéditeur doit être authentifié dans Brevo (Senders & IP →
Domains) : enregistrements **DKIM** et **SPF** à ajouter chez Hostinger, plus un
**DMARC** (`_dmarc.finarent.fr`, `v=DMARC1; p=none; rua=mailto:…` pour démarrer).
Sans cela, Gmail classe en spam ou rejette.

Autres points qui pèsent : un `replyTo` réel et surveillé, pas d'URL raccourcie,
un ratio texte/image élevé, et le respect immédiat des désabonnements.

## 12. Variables d'environnement

| Variable | Rôle |
|---|---|
| `BREVO_API_KEY` | Canal d'envoi nominal + campagnes |
| `BREVO_SENDER_EMAIL` | Adresse expéditrice (domaine authentifié) |
| `BREVO_SENDER_NAME` | Nom affiché pour la prospection centre d'appels |
| `BREVO_MARKETING_LIST_ID` | Liste destinataire des campagnes |
| `BREVO_WEBHOOK_TOKEN` | Authentifie `/api/webhooks/brevo` (ouvertures, bounces) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Canal de repli |
| `ADMIN_EMAIL` | Destinataire des alertes internes |
| `APP_BASE_URL` | Base des liens et du logo dans les emails |
| `UNSUBSCRIBE_SECRET` | Signature des liens de désabonnement — à défaut, `ENCRYPTION_KEY` puis `CRON_SECRET` |

Toutes doivent être renseignées **dans la console Clever Cloud**, pas seulement
dans le `.env` local.
