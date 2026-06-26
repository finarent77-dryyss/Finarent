import { ringoverSmsFromNumber } from './api-client';

export function formatRingoverE164(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('33')) return `+${digits}`;
  if (digits.startsWith('0')) return `+33${digits.slice(1)}`;
  return `+${digits}`;
}

export function parseRingoverPhoneNumbersInput(input) {
  if (!input?.trim()) return [];
  return input
    .split(/[\n,;]+/)
    .map((s) => formatRingoverE164(s.trim()))
    .filter(Boolean);
}

export function getCallCenterRingoverNumbers(callCenter) {
  const fromCenter = (callCenter?.ringoverPhoneNumbers ?? [])
    .map(formatRingoverE164)
    .filter(Boolean);
  if (fromCenter.length) return fromCenter;
  const fallback = formatRingoverE164(ringoverSmsFromNumber());
  return fallback ? [fallback] : [];
}

export function resolveRingoverSmsFromNumber(callCenter, choice) {
  const numbers = getCallCenterRingoverNumbers(callCenter);
  if (choice && numbers.includes(choice)) return choice;
  return numbers[0] ?? formatRingoverE164(ringoverSmsFromNumber());
}
