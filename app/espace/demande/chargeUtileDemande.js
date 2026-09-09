// Construction de la charge utile envoyée à POST /api/applications.
// Reprise du corps de requête bâti dans DemandeWizardClient.jsx : mêmes noms
// de champs, mêmes conversions, même ordre, plus `consent` (acceptation des
// CGU) qui n'était transmis nulle part et laissait la portée juridique de
// l'acceptation reposer sur le seul navigateur.

/**
 * Bâtit le corps JSON de la demande à partir du formulaire et du préremplissage.
 * @param {object} form état courant du formulaire
 * @param {object|null} prefill préremplissage issu d'un simulateur
 */
export function construireCorpsDemande(form, prefill) {
  const isRcPro = form.productType === 'RC_PRO';
  return {
    productType: form.productType,
    companyName: form.companyName.trim(),
    siren: form.siren.replace(/\D/g, ''),
    legalForm: form.legalForm,
    sector: isRcPro ? form.sector_rcpro : form.sector,
    description: isRcPro
      ? `CA: ${form.ca}€ | Effectif: ${form.employees} | ${form.description}`.trim()
      : form.description.trim() || null,
    amount: isRcPro ? Number(form.ca) : Number(form.amount),
    duration: isRcPro ? null : Number(form.duration),
    equipmentType: isRcPro ? null : form.equipmentType.trim(),
    name: form.name.trim(),
    phone: form.phone.trim(),
    // Acceptation des CGU. Même nom de champ que POST /api/financement, seule
    // route de création qui la contrôle aujourd'hui : une validation qui ne
    // vit que dans le navigateur s'écarte avec les outils de développement,
    // le serveur doit pouvoir trancher.
    consent: form.terms === true,
    sourceSimulator: prefill?.fromSimulatorSlug
      ? {
          slug: prefill.fromSimulatorSlug,
          category: prefill.fromSimulatorCategory || null,
          label: prefill.fromSimulatorLabel || null,
          params: prefill.rawParams || {},
        }
      : null,
  };
}
