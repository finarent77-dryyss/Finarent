/**
 * Coordonnées légales Finarent, utilisées dans tous les documents
 * commerciaux (factures, devis, avoirs, contrats).
 * Source : extrait Kbis RCS Melun du 03/07/2026 (n° gestion 2026B01716).
 */

export const COMPANY_INFO = {
  name: 'Finarent',
  legalForm: 'SAS',
  address: '39 Avenue de la République',
  postal: '77340',
  city: 'Pontault-Combault',
  country: 'France',
  siren: '931 295 836',
  // NIC du siège non présent sur le Kbis — à compléter via l'avis de situation SIRENE
  siret: '931 295 836',
  rcs: 'Melun 931 295 836',
  ape: '6622Z',
  tva: 'FR12931295836', // clé calculée depuis le SIREN — à confirmer auprès du comptable
  orias: 'XX XXX XXX', // non présent sur le Kbis — à compléter (orias.fr)
  capital: '2 010 €',
  president: 'Ntela Bardai',
  directeurGeneral: 'Armel Fabrice Lebie',
  phone: '01 23 45 67 89',
  email: 'contact@finarent.fr',
  website: 'www.finarent.fr',
  iban: 'FR76 0000 0000 0000 0000 0000 000',
  bic: 'XXXXFRPPXXX',
  bankName: 'BNP Paribas',
  // Charte officielle Finarent (FINARENT Partenaires.pdf §1)
  primaryColor: '#10253C', // Bleu Marine
  accentColor:  '#58B794', // Vert Menthe
};
