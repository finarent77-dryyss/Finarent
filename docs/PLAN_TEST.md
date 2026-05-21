# Plan de test Finarent — couverture complète

Suite de tests pour valider toutes les routes, APIs, intégrité DB et parcours utilisateurs avant MEP.

---

## Comptes de test (créés par `scripts/test-e2e.js`)

| Rôle | Email | Usage |
|---|---|---|
| **CLIENT** | andrys972@gmail.com | Parcours espace client, demandes, docs |
| **ADMIN** | andrys.magar@hotmail.fr | Back-office complet, modération, prospection |
| **PARTNER** | andrys.developper@gmail.com | Espace partenaire, dossiers reçus, commissions |

Mot de passe initial : `FinarentTest2026!` (à changer à la 1re connexion réelle).

---

## 1. Tests API (69 routes)

### Auth & profil
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/auth/[...auth0]` | GET | public | OAuth flow OK |
| `/api/auth/sync-user` | POST | auth | Upsert user en DB |
| `/api/profile` | GET | auth | Profil utilisateur courant |
| `/api/profile/export` | GET | auth | Dump JSON RGPD complet |
| `/api/profile/delete` | DELETE | auth | Soft-delete + audit RgpdAction |

### Demandes (Applications)
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/applications` | POST | CLIENT | Création |
| `/api/applications` | GET | auth | Liste filtrée par user |
| `/api/applications/[id]` | GET | auth | Détail (RBAC) |
| `/api/applications/[id]` | PATCH | ADMIN | Update statut |
| `/api/applications/[id]/pdf` | GET | auth | PDF généré |
| `/api/applications/[id]/sign` | POST | CLIENT | Signature électronique |
| `/api/applications/[id]/rescore` | POST | ADMIN | Recalcul score |

### Offres
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/offers/[id]/accept` | POST | CLIENT | Statut → ACCEPTED |
| `/api/offers/[id]/sign` | POST | CLIENT | Signature offre |

### Documents
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/documents/upload` | POST | CLIENT | Upload + record DB + DocumentAccess |
| `/api/documents/file/[id]` | GET | auth | Stream + audit accès |

### Messages
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/messages` | POST | auth | Création message |
| `/api/messages` | GET | auth | Liste par dossier |

### Notifications
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/notifications` | GET | auth | Liste notifs non lues |

### Devis / Factures (admin)
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/admin/quotes` | GET/POST | ADMIN | CRUD devis |
| `/api/admin/quotes/[id]/send` | POST | ADMIN | Email + statut SENT |
| `/api/admin/invoices` | GET/POST | ADMIN | CRUD factures |
| `/api/admin/invoices/[id]/payment` | POST | ADMIN | Enregistrement règlement |
| `/api/admin/invoices/[id]/pdf` | GET | ADMIN | PDF facture |

### Admin
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/admin/users` | GET | ADMIN | Liste utilisateurs |
| `/api/admin/users/[id]` | GET/PATCH | ADMIN | Détail + update rôle |
| `/api/admin/applications` | GET | ADMIN | Toutes demandes |
| `/api/admin/partners` | GET/POST | ADMIN | CRUD partenaires |
| `/api/admin/prospects` | GET | ADMIN | Leads cookie tracking |
| `/api/admin/prospects/[id]` | GET/PATCH/DELETE | ADMIN | Détail prospect |
| `/api/admin/logs` | GET | ADMIN | Audit trail |
| `/api/admin/affiliates` | GET/POST | ADMIN | CRUD apporteurs |
| `/api/admin/affiliates/[id]/invites` | POST | ADMIN | Email invite |

### Partner
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/partner/applications` | GET | PARTNER | Dossiers reçus |
| `/api/partner/commissions` | GET | PARTNER | Commissions perçues |
| `/api/partner/stats` | GET | PARTNER | KPI partenaire |

### Insurer
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/insurer/applications` | GET | INSURER | Dossiers assurance |
| `/api/insurer/stats` | GET | INSURER | KPI assureur |

### Tracking public
| Route | Méthode | Rôle | Attendu |
|---|---|---|---|
| `/api/prospects` | POST | public | Tracking event simulator |
| `/api/newsletter` | POST | public | Inscription newsletter |
| `/api/referrals` | POST | auth | Création parrainage |
| `/api/financement` | POST | public | Demande contact |
| `/api/testimonials` | GET | public | Liste publiée |
| `/api/faq` | GET | public | Liste publiée |
| `/api/siret/[siret]` | GET | public | Lookup SIREN/SIRET |

### Cron
| Route | Méthode | Auth | Attendu |
|---|---|---|---|
| `/api/cron/reminders` | GET | header | Relances J+3/J+7 |
| `/api/cron/sla-check` | GET | header | Détection retards SLA |
| `/api/health` | GET | public | 200 OK + version |

---

## 2. Tests UI (62 pages)

