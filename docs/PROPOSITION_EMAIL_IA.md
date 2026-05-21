# Proposition — Plateforme Email-IA centralisée Finarent

**Demande client (Stanley Bardai, mai 2026)**

Connecter Gmail/Outlook au site Finarent via API pour que les agents IA et la plateforme gèrent automatiquement :
- Lecture et tri des mails
- Catégorisation intelligente
- Détection des urgences
- Relances automatiques quotidiennes des mails sans réponse
- Création automatique de tâches et suivi dossier
- Génération de pré-réponses IA
- Extraction des pièces jointes et données importantes
- Dashboard analytique journalier
- Synchronisation CRM / calendrier / WhatsApp
- Suivi commercial et administratif en temps réel

---

## Découpage en 3 phases

### Phase 1 — MVP (démontrable)

| Brique | Détail |
|---|---|
| Connexion Gmail | OAuth 2.0 + scope `gmail.readonly` / `gmail.modify` |
| Sync inbox | Pub/Sub Google (push webhook, pas de polling) |
| Modèle Prisma | `EmailMessage`, `EmailAttachment`, `EmailThread` |
| Catégorisation | Claude Haiku 4.5 — tags : nouveau dossier / relance / pièce manquante / spam / RDV |
| Détection urgence | Combinaison regex (« urgent », « préfecture », « ANTAI ») + IA |
| UI admin | Vue inbox dans `/admin/inbox` + filtres + tags auto |

**Durée :** 6-8 jours (+25 % buffer = ~10 jours)

### Phase 2 — Productivité

| Brique | Détail |
|---|---|
| Pré-réponses Claude | Sonnet 4.6 — 4 brouillons à l'ouverture : accusé / relance docs / RDV / refus |
| Extraction PJ | Auto vers `Document` du dossier client correspondant |
| Matching dossier auto | Par email + numéro de dossier dans le sujet/corps |
| Relances cron | J+3 / J+7 sur emails sans réponse (Vercel cron) |
| Création auto | Prospect → Application si email d'un prospect inconnu |

**Durée :** 10-14 jours (+25 % buffer = ~17 jours)

### Phase 3 — Hub central

| Brique | Détail |
|---|---|
| Outlook | Microsoft Graph API (OAuth + webhooks) |
| Dashboard analytique | Volume mails/j, temps de réponse, taux d'urgences, ratio auto-traité |
| WhatsApp Business | Meta Cloud API directe (1 € pour 1000 messages) |
| Sync calendrier | Google Calendar + Outlook — proposer RDV depuis l'admin |

**Durée :** 12-16 jours (+25 % buffer = ~20 jours)

**Total réaliste : 35-48 jours de dev solo**

---

## Stack technique recommandée

| Brique | Choix | Pourquoi |
|---|---|---|
| Gmail API | OAuth + `watch()` Pub/Sub | Gratuit jusqu'à 1 M req/j, temps réel |
| Outlook | Microsoft Graph API | Standard MS, webhooks supportés |
| IA tri | Claude Haiku 4.5 | ~0,001 € par mail |
| IA pré-réponses | Claude Sonnet 4.6 | Qualité conversationnelle |
| Queue / cron | Vercel cron + Inngest | Déjà en place |
| Stockage PJ | Vercel Blob | Cohérent avec stack actuel |
| WhatsApp | Meta Cloud API | Direct, sans BSP intermédiaire |

---

## Coûts récurrents (1 000 mails/jour)

| Poste | Coût mensuel | Notes |
|---|---|---|
| Gmail API | 0 € | Gratuit jusqu'à 1 M req/j |
| Claude Haiku (tri) | ~10 € | 30 000 mails × 0,0003 € |
| Claude Sonnet (réponses) | ~20 € | 1 000 brouillons × 0,02 € |
| Vercel Blob (PJ) | ~10 € | Stockage attachements |
| WhatsApp Business | 20-150 € | Selon volume sortant |
| Maintenance forfait | 300 € | 1 j/mois |
| **Total coût** | **360-490 €/mois** | |
| **Refacturé client (×1,3)** | **500-650 €/mois** | Marge confortable |

---

## Tarification client (3 options)

### Option A — MVP seul
**4 500 € HT** clé en main, livré 2 semaines
→ Démontre la valeur, sécurise la suite

### Option B — Phases 1 + 2 (recommandé)
**12 000 € HT**, livré 4-5 semaines
→ C'est là que le client voit le vrai gain de productivité

### Option C — Tout en main (Phases 1+2+3)
**22 000 € HT**, livré 7-8 semaines
→ Plateforme complète, vendable comme outil concurrentiel

### Conditions
- **Acompte 40 % à la signature** (4 800 € sur Option B)
- 30 % à la livraison Phase 1
- 30 % à la livraison finale
- **30 jours de garantie** post-livraison
- **2 h de formation visio** incluses
- Ajouts hors scope facturés à **600 €/jour**

---

## Risques identifiés

| Risque | Mitigation |
|---|---|
| Google bloque l'app pendant la review OAuth | Démarrer la review dès la signature (10 j ouvrés) |
| Volume mails sous-estimé | Cap IA + facturation à l'usage au-delà de 1 500 mails/j |
| Client demande "encore une feature" | Hors scope = devis additionnel signé avant dev |
| Conformité RGPD sur lecture mails | Mention obligatoire dans les CGU + consentement explicite |
| Vie privée des collaborateurs Finarent | Sync uniquement sur boîte commerciale partagée (pas mails perso) |

---

## Mail-type à envoyer à Stanley

> Bonjour Stanley,
>
> Suite à notre échange, voici ma proposition pour l'intégration email-IA sur Finarent.
>
> **Périmètre :** [Option B]
> Connexion Gmail (Outlook en option), tri IA, détection urgences, relances auto, pré-réponses générées, extraction de pièces jointes vers les dossiers, dashboard analytique.
>
> **Délai :** 4-5 semaines à compter de la signature
> **Tarif :** 12 000 € HT clé en main
> **Hébergement / IA / WhatsApp :** environ 500 €/mois en récurrent
>
> Je propose 40 % d'acompte à la signature, 30 % à mi-parcours, 30 % à la livraison. Garantie 30 jours et formation incluses.
>
> La Phase 3 (WhatsApp, Outlook, dashboard avancé) peut s'ajouter ensuite pour 9 000 € HT.
>
> Dis-moi si tu veux qu'on cale un call pour valider le périmètre exact avant que je te transmette le devis formel.
>
> Andrys

---

## TODO avant de relancer

- [ ] Confirmer avec Stanley le périmètre (Option A/B/C)
- [ ] Vérifier consentement RGPD côté Finarent (mention CGU à ajouter)
- [ ] Démarrer la review OAuth Google dès la signature
- [ ] Définir la boîte commerciale unique de référence (pas multi-comptes au début)
- [ ] Décider du CRM cible pour la sync (HubSpot ? Pipedrive ? Notion ?)
