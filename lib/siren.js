/**
 * Recherche entreprise par SIRET via l'API publique recherche-entreprises.api.gouv.fr
 * Aucune clé requise.
 */
export async function lookupSiret(input) {
  const cleaned = (input || '').replace(/\D/g, '');
  if (!/^\d{9}$|^\d{14}$/.test(cleaned)) {
    return { error: 'SIREN (9 chiffres) ou SIRET (14 chiffres) requis' };
  }

  const siren = cleaned.slice(0, 9);

  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${siren}&per_page=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return { error: 'Entreprise introuvable' };
    }

    const entreprise = data.results[0];
    const etablissement = entreprise.siege || entreprise.matching_etablissements?.[0];

    return {
      siren: entreprise.siren,
      siret: cleaned.length === 14 ? cleaned : etablissement?.siret || `${siren}00001`,
      raisonSociale: entreprise.nom_complet || entreprise.nom_raison_sociale,
      formeJuridique: entreprise.nature_juridique || null,
      dateCreation: entreprise.date_creation,
      activite: entreprise.activite_principale,
      effectif: entreprise.tranche_effectif_salarie,
      adresse: etablissement?.geo_adresse,
      codePostal: etablissement?.code_postal,
      ville: etablissement?.libelle_commune,
    };
  } catch (err) {
    console.error('SIRET lookup error:', err);
    return { error: 'Erreur lors de la recherche' };
  }
}
