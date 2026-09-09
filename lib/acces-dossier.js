/**
 * Garde partagé d'appartenance d'un dossier (accès horizontaux).
 *
 * Ce module existe parce que le même défaut avait été écrit six fois : le
 * contrôle d'accès reposait sur une **égalité entre deux valeurs nullables**.
 * `application.partnerId === dbUser.partnerId` est vrai quand les deux valent
 * `null` — un compte PARTNER jamais rattaché à une société satisfaisait donc la
 * condition pour *tous* les dossiers déposés en direct, c'est-à-dire pour la
 * quasi-totalité de la base.
 *
 * Règle unique appliquée ici, sans exception :
 *   **un rattachement absent ne vaut jamais appartenance.**
 * Un identifiant nul, vide ou non fourni ferme l'accès ; il ne l'ouvre pas.
 *
 * Le module est volontairement **pur** : aucun import de `@/lib/prisma`, aucun
 * accès réseau, aucune session. C'est ce qui permet de le couvrir par des tests
 * unitaires (`tests/unit/acces-dossier.test.js`) — les deux cas qui doivent
 * échouer si quelqu'un réintroduit le défaut y sont figés.
 */

/** Produit d'assurance : seul périmètre qu'un assureur a vocation à consulter. */
export const PRODUIT_ASSURANCE = 'RC_PRO';

/**
 * Statuts d'offre pour lesquels un parcours de signature peut être ouvert.
 * `DRAFT` est exclu : une offre jamais transmise n'engage personne.
 * `REFUSED`, `EXPIRED` et `SIGNED` sont exclus : le parcours est clos.
 */
export const STATUTS_OFFRE_SIGNABLE = Object.freeze(['SENT', 'VIEWED', 'ACCEPTED']);

/**
 * Statuts d'offre encore acceptables par le client.
 * `ACCEPTED`/`SIGNED` sont déjà engagés, `DRAFT` n'a jamais été transmis.
 */
export const STATUTS_OFFRE_ACCEPTABLE = Object.freeze(['SENT', 'VIEWED']);

/**
 * Identifiant exploitable pour une comparaison d'appartenance.
 * Tout le reste (`null`, `undefined`, chaîne vide, nombre, objet) est refusé.
 * @param {unknown} valeur
 * @returns {boolean}
 */
export function identifiantUtilisable(valeur) {
  return typeof valeur === 'string' && valeur.trim().length > 0;
}

/**
 * Égalité d'appartenance : vraie uniquement si les deux identifiants existent
 * *et* coïncident. C'est le cœur de la correction — `null === null` renvoie
 * `false` ici, contrairement à l'opérateur `===` employé dans les routes.
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function memeRattachement(a, b) {
  if (!identifiantUtilisable(a) || !identifiantUtilisable(b)) return false;
  return a === b;
}

/** @param {{ role?: string } | null | undefined} utilisateur */
export function estAdmin(utilisateur) {
  return utilisateur?.role === 'ADMIN';
}

/**
 * Propriétaire du dossier. Un dossier anonyme (`userId` nul) n'a pas de
 * propriétaire : personne ne peut l'être par défaut.
 * @param {{ id?: string } | null | undefined} utilisateur
 * @param {{ userId?: string | null } | null | undefined} dossier
 */
export function estProprietaireDossier(utilisateur, dossier) {
  return memeRattachement(utilisateur?.id, dossier?.userId);
}

/**
 * Partenaire du dossier. Exige un `partnerId` **des deux côtés** : un compte
 * PARTNER sans société de rattachement n'est le partenaire d'aucun dossier.
 * @param {{ role?: string, partnerId?: string | null } | null | undefined} utilisateur
 * @param {{ partnerId?: string | null } | null | undefined} dossier
 */
export function estPartenaireDuDossier(utilisateur, dossier) {
  if (utilisateur?.role !== 'PARTNER') return false;
  return memeRattachement(utilisateur?.partnerId, dossier?.partnerId);
}

/**
 * Assureur du dossier. Le schéma ne porte aucun rattachement dossier→assureur ;
 * la borne la plus étroite exprimable est donc le produit d'assurance, celle
 * qu'applique déjà `app/api/documents/file/[id]`. Un assureur n'a rien à voir
 * dans un prêt professionnel ou un crédit-bail.
 * @param {{ role?: string } | null | undefined} utilisateur
 * @param {{ productType?: string | null } | null | undefined} dossier
 */
export function estAssureurDuDossier(utilisateur, dossier) {
  if (utilisateur?.role !== 'INSURER') return false;
  return dossier?.productType === PRODUIT_ASSURANCE;
}

/**
 * Décision d'accès à un dossier, tous rôles confondus.
 *
 * L'appelant doit fournir un dossier comportant `userId`, `partnerId` et
 * `productType` : un champ absent est traité comme absent, donc fermant.
 *
 * @param {{ id?: string, role?: string, partnerId?: string | null } | null | undefined} utilisateur
 * @param {{ userId?: string | null, partnerId?: string | null, productType?: string | null } | null | undefined} dossier
 * @returns {boolean}
 */
