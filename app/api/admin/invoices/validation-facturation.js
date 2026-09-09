/**
 * Contrôles de saisie communs aux factures et aux devis (constat ADM2-11).
 *
 * Les routes de création recopiaient les montants reçus après un simple
 * `Number(x) || défaut`, ce qui laissait passer trois familles de saisies
 * aberrantes :
 *
 *  1. `lines: []` / `items: []` — une pièce sans aucune ligne, donc un total de
 *     0 € et un document vide envoyé au client ;
 *  2. `quantity: 0` — la ligne apparaît sur le PDF mais ne contribue pas au
 *     total, l'écart entre le détail et le total TTC n'est visible nulle part ;
 *  3. `unitPrice: -500` — `Number(-500) || 0` vaut -500, le total devient
 *     négatif, et une facture à montant négatif n'est pas une facture : c'est
 *     un avoir, qui a son propre modèle (`CreditNote`) et sa propre séquence.
 *
 * Le parti pris est celui des autres contrôles du dépôt (`lib/invoicing/statuses`)
 * : refuser franchement avec un message qui dit quoi corriger, plutôt que de
 * réparer silencieusement une saisie que l'utilisateur croit avoir validée.
 *
 * Une valeur *absente* reste tolérée et prend son défaut historique
 * (quantité 1, prix 0, TVA 20 %) : le but est de fermer les saisies fausses,
 * pas de casser les appels existants qui omettent un champ facultatif.
 */

import { NextResponse } from 'next/server';

/** Garde-fous de bon sens : au-delà, c'est une erreur de saisie, pas un montant. */
const MONTANT_MAX = 100_000_000;
const QUANTITE_MAX = 1_000_000;

/** Tolérance d'arrondi en euros, alignée sur `lib/invoicing/statuses`. */
const EPSILON = 0.01;

