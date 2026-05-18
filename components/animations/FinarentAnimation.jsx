'use client';

import React from 'react';

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

const FinarentAnimations = {
  FinarentAnimation,
  IntroLogo,
  LoadingIcon,
  SuccessIcon,
  CancelIcon,
  ValidationStamp,
  SplashLogo,
  DossierStatusIcon,
};

export default FinarentAnimations;
