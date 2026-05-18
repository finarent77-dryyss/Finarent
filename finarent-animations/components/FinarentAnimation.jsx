/**
 * Composants React pour les animations Finarent
 * 
 * Usage :
 *   import { LoadingIcon, SuccessIcon, CancelIcon } from './FinarentAnimation';
 * 
 * Place les SVG dans : public/animations/
 */

import React from 'react';

// ============================================================
// COMPOSANT GÉNÉRIQUE
// ============================================================

/**
 * Composant de base qui affiche n'importe quelle animation Finarent.
 * @param {string} name - Nom du fichier sans extension (ex: 'loading')
 * @param {number} size - Taille en pixels (largeur ET hauteur, garde le ratio)
 * @param {string} className - Classes CSS additionnelles
 * @param {string} alt - Texte alternatif pour l'accessibilité
 */
export function FinarentAnimation({ name, size = 64, className = '', alt = '' }) {
  return (
    <img
      src={`/animations/${name}.svg`}
      alt={alt}
      width={size}
      height={size}
      className={`finarent-animation ${className}`}
      style={{ display: 'inline-block' }}
    />
  );
}

// ============================================================
// COMPOSANTS SPÉCIALISÉS
// ============================================================

/**
 * Logo Finarent qui s'anime à l'apparition.
 * À utiliser une seule fois par page (page d'accueil, header).
 */
export function IntroLogo({ size = 200, className = '' }) {
  return (
    <img
      src="/animations/intro-home.svg"
      alt="Finarent — Financement, Location, Assurance Pro"
      width={size}
      className={`finarent-intro ${className}`}
      style={{ height: 'auto' }}
    />
  );
}

/**
 * Spinner de chargement à utiliser pendant les requêtes API,
 * les calculs de simulation, l'analyse de dossier.
 */
export function LoadingIcon({ size = 64, className = '' }) {
  return (
    <FinarentAnimation
      name="loading"
      size={size}
      className={className}
      alt="Chargement en cours"
    />
  );
}

/**
 * Icône de succès — dossier validé, action confirmée.
 * L'animation joue en boucle.
 */
export function SuccessIcon({ size = 64, className = '' }) {
  return (
    <FinarentAnimation
      name="success-check"
      size={size}
      className={className}
      alt="Validé"
    />
  );
}

/**
 * Icône d'erreur — dossier refusé, action annulée.
 * L'animation joue en boucle.
 */
export function CancelIcon({ size = 64, className = '' }) {
  return (
    <FinarentAnimation
      name="error-cancel"
      size={size}
      className={className}
      alt="Refusé"
    />
  );
}

/**
 * Tampon "VALIDÉ + date" — pour PDF, attestations, certificats.
 * L'animation joue une seule fois.
 */
export function ValidationStamp({ size = 200, className = '' }) {
  return (
    <FinarentAnimation
      name="stamp-validated"
      size={size}
      className={className}
      alt="Document validé"
    />
  );
}

/**
 * Animation de splash screen — apparition formelle du logo.
 * L'animation joue une seule fois.
 */
export function SplashLogo({ size = 200, className = '' }) {
  return (
    <FinarentAnimation
      name="splash-reveal"
      size={size}
      className={className}
      alt="Finarent"
    />
  );
}

// ============================================================
// COMPOSANT INTELLIGENT : STATUT DE DOSSIER
// ============================================================

/**
 * Affiche automatiquement la bonne animation selon le statut.
 * Idéal pour les pages de suivi de dossier.
 * 
 * @param {string} status - 'pending' | 'approved' | 'rejected'
 * @param {number} size - Taille en pixels
 */
export function DossierStatusIcon({ status, size = 64, className = '' }) {
  switch (status) {
    case 'pending':
    case 'processing':
    case 'analyzing':
      return <LoadingIcon size={size} className={className} />;
    
    case 'approved':
    case 'validated':
    case 'success':
      return <SuccessIcon size={size} className={className} />;
    
    case 'rejected':
    case 'refused':
    case 'cancelled':
    case 'error':
      return <CancelIcon size={size} className={className} />;
    
    default:
      return null;
  }
}

// ============================================================
// EXEMPLES D'USAGE
// ============================================================

/*

// Exemple 1 : Page d'accueil
function HomePage() {
  return (
    <header className="hero">
      <IntroLogo size={300} />
    </header>
  );
}

// Exemple 2 : Bouton de soumission avec état
function SubmitButton({ loading }) {
  return (
    <button disabled={loading}>
      {loading ? (
        <>
          <LoadingIcon size={20} /> Analyse en cours...
        </>
      ) : (
        'Soumettre mon dossier'
      )}
    </button>
  );
}

// Exemple 3 : Carte de résultat de dossier
function DossierCard({ dossier }) {
  return (
    <div className={`card card--${dossier.status}`}>
      <DossierStatusIcon status={dossier.status} size={80} />
      <h3>Dossier #{dossier.id}</h3>
      <p>{dossier.statusMessage}</p>
    </div>
  );
}

// Exemple 4 : Modal de confirmation
function ApprovalModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="modal">
      <SuccessIcon size={120} />
      <h2>Votre financement est accepté !</h2>
      <p>Vous recevrez le contrat par email sous 24h.</p>
      <button onClick={onClose}>Fermer</button>
    </div>
  );
}

*/

export default {
  FinarentAnimation,
  IntroLogo,
  LoadingIcon,
  SuccessIcon,
  CancelIcon,
  ValidationStamp,
  SplashLogo,
  DossierStatusIcon,
};
