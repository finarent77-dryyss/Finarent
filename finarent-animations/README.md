# 🎨 Finarent — Pack d'animations SVG

Pack de 6 animations professionnelles pour la plateforme Finarent.
Toutes les animations sont **100% CSS**, ultra-légères (~7-20 ko), sans aucune dépendance JavaScript.

---

## 📦 Contenu du pack

| Fichier | Usage métier | Boucle ? |
|---|---|---|
| `intro-home.svg` | Page d'accueil au premier chargement | Non |
| `success-check.svg` | Dossier validé, financement accepté | Oui |
| `error-cancel.svg` | Dossier refusé, action annulée | Oui |
| `loading.svg` | Chargement, simulation en cours | Oui |
| `stamp-validated.svg` | En-tête de PDF, attestation, certificat | Non |
| `splash-reveal.svg` | Splash screen, intro de présentation | Non |

---

## 🚀 Installation

### Option 1 — Dossier public (recommandé)

Copie le dossier `svg/` dans le dossier `public/` (ou `assets/`) de ton projet :

```
ton-projet/
├── public/
│   └── animations/
│       ├── intro-home.svg
│       ├── success-check.svg
│       ├── error-cancel.svg
│       ├── loading.svg
│       ├── stamp-validated.svg
│       └── splash-reveal.svg
```

### Option 2 — Import direct dans le bundle

Place le dossier `svg/` dans `src/assets/animations/` pour qu'ils soient bundlés avec ton code.

---

## 💻 Intégration

### Méthode 1 — Balise `<img>` (la plus simple)

```html
<img src="/animations/loading.svg" alt="Chargement en cours" />
```

Les animations CSS embarquées dans le SVG fonctionnent automatiquement. **Cette méthode est suffisante dans 90% des cas.**

### Méthode 2 — Background CSS

```css
.loader {
  width: 80px;
  height: 80px;
  background: url('/animations/loading.svg') center/contain no-repeat;
}
```

### Méthode 3 — Inline SVG (avancé)

Si tu as besoin de manipuler les couleurs ou les animations dynamiquement, inline directement le contenu du SVG dans ton HTML/JSX. Cela permet aussi d'utiliser CSS custom properties.

---

## ⚛️ Composants React prêts à l'emploi

Voir le fichier [`FinarentAnimation.jsx`](./components/FinarentAnimation.jsx) pour les composants prêts à copier-coller.

Exemple d'usage :

```jsx
import { LoadingIcon, SuccessIcon, CancelIcon } from './components/FinarentAnimation';

function DossierStatus({ status }) {
  if (status === 'pending') return <LoadingIcon size={64} />;
  if (status === 'approved') return <SuccessIcon size={64} />;
  if (status === 'rejected') return <CancelIcon size={64} />;
}
```

---

## 🎯 Cas d'usage recommandés

### Sur la page d'accueil
```jsx
<header>
  <img src="/animations/intro-home.svg" alt="Finarent" className="logo-hero" />
</header>
```

### Pendant le traitement d'un dossier
```jsx
{loading && (
  <div className="loading-overlay">
    <img src="/animations/loading.svg" alt="Analyse en cours" />
    <p>Nous étudions votre demande de financement…</p>
  </div>
)}
```

### Après validation
```jsx
{status === 'success' && (
  <div className="result-card success">
    <img src="/animations/success-check.svg" alt="Validé" />
    <h2>Votre dossier est accepté</h2>
  </div>
)}
```

### Après refus
```jsx
{status === 'rejected' && (
  <div className="result-card error">
    <img src="/animations/error-cancel.svg" alt="Refusé" />
    <h2>Dossier non retenu</h2>
  </div>
)}
```

### Sur un PDF généré
Le `stamp-validated.svg` peut être intégré en haut à droite d'un PDF en remplacement d'un tampon manuel.

---

## 🎨 Personnalisation

### Tailles recommandées

| Contexte | Taille |
|---|---|
| Loader inline (texte, bouton) | 24–32 px |
| Icône de statut dans une carte | 48–64 px |
| Hero / page entière | 120–200 px |
| Splash screen mobile | 80% de la largeur écran |

### Couleurs

Les SVG utilisent les couleurs officielles Finarent :
- **Bleu nuit** `#13253b` (pastille de fond)
- **Vert Finarent** `#45b388` (accents, validations)
- **Rouge** `#e54d4d` (utilisé uniquement pour le cancel)

⚠️ **Mode sombre** : pour `intro-home.svg` sur fond foncé, ajoute la règle CSS suivante dans ton thème dark :

```css
.dark img[src*="intro-home"] {
  /* Cette astuce ne fonctionne pas avec <img>, voir solution inline ci-dessous */
}

/* Solution recommandée : inline le SVG et cibler la classe interne */
.dark .finarent-intro .st1 { fill: #ffffff; }
```

---

## ⚡ Performance

- **Poids total** : ~60 ko pour les 6 SVG
- **Pas de JavaScript** : tout est en CSS pur
- **GPU-accelerated** : les animations utilisent `transform` et `opacity`
- **Compatibilité** : tous les navigateurs modernes (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)

---

## 🔧 Modification des animations

Chaque SVG contient un bloc `<style>` au début. Tu peux y ajuster :

- **Durée** : `animation: NS_progress 4s` → modifie le `4s`
- **Délai** : `animation: ... 0.5s forwards` → modifie le délai
- **Couleurs** : recherche `#45b388` ou `#e54d4d`

Exemple — accélérer le chargement :
```xml
<!-- Dans loading.svg, ligne ~80 -->
animation: anim3_loop-progress 2.5s ease-in-out infinite;
                              ^^^
                              Changer en 1.5s pour plus rapide
```

---

## 📞 Support

Pour toute modification (durée, couleur, comportement), ouvre simplement le SVG dans un éditeur de texte et modifie le bloc `<style>` en haut.

Tous les SVG ont leurs classes CSS préfixées (`anim1_`, `anim2_`, etc.) pour éviter les conflits si plusieurs animations cohabitent sur une même page.
