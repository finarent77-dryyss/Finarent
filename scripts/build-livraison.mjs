/**
 * Fabrique le dossier de livraison client : docs/livraison-client/*.html
 *
 * Convertit les documents Markdown de docs/ en pages HTML autonomes,
 * aux couleurs Finarent, prêtes à être imprimées en PDF depuis un navigateur
 * (Ctrl+P -> « Enregistrer au format PDF »).
 *
 * Aucune dependance externe : node scripts/build-livraison.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const OUT = join(DOCS, 'livraison-client');

const MARQUE = {
  marine: '#13253b',
  marineClair: '#1c3654',
  vert: '#45b388',
  vertFonce: '#3e9d7a',
  vertPale: '#eaf6f1',
  gris: '#5b6b7c',
  bordure: '#dde3ea',
  fond: '#f7f9fb',
};

/* ------------------------------------------------------------------ */
/* Rendu Markdown                                                      */
/* ------------------------------------------------------------------ */

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Slug compatible avec les ancres GitHub, pour que les sommaires existants marchent. */
function slugify(texte) {
  return texte
    .toLowerCase()
    .replace(/[^\p{L}\p{N} \-]/gu, '')
    .trim()
    .replace(/ /g, '-');
}

/** Rendu du contenu d'une ligne : code, gras, italique, liens. */
function inline(src) {
  const codes = [];
  let s = src.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });

  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, texte, href) => {
    if (/\.md(#|$)/i.test(href) && !href.startsWith('#')) return texte; // doc hors livraison
    const sur = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href}"${sur}>${texte}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');

  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
}

const EST_BLOC = (l) =>
  /^```/.test(l) ||
  /^#{1,6}\s/.test(l) ||
  /^(-{3,}|\*{3,})\s*$/.test(l) ||
  /^>/.test(l) ||
  /^\s*([-*+]|\d+\.)\s+/.test(l) ||
  /^\|/.test(l) ||
  l.trim() === '';

/** Convertit un bloc Markdown en HTML. `titres` collecte le sommaire. */
function rendre(md, titres = null, ancres = new Set()) {
  const lignes = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lignes.length) {
    const ligne = lignes[i];

    if (ligne.trim() === '') {
      i++;
      continue;
    }

    // Bloc de code
    if (/^```/.test(ligne)) {
      const langue = ligne.slice(3).trim();
      const corps = [];
      i++;
      while (i < lignes.length && !/^```/.test(lignes[i])) corps.push(lignes[i++]);
      i++;
      const cls = langue ? ` data-langue="${esc(langue)}"` : '';
      out.push(`<pre${cls}><code>${esc(corps.join('\n'))}</code></pre>`);
      continue;
    }

    // Tableau
    if (/^\|/.test(ligne) && /^\|[\s:|-]+\|?\s*$/.test(lignes[i + 1] || '')) {
      const cellules = (l) => {
        const t = l.trim().replace(/^\|/, '').replace(/\|$/, '');
        return t.split('|').map((c) => c.trim());
      };
      const entetes = cellules(ligne);
      const aligns = cellules(lignes[i + 1]).map((s) =>
        s.startsWith(':') && s.endsWith(':') ? 'center' : s.endsWith(':') ? 'right' : 'left'
      );
      i += 2;
      const corps = [];
      while (i < lignes.length && /^\|/.test(lignes[i])) corps.push(cellules(lignes[i++]));

      const al = (n) => (aligns[n] && aligns[n] !== 'left' ? ` style="text-align:${aligns[n]}"` : '');
      const th = entetes.map((c, n) => `<th${al(n)}>${inline(c)}</th>`).join('');
      const tr = corps
        .map((r) => `<tr>${r.map((c, n) => `<td${al(n)}>${inline(c)}</td>`).join('')}</tr>`)
        .join('\n');
      out.push(`<div class="tableau"><table><thead><tr>${th}</tr></thead><tbody>\n${tr}\n</tbody></table></div>`);
      continue;
    }

    // Titre
    const titre = ligne.match(/^(#{1,6})\s+(.*)$/);
    if (titre) {
      const niveau = titre[1].length;
      const texte = titre[2].replace(/\s+#+\s*$/, '');
      let ancre = slugify(texte);
      if (ancres.has(ancre)) {
        let n = 1;
        while (ancres.has(`${ancre}-${n}`)) n++;
        ancre = `${ancre}-${n}`;
      }
      ancres.add(ancre);
      if (titres && niveau <= 2) titres.push({ ancre, texte, niveau });
      // Un titre de niveau 1 dans le corps est un separateur de partie (le titre du
      // document, lui, a deja ete retire par `separer`).
      if (niveau === 1) out.push(`<h1 class="partie" id="${ancre}">${inline(texte)}</h1>`);
      else out.push(`<h${niveau} id="${ancre}">${inline(texte)}</h${niveau}>`);
      i++;
      continue;
    }

    // Filet horizontal
    if (/^(-{3,}|\*{3,})\s*$/.test(ligne)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // Citation
    if (/^>/.test(ligne)) {
      const corps = [];
      while (i < lignes.length && /^>/.test(lignes[i])) corps.push(lignes[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${rendre(corps.join('\n'), null, ancres)}</blockquote>`);
      continue;
    }

    // Liste
    const puce = ligne.match(/^(\s*)([-*+]|\d+\.)\s+/);
    if (puce) {
      const ordonnee = /\d/.test(puce[2]);
      const items = [];
      let courant = null;
      while (i < lignes.length) {
        const l = lignes[i];
        const m = l.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
        if (m && m[1].length < 2) {
          if (courant) items.push(courant);
          courant = [m[3]];
          i++;
        } else if (courant && (/^\s{2,}\S/.test(l) || (l.trim() !== '' && !EST_BLOC(l)))) {
          courant.push(l.replace(/^\s{0,4}/, ''));
          i++;
        } else if (courant && l.trim() === '' && lignes[i + 1] && /^\s{2,}\S/.test(lignes[i + 1])) {
          courant.push('');
          i++;
        } else break;
      }
      if (courant) items.push(courant);

      const html = items
        .map((bloc) => {
          let texte = bloc.join('\n');
          const coche = texte.match(/^\[([ xX])\]\s+([\s\S]*)$/);
          if (coche) {
            const case_ = coche[1].toLowerCase() === 'x' ? '☑' : '☐';
            return `<li class="coche"><span class="case">${case_}</span> ${inline(coche[2].split('\n')[0])}</li>`;
          }
          if (bloc.length > 1 && bloc.slice(1).some((l) => EST_BLOC(l) && l.trim() !== '')) {
            const [tete, ...reste] = bloc;
            return `<li>${inline(tete)}${rendre(reste.join('\n'), null, ancres)}</li>`;
          }
          return `<li>${inline(texte.replace(/\n/g, ' '))}</li>`;
        })
        .join('\n');
      out.push(ordonnee ? `<ol>\n${html}\n</ol>` : `<ul>\n${html}\n</ul>`);
      continue;
    }

    // Paragraphe
    const para = [];
    while (i < lignes.length && lignes[i].trim() !== '' && !EST_BLOC(lignes[i])) para.push(lignes[i++]);
    if (para.length) out.push(`<p>${inline(para.join('\n')).replace(/\n/g, '<br>')}</p>`);
    else i++;
  }

  return out.join('\n');
}

