import crypto from 'crypto';

/**
 * Génération SEPA XML pain.001.001.03 pour virements groupés.
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
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 .,'\-/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function fmtAmount(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

export function generateSepaXml(input) {
  if (!input.creditors?.length) throw new Error('Aucun virement dans le lot SEPA');

  const messageId = (input.messageId || `FNR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`).slice(0, 35);
  const createdAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const totalSum = input.creditors.reduce((s, c) => s + c.amount, 0);
  const numTransactions = input.creditors.length;

  const transactions = input.creditors
    .map((c, idx) => {
      const e2e = sepaClean(c.endToEndId || `${messageId}-${idx + 1}`, 35);
      const refTxt = sepaClean(c.reference || `Virement ${idx + 1}`, 140);
      const creditorName = sepaClean(c.name, 70);
      const iban = c.iban.replace(/\s/g, '').toUpperCase();

      return `      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${escapeXml(e2e)}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">${fmtAmount(c.amount)}</InstdAmt>
        </Amt>
        ${c.bic ? `<CdtrAgt><FinInstnId><BIC>${escapeXml(c.bic.toUpperCase())}</BIC></FinInstnId></CdtrAgt>` : ''}
        <Cdtr>
          <Nm>${escapeXml(creditorName)}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id><IBAN>${escapeXml(iban)}</IBAN></Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${escapeXml(refTxt)}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`;
    })
    .join('\n');

  const debtorIban = input.debtorIban.replace(/\s/g, '').toUpperCase();

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${escapeXml(messageId)}</MsgId>
      <CreDtTm>${createdAt}</CreDtTm>
      <NbOfTxs>${numTransactions}</NbOfTxs>
      <CtrlSum>${fmtAmount(totalSum)}</CtrlSum>
      <InitgPty>
        <Nm>${escapeXml(sepaClean(input.debtorName, 70))}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${escapeXml(messageId)}-PMT</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>true</BtchBookg>
      <NbOfTxs>${numTransactions}</NbOfTxs>
      <CtrlSum>${fmtAmount(totalSum)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl><Cd>SEPA</Cd></SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>${input.requestedExecutionDate}</ReqdExctnDt>
      <Dbtr>
        <Nm>${escapeXml(sepaClean(input.debtorName, 70))}</Nm>
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

export function nextBusinessDay(d = new Date()) {
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  if (next.getDay() === 6) next.setDate(next.getDate() + 2);
  else if (next.getDay() === 0) next.setDate(next.getDate() + 1);
  return next.toISOString().slice(0, 10);
}