### Pages publiques (à smoke-tester)
- `/` Home — Hero + 11 sections + CTA
- `/sectors` + `/sectors/[id]`
- `/solutions` + `/solutions/[id]`
- `/assurance` + 5 tunnels (`/auto`, `/moto`, `/habitation`, `/sante`, `/rc-pro`)
- `/simulateurs` + 43 simulateurs (5 wizards + 38 single-page)
- `/glossaire`, `/guides`, `/guides/[slug]`, `/quiz/quelle-solution`
- `/blog` + `/blog/[id]` (6 articles)
- `/contact`, `/faq`, `/process`, `/why-leasing`, `/testimonials`, `/comparateur`
- `/cgv`, `/legal`, `/privacy`, `/terms`

### Espace CLIENT (`/espace/*`)
- Dashboard (KPI, dossiers en cours, économies estimées)
- Détail dossier `/espace/[id]` (messages, docs, statut)
- Demande wizard `/espace/demande`
- Profil `/espace/profile`
- Sécurité `/espace/security`
- Notifications `/espace/notifications`
- Parrainage `/espace/parrainage`

### Espace ADMIN (`/admin/*`)
- Dashboard
- Demandes (liste + kanban)
- Devis (liste + détail + envoi)
- Factures (liste + détail + paiement)
- Offres prêt
- Utilisateurs (liste + détail profil)
- Prospection (liste + drawer + tri Récents/Chauds)
- Partenaires
- Affiliation (codes, invites, commissions, audit)
- Logs d'activité
- FAQ (édition)
- Témoignages (modération)
- Settings

### Espace PARTNER (`/partner/*`)
- Dashboard
- Applications reçues
- Commissions

### Espace INSURER (`/insurer/*`)
- Dashboard
- Applications

---

## 3. Tests DB (intégrité)

### Vérifications structurelles
- Toutes les FK ont `onDelete` correct
- Tous les `@@index` sont utilisés
- Pas de cycles dans les relations
- Types `Decimal` corrects sur les montants (jamais Float)

### Vérifications data
- 28 modèles présents en DB
- Au moins 1 row dans chaque table critique (User, Application, Partner, Document, Invoice, Quote, Prospect)
- Aucun orphan (Application sans User, Document sans Application)
- Soft-delete fonctionnel (Document.deletedAt + DocumentAccess audit)

### RGPD
- DocumentAccess tracé pour chaque accès UPLOAD/VIEW/DOWNLOAD/DELETE
- RgpdAction tracé pour chaque export / suppression / rectification
- Suppression utilisateur cascade correctement (Applications, Documents, Messages…)

---

## 4. Tests email transactionnels

Suite à exécution du script E2E, vérifier réception sur les 3 boîtes :

| Email cible | Type attendu |
|---|---|
| andrys972@gmail.com (CLIENT) | Bienvenue + confirmation création dossier + signature à effectuer |
| andrys.magar@hotmail.fr (ADMIN) | Bienvenue + notif nouveau dossier + alerte SLA |
| andrys.developper@gmail.com (PARTNER) | Bienvenue + nouveau dossier transmis + relevé commissions |

---

## 5. Tests sécurité

- [ ] RBAC : CLIENT ne peut pas accéder à `/api/admin/*` → 403
- [ ] RBAC : ADMIN ne peut pas voir `/api/partner/commissions` (cross-rôle leak) → vérifier
- [ ] CSRF : Auth0 cookies en SameSite=Lax
- [ ] Rate limiting : `/api/prospects` POST > 100/min → 429
- [ ] SQL injection : tester payload `'; DROP TABLE` sur tous les params dynamiques
- [ ] XSS : injecter `<script>alert(1)</script>` dans le contenu utilisateur (messages, notes, profil)
- [ ] Upload : refuser MIME non whitelistés (executables, .exe, .sh)
- [ ] File traversal : refuser `../../etc/passwd` dans paths

---

## 6. Tests performance

- Lighthouse 4 pages : `/`, `/simulateurs/credit-immobilier/mensualite`, `/espace`, `/admin`
- Bundle size par page < 200 kB (First Load JS)
- DB query slowest < 500 ms p95
- API endpoints p95 < 800 ms

---

## Exécution

```bash
# Test E2E API automatisé (crée comptes + frappe routes + email récap)
node scripts/test-e2e.js

# Test UI manuel
npm run dev
# Puis parcourir checklist par rôle
```

---

## Critères go/no-go MEP

- [ ] 100 % API routes 2xx sur scénarios nominaux
- [ ] 100 % rôles isolés (pas de leak cross-rôle)
- [ ] 3 emails reçus sur les 3 boîtes
- [ ] 0 erreur Sentry sur 24 h en pré-prod
- [ ] Lighthouse > 85 sur 4 pages clés
- [ ] Backup Neon validé
- [ ] SPF/DKIM/DMARC OK