/* ------------------------------------------------------------------ */
/* Gabarit HTML                                                        */
/* ------------------------------------------------------------------ */

const logoPng = join(DOCS, 'client', 'SlFormation_FINARENT_logo.png');
const LOGO = existsSync(logoPng)
  ? `data:image/png;base64,${readFileSync(logoPng).toString('base64')}`
  : null;

const CSS = `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:${MARQUE.fond};color:#1f2d3d;
  font-family:"Segoe UI",Roboto,-apple-system,"Helvetica Neue",Arial,sans-serif;
  font-size:15px;line-height:1.65;-webkit-font-smoothing:antialiased}

.feuille{max-width:900px;margin:0 auto;background:#fff;padding:56px 64px 72px;
  box-shadow:0 1px 3px rgba(19,37,59,.08),0 12px 40px rgba(19,37,59,.06)}

/* --- Bandeau d'aide, retire a l'impression --- */
.aide{max-width:900px;margin:24px auto 0;background:${MARQUE.marine};color:#fff;
  border-radius:10px;padding:16px 22px;display:flex;align-items:center;gap:18px;
  font-size:13.5px;line-height:1.5}
.aide strong{color:${MARQUE.vert}}
.aide button{margin-left:auto;flex:none;background:${MARQUE.vert};color:#08301f;border:0;
  border-radius:7px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer}
.aide button:hover{background:#54c99b}
.aide a{color:${MARQUE.vert}}

/* --- Page de garde --- */
.garde{border-bottom:3px solid ${MARQUE.vert};padding-bottom:28px;margin-bottom:38px}
.garde img{height:56px;width:auto;display:block;margin-bottom:26px}
.garde .surtitre{font-size:11.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
  color:${MARQUE.vertFonce};margin-bottom:10px}
.garde h1{font-size:31px;line-height:1.2;margin:0 0 14px;color:${MARQUE.marine};font-weight:700;
  letter-spacing:-.01em}
.garde .meta{font-size:13.5px;color:${MARQUE.gris};margin:0}
.garde .meta strong{color:${MARQUE.marineClair}}

/* --- Titres --- */
h2{font-size:22px;line-height:1.3;margin:44px 0 16px;padding-top:20px;color:${MARQUE.marine};
  font-weight:700;border-top:1px solid ${MARQUE.bordure};letter-spacing:-.01em}
h2:first-of-type{border-top:0;padding-top:0}
h3{font-size:17.5px;margin:30px 0 10px;color:${MARQUE.marineClair};font-weight:700}
h4{font-size:15px;margin:22px 0 8px;color:${MARQUE.marineClair};font-weight:700}
p{margin:0 0 14px}
strong{color:${MARQUE.marine};font-weight:600}
a{color:${MARQUE.vertFonce}}
hr{border:0;border-top:1px solid ${MARQUE.bordure};margin:32px 0}

/* --- Sommaire genere --- */
.sommaire{background:${MARQUE.vertPale};border:1px solid #cfe7dc;border-radius:10px;
  padding:22px 28px;margin:0 0 36px}
.sommaire h2{margin:0 0 12px;padding:0;border:0;font-size:13px;letter-spacing:.14em;
  text-transform:uppercase;color:${MARQUE.vertFonce}}
.sommaire ol{margin:0;padding-left:20px;columns:2;column-gap:38px}
.sommaire li{margin:0 0 6px;font-size:13.5px;break-inside:avoid}
.sommaire a{color:${MARQUE.marineClair};text-decoration:none}
.sommaire a:hover{text-decoration:underline}

/* --- Listes --- */
ul,ol{margin:0 0 16px;padding-left:24px}
li{margin:0 0 7px}
li.coche{list-style:none;margin-left:-24px}
li.coche .case{color:${MARQUE.vertFonce};font-size:16px;margin-right:6px}

/* --- Tableaux --- */
.tableau{margin:0 0 22px;overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:13.5px}
th{background:${MARQUE.marine};color:#fff;text-align:left;font-weight:600;
  padding:10px 13px;border:1px solid ${MARQUE.marine};vertical-align:top}
td{padding:9px 13px;border:1px solid ${MARQUE.bordure};vertical-align:top}
tbody tr:nth-child(even) td{background:#f8fafb}
td code,th code{white-space:normal}

/* --- Code --- */
code{background:#eef2f6;border:1px solid #e0e7ee;border-radius:4px;padding:.1em .38em;
  font-family:Consolas,"SF Mono",Menlo,monospace;font-size:.87em;color:${MARQUE.marineClair}}
pre{background:${MARQUE.marine};color:#e7edf4;border-radius:9px;padding:16px 20px;
  overflow-x:auto;margin:0 0 22px;font-size:12.7px;line-height:1.55}
pre code{background:none;border:0;padding:0;color:inherit;font-size:inherit;white-space:pre}

blockquote{margin:0 0 22px;padding:12px 20px;border-left:4px solid ${MARQUE.vert};
  background:${MARQUE.vertPale};border-radius:0 8px 8px 0}
blockquote p:last-child{margin-bottom:0}

.pied{margin-top:56px;padding-top:20px;border-top:1px solid ${MARQUE.bordure};
  font-size:12px;color:${MARQUE.gris};display:flex;justify-content:space-between;gap:20px}

/* --- Separateurs de partie (titres de niveau 1 dans le corps) --- */
h1.partie{margin:64px 0 18px;padding:26px 0 0;border-top:3px solid ${MARQUE.vert};font-size:26px;
  line-height:1.25;color:${MARQUE.marine};font-weight:700;letter-spacing:-.01em;text-wrap:balance}
h1.partie .partie-num{display:block;font-size:12px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:${MARQUE.vertFonce};margin-bottom:8px}
h1.partie + p{font-size:16px;color:${MARQUE.gris}}

/* --- Sommaire groupe par partie --- */
.sommaire-groupe ol{columns:1}
.sommaire-groupe > ol > li{margin:0 0 10px}
.sommaire-groupe a.sommaire-partie{font-weight:700;color:${MARQUE.marine}}
.sommaire-groupe .sommaire-plage{margin-left:10px;font-size:12px;color:${MARQUE.gris}}
.sommaire-groupe ul{margin:4px 0 0;padding-left:18px;columns:2;column-gap:30px}
.sommaire-groupe ul li{margin:0 0 4px}

/* --- Barre de navigation fixe --- */
.nav-parties{position:sticky;top:0;z-index:20;max-width:900px;margin:0 auto;
  background:${MARQUE.marine};color:#fff;padding:10px 18px;display:flex;flex-wrap:wrap;
  align-items:center;gap:4px 14px;font-size:13px;box-shadow:0 4px 14px rgba(19,37,59,.18)}
.nav-parties a{color:rgba(255,255,255,.82);text-decoration:none;padding:3px 0;
  border-bottom:2px solid transparent;white-space:nowrap}
.nav-parties a:hover,.nav-parties a:focus-visible{color:#fff;border-bottom-color:${MARQUE.vert};outline:0}
.nav-parties .compteur{margin-left:auto;background:rgba(255,255,255,.12);border-radius:999px;
  padding:4px 12px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}

/* --- Cartes de test --- */
.test{background:#fff;border:1px solid ${MARQUE.bordure};border-radius:12px;padding:22px 26px 18px;
  margin:0 0 22px;box-shadow:0 1px 2px rgba(19,37,59,.05)}
.test-tete{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:14px}
.test-num{flex:none;min-width:44px;height:44px;padding:0 8px;border-radius:9px;background:${MARQUE.marine};
  color:#fff;display:flex;align-items:center;justify-content:center;gap:3px;font-weight:700;font-size:17px;
  font-variant-numeric:tabular-nums}
.test-num small{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.85}
.test-tete h2{flex:1 1 300px;margin:0;padding:0;border:0;font-size:19px;line-height:1.3;text-wrap:balance}
.test-prio{flex:none;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:#8a5a00;background:#fff1cc;border:1px solid #f2d27a;border-radius:999px;padding:4px 10px}
.rub{display:grid;grid-template-columns:150px minmax(0,1fr);gap:6px 20px;padding:12px 0;
  border-top:1px solid ${MARQUE.bordure}}
.rub-label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  color:${MARQUE.gris};padding-top:4px}
.rub-corps p{margin:0 0 8px}
.rub-corps > :last-child{margin-bottom:0}
.rub-corps ol,.rub-corps ul{margin:0;padding-left:22px}
.rub-corps li{margin:0 0 6px}
.rub-voir .rub-label{color:${MARQUE.vertFonce}}
.rub-probleme{background:#fdf2f2;border-top:0;border-left:4px solid #d64545;border-radius:0 8px 8px 0;
  padding:12px 16px;margin-top:10px}
.rub-probleme .rub-label{color:#b23a3a}
.rub-probleme strong{color:#8f2b2b}
.resultat{display:grid;grid-template-columns:150px minmax(0,1fr);gap:6px 20px;align-items:center;
  padding:14px 0 4px;border-top:1px solid ${MARQUE.bordure};margin-top:10px}
.resultat .cases{display:flex;flex-wrap:wrap;gap:10px}
.resultat label{display:inline-flex;align-items:center;gap:8px;border:1px solid ${MARQUE.bordure};
  border-radius:8px;padding:7px 14px;font-weight:600;font-size:14px;cursor:pointer;
  background:#fff;user-select:none}
.resultat input{width:18px;height:18px;margin:0;accent-color:${MARQUE.marine};cursor:pointer}
.resultat label:has(input:checked){border-color:${MARQUE.marine};background:#eef2f6}
.resultat label[data-kind="ok"]:has(input:checked){border-color:${MARQUE.vert};background:${MARQUE.vertPale}}
.resultat label[data-kind="ko"]:has(input:checked){border-color:#d64545;background:#fdf2f2}
.resultat label:focus-within{outline:2px solid ${MARQUE.vert};outline-offset:2px}
.test blockquote{margin:12px 0 4px}
blockquote.defaut{background:#fff7e6;border-left-color:#e0a020}
blockquote.attention{background:#fdf2f2;border-left-color:#d64545}

@media (max-width:640px){
  .rub,.resultat{grid-template-columns:1fr;gap:4px}
  .test{padding:18px 16px 14px}
  .sommaire-groupe ul{columns:1}
}

/* --- Impression --- */
@page{size:A4;margin:16mm 14mm}
@media print{
  body{background:#fff;font-size:10.4pt;line-height:1.5}
  .aide{display:none}
  .feuille{max-width:none;margin:0;padding:0;box-shadow:none}
  .garde{page-break-after:avoid}
  h2{font-size:15pt;page-break-after:avoid;margin-top:26px}
  h3,h4{page-break-after:avoid}
  table{font-size:8.8pt}
  th,td{padding:5px 7px}
  tr,li,blockquote,pre{page-break-inside:avoid}
  .tableau{overflow:visible;page-break-inside:auto}
  pre{background:#f2f5f8;color:#16283d;border:1px solid ${MARQUE.bordure};font-size:8.6pt}
  .sommaire{page-break-inside:avoid}
  .sommaire ol{columns:2}
  .sommaire-groupe ol{columns:1}
  a{color:${MARQUE.marineClair};text-decoration:none}
  .pied{page-break-inside:avoid}
  .nav-parties{display:none}
  h1.partie{page-break-before:always;font-size:19pt;margin-top:0}
  .test{page-break-inside:avoid;box-shadow:none;border-color:#c9d2dc}
  .resultat label{border-color:#9aa7b4}
}
`;

