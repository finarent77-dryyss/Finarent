import { ringoverApi } from './api-client';

let cache = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getRingoverTeamUsers() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.users;
  }
  const data = await ringoverApi('/teams');
  const users = data.users ?? [];
  cache = { at: Date.now(), users };
  return users;
}

export async function findRingoverUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const users = await getRingoverTeamUsers();
  return users.find((u) => u.email?.trim().toLowerCase() === normalized) ?? null;
}

export function primaryRingoverNumber(user) {
  for (const entry of user.numbers ?? []) {
    if (entry.number) return entry.number;
  }
  return null;
}
