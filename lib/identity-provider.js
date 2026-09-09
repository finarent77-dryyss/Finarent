/**
 * Lecture du fournisseur d'identité à partir du `sub` Auth0 ("auth0|abc",
 * "google-oauth2|123"…). Sans dépendance Node : utilisable côté serveur
 * comme dans un composant client.
 */

const LABELS = {
  auth0: 'Finarent',
  'google-oauth2': 'Google',
  windowslive: 'Microsoft',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  apple: 'Apple',
};

/**
 * @param {string | null | undefined} sub
 * @returns {{ prefix: string, label: string, isDatabase: boolean }}
 */
export function identityProvider(sub) {
  const prefix = String(sub || '').split('|')[0];
  return {
    prefix,
    label: LABELS[prefix] || prefix || "votre fournisseur d'identité",
    // Seule la connexion base de données Auth0 possède un mot de passe Finarent.
    isDatabase: prefix === 'auth0',
  };
}