/**
 * Sommaire genere : liste plate des sections, ou groupee par partie quand le
 * document comporte des titres de niveau 1 dans son corps. Dans un groupe, les
 * sections « Test N » sont resumees par leur plage plutot que listees une a une.
 */
function renduSommaire(sommaire) {
  if (!sommaire || !sommaire.length) return '';
  const nettoyer = (t) => esc(t.replace(/\*+/g, ''));
  const lien = (t) => `<li><a href="#${t.ancre}">${nettoyer(t.texte)}</a></li>`;

  if (!sommaire.some((t) => t.niveau === 1)) {
    return `<nav class="sommaire"><h2>Sommaire</h2><ol>${sommaire.map(lien).join('')}</ol></nav>`;
  }

  const groupes = [];
  let courant = { entete: null, sections: [] };
  for (const t of sommaire) {
    if (t.niveau === 1) {
      groupes.push(courant);
      courant = { entete: t, sections: [] };
    } else courant.sections.push(t);
  }
  groupes.push(courant);

  const estTest = (s) => /^Test \d+/.test(s.texte);
  const numero = (s) => s.texte.match(/\d+/)[0];
  const lignes = groupes
    .map((g) => {
      const tests = g.sections.filter(estTest);
      const autres = g.sections.filter((s) => !estTest(s));
      if (!g.entete) return autres.map(lien).join('');
      const plage = tests.length
        ? `<span class="sommaire-plage">Tests ${numero(tests[0])} à ${numero(tests[tests.length - 1])}</span>`
        : '';
      const sous = autres.length ? `<ul>${autres.map(lien).join('')}</ul>` : '';
      return `<li><a class="sommaire-partie" href="#${g.entete.ancre}">${nettoyer(g.entete.texte)}</a>${plage}${sous}</li>`;
    })
    .join('');
  return `<nav class="sommaire sommaire-groupe"><h2>Sommaire</h2><ol>${lignes}</ol></nav>`;
}

