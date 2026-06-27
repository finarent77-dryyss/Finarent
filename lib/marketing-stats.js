/**
 * Chiffres marketing affichés sur le site — valeurs validées client (réalistes).
 * Modifier ici pour garder hero, home, about et SEO cohérents.
 */
export const MARKETING_STATS = {
  /** Clients / entreprises accompagnées */
  clients: '120+',
  clientsCounter: 120,

  /** Montant total financé (affichage statique) */
  fundedAmount: '1,85M€',
  fundedAmountShort: '1,85M€',

  /** Compteur animé « financés en 2025 » */
  funded2025Counter: { to: 1.85, suffix: 'M€' },

  /** Délai de réponse — engagement réel */
  responseHours: { to: 48, suffix: 'h', duration: 1200 },

  /** Taux d'acceptation observé */
  approvalRate: { to: 93, suffix: '%' },
  approvalRateLabel: '93%',

  /** Satisfaction & avis */
  reviewScore: '4,6/5',
  satisfactionRate: '90%',

  /** Par secteur (PME financées) */
  sectorCounts: {
    transport: '12+',
    btp: '28+',
    medical: '18+',
    tech: '22+',
    services: '25+',
    industry: '14+',
  },
};
