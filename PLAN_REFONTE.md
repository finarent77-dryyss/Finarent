# 🗺️ Plan de refonte Finarent — Architecture v2.0

**Basé sur la spec Mars 2026.** Migration du codebase actuel (JS, DemandeFinancement) vers l'architecture cible (TS, Application, Partenaires, workflow complet).

---

## 📊 État actuel vs Cible

| Aspect | Actuel | Cible (Spec) |
|--------|--------|--------------|
| Langage | JavaScript | **TypeScript strict** |
| Modèle principal | DemandeFinancement | **Application** (ProductType, ApplicationStatus) |
| Base | PostgreSQL + User partiel | **Schema v2 complet** (User, Partner, Application, Document, Message, StatusHistory) |
| Emails | EmailJS (client) | **Nodemailer** (serveur) |
| Fichiers | À vérifier | **Supabase Storage** |
| Validation | Manuelle | **Zod** (client + serveur) |
| Structure routes | Pages plates | **(public), (auth)/dashboard, admin** |
| Rôles | String "client"/"admin" | **Enum Role** + claim Auth0 |

---

## 🔧 Prérequis techniques (à faire en premier)

| # | Tâche | Commande / Action |
|---|-------|-------------------|
| P0 | Activer TypeScript | `npx tsc --init`, renommer `.jsx` → `.tsx`, config `tsconfig.json` |
| P1 | Installer dépendances | `npm i zod nodemailer @supabase/supabase-js react-hook-form @hookform/resolvers` |
| P2 | Supprimer EmailJS | Retirer `@emailjs/browser`, `FooterNewsletter` → formulaire + API |
| P3 | Variables d'env | Ajouter `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SMTP_*`, `YOUSIGN_*` |

---

## Phase 1 — Fondations (Semaine 1)

**Objectif :** Base technique solide. Rien ne peut être codé sans ça.

| # | Tâche | Fichier(s) | Statut |
|---|-------|------------|--------|
| 1.1 | Remplacer schema Prisma par v2 (spec section 4) | `prisma/schema.prisma` | ✅ |
| 1.2 | Migration | `prisma/migrations/20260226120000_init_v2/` | ✅ |
| 1.3 | Singleton Prisma (TS) | `lib/prisma.ts` | ✅ |
| 1.4 | Helpers auth : getAuthUser, isAdmin, getLocalUser | `lib/auth.ts` | ✅ |
| 1.5 | API sync-user : upsert User depuis Auth0 | `app/api/auth/sync-user/route.ts` | ✅ |
| 1.6 | Middleware : /dashboard/* → CLIENT+, /admin/* → ADMIN | `middleware.ts` | ✅ |

**Livrable Phase 1 :** Connexion Auth0 → sync en DB, routes protégées.

---

## Phase 2 — MVP Financement (Semaines 2-3)

**Objectif :** Flux complet soumission → traitement → statut pour Prêt Pro / Crédit-Bail / LOA.

| # | Tâche | Fichier(s) | Statut |
|---|-------|------------|--------|
| 2.1 | API POST /api/financement (créer demande) | `app/api/financement/route.js` | ✅ |
| 2.2 | API GET /api/applications (mes demandes) | `app/api/applications/route.js` | ✅ |
| 2.3 | Formulaire public (contact) | `app/contact/page.jsx` | ✅ |
| 2.4 | Page dashboard client | `app/espace/page.jsx` | ✅ |
| 2.5 | Page détail dossier | `app/espace/[id]/page.jsx` | ✅ |
| 2.6 | Upload documents (local) | `app/api/documents/upload/route.js` | ✅ |
| 2.7 | Admin : liste dossiers | `app/admin/demandes/` | ✅ |
| 2.8 | Admin : détail + changement statut | `app/admin/demandes/` | ✅ |
| 2.9 | Emails serveur (Nodemailer) | `lib/email.js` | ✅ |

**Livrable Phase 2 :** Parcours client complet (demande → dashboard → documents) + admin (liste, détail, statut).

---

## Phase 3 — Assurance & Partenaires (Semaine 4)

| # | Tâche | Fichier(s) | Statut |
|---|-------|------------|--------|
| 3.1 | Formulaire assurance RC Pro (switch dans formulaire) | `app/(public)/demande/page.tsx` | ⬜ |
| 3.2 | Admin : CRUD partenaires | `app/admin/partners/page.tsx` | ⬜ |
| 3.3 | Admin : assignation partenaire + envoi devis | `PATCH /api/applications/[id]/assign` | ⬜ |
| 3.4 | Admin : transmission dossier partenaire (PDF + email) | `POST /api/applications/[id]/transmit` | ⬜ |
| 3.5 | Client : acceptation devis | `PATCH /api/applications/[id]/accept-quote` | ⬜ |
| 3.6 | Messagerie (Message model) | `app/api/messages/route.ts` + UI | ⬜ |

---

## Phase 4 — Signature & Finitions (Semaine 5)

| # | Tâche | Fichier(s) | Statut |
|---|-------|------------|--------|
| 4.1 | Intégration YouSign | `app/api/yousign/route.ts` + webhook | ⬜ |
| 4.2 | Dashboard admin KPIs (recharts) | `app/admin/page.tsx` | ⬜ |
| 4.3 | Vérification SIREN API INSEE | `app/api/siren/[siren]/route.ts` | ⬜ |
| 4.4 | Rate limiting (Upstash) | Endpoints sensibles | ⬜ |

---

## 📁 Nouvelle structure cible

```
app/
├── (public)/              # Pages sans auth
│   ├── page.tsx            # Landing (ex-page.jsx)
│   ├── demande/page.tsx    # Formulaire unifié (ex-contact)
│   ├── simulator/page.tsx
│   ├── assurance/page.tsx
│   └── ...
├── (auth)/
│   └── dashboard/
│       ├── page.tsx        # Liste demandes
│       └── [id]/page.tsx   # Détail dossier
├── admin/
│   ├── page.tsx            # KPIs
│   ├── applications/      # Liste + détail
│   └── partners/           # CRUD partenaires
└── api/
    ├── auth/sync-user/
    ├── applications/
    ├── documents/
    ├── messages/
    ├── send-email/
    └── siren/[siren]/

lib/
├── prisma.ts
├── auth.ts
└── email.ts
```

---

## ⚡ Ordre d'exécution recommandé

1. **Prérequis** (P0–P3) — 1–2h
2. **Phase 1** — 1 jour
3. **Phase 2** — 2–3 jours
4. **Phase 3** — 1–2 jours
5. **Phase 4** — 2–3 jours

---

## 🚀 Par où commencer ?

**Immédiatement :** Phase 1, tâche 1.1 — remplacer le schema Prisma par le schema v2 de la spec.

Ensuite : migration, puis `lib/prisma.ts` et `lib/auth.ts`.

---

*Document généré pour Finarent — Mars 2026*