function page({ titre, surtitre, meta, corps, sommaire, pied, avant = '', apres = '' }) {
  const toc = renduSommaire(sommaire);

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(titre)} — Finarent</title>
<style>${CSS}</style>
</head>
<body>
<div class="aide">
  <span><strong>Pour obtenir un PDF :</strong> cliquez sur le bouton, puis choisissez
  « Enregistrer au format PDF » comme imprimante. Ce bandeau n'apparaîtra pas dans le document.</span>
  <button type="button" onclick="window.print()">Enregistrer en PDF</button>
</div>
${avant}
<main class="feuille">
  <header class="garde">
    ${LOGO ? `<img src="${LOGO}" alt="Finarent">` : ''}
    <div class="surtitre">${esc(surtitre)}</div>
    <h1>${esc(titre)}</h1>
    <p class="meta">${meta}</p>
  </header>
  ${toc}
  ${corps}
  <footer class="pied"><span>${esc(pied)}</span><span>Finarent — document confidentiel</span></footer>
</main>
${apres}
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Documents de la livraison                                           */
/* ------------------------------------------------------------------ */

const DATE_LIVRAISON = '8 septembre 2026';

const DOCUMENTS = [
  {
    source: 'TUTORIEL_UTILISATION.md',
    fichier: '01-Tutoriel-utilisation.html',
    titre: "Tutoriel d'utilisation",
    surtitre: 'Document 1 sur 8 · Prise en main',
    resume:
      "Comment utiliser la plateforme, rôle par rôle. Aucun prérequis technique. 15 minutes de lecture pour votre rôle, 45 minutes pour l'ensemble.",
  },
  {
    source: 'AUDIT_2026-09_CLIENT.md',
    fichier: '02-Audit-plateforme.html',
    titre: 'Audit de la plateforme',
    surtitre: 'Document 2 sur 8 · Synthèse pour la direction',
    resume:
      '21 constats, les points forts, et un plan de correction en 3 lots. Écrit sans vocabulaire technique.',
  },
  {
    source: 'PROCEDURES_EXPLOITATION.md',
    fichier: '03-Procedures-exploitation.html',
    titre: "Procédures d'exploitation",
    surtitre: 'Document 3 sur 8 · Manuel technique',
    resume:
      "Installation, déploiement, configuration des intégrations, procédures d'incident et procédures RGPD. Destiné à l'équipe technique.",
  },
  {
    source: 'TESTS_LISTE_COMPLETE.md',
    fichier: '04-Plan-de-recette.html',
    titre: 'Plan de recette',
    surtitre: 'Document 4 sur 8 · Contrôle qualité',
    resume:
      "263 cas de test couvrant les 7 espaces de la plateforme, avec protocole de recette manuelle et suite automatisée à mettre en place.",
  },
  {
    source: 'AUDIT_2026-09.md',
    fichier: '05-Audit-technique.html',
    titre: 'Audit technique',
    surtitre: 'Document 5 sur 8 · Version détaillée',
    resume:
      "La version complète de l'audit, avec le détail de chaque constat, les fichiers concernés et la correction attendue. Destinée à l'équipe technique.",
  },
  {
    source: 'PLAN_CORRECTION_2026-09.md',
    fichier: '06-Plan-de-correction.html',
    titre: 'Plan de correction',
    surtitre: 'Document 6 sur 8 · Feuille de route',
    resume:
      "Quoi faire, dans quel ordre, et comment prouver que c'est fait. Chaque action porte l'identifiant de son constat et une preuve de clôture.",
  },
  {
    source: 'VERIFICATION_2026-09.md',
    fichier: '07-Rapport-de-verification.html',
    titre: 'Rapport de vérification',
    surtitre: 'Document 7 sur 8 · Ce qui a été corrigé et prouvé',
    resume:
      "Ce qui a été corrigé, ce qui a été vérifié en conditions réelles, et ce qui reste ouvert. Chaque affirmation est adossée à une preuve reproductible.",
  },
  {
    source: 'PROTOCOLE_TEST_CLIENT.md',
    fichier: '08-Protocole-de-test.html',
    titre: 'Protocole de test',
    surtitre: 'Document 8 sur 8 · À faire soi-même',
    resume:
      "99 tests pas à pas pour vérifier vous-même toute la plateforme, profil par profil, avec les emails attendus et les défauts déjà connus. Aucune compétence technique requise.",
    protocole: true,
    navigation: [
      { titre: 'Avant de commencer', label: 'Préparation' },
      { titre: 'Les douze tests prioritaires', label: 'Prioritaires' },
      { titre: 'Partie 1 — Le site public, sans être connecté', label: '1 · Site public' },
      { titre: "Partie 2 — L'espace client", label: '2 · Espace client' },
      { titre: 'Partie 3 — Le back-office administrateur', label: '3 · Back-office' },
      { titre: "Partie 4 — L'apporteur d'affaires", label: '4 · Apporteur' },
      { titre: "Partie 5 — Le centre d'appel", label: "5 · Centre d'appel" },
      { titre: "Partie 6 — L'espace partenaire", label: '6 · Partenaire' },
      { titre: "Partie 7 — L'espace assureur", label: '7 · Assureur' },
      { titre: 'Les emails que la plateforme envoie', label: 'Emails' },
      { titre: 'Ce qui ne peut pas encore être testé, et pourquoi', label: 'Non testable' },
      { titre: 'Les défauts déjà connus à la date de ce protocole', label: 'Défauts connus' },
      { titre: 'Fiche de relevé', label: 'Relevé' },
    ],
  },
];

