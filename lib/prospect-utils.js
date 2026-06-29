/** Labels statut prospect Finarent (CRM). */
export const PROSPECT_STATUS_LABELS = {
  NEW: 'Nouveau',
  CONTACTED: 'Contacté',
  QUALIFIED: 'Qualifié',
  CONVERTED: 'Converti',
  LOST: 'Perdu',
};

export function prospectStatusLabel(status) {
  return PROSPECT_STATUS_LABELS[status] || status || '—';
}

/** Découpe un nom complet en prénom / nom pour APIs externes (Brevo, Ringover). */
export function splitProspectName(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: 'Prospect', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}