/** Réponse 400 pour une saisie refusée. Même forme que le reste des routes. */
export function reponseSaisieInvalide(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Convertit une valeur de formulaire en nombre fini.
 *
 * Rend `null` — et non 0 — pour tout ce qui n'est pas un nombre exploitable :
 * c'est ce `null` qui permet à l'appelant de distinguer « champ absent »
 * (défaut applicable) de « champ faux » (refus), distinction que le
 * `Number(x) || défaut` d'origine rendait impossible.
 *
 * @param {unknown} valeur
 * @returns {number | null}
 */
export function nombreFini(valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return null;
  if (typeof valeur === 'boolean') return null;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : null;
}

/**
 * Lit un nombre facultatif borné.
 *
 * @param {unknown} valeur
 * @param {{ libelle: string, defaut?: number, min?: number, max?: number }} options
 * @returns {{ ok: true, valeur: number } | { ok: false, message: string }}
 */
export function validerNombre(valeur, { libelle, defaut = null, min = 0, max = MONTANT_MAX }) {
  const absent = valeur === null || valeur === undefined || valeur === '';
  if (absent) {
    if (defaut === null) return { ok: false, message: `${libelle} est obligatoire.` };
    return { ok: true, valeur: defaut };
  }

  const nombre = nombreFini(valeur);
  if (nombre === null) {
    return { ok: false, message: `${libelle} doit être un nombre (reçu : « ${String(valeur)} »).` };
  }
  if (nombre < min) {
    return { ok: false, message: `${libelle} ne peut pas être inférieur à ${min} (reçu : ${nombre}).` };
  }
  if (nombre > max) {
    return { ok: false, message: `${libelle} dépasse la limite admise de ${max} (reçu : ${nombre}).` };
  }
  return { ok: true, valeur: nombre };
}

/**
 * Valide et normalise les lignes d'une facture ou les postes d'un devis.
 *
 * Le calcul des totaux est laissé à l'appelant : seules la forme et les bornes
 * sont vérifiées ici, mais les valeurs rendues sont déjà converties, de sorte
 * que la route n'a plus à refaire de `Number(...)` — c'était précisément la
 * double conversion qui masquait les saisies fausses.
 *
 * @param {unknown} lignes             tableau reçu (`lines` ou `items`)
 * @param {object}  options
 * @param {string}  options.nomLigne   nom métier capitalisé, préfixe des messages
 * @param {string}  options.messageVide message rendu si la liste est vide
 * @param {string}  options.champPrix  nom du champ de prix (`unitPrice` / `unitPriceHT`)
 * @param {boolean} [options.avecTva]  valide en plus un taux de TVA par ligne
 * @returns {{ ok: true, lignes: Array<{description: string, quantite: number, prix: number, tauxTva: number, position: number}> }
 *          | { ok: false, message: string }}
 */
export function validerLignes(lignes, { nomLigne, messageVide, champPrix, avecTva = false }) {
  if (!Array.isArray(lignes) || lignes.length === 0) {
    return { ok: false, message: messageVide };
  }

  const normalisees = [];

  for (let index = 0; index < lignes.length; index += 1) {
    const rang = index + 1;
    const ligne = lignes[index];
    const prefixe = `${nomLigne} ${rang}`;

    if (!ligne || typeof ligne !== 'object' || Array.isArray(ligne)) {
      return { ok: false, message: `${prefixe} : format inattendu, un objet est attendu.` };
    }

    const description = typeof ligne.description === 'string' ? ligne.description.trim() : '';
    if (!description) {
      return { ok: false, message: `${prefixe} : la description est obligatoire.` };
    }

    // Quantité : 0 est refusé. Une ligne à quantité nulle figure sur le PDF
    // sans peser dans le total — le client voit un détail qui ne correspond
    // pas au montant réclamé.
    const quantite = validerNombre(ligne.quantity, {
      libelle: `${prefixe} : la quantité`,
      defaut: 1,
      min: 0,
      max: QUANTITE_MAX,
    });
    if (!quantite.ok) return quantite;
    if (quantite.valeur <= 0) {
      return { ok: false, message: `${prefixe} : la quantité doit être strictement positive (reçu : ${quantite.valeur}).` };
    }

    const prix = validerNombre(ligne[champPrix], {
      libelle: `${prefixe} : le prix unitaire HT`,
      defaut: 0,
      min: 0,
      max: MONTANT_MAX,
    });
    if (!prix.ok) return prix;

    let tauxTva = 0;
    if (avecTva) {
      const tva = validerNombre(ligne.vatRate, {
        libelle: `${prefixe} : le taux de TVA`,
        defaut: 20,
        min: 0,
        max: 100,
      });
      if (!tva.ok) return tva;
      tauxTva = tva.valeur;
    }

    normalisees.push({
      description,
      quantite: quantite.valeur,
      prix: prix.valeur,
      tauxTva,
      position: index,
    });
  }

  return { ok: true, lignes: normalisees };
}

/**
 * Valide la remise d'un devis, exprimée en pourcentage ou en euros.
 *
 * Une remise supérieure au sous-total donnait un total TTC négatif, avec les
 * mêmes conséquences qu'un prix unitaire négatif.
 *
 * @param {{ discountPercent?: unknown, discountAmount?: unknown }} corps
 * @param {number} sousTotalHT
 * @returns {{ ok: true, remise: number, pourcentage: number | null, montant: number | null }
 *          | { ok: false, message: string }}
 */
export function validerRemise(corps, sousTotalHT) {
  const pourcentage = validerNombre(corps.discountPercent, {
    libelle: 'La remise en pourcentage',
    defaut: 0,
    min: 0,
    max: 100,
  });
  if (!pourcentage.ok) return pourcentage;

  const montant = validerNombre(corps.discountAmount, {
    libelle: 'La remise en euros',
    defaut: 0,
    min: 0,
    max: MONTANT_MAX,
  });
  if (!montant.ok) return montant;

  // Même précédence que le calcul d'origine : la remise en euros l'emporte.
  const remise = montant.valeur > 0
    ? montant.valeur
    : (sousTotalHT * pourcentage.valeur) / 100;

  if (remise > sousTotalHT + EPSILON) {
    return {
      ok: false,
      message: `La remise (${remise.toFixed(2)} €) dépasse le sous-total HT (${sousTotalHT.toFixed(2)} €) : le total deviendrait négatif.`,
    };
  }

  return {
    ok: true,
    remise,
    pourcentage: pourcentage.valeur > 0 ? pourcentage.valeur : null,
    montant: montant.valeur > 0 ? montant.valeur : null,
  };
}