/** Retire l'en-tete Markdown (titre + lignes de metadonnees) deja rendu dans la page de garde. */
function separer(md) {
  const lignes = md.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lignes.length && lignes[i].trim() === '') i++;
  const h1 = lignes[i] && lignes[i].startsWith('# ') ? lignes[i++].slice(2).trim() : '';
  const meta = [];
  while (i < lignes.length && !/^(#{2,6}\s|-{3,}\s*$)/.test(lignes[i])) {
    if (lignes[i].trim() !== '') meta.push(lignes[i]);
    i++;
  }
  while (i < lignes.length && /^-{3,}\s*$/.test(lignes[i])) i++;
  return { h1, meta: meta.join('\n'), corps: lignes.slice(i).join('\n') };
}

/** Supprime la section « Sommaire » d'origine (remplacee par le sommaire genere). */
function retirerSommaire(md) {
  const lignes = md.split('\n');
  const debut = lignes.findIndex((l) => /^##\s+Sommaire\s*$/.test(l));
  if (debut === -1) return { corps: md, avait: false };
  let fin = debut + 1;
  while (fin < lignes.length && !/^##\s/.test(lignes[fin])) fin++;
  while (fin > debut && /^(-{3,}\s*|\s*)$/.test(lignes[fin - 1])) fin--;
  return { corps: [...lignes.slice(0, debut), ...lignes.slice(fin)].join('\n'), avait: true };
}

/**
 * Retire la section « Documents liés » d'origine : elle renvoie vers des fichiers
 * internes du depot, absents de la livraison client. Elle est remplacee apres coup
 * par un renvoi vers les documents reellement joints.
 */
function retirerDocumentsLies(md) {
  const lignes = md.split('\n');
  const debut = lignes.findIndex((l) => /^##\s+Documents li[ée]s\s*$/i.test(l));
  if (debut === -1) return md;
  let fin = debut + 1;
  while (fin < lignes.length && !/^##\s/.test(lignes[fin])) fin++;
  let coupe = debut;
  while (coupe > 0 && /^(-{3,}\s*|\s*)$/.test(lignes[coupe - 1])) coupe--;
  return [...lignes.slice(0, coupe), ...lignes.slice(fin)].join('\n');
}

/* ------------------------------------------------------------------ */
/* Protocole de test : cartes, rubriques etiquetees, cases a cocher    */
/* ------------------------------------------------------------------ */

/** Les quatre rubriques d'un test, dans l'ordre du document. */
const RUBRIQUES = [
  { motif: 'Objectif', classe: 'rub-objectif', label: 'Objectif' },
  { motif: 'Ce que vous faites', classe: 'rub-faites', label: 'Ce que vous faites' },
  { motif: 'Ce que vous devez voir', classe: 'rub-voir', label: 'Ce que vous devez voir' },
  { motif: "C['’]est un problème si", classe: 'rub-probleme', label: "C'est un problème si" },
];

const slugCase = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** « Résultat : ☐ OK ☐ KO ☐ Non testé » → cases a cocher, memorisees dans le navigateur. */
function casesResultat(num, brut) {
  const options = brut.split('☐').map((o) => o.replace(/—/g, '').trim()).filter(Boolean);
  const cases = options
    .map((o) => {
      const kind = o === 'OK' ? 'ok' : o === 'KO' ? 'ko' : /^Non test/i.test(o) ? 'nt' : 'autre';
      const exclusif = kind === 'autre' ? '0' : '1';
      return `<label data-kind="${kind}"><input type="checkbox" name="t${slugCase(num)}-${slugCase(o)}" data-test="${slugCase(num)}" data-kind="${kind}" data-exclusif="${exclusif}"> ${esc(o)}</label>`;
    })
    .join('');
  return `<div class="resultat"><span class="rub-label">Résultat</span><div class="cases">${cases}</div></div>`;
}

/** Transforme le HTML rendu du protocole : parties, encadres, puis une carte par test. */
function postTraiterProtocole(html) {
  // Filet redondant juste avant un separateur de partie.
  html = html.replace(/<hr>\s*(?=<h1 class="partie")/g, '');
  // « Partie N — Titre » : le numero devient un surtitre.
  html = html.replace(
    /<h1 class="partie" id="([^"]+)">Partie (\d+) — ([\s\S]*?)<\/h1>/g,
    '<h1 class="partie" id="$1"><span class="partie-num">Partie $2</span>$3</h1>'
  );
  // Encadres : defauts connus en ambre, mises en garde en rouge, le reste en vert.
  html = html.replace(/<blockquote>(?=<p><em>Défauts? connus?)/g, '<blockquote class="defaut">');
  html = html.replace(
    /<blockquote>(?=<p><strong>(?:Attention|Prérequis important|À ne faire|Un refus franc))/g,
    '<blockquote class="attention">'
  );

  // Une carte par test : du titre « Test N — … » jusqu'au titre suivant ou au filet.
  return html.replace(
    /<h2 id="(test-[^"]+)">Test (\d+(?: bis)?) — ([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2 |<h1 |<hr>|$)/g,
    (_, ancre, num, titre, corps) => {
      const prioritaire = / ★ <em>priorité<\/em>\s*$/.test(titre);
      const titrePropre = titre.replace(/ ★ <em>priorité<\/em>\s*$/, '');
      let c = corps;
      for (const r of RUBRIQUES) {
        const liste = '(\\s*<(?:ol|ul)>[\\s\\S]*?<\\/(?:ol|ul)>)?';
        // « **Label** — texte », suivi ou non d'une liste.
        c = c.replace(
          new RegExp(`<p><strong>${r.motif}<\\/strong> — ([\\s\\S]*?)<\\/p>${liste}`),
          (m, texte, l = '') =>
            `<div class="rub ${r.classe}"><span class="rub-label">${r.label}</span><div class="rub-corps"><p>${texte}</p>${l}</div></div>`
        );
        // « **Label** » seul, suivi d'une liste.
        c = c.replace(
          new RegExp(`<p><strong>${r.motif}<\\/strong><\\/p>${liste}`),
          (m, l = '') =>
            `<div class="rub ${r.classe}"><span class="rub-label">${r.label}</span><div class="rub-corps">${l}</div></div>`
        );
      }
      c = c.replace(/<p><strong>Résultat<\/strong> : ([^<]*)<\/p>/, (m, brut) => casesResultat(num, brut));
      const prio = prioritaire ? '<span class="test-prio">★ Prioritaire</span>' : '';
      const numero = num.replace(' bis', '<small>bis</small>');
      return `<section class="test" id="${ancre}"><header class="test-tete"><span class="test-num">${numero}</span><h2>${titrePropre}</h2>${prio}</header>${c}</section>\n`;
    }
  );
}

