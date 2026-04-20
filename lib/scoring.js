/**
 * Calcule le score de pré-qualification d'une demande (0-100)
 * Composantes:
 * - Ancienneté entreprise (20 pts)
 * - Ratio CA / montant demandé (25 pts)
 * - Forme juridique (15 pts)
 * - Effectif (15 pts)
 * - Complétude documents (15 pts)
 * - Secteur d'activité (10 pts)
 */
export function calculateScore(application, documents = []) {
  let score = 0;
  const details = {};

  // 1. Ancienneté entreprise (max 20 pts)
  // Les applications n'ont pas de date de création entreprise dans le schéma
  // On utilise createdAt comme proxy (temporaire)
  // TODO: ajouter dateCreationEntreprise au schéma
  details.anciennete = 10;
  score += 10;

  // 2. Ratio CA / montant (max 25 pts) - pas de CA dans schéma, placeholder
  // TODO: ajouter caAnnuel au schéma
  details.ratioCA = 12;
  score += 12;

  // 3. Forme juridique (max 15 pts)
  const formes = { 'SAS': 15, 'SARL': 15, 'SA': 15, 'EURL': 10, 'SCI': 10, 'EI': 5, 'Auto-entrepreneur': 3 };
  const formeScore = formes[application.legalForm] || 8;
  details.legalForm = formeScore;
  score += formeScore;

  // 4. Effectif - pas dans schéma, placeholder
  // TODO: ajouter effectif au schéma
  details.effectif = 8;
  score += 8;

  // 5. Complétude documents (max 15 pts)
  const docsRequired = ['KBIS', 'RIB', 'CNI'];
  const docsUploaded = documents.map(d => d.type);
  const completeDocs = docsRequired.filter(r => docsUploaded.includes(r)).length;
  const docsScore = Math.round((15 / docsRequired.length) * completeDocs);
  details.documents = docsScore;
  score += docsScore;

  // 6. Secteur (max 10 pts)
  const secteurs = { 'medical': 10, 'it': 10, 'transport': 8, 'btp': 8, 'industry': 7, 'agriculture': 6, 'retail': 6, 'restaurant': 5 };
  const secteurScore = secteurs[application.sector] || 6;
  details.sector = secteurScore;
  score += secteurScore;

  return {
    score: Math.min(100, score),
    label: score >= 75 ? 'excellent' : score >= 60 ? 'bon' : score >= 40 ? 'moyen' : 'faible',
    details,
  };
}
