/** Normalise un numéro FR pour comparaison (ex. +33612345678 → 0612345678). */
export function normalizePhone(input) {
  if (!input) return '';
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0033')) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith('33') && digits.length >= 11) digits = `0${digits.slice(2)}`;
  return digits;
}

/** 9 derniers chiffres — matching tolérant (0X vs +33). */
export function phoneSuffix(input) {
  const n = normalizePhone(input);
  return n.length >= 9 ? n.slice(-9) : n;
}

/** Format numérique Ringover (sans +, ex. 33612345678). */
export function toRingoverNumber(input) {
  const n = normalizePhone(input);
  if (!n) return null;
  const intl = n.startsWith('0') ? `33${n.slice(1)}` : n;
  const num = parseInt(intl, 10);
  return Number.isFinite(num) ? num : null;
}

export function prospectPhoneFromCall(data) {
  if (data.contact_number) return data.contact_number;
  const dir = (data.direction || '').toLowerCase();
  if (dir === 'outbound' || dir === 'out') return data.to_number || null;
  return data.from_number || null;
}
