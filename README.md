# Finarent - Plateforme de Financement Professionnel

Application **Next.js 15** pour Finarent, spécialisée dans le financement professionnel (crédit-bail, LOA, solutions de financement).

## 🚀 Technologies Utilisées

- **Next.js 15** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **TailwindCSS v4** - Framework CSS
- **Auth0** - Authentification (préparé, voir AUTH0_SETUP.md)
- **EmailJS** - Envoi d'emails
- **Font Awesome** - Icônes

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn

## 🛠️ Installation

1. Clonez le repository
```bash
cd finarent
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez les variables d'environnement

Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example`:

```env
# Auth0 (Next.js)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_SECRET=run_openssl_rand_hex_32
APP_BASE_URL=http://localhost:3000

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_NEWSLETTER=your_newsletter_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Configuration Auth0

1. Créez un compte sur [Auth0](https://auth0.com/)
2. Créez une nouvelle application (Single Page Application)
3. Configurez les URLs autorisées:
- Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
  - Allowed Logout URLs: `http://localhost:3000`
  - Allowed Web Origins: `http://localhost:3000`
4. Copiez le Domain et Client ID dans votre fichier `.env`

### Configuration EmailJS

1. Créez un compte sur [EmailJS](https://www.emailjs.com/)
2. Créez un nouveau service email
3. Créez **deux templates** EmailJS :

   **Template Contact** (financement/assurance) - variables :
   - `{{to_name}}`, `{{from_name}}`, `{{request_type}}`, `{{company_name}}`, `{{siren}}`, `{{sector}}`, `{{amount}}`, `{{equipment_type}}`, `{{email}}`, `{{phone}}`, `{{message}}`, `{{recaptcha_token}}`

   **Template Newsletter** - variables :
   - `{{to_name}}`, `{{from_name}}`, `{{email}}`, `{{message}}`, `{{type}}`

4. Créez une clé reCAPTCHA v3 sur [Google reCAPTCHA](https://www.google.com/recaptcha/admin)

5. Copiez les IDs dans votre fichier `.env`

## 🚀 Démarrage

### Mode Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de Production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

### Prévisualisation du Build

```bash
npm run preview
```

## 📁 Structure du Projet

```
finarent/
├── app/                   # Next.js App Router
│   ├── layout.jsx        # Layout racine
│   ├── page.jsx          # Page d'accueil
│   ├── api/auth/         # Routes Auth0
│   ├── solutions/        # Pages solutions
│   ├── sectors/          # Pages secteurs
│   ├── blog/             # Pages blog
│   └── ...
├── components/           # Composants réutilisables
│   ├── layout/           # Header, Footer
│   ├── ui/               # Cards, etc.
│   └── pages/            # Composants de pages (client)
├── assets/data/          # Données statiques
├── hooks/                # Custom hooks
├── utils/                # Utilitaires
├── public/               # Assets statiques
└── next.config.js
```

## 🎨 Pages Disponibles

1. **Home** (`/`) - Page d'accueil avec hero, simulateur, secteurs, témoignages
2. **Solutions** (`/solutions`) - Toutes les solutions de financement
3. **Sectors** (`/sectors`) - Secteurs d'activité financés
4. **Why Leasing** (`/why-leasing`) - Avantages du leasing professionnel
5. **Process** (`/process`) - Processus de demande en 4 étapes
6. **Testimonials** (`/testimonials`) - Témoignages clients
7. **Blog** (`/blog`) - Articles et actualités
8. **Simulator** (`/simulator`) - Simulateur de financement interactif
9. **Contact** (`/contact`) - Formulaire de contact avec EmailJS

## 🎨 Design System

### Couleurs

- **Primary**: `#0A2540` (Bleu foncé)
- **Secondary**: `#6366F1` (Indigo)
- **Accent**: `#10B981` (Vert)

### Typographie

- **Font**: Inter (Google Fonts)
- **Poids**: 400, 500, 600, 700, 800, 900

### Classes Utilitaires Personnalisées

- `.btn-primary` - Bouton principal avec gradient
- `.btn-secondary` - Bouton secondaire
- `.btn-outline` - Bouton outline
- `.input-field` - Champ de formulaire
- `.premium-card` - Carte premium avec hover effect
- `.glass` - Effet glassmorphism
- `.gradient-text` - Texte avec gradient
- `.gradient-bg` - Fond avec gradient

## 🔧 Fonctionnalités Principales

### Simulateur de Financement
- Calcul en temps réel des mensualités
- Tableau d'amortissement
- Ajustement du montant et de la durée
- Taux d'intérêt configurable

### Formulaire de Contact
- Validation des champs
- Intégration EmailJS
- Messages de succès/erreur
- Protection RGPD

### Authentification Auth0
- Login/Logout
- Profil utilisateur
- Protection des routes (optionnel)

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour:
- 📱 Mobile (< 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (> 1024px)

## 🔒 Sécurité

- Cryptage SSL
- Validation côté client et serveur
- Protection RGPD
- Variables d'environnement pour les clés sensibles

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Glissez-déposez le dossier dist/ sur Netlify
```

### Autres Plateformes

Le projet peut être déployé sur n'importe quelle plateforme supportant les applications React statiques.

## 📝 Configuration Supplémentaire

### Modifier les Données

Les données sont stockées dans `src/assets/data/`:
- `sectors.js` - Secteurs d'activité
- `testimonials.js` - Témoignages clients
- `solutions.js` - Solutions de financement
- `blog.js` - Articles de blog

### Personnaliser les Couleurs

Modifiez les couleurs dans `src/index.css`:

```css
@theme {
  --color-primary: #0A2540;
  --color-secondary: #6366F1;
  --color-accent: #10B981;
}
```

## 🐛 Dépannage

### Erreur Auth0
- Vérifiez que les URLs de callback sont correctement configurées
- Assurez-vous que le Domain et Client ID sont corrects

### Erreur EmailJS
- Vérifiez que le Service ID, Template ID et Public Key sont corrects
- Assurez-vous que le template contient toutes les variables nécessaires

### Erreur de Build
- Supprimez `node_modules` et `package-lock.json`
- Réinstallez les dépendances: `npm install`

## 📄 Licence

Ce projet est privé et propriétaire.

## 👥 Support

Pour toute question ou problème:
- Email: contact@finarent.fr
- Téléphone: 01 23 45 67 89

---

Développé avec ❤️ pour Finarent
