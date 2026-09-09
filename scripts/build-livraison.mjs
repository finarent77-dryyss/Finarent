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
      if (titres && niveau === 2) titres.push({ ancre, texte });
      if (niveau > 1) out.push(`<h${niveau} id="${ancre}">${inline(texte)}</h${niveau}>`);
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
  a{color:${MARQUE.marineClair};text-decoration:none}
  .pied{page-break-inside:avoid}
}
`;

function page({ titre, surtitre, meta, corps, sommaire, pied }) {
  const toc =
    sommaire && sommaire.length
      ? `<nav class="sommaire"><h2>Sommaire</h2><ol>${sommaire
          .map((t) => `<li><a href="#${t.ancre}">${esc(t.texte)}</a></li>`)
          .join('')}</ol></nav>`
      : '';

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
    source: 'TESTS_DEBUTANT.md',
    fichier: '08-Guide-de-test-manuel.html',
    titre: 'Guide de test manuel',
    surtitre: 'Document 8 sur 8 · À faire soi-même',
    resume:
      "La marche à suivre pour vérifier la plateforme par vous-même, écran par écran. Aucune compétence technique requise.",
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
  const lies = documentsLies(doc, ancres);
  html += `\n${lies.html}`;
  titres.push({ ancre: lies.ancre, texte: 'Documents liés' });
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
