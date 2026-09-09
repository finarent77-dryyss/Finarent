/**
 * Sérialisation sûre des blocs JSON-LD injectés via `dangerouslySetInnerHTML`.
 *
 * Un `<script type="application/ld+json">` n'est pas un contexte JavaScript :
 * le navigateur y cherche la première séquence `</script` pour fermer la
 * balise, sans se soucier des guillemets JSON. Une donnée éditable en
 * back-office (une réponse de FAQ, un nom de solution…) qui contiendrait
 * `</script>` couperait donc le bloc en deux et casserait la page.
 *
 * La parade standard : échapper `<`, `>` et `&` sous forme d'échappements
 * Unicode JSON. `\u003c` est strictement équivalent à `<` pour le parseur
 * JSON — le balisage reste valide — mais l'analyseur HTML ne voit plus de
 * chevron et ne peut plus refermer la balise prématurément.
 */

const CARACTERES_DANGEREUX = /[<>&]/g;

const ECHAPPEMENTS = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
};

/**
 * Sérialise des données en JSON prêt à être injecté dans une balise
 * `<script type="application/ld+json">`.
 *
 * @param {unknown} donnees Objet (ou tableau) Schema.org à sérialiser.
 * @returns {string} JSON échappé, sûr pour `dangerouslySetInnerHTML`.
 */
export function serialiserJsonLd(donnees) {
  return JSON.stringify(donnees).replace(
    CARACTERES_DANGEREUX,
    (caractere) => ECHAPPEMENTS[caractere],
  );
}

export default serialiserJsonLd;
