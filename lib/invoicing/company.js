import { CONTACT_EMAIL, CONTACT_PHONE } from '../contact.js';

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
  orias: '24005698', // registre unique des intermédiaires — vérifiable sur orias.fr
  capital: '2 010 €',
  president: 'Ntela Bardai',
  directeurGeneral: 'Armel Fabrice Lebie',
  phone: CONTACT_PHONE,
  email: CONTACT_EMAIL,
  website: 'www.finarent.com',
  // ⚠️ VALEURS DE REMPLISSAGE — à remplacer par le RIB réel de Finarent.
  // Voir `coordonneesBancairesValides()` plus bas : tant que ces valeurs sont
  // en place, l'émission d'une facture et l'export SEPA sont refusés.
  iban: 'FR76 0000 0000 0000 0000 0000 000',
  bic: 'XXXXFRPPXXX',
  bankName: 'BNP Paribas',
  // Charte officielle Finarent (FINARENT Partenaires.pdf §1)
  primaryColor: '#10253C', // Bleu Marine
  accentColor:  '#58B794', // Vert Menthe
};

/**
 * Les coordonnées bancaires de Finarent sont-elles réelles ?
 *
 * Le RIB livré avec le projet est un gabarit : IBAN à zéros, BIC `XXXX…`. Il
 * était pourtant imprimé sur chaque facture client (`lib/invoicing/pdf.js`) et
 * servait de compte débiteur au fichier SEPA. Conséquences : toute facture
 * émise était impayable par virement, et tout lot de virement aurait été
 * rejeté par la banque — sans qu'aucun message n'alerte qui que ce soit.
 *
 * Plutôt que d'émettre un document faux en silence, les deux chemins
 * consultent cette garde et refusent explicitement.
 */
export function ribValide(ibanBrut, bicBrut) {
  const iban = String(ibanBrut || '').replace(/\s/g, '').toUpperCase();
  const bic = String(bicBrut || '').replace(/\s/g, '').toUpperCase();

  // Structure IBAN : 2 lettres de pays, 2 chiffres de clé, puis l'identifiant
  // national. Un gabarit ne contient que des zéros après la clé.
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  if (/^0+$/.test(iban.slice(4))) return false;

  // BIC : 8 ou 11 caractères. `XXXX` en tête est la marque du gabarit livré.
  if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)) return false;
  if (bic.startsWith('XXXX')) return false;

  return true;
}

export function coordonneesBancairesValides() {
  return ribValide(COMPANY_INFO.iban, COMPANY_INFO.bic);
}

/** Message unique, pour ne pas le réécrire à chaque point d'appel. */
export const MESSAGE_RIB_MANQUANT =
  'Les coordonnées bancaires de Finarent sont encore celles du gabarit '
  + '(IBAN à zéros, BIC XXXX…). Renseignez le RIB réel dans lib/invoicing/company.js '
  + 'avant d\'émettre une facture ou un ordre de virement.';
