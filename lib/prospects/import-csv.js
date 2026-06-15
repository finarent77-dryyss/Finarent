/**
 * Parsing d'un CSV de prospects pour l'import admin.
 *
 * Tolère :
 *  - BOM UTF-8 (Excel), séparateur `,` ou `;` (auto-détecté sur l'en-tête)
 *  - champs entre guillemets (avec virgules / retours ligne internes, `""` échappé)
 *  - en-têtes FR ou EN dans n'importe quel ordre
 *
 * Colonnes reconnues (insensibles à la casse/accents) :
 *  - name      : name | nom | prenom nom | contact
 *  - email     : email | e-mail | courriel | mail
 *  - phone     : phone | telephone | tel | mobile | portable
 *  - company   : company | societe | entreprise | raison sociale
 *  - status    : status | statut | etat
 *  - source    : source | origine | canal
 *  - notes     : notes | note | commentaire | remarque
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STATUS_VALUES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

// Mappe un libellé FR ou un code vers un ProspectStatus valide.
const STATUS_ALIASES = {
  new: 'NEW', nouveau: 'NEW', nouveaux: 'NEW',
  contacted: 'CONTACTED', contacte: 'CONTACTED', 'contacté': 'CONTACTED',
  qualified: 'QUALIFIED', qualifie: 'QUALIFIED', 'qualifié': 'QUALIFIED',
  converted: 'CONVERTED', converti: 'CONVERTED', client: 'CONVERTED',
  lost: 'LOST', perdu: 'LOST', perdus: 'LOST',
};

// Synonymes d'en-têtes → clé canonique.
const HEADER_ALIASES = {
  name: 'name', nom: 'name', contact: 'name', 'prenom nom': 'name', 'nom complet': 'name',
  email: 'email', 'e-mail': 'email', courriel: 'email', mail: 'email', emails: 'email',
  phone: 'phone', telephone: 'phone', tel: 'phone', mobile: 'phone', portable: 'phone', 'tel.': 'phone',
  company: 'company', societe: 'company', entreprise: 'company', 'raison sociale': 'company', organisation: 'company',
  status: 'status', statut: 'status', etat: 'status',
  source: 'source', origine: 'source', canal: 'source',
  notes: 'notes', note: 'notes', commentaire: 'notes', remarque: 'notes', commentaires: 'notes',
};

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const t = email.trim().toLowerCase();
  return t.length >= 5 && t.length <= 200 && EMAIL_RE.test(t);
}

/** Normalise un libellé d'en-tête : minuscules, sans accents ni espaces superflus. */
function normalizeHeader(h) {
  return String(h || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/** Parse une ligne CSV en respectant les guillemets. */
function parseCsvLine(line, delimiter) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Découpe le CSV en lignes logiques (gère les retours ligne dans les guillemets). */
function splitCsvRows(text) {
  const rows = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cur += '""'; i++; continue; }
      inQuotes = !inQuotes;
      cur += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      rows.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.length) rows.push(cur);
  return rows.filter((r) => r.trim().length > 0);
}

function normalizeStatus(value) {
  if (!value) return null;
  const v = String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  if (STATUS_VALUES.includes(v.toUpperCase())) return v.toUpperCase();
  return STATUS_ALIASES[v] || null;
}

/**
 * Parse un CSV de prospects.
 * @param {string} csv
 * @returns {{ rows: Array<{name,email,phone,company,status,source,notes}>, errors: string[], total: number }}
 */
export function parseProspectCsv(csv) {
  const errors = [];
  if (!csv || typeof csv !== 'string') {
    return { rows: [], errors: ['CSV vide'], total: 0 };
  }

  // Strip BOM
  const text = csv.replace(/^\uFEFF/, '');
  const rawRows = splitCsvRows(text);
  if (rawRows.length === 0) {
    return { rows: [], errors: ['Aucune ligne détectée'], total: 0 };
  }

  // Auto-détection du séparateur sur la 1re ligne
  const headerLine = rawRows[0];
  const delimiter = (headerLine.match(/;/g)?.length || 0) > (headerLine.match(/,/g)?.length || 0) ? ';' : ',';

  const headerCells = parseCsvLine(headerLine, delimiter).map(normalizeHeader);
  const colMap = {};
  headerCells.forEach((h, idx) => {
    const key = HEADER_ALIASES[h];
    if (key && colMap[key] === undefined) colMap[key] = idx;
  });

  // Si aucune colonne reconnue → on suppose un format simple "email,nom" sans en-tête
  const hasHeader = Object.keys(colMap).length > 0;
  let dataRows = rawRows;
  if (hasHeader) {
    dataRows = rawRows.slice(1);
  } else {
    colMap.email = 0;
    colMap.name = 1;
    colMap.phone = 2;
    errors.push('En-tête non reconnu : interprétation par défaut « email, nom, téléphone ».');
  }

  const get = (cells, key) => {
    const idx = colMap[key];
    if (idx === undefined) return '';
    return (cells[idx] || '').trim();
  };

  const out = [];
  const seenEmail = new Set();
  const seenPhone = new Set();
  let total = 0;

  dataRows.forEach((line, i) => {
    const cells = parseCsvLine(line, delimiter);
    const lineNo = (hasHeader ? i + 2 : i + 1);
    total++;

    const email = get(cells, 'email').toLowerCase();
    const name = get(cells, 'name');
    const phone = get(cells, 'phone').replace(/[^0-9+]/g, '');
    const company = get(cells, 'company');
    const status = normalizeStatus(get(cells, 'status')) || 'NEW';
    const source = get(cells, 'source') || null;
    const notes = get(cells, 'notes') || null;

    // Ligne sans aucun identifiant exploitable
    if (!email && !phone && !name && !company) return;

    if (email && !isValidEmail(email)) {
      errors.push(`Ligne ${lineNo} : email invalide « ${email} » (ignorée)`);
      return;
    }

    // Dédoublonnage intra-fichier
    if (email && seenEmail.has(email)) return;
    if (!email && phone && seenPhone.has(phone)) return;
    if (email) seenEmail.add(email);
    if (phone) seenPhone.add(phone);

    out.push({
      name: name ? name.slice(0, 150) : null,
      email: email || null,
      phone: phone ? phone.slice(0, 30) : null,
      company: company ? company.slice(0, 150) : null,
      status,
      source: source ? source.slice(0, 100) : null,
      notes: notes ? notes.slice(0, 2000) : null,
    });
  });

  return { rows: out, errors, total };
}