export function peutAccederAuDossier(utilisateur, dossier) {
  if (!utilisateur || !dossier) return false;
  if (estAdmin(utilisateur)) return true;
  if (estProprietaireDossier(utilisateur, dossier)) return true;
  if (estPartenaireDuDossier(utilisateur, dossier)) return true;
  if (estAssureurDuDossier(utilisateur, dossier)) return true;
  return false;
}

/**
 * Droit d'écrire un message interne (`isAdminOnly`), invisible du client.
 * Réservé aux profils qui ont déjà un accès légitime au dossier — donc jamais
 * à un partenaire non rattaché ni à un assureur hors périmètre.
 * @param {{ id?: string, role?: string, partnerId?: string | null } | null | undefined} utilisateur
 * @param {{ userId?: string | null, partnerId?: string | null, productType?: string | null } | null | undefined} dossier
 */
export function peutEcrireMessageInterne(utilisateur, dossier) {
  if (!utilisateur || !dossier) return false;
  if (estAdmin(utilisateur)) return true;
  return estPartenaireDuDossier(utilisateur, dossier) || estAssureurDuDossier(utilisateur, dossier);
}

/**
 * Un compte PARTNER est-il réellement rattaché à une société ?
 * Utilisé par `requirePartner` (lib/auth.ts) pour refuser en 403 un rôle
 * PARTNER au `partnerId` nul, plutôt que de le laisser interroger la base avec
 * un filtre `{ partnerId: null }` qui ramène tous les dossiers non attribués.
 * @param {{ role?: string, partnerId?: string | null } | null | undefined} utilisateur
 */
export function partenaireRattache(utilisateur) {
  if (!utilisateur) return false;
  if (estAdmin(utilisateur)) return true;
  if (utilisateur.role !== 'PARTNER') return false;
  return identifiantUtilisable(utilisateur.partnerId);
}

/**
 * Filtre Prisma des dossiers visibles par un partenaire.
 * Renvoie `null` — et non un filtre permissif — quand le compte n'a aucun
 * rattachement : l'appelant doit alors répondre 403 sans interroger la base.
 * @param {{ role?: string, partnerId?: string | null } | null | undefined} utilisateur
 * @returns {{ partnerId?: string } | null}
 */
export function filtreDossiersPartenaire(utilisateur) {
  if (estAdmin(utilisateur)) return {};
  if (!partenaireRattache(utilisateur)) return null;
  return { partnerId: /** @type {string} */ (utilisateur?.partnerId) };
}

/**
 * L'adresse de la session Auth0 a-t-elle été prouvée ?
 *
 * Le rattachement des dossiers anonymes se fait sur l'égalité des adresses. Or
 * cette adresse a été saisie sur un formulaire public, sans aucune preuve de
 * possession. Sans ce contrôle, ouvrir un compte avec l'adresse d'un tiers
 * suffit à récupérer son dossier. La comparaison est stricte : Auth0 peut
 * renvoyer la chaîne `"false"`, qui est vraie au sens booléen.
 * @param {{ email_verified?: unknown } | null | undefined} utilisateurAuth0
 */
export function emailSessionVerifie(utilisateurAuth0) {
  return utilisateurAuth0?.email_verified === true;
}

/**
 * Le rattachement d'un dossier anonyme au compte connecté est-il permis ?
 * Exige une adresse non vide **et** vérifiée.
 * @param {{ email_verified?: unknown } | null | undefined} utilisateurAuth0
 * @param {{ email?: string | null } | null | undefined} utilisateurBase
 */
export function peutRattacherDossiersAnonymes(utilisateurAuth0, utilisateurBase) {
  if (!identifiantUtilisable(utilisateurBase?.email)) return false;
  return emailSessionVerifie(utilisateurAuth0);
}

/**
 * Une offre peut-elle ouvrir un parcours de signature ?
 * Contrôle le statut **et** l'expiration : signer une offre en brouillon,
 * refusée ou périmée créerait un document `CONTRAT` que personne ne peut plus
 * supprimer, sur la base d'une offre jamais transmise.
 * @param {{ status?: string | null, expiresAt?: Date | string | null } | null | undefined} offre
 * @param {Date} [maintenant]
 */
export function offreSignable(offre, maintenant = new Date()) {
  if (!offre) return false;
  if (!STATUTS_OFFRE_SIGNABLE.includes(String(offre.status))) return false;
  return !offreExpiree(offre, maintenant);
}

/**
 * Une offre peut-elle encore être acceptée par le client ?
 * @param {{ status?: string | null, expiresAt?: Date | string | null } | null | undefined} offre
 * @param {Date} [maintenant]
 */
export function offreAcceptable(offre, maintenant = new Date()) {
  if (!offre) return false;
  if (!STATUTS_OFFRE_ACCEPTABLE.includes(String(offre.status))) return false;
  return !offreExpiree(offre, maintenant);
}

/**
 * Date d'expiration dépassée, ou inexploitable.
 * Une échéance absente ou illisible est traitée comme expirée : par défaut on
 * ferme.
 * @param {{ expiresAt?: Date | string | null } | null | undefined} offre
 * @param {Date} [maintenant]
 */
export function offreExpiree(offre, maintenant = new Date()) {
  const echeance = offre?.expiresAt == null ? null : new Date(offre.expiresAt);
  if (!echeance || Number.isNaN(echeance.getTime())) return true;
  return echeance.getTime() <= maintenant.getTime();
}
