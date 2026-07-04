/**
 * Garde anti-SSRF pour les URLs fournies par un utilisateur (webhooks partenaires).
 * Bloque les schémas non-http(s) et les hôtes privés / loopback / link-local
 * (dont l'endpoint de métadonnées cloud 169.254.169.254).
 *
 * Limite connue : protection basée sur l'hôte littéral, sans résolution DNS —
 * ne couvre pas le DNS rebinding (domaine public résolvant vers une IP privée).
 * Suffisant pour bloquer les cibles internes évidentes.
 */

function isPrivateIpv4(host) {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;             // link-local + métadonnées cloud
  if (a === 172 && b >= 16 && b <= 31) return true;     // 172.16.0.0/12
  if (a === 192 && b === 168) return true;              // 192.168.0.0/16
  return false;
}

/**
 * Valide une URL de webhook. Lève une erreur si elle vise le réseau interne.
 * @param {string} rawUrl
 * @returns {URL}
 */
export function assertSafeWebhookUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('URL webhook invalide');
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Schéma URL non autorisé (https requis)');
  }

  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '::1' ||
    host === '0.0.0.0' ||
    host === 'metadata.google.internal' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    isPrivateIpv4(host)
  ) {
    throw new Error('Hôte webhook non autorisé (réseau interne)');
  }

  return url;
}
