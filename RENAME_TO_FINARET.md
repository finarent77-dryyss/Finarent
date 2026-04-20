# Renommage du projet : Finassur → Finaret

## Objectif

Renommer le projet **Finassur** en **Finaret** dans l'ensemble du code source, de la configuration et de la documentation.

## Checklist de renommage

### 1. Configuration & metadata

- [ ] `package.json` — champ `name`
- [ ] `next.config.js` / `next.config.mjs` — éventuel `basePath` ou metadata
- [ ] `.env` / `.env.example` — `AUTH0_BASE_URL`, `SMTP_FROM`, `ADMIN_EMAIL`
- [ ] `vercel.json` — noms de projet si présents

### 2. Auth0 custom claim

- [ ] `middleware.ts` — `ROLE_CLAIM = 'https://finassur/role'` → `'https://finaret/role'`
- [ ] `lib/auth.ts` — même claim
- [ ] `lib/users.js` — même claim
- [ ] **Action Auth0 Dashboard** : mettre à jour la Rule/Action qui ajoute le custom claim

### 3. Textes UI & branding

- [ ] `app/layout.jsx` — metadata `title`, `description`
- [ ] `components/layout/Header.jsx` — logo / nom affiché
- [ ] `components/layout/Footer.jsx` — mentions légales, copyright
- [ ] `components/FirstVisitSplash.jsx` — écran d'accueil
- [ ] `messages/fr.json` — toutes les occurrences "Finassur"
- [ ] `messages/en.json` — toutes les occurrences "Finassur"
- [ ] `app/not-found.jsx`, `app/error.jsx` — textes d'erreur
- [ ] `app/legal/`, `app/privacy/`, `app/terms/` — mentions légales

### 4. Assets & images

- [ ] `public/Finassurs_logo.jpeg` → `public/Finaret_logo.jpeg`
- [ ] `public/favicon.ico` — nouvelle icône
- [ ] Références dans le code : `<img src="/Finassurs_logo.jpeg" />`
- [ ] Open Graph / Twitter cards images

### 5. Emails transactionnels

- [ ] `lib/email.js` — templates HTML (expéditeur, signature)
- [ ] `sendConfirmationDemande()` — nom dans le corps
- [ ] `sendAlerteAdmin()` — idem
- [ ] Variable `SMTP_FROM=noreply@finassur.fr` → `noreply@finaret.fr`

### 6. Base de données

- [ ] `DATABASE_URL` — renommer la base `finassur` → `finaret` (optionnel)
- [ ] Aucun changement de schéma Prisma requis (pas de champ "finassur")

### 7. Génération PDF

- [ ] `app/api/applications/[id]/pdf/route.js` — logo, titre, footer ("Finassur — Courtier en financement")

### 8. Git & déploiement

- [ ] Remote Git : `slformation-dryyss/finassur` → nouveau repo `finaret`
- [ ] Domaine de production : `finassur.fr` → `finaret.fr`
- [ ] Certificats SSL
- [ ] DNS (MX pour emails transactionnels)

### 9. Références textuelles

Faire un `grep -ri "finassur" .` et remplacer toutes les occurrences :
- Textes marketing sur les pages (About, Home, FAQ, etc.)
- Données JSON (secteurs, solutions, témoignages, FAQ)
- Commentaires de code
- Messages d'erreur utilisateur

### 10. Tests & validation

- [ ] Build sans erreur : `npx next build`
- [ ] Auth0 login/logout fonctionne avec le nouveau claim
- [ ] Emails envoyés avec le bon `from`
- [ ] Aucune occurrence "Finassur" restante : `grep -ri "finassur" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git`

## Commandes de remplacement en masse

### Rechercher toutes les occurrences

```bash
grep -rni "finassur" . \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude-dir=dist
```

### Remplacement automatique (à utiliser avec prudence)

```bash
# Dry-run : voir les fichiers concernés
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" \) \
  -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" \
  -exec grep -l "Finassur" {} \;

# Remplacer "Finassur" → "Finaret" (capitalisé)
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" \
  -exec sed -i 's/Finassur/Finaret/g' {} +

# Remplacer "finassur" → "finaret" (minuscule, URLs, emails)
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" \) \
  -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" \
  -exec sed -i 's/finassur/finaret/g' {} +
```

## Ordre recommandé

1. **Backup** : créer une branche `rename-to-finaret` avant tout changement
2. **Remplacement textuel** : lancer les commandes sed ci-dessus
3. **Auth0** : mettre à jour le custom claim côté Auth0 Dashboard + code
4. **Build & tests** : vérifier que tout compile
5. **Assets** : renommer les images et mettre à jour les références
6. **Emails** : tester l'envoi avec la nouvelle identité
7. **Déploiement** : pousser sur le nouveau repo + déployer sur le nouveau domaine
8. **Communication** : informer les utilisateurs existants du renommage

## Points d'attention

- **Sessions Auth0 existantes** : les utilisateurs connectés avec l'ancien claim `https://finassur/role` seront déconnectés. Prévoir une fenêtre de maintenance.
- **Emails en transit** : les emails déjà envoyés référenceront "Finassur". Pas de rétroaction possible.
- **SEO** : rediriger `finassur.fr` → `finaret.fr` avec un 301 permanent pour préserver le référencement.
- **Marques** : vérifier que "Finaret" est disponible à l'INPI avant le renommage définitif.
