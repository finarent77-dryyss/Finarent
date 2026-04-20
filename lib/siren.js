/**
 * Recherche entreprise par SIRET via l'API publique recherche-entreprises.api.gouv.fr
 * Aucune clé requise.
 */
export async function lookupSiret(siret) {
  const cleaned = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) {
    return { error: 'SIRET invalide (14 chiffres requis)' };
  }

  try {
    const res = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${cleaned}&per_page=1`,
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
      siret: cleaned,
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
