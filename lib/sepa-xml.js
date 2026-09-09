import crypto from 'crypto';

/**
 * Génération SEPA XML pain.001.001.03 pour virements groupés.
 *
 * Un fichier malformé est rejeté en bloc par la banque, sans indication de la
 * ligne fautive : tous les contrôles se font donc ici, avant émission.
 */

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sepaClean(s, maxLen) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 .,'\-/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

/** Montant en centimes entiers : seule façon de garantir que les lignes et le
 *  CtrlSum sont calculés sur exactement les mêmes valeurs arrondies. */
function enCentimes(montant, contexte) {
  const n = Number(montant);
  if (!Number.isFinite(n)) {
    throw new Error(`Montant invalide pour ${contexte} : ${montant}`);
  }
  return Math.round(n * 100);
}

function fmtCentimes(centimes) {
  return (centimes / 100).toFixed(2);
}

function normaliserIban(iban, contexte) {
  if (typeof iban !== 'string' || !iban.trim()) {
    throw new Error(`IBAN manquant pour ${contexte}`);
  }
  return iban.replace(/\s/g, '').toUpperCase();
}

const DATE_ISO_COURTE = /^\d{4}-\d{2}-\d{2}$/;

export function generateSepaXml(input) {
  if (!input.creditors?.length) throw new Error('Aucun virement dans le lot SEPA');

  const messageId = (input.messageId || `FNR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`).slice(0, 35);
  const createdAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  // Date d'exécution : absente, elle produisait « <ReqdExctnDt>undefined</…> »,
  // que la banque refuse. On retombe sur le prochain jour ouvré bancaire —
  // valeur que l'appelant calcule déjà — et on refuse tout autre format.
  const requestedExecutionDate = input.requestedExecutionDate ?? nextBusinessDay();
  if (!DATE_ISO_COURTE.test(requestedExecutionDate)) {
    throw new Error(
      `Date d'exécution SEPA invalide : « ${requestedExecutionDate} » (attendu AAAA-MM-JJ)`,
    );
  }

  const debtorIban = normaliserIban(input.debtorIban, "le donneur d'ordre");
  const debtorName = sepaClean(input.debtorName, 70);
  if (!debtorName) throw new Error("Nom du donneur d'ordre manquant dans le lot SEPA");

  // Chaque montant est arrondi une seule fois, en centimes, AVANT d'être à la
  // fois écrit dans <InstdAmt> et additionné dans <CtrlSum>. Arrondir le total
  // après la somme désynchronisait les deux : 33,335 + 66,665 donnait deux
  // lignes à 100,01 € pour un CtrlSum de 100,00 € — lot rejeté en bloc.
  const lignes = input.creditors.map((c, idx) => {
    const nom = sepaClean(c.name, 70);
    const contexte = `le bénéficiaire ${idx + 1} (${nom || 'sans nom'})`;
    if (!nom) throw new Error(`Nom manquant pour ${contexte}`);
    const centimes = enCentimes(c.amount, contexte);
    if (centimes <= 0) {
      throw new Error(
        `Montant nul ou négatif (${fmtCentimes(centimes)} €) pour ${contexte} : un virement SEPA doit être strictement positif`,
      );
    }
    return {
      e2e: sepaClean(c.endToEndId || `${messageId}-${idx + 1}`, 35),
      refTxt: sepaClean(c.reference || `Virement ${idx + 1}`, 140),
      nom,
      iban: normaliserIban(c.iban, contexte),
      bic: c.bic,
      centimes,
    };
  });

  const totalCentimes = lignes.reduce((s, l) => s + l.centimes, 0);
  const numTransactions = lignes.length;

  const transactions = lignes
    .map(
      (l) => `      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${escapeXml(l.e2e)}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">${fmtCentimes(l.centimes)}</InstdAmt>
        </Amt>
        ${l.bic ? `<CdtrAgt><FinInstnId><BIC>${escapeXml(l.bic.toUpperCase())}</BIC></FinInstnId></CdtrAgt>` : ''}
        <Cdtr>
          <Nm>${escapeXml(l.nom)}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id><IBAN>${escapeXml(l.iban)}</IBAN></Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${escapeXml(l.refTxt)}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${escapeXml(messageId)}</MsgId>
      <CreDtTm>${createdAt}</CreDtTm>
      <NbOfTxs>${numTransactions}</NbOfTxs>
      <CtrlSum>${fmtCentimes(totalCentimes)}</CtrlSum>
      <InitgPty>
        <Nm>${escapeXml(debtorName)}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${escapeXml(messageId)}-PMT</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>true</BtchBookg>
      <NbOfTxs>${numTransactions}</NbOfTxs>
      <CtrlSum>${fmtCentimes(totalCentimes)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>${requestedExecutionDate}</ReqdExctnDt>
      <Dbtr>
        <Nm>${escapeXml(debtorName)}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id><IBAN>${escapeXml(debtorIban)}</IBAN></Id>
      </DbtrAcct>
      ${input.debtorBic ? `<DbtrAgt><FinInstnId><BIC>${escapeXml(input.debtorBic.toUpperCase())}</BIC></FinInstnId></DbtrAgt>` : '<DbtrAgt><FinInstnId><Othr><Id>NOTPROVIDED</Id></Othr></FinInstnId></DbtrAgt>'}
      <ChrgBr>SLEV</ChrgBr>
${transactions}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}

/** Dimanche de Pâques (algorithme de Meeus/Jones/Butcher, calendrier grégorien).
 *  @returns {Date} date locale à minuit */
function paques(annee) {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = avril
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(annee, mois - 1, jour);
}

function cleJour(d) {
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mois}-${jour}`;
}

function decalerJours(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const cacheFeries = new Map();

/** Jours de fermeture bancaire : jours fériés légaux français, augmentés du
 *  Vendredi saint et du 26 décembre, où le système de règlement TARGET2 est
 *  fermé — un virement SEPA ne peut alors pas être exécuté. */
function joursFeries(annee) {
  const enCache = cacheFeries.get(annee);
  if (enCache) return enCache;
  const dimanchePaques = paques(annee);
  const jours = new Set([
    `${annee}-01-01`, // Jour de l'an
    `${annee}-05-01`, // Fête du Travail
    `${annee}-05-08`, // Victoire 1945
    `${annee}-07-14`, // Fête nationale
    `${annee}-08-15`, // Assomption
    `${annee}-11-01`, // Toussaint
    `${annee}-11-11`, // Armistice 1918
    `${annee}-12-25`, // Noël
    `${annee}-12-26`, // TARGET2 fermé
    cleJour(decalerJours(dimanchePaques, -2)), // Vendredi saint (TARGET2)
    cleJour(decalerJours(dimanchePaques, 1)), // Lundi de Pâques
    cleJour(decalerJours(dimanchePaques, 39)), // Ascension
    cleJour(decalerJours(dimanchePaques, 50)), // Lundi de Pentecôte
  ]);
  cacheFeries.set(annee, jours);
  return jours;
}

/** Prochain jour ouvré bancaire, au format ISO court (AAAA-MM-JJ).
 *
 *  Sérialisation en date LOCALE, et non via toISOString().
 *
 *  setDate() et getDay() raisonnent en heure locale, alors que toISOString()
 *  bascule en UTC. À minuit heure de Paris (UTC+1/+2), la date UTC est celle
 *  de la veille : le décalage annulait le « +1 jour » et ramenait le résultat
 *  sur le jour même — voire sur un dimanche pour un vendredi de départ.
 *  Cette date alimente <ReqdExctnDt> du lot SEPA : une date passée, un
 *  week-end ou un jour férié fait rejeter ou différer le virement.
 */
export function nextBusinessDay(d = new Date()) {
  let next = decalerJours(d, 1);
  // Le plus long pont possible (Noël, 26 décembre, week-end, Jour de l'an)
  // reste très en deçà de 10 reports.
  for (let i = 0; i < 10; i++) {
    const jourSemaine = next.getDay();
    const ferie = joursFeries(next.getFullYear()).has(cleJour(next));
    if (jourSemaine !== 0 && jourSemaine !== 6 && !ferie) break;
    next = decalerJours(next, 1);
  }
  return cleJour(next);
}