/**
 * Accès des comptes de recette, produits par `scripts/comptes-recette.mjs` dans
 * `docs/client/comptes-test.json` (hors git). Absents, le tableau reste vide.
 */
function lireComptesRecette() {
  const chemin = join(DOCS, 'client', 'comptes-test.json');
  if (!existsSync(chemin)) return [];
  try {
    return JSON.parse(readFileSync(chemin, 'utf8')).comptes || [];
  } catch {
    return [];
  }
}

/** Remplit les colonnes Email / Mot de passe du tableau des comptes, profil par profil. */
function injecterComptes(html, comptes) {
  if (!comptes.length) return html;
  const sansBalises = (s) => s.replace(/<[^>]+>/g, '');
  return html.replace(
    /<tr><td>([^<]*(?:<[^>]+>[^<]*)*)<\/td>(<td>[\s\S]*?<\/td>)<td><\/td><td><\/td><\/tr>/g,
    (ligne, profil, usage) => {
      const libelle = sansBalises(profil).trim();
      const compte = comptes.find((c) => libelle.startsWith(c.profil));
      if (!compte) return ligne;
      return `<tr><td>${profil}</td>${usage}<td><code>${esc(compte.email)}</code></td><td><code>${esc(compte.motDePasse)}</code></td></tr>`;
    }
  );
}

