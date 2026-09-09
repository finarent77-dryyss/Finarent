import { describe, it, expect } from 'vitest';
import { serialiserJsonLd } from '@/lib/json-ld.js';

/**
 * Les blocs JSON-LD sont injectés via `dangerouslySetInnerHTML` et alimentés
 * par des contenus éditables en back-office (FAQ notamment). L'exigence
 * testée ici est double : aucun chevron ne doit survivre à la sérialisation
 * (sinon la balise <script> se referme trop tôt), et le JSON produit doit
 * rester strictement équivalent à l'objet d'origine.
 */

describe('serialiserJsonLd', () => {
  it('échappe une réponse de FAQ contenant </script>', () => {
    const donnees = {
      '@type': 'Answer',
      text: 'Voir la doc</script><script>alert(1)</script>',
    };
    const serialise = serialiserJsonLd(donnees);

    expect(serialise).not.toContain('</script>');
    expect(serialise).not.toContain('<');
    expect(serialise).not.toContain('>');
    expect(serialise).toContain('\\u003c/script\\u003e');
  });

  it('échappe aussi les esperluettes (entités HTML)', () => {
    const serialise = serialiserJsonLd({ name: 'Crédit-bail &amp; LOA' });
    expect(serialise).not.toContain('&');
    expect(serialise).toContain('\\u0026');
  });

  it('produit un JSON qui se reparse à l identique', () => {
    const donnees = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Coût < 500 € ?', acceptedAnswer: { text: 'Oui & non</script>' } },
      ],
    };
    expect(JSON.parse(serialiserJsonLd(donnees))).toEqual(donnees);
  });

  it('préserve les accents et les caractères non ASCII', () => {
    const donnees = { name: 'Finarent — Courtier financement & assurance pro' };
    expect(JSON.parse(serialiserJsonLd(donnees)).name).toBe(donnees.name);
  });

  it('n altère pas un contenu sans caractère dangereux', () => {
    const donnees = { '@type': 'Organization', name: 'Finarent' };
    expect(serialiserJsonLd(donnees)).toBe(JSON.stringify(donnees));
  });

  it('gère les tableaux et les valeurs nulles', () => {
    expect(serialiserJsonLd([1, null, 'a<b'])).toBe('[1,null,"a\\u003cb"]');
  });
});
