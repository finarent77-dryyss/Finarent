// Espaces connectés (tableaux de bord) : liste unique de tout ce qui doit les
// distinguer du site public — pied de page, fond iridescent, bulle de contact
// flottante, robots.txt. Elle était recopiée dans chaque composant, et l'oubli
// de /call-center dans ces copies affichait le chrome du site public dans
// l'espace agents (où l'admin arrive via « Espace agents »).
export const ESPACES_CONNECTES = ['/admin', '/espace', '/partner', '/insurer', '/call-center'];

// Sous-ensemble doté de sa propre barre du haut : le header public y est masqué.
// L'espace client, le partenaire et l'assureur s'appuient au contraire sur ce
// header (leurs layouts réservent sa hauteur avec pt-20).
export const ESPACES_AVEC_BARRE_PROPRE = ['/admin', '/call-center'];

function correspond(pathname, prefixes) {
  return prefixes.some((p) => pathname === p || pathname?.startsWith(p + '/'));
}

export function estEspaceConnecte(pathname) {
  return correspond(pathname, ESPACES_CONNECTES);
}

export function aSaPropreBarre(pathname) {
  return correspond(pathname, ESPACES_AVEC_BARRE_PROPRE);
}