/** Barre de navigation fixe vers les grandes parties du protocole. */
function navProtocole(entrees) {
  const liens = entrees.map((e) => `<a href="#${slugify(e.titre)}">${esc(e.label)}</a>`).join('');
  return `<nav class="nav-parties" aria-label="Parties du protocole">${liens}<span class="compteur" id="compteur-resultats">OK 0 · KO 0 · Non testé 0</span></nav>`;
}

/** Cases a cocher memorisees dans le navigateur, et compteur OK / KO / Non teste. */
const SCRIPT_PROTOCOLE = `<script>
(function () {
  var CLE = 'finarent.protocole.resultats.v1';
  var etat = {};
  try { etat = JSON.parse(localStorage.getItem(CLE) || '{}') || {}; } catch (e) { etat = {}; }
  var cases = Array.prototype.slice.call(document.querySelectorAll('.resultat input[type="checkbox"]'));
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) {} }
  function compter() {
    var n = { ok: 0, ko: 0, nt: 0 };
    cases.forEach(function (c) { if (c.checked && n[c.dataset.kind] !== undefined) n[c.dataset.kind]++; });
    var el = document.getElementById('compteur-resultats');
    if (el) el.textContent = 'OK ' + n.ok + ' · KO ' + n.ko + ' · Non testé ' + n.nt;
  }
  cases.forEach(function (c) {
    if (etat[c.name]) c.checked = true;
    c.addEventListener('change', function () {
      if (c.checked && c.dataset.exclusif === '1') {
        cases.forEach(function (o) {
          if (o !== c && o.dataset.test === c.dataset.test && o.dataset.exclusif === '1') {
            o.checked = false;
            delete etat[o.name];
          }
        });
      }
      if (c.checked) etat[c.name] = 1; else delete etat[c.name];
      sauver();
      compter();
    });
  });
  compter();
})();
</script>`;

/** Renvoi vers les autres documents de la livraison. */
function documentsLies(courant, ancres) {
  const autres = DOCUMENTS.filter((d) => d.fichier !== courant.fichier);
  const ancre = 'documents-lies';
  ancres.add(ancre);
  const lignes = autres
    .map(
      (d) =>
        `<tr><td><a href="${d.fichier}"><strong>${esc(d.titre)}</strong></a></td><td>${esc(d.resume)}</td></tr>`
    )
    .join('\n');
  return {
    ancre,
    html: `<hr>
<h2 id="${ancre}">Documents liés</h2>
<p>Les autres documents de cette livraison :</p>
<div class="tableau"><table>
<thead><tr><th>Document</th><th>Objet</th></tr></thead>
<tbody>
${lignes}
</tbody></table></div>
<p>Le <a href="00-Sommaire.html">sommaire de la livraison</a> indique par où commencer selon votre rôle.</p>`,
  };
}

mkdirSync(OUT, { recursive: true });

const generes = [];
for (const doc of DOCUMENTS) {
  const chemin = join(DOCS, doc.source);
  if (!existsSync(chemin)) {
    console.error(`  MANQUANT  ${doc.source}`);
    continue;
  }
  const brut = readFileSync(chemin, 'utf8');
  const { meta, corps } = separer(brut);
  const { corps: sansToc } = retirerSommaire(corps);
  const propre = retirerDocumentsLies(sansToc);

  const titres = [];
  const ancres = new Set();
  let html = rendre(propre, titres, ancres);
  if (doc.protocole) {
    html = postTraiterProtocole(html);
    const comptes = lireComptesRecette();
    html = injecterComptes(html, comptes);
    console.log(comptes.length ? `      accès de ${comptes.length} comptes de recette injectés` : '      aucun compte de recette (docs/client/comptes-test.json absent)');
  }
  const lies = documentsLies(doc, ancres);
  html += `\n${lies.html}`;
  titres.push({ ancre: lies.ancre, texte: 'Documents liés', niveau: 2 });
  // La mention de livraison n'est ajoutee que si l'en-tete d'origine ne date pas deja le document.
  const dateDeja = /\*\*Date\*\*/.test(meta);
  const metaHtml = (
    dateDeja ? inline(meta) : `${inline(meta)}\n<strong>Livraison du ${DATE_LIVRAISON}</strong>`
  ).replace(/\n/g, '<br>');

  const sortie = join(OUT, doc.fichier);
  writeFileSync(
    sortie,
    page({
      titre: doc.titre,
      surtitre: doc.surtitre,
      meta: metaHtml,
      corps: html,
      sommaire: titres,
      pied: `${doc.titre} — plateforme Finarent — ${DATE_LIVRAISON}`,
      avant: doc.protocole ? navProtocole(doc.navigation) : '',
      apres: doc.protocole ? SCRIPT_PROTOCOLE : '',
    }),
    'utf8'
  );
  generes.push({ ...doc, sections: titres.length, poids: Buffer.byteLength(readFileSync(sortie)) });
  console.log(`  OK  ${doc.fichier}  (${titres.length} sections)`);
}

