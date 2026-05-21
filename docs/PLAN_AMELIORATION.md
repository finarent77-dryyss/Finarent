# Plan d'amélioration Finarent — pré-MEP

Audit des chantiers d'amélioration recensés à date. Priorisés en 3 niveaux : **P0** (bloquant MEP), **P1** (qualité-confort), **P2** (croissance).

---

## P0 — Bloquant MEP / qualité critique

### 1. Couverture de tests E2E
- **État actuel** : pas de tests automatisés
- **Action** : suite Playwright + script E2E API (voir `scripts/test-e2e.js`)
- **Critère de succès** : 100 % des routes API frappées + scénarios CLIENT/ADMIN/PARTNER validés

### 2. Monitoring & alerting prod
- **État actuel** : Sentry installé (Prisma instrumentation visible dans build) mais pas confirmé en prod
- **Action** : DSN Sentry en `.env`, alerting Slack/email sur erreur 5xx > 5/min
- **Critère** : alerte fonctionnelle simulée OK

### 3. Sauvegardes Neon DB
- **État actuel** : Neon fait des PITR par défaut mais pas de backup hors-Neon
- **Action** : dump quotidien vers Vercel Blob via cron + rotation 30 jours
- **Critère** : restore validé sur snapshot < 24 h

### 4. Limites Auth0 / quotas
- **État actuel** : tenant dev gratuit, plafond 7000 utilisateurs actifs
- **Action** : valider le plan Auth0 cible (Essentials €23/mois × user actif M+1)
- **Critère** : devis Auth0 commercial signé

### 5. RGPD export client
- **État actuel** : route `/api/profile/export` existe, à valider end-to-end
- **Action** : test depuis l'espace client + vérifier que toutes les tables liées sont exportées
- **Critère** : export JSON exhaustif (User + Application + Document + Message + Invoice + Prospect)

### 6. Email transactionnel délivrabilité
- **État actuel** : SMTP configuré, mais SPF/DKIM/DMARC à vérifier
- **Action** : enregistrements DNS sur le domaine finarent.com
- **Critère** : 10/10 sur Mail-Tester

---

## P1 — Qualité & confort

### 7. Performance Lighthouse
- **État actuel** : non mesuré régulièrement
- **Action** : audit Lighthouse sur 10 pages clés + budget Web Vitals dans CI
- **Critère** : LCP < 2,5 s sur Home / Simulateurs / Espace client

### 8. Accessibilité WCAG AA
- **État actuel** : aria-label correctes par endroits, audit complet à faire
- **Action** : `eslint-plugin-jsx-a11y` + audit axe-core sur 20 pages
- **Critère** : zéro erreur niveau A sur les parcours critiques

### 9. SEO technique
- **État actuel** : sitemap.xml + robots.txt + metadata par page
- **Action** : valider Search Console + JSON-LD `Article` sur le blog + `FAQPage` sur la FAQ
- **Critère** : 100 % des pages indexables sans erreur GSC

### 10. Wizard sur les 5 simulateurs phares
- **État actuel** : 5 wizards Pretto en mode toggle "guidé / expert"
- **Action** : étudier les analytics au bout de 30 jours pour décider d'étendre à 5 autres
- **Critère** : choix data-driven basé sur la conversion

### 11. PWA / mobile install
- **État actuel** : pas de manifest.json déclaré
- **Action** : `manifest.json` + service worker minimaliste (offline indicator)
- **Critère** : score PWA Lighthouse 90+

### 12. i18n (FR par défaut, EN secondaire)
- **État actuel** : `LanguageProvider` en place, fichiers de traduction partiels
- **Action** : compléter `fr.json` + `en.json` sur les pages éditoriales (glossaire, guides, blog, quiz)
- **Critère** : aucune key manquante côté EN sur les 20 pages publiques

### 13. Documentation interne
- **État actuel** : `docs/QUESTIONS_CLIENT.md` + ce fichier
- **Action** : `docs/ARCHITECTURE.md` (schéma DB, parcours utilisateur) + `docs/ENV.md` (toutes les variables d'env)
- **Critère** : onboarding nouveau dev < 2 h

### 14. Cleanup imports inutilisés / dead code
- **État actuel** : nettoyage majeur fait (-17 500 lignes), résidus probables
- **Action** : `eslint --fix` + `knip` pour détecter exports orphelins
- **Critère** : 0 warning ESLint sur l'app

---

## P2 — Croissance & nouvelles features

### 15. Plateforme Email-IA (proposition Stanley)
- **État** : MD séparé `docs/PROPOSITION_EMAIL_IA.md`
- **Effort** : 6-8 semaines, 12-22 k€
- **Quand** : après MEP

### 16. Intégration WhatsApp Business
- **État actuel** : non commencé
- **Action** : Meta Cloud API directe, relances + notifications client
- **Effort** : 5-7 jours

### 17. CRM bidirectionnel (HubSpot/Pipedrive)
- **État actuel** : prospects en interne uniquement
- **Action** : webhook sortant + API entrante pour sync deals
- **Effort** : 4-6 jours

### 18. Score d'engagement amélioré (ML)
- **État actuel** : scoring heuristique (pondération fixe)
- **Action** : modèle gradient boosting sur données historiques
- **Effort** : 8-12 jours (avec assez de data)
- **Prérequis** : 500+ prospects historiques convertis/non convertis

### 19. Notifications push (web + email digest)
- **État actuel** : in-app notifications uniquement
- **Action** : Web Push API + email digest hebdo aux clients
- **Effort** : 3-5 jours

### 20. App mobile React Native
- **État actuel** : web responsive uniquement
- **Action** : Expo + reuse 70 % du code business
- **Effort** : 8-12 semaines

### 21. Marketplace partenaires (côté client final)
- **État actuel** : matching admin uniquement
- **Action** : le client final voit les partenaires proposés + scoring transparent
- **Effort** : 6-10 jours

### 22. Module pricing dynamique
- **État actuel** : taux statiques dans les simulateurs
- **Action** : flux taux marché (sources publiques BdF, BCE) + actualisation hebdo
- **Effort** : 4-6 jours

---

## Plan recommandé sur 8 semaines

| Semaine | Focus |
|---|---|
| **S1** | Tests E2E (#1) + Monitoring (#2) + RGPD export (#5) |
| **S2** | Délivrabilité email (#6) + Backups (#3) + Auth0 commercial (#4) |
| **S3** | Lighthouse perf (#7) + A11y (#8) + SEO (#9) |
| **S4** | Documentation (#13) + Cleanup (#14) + Tests régression |
| **S5-6** | i18n complet (#12) + PWA (#11) |
| **S7-8** | Décision wizard étendu (#10) + démarrage Email-IA Phase 1 (#15) |

**MEP recommandée : fin S4**, sous réserve P0 validés.
