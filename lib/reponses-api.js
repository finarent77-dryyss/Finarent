/**
 * Chemins d'erreur communs aux routes d'API.
 *
 * Deux défauts revenaient à l'identique dans une vingtaine de handlers
 * d'administration (constats ADM1-07 et ADM1-08) :
 *
 *  1. `await request.json()` appelé hors de tout `try` : un corps vide ou
 *     non-JSON fait rejeter la promesse (`SyntaxError: Unexpected end of JSON
 *     input`), l'exception remonte au runtime Next et l'appelant reçoit un 500
 *     sans corps, là où la route sait par ailleurs répondre 400.
 *  2. `update` / `delete` appelés sur un identifiant inexistant : Prisma lève
 *     `P2025`, qu'aucun bloc `catch` ne distinguait, d'où un 500 au lieu d'un
 *     404 — le front ne pouvait donc pas différencier « la ressource a été
 *     supprimée entre-temps » d'un incident serveur.
 *
 * L'idiome de référence est celui de `requireAdmin` / `isAuthError` déjà en
 * place dans le dépôt : la fonction rend une valeur, la route décide en une
 * ligne. Rien n'est masqué — le code de statut et le message restent visibles
 * dans le fichier de la route.
 *
 * Usage :
 *   const corps = await lireCorpsJson(request);
 *   if (!corps) return reponseCorpsInvalide();
 *
 *   try {
 *     const faq = await prisma.fAQ.update({ where: { id }, data });
 *     return NextResponse.json(faq);
 *   } catch (err) {
 *     return reponseErreurPrisma(err, {
 *       contexte: 'PATCH /api/admin/faq/[id]',
 *       introuvable: 'FAQ introuvable',
 *     });
 *   }
 */

import { NextResponse } from 'next/server';

/**
 * Lit le corps JSON d'une requête sans jamais lever d'exception.
 *
 * Retourne l'objet décodé, ou `null` si le corps est absent, illisible, ou
 * n'est pas un objet JSON (les routes concernées attendent toutes un objet :
 * un tableau, un scalaire ou `null` ne leur sert à rien et finirait en erreur
 * Prisma non attrapée).
 *
 * @param {Request} request
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function lireCorpsJson(request) {
  let brut;
  try {
    brut = await request.json();
  } catch {
    // Corps vide ou JSON malformé : traité comme une absence de corps.
    return null;
  }
  if (brut === null || typeof brut !== 'object' || Array.isArray(brut)) return null;
  return brut;
}

/**
 * Variante tolérante, pour les routes dont le corps est facultatif
 * (`ringover-sync` par exemple, où tous les paramètres ont un défaut).
 * Rend toujours un objet : `{}` quand il n'y a rien d'exploitable.
 *
 * @param {Request} request
 * @returns {Promise<Record<string, unknown>>}
 */
export async function lireCorpsJsonOptionnel(request) {
  return (await lireCorpsJson(request)) ?? {};
}

/**
 * Réponse 400 standard quand `lireCorpsJson` a rendu `null`.
 * Le message doit rester exploitable côté client : il dit quoi corriger.
 *
 * @param {string} [message]
 * @returns {NextResponse}
 */
export function reponseCorpsInvalide(message = 'Corps de requête JSON absent ou invalide') {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Vrai si l'erreur est le « enregistrement introuvable » de Prisma.
 * Utile quand la route veut traiter le cas elle-même plutôt que déléguer.
 *
 * @param {unknown} erreur
 * @returns {boolean}
 */
export function estIntrouvable(erreur) {
  return Boolean(erreur) && typeof erreur === 'object' && erreur.code === 'P2025';
}

/**
 * Traduit une erreur Prisma en réponse HTTP :
 *   - P2025 (enregistrement introuvable)   → 404
 *   - P2002 (contrainte d'unicité violée)  → 409
 *   - tout le reste                        → 500 « Erreur serveur », journalisé
 *
 * Le message d'erreur technique n'est jamais renvoyé au client : seul le
 * serveur le voit, via `console.error`. Les messages 404/409 sont fournis par
 * la route pour rester compréhensibles à l'écran.
 *
 * @param {unknown} erreur
 * @param {{ contexte?: string, introuvable?: string, conflit?: string }} [options]
 * @returns {NextResponse}
 */
export function reponseErreurPrisma(erreur, options = {}) {
  const {
    contexte = 'Erreur Prisma',
    introuvable = 'Ressource introuvable',
    conflit = 'Valeur déjà utilisée',
  } = options;

  const code = erreur && typeof erreur === 'object' ? erreur.code : undefined;

  if (code === 'P2025') {
    return NextResponse.json({ error: introuvable }, { status: 404 });
  }
  if (code === 'P2002') {
    return NextResponse.json({ error: conflit }, { status: 409 });
  }

  console.error(`${contexte} :`, erreur);
  return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
}