/* --- Page de garde de la livraison --- */

const cartes = generes
  .map(
    (d) => `<tr>
      <td><a href="${d.fichier}"><strong>${esc(d.titre)}</strong></a></td>
      <td>${esc(d.resume)}</td>
      <td style="text-align:center">${d.sections}</td>
    </tr>`
  )
  .join('\n');

const sommaireHtml = `
<h2 id="contenu">Contenu de la livraison</h2>
<p>Quatre documents complémentaires. Chacun est autonome : vous pouvez les lire dans l'ordre qui vous convient, et les transmettre séparément.</p>
<div class="tableau"><table>
<thead><tr><th>Document</th><th>Objet</th><th>Sections</th></tr></thead>
<tbody>
${cartes}
</tbody></table></div>

<h2 id="par-ou-commencer">Par où commencer</h2>
<div class="tableau"><table>
<thead><tr><th>Vous êtes…</th><th>Commencez par</th><th>Puis</th></tr></thead>
<tbody>
<tr><td><strong>Dirigeant</strong></td><td>Audit de la plateforme, partie « En une page »</td><td>Plan de correction (partie 7) et « Ce que nous attendons de votre part » (partie 8)</td></tr>
<tr><td><strong>Responsable opérationnel</strong></td><td>Tutoriel d'utilisation, pour votre rôle</td><td>Plan de recette, parties C1 à C7</td></tr>
<tr><td><strong>Équipe technique</strong></td><td>Procédures d'exploitation</td><td>Audit, puis plan de recette</td></tr>
<tr><td><strong>Testeur métier</strong></td><td>Plan de recette</td><td>Tutoriel d'utilisation en appui</td></tr>
</tbody></table></div>

<h2 id="en-resume">Ce qu'il faut retenir</h2>
<p>La plateforme est <strong>solide et complète sur le fond</strong> : les fonctionnalités sont en place, et le cloisonnement des accès — le point le plus sensible d'un audit de ce type — est irréprochable sur les 92 points d'entrée vérifiés.</p>
<p>Ce qui manque relève de <strong>l'exploitation, pas du développement</strong>. Trois sujets appellent une décision de votre part :</p>
<ol>
<li><strong>Les emails ne partent pas.</strong> Un client qui dépose une demande ne reçoit aucun accusé de réception. Il faut ouvrir un compte d'envoi d'emails.</li>
<li><strong>Les pannes sont invisibles.</strong> Aucun outil de remontée d'erreur n'est branché en production.</li>
<li><strong>Le score de pré-qualification est incomplet.</strong> Ancienneté, chiffre d'affaires et effectif de l'entreprise ne sont pas collectés — un arbitrage métier est nécessaire.</li>
</ol>
<p>Le détail, le chiffrage et le calendrier figurent dans l'<a href="02-Audit-plateforme.html">audit de la plateforme</a>.</p>

<h2 id="obtenir-un-pdf">Obtenir une version PDF</h2>
<p>Chaque document s'ouvre dans un navigateur (Chrome, Edge, Firefox ou Safari) par un double-clic sur le fichier.</p>
<ol>
<li>Ouvrez le document.</li>
<li>Cliquez sur le bouton <strong>« Enregistrer en PDF »</strong> en haut de la page — ou faites <strong>Ctrl+P</strong> (<strong>Cmd+P</strong> sur Mac).</li>
<li>Dans la liste des imprimantes, choisissez <strong>« Enregistrer au format PDF »</strong>.</li>
<li>Enregistrez.</li>
</ol>
<blockquote><p>La mise en page A4, les sauts de page et les couleurs sont déjà réglés. Le bandeau bleu d'aide n'apparaît pas dans le PDF. Pour un rendu identique au nôtre, laissez l'option « Graphiques d'arrière-plan » activée.</p></blockquote>
`;

writeFileSync(
  join(OUT, '00-Sommaire.html'),
  page({
    titre: 'Livraison documentaire',
    surtitre: `Plateforme Finarent · ${DATE_LIVRAISON}`,
    meta: `<strong>Quatre documents</strong> : prise en main, audit, procédures d'exploitation, plan de recette.<br>Ce sommaire vous indique par où commencer selon votre rôle, et comment obtenir une version PDF.`,
    corps: sommaireHtml,
    sommaire: [
      { ancre: 'contenu', texte: 'Contenu de la livraison' },
      { ancre: 'par-ou-commencer', texte: 'Par où commencer' },
      { ancre: 'en-resume', texte: "Ce qu'il faut retenir" },
      { ancre: 'obtenir-un-pdf', texte: 'Obtenir une version PDF' },
    ],
    pied: `Livraison documentaire — plateforme Finarent — ${DATE_LIVRAISON}`,
  }),
  'utf8'
);
console.log('  OK  00-Sommaire.html');
console.log(`\nDossier de livraison : ${OUT}`);
