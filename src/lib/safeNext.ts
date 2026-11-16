/**
 * Only allow in-app paths as a redirect target: "/learn", "/level/12?x=1".
 * Rejects "//host", "/\host", "\\host", "https://…", control characters and
 * anything a browser could read as another site.
 */
export function safeNext(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback;
  if (raw.length > 512) return fallback;
  if (!/^\/[A-Za-z0-9\-._~!$&'()*+,;=:@%/?#]*$/.test(raw)) return fallback; // no backslashes, spaces or control chars
  if (raw.startsWith('//')) return fallback;
  try { if (new URL(raw, 'https://stave.invalid').origin !== 'https://stave.invalid') return fallback; } catch { return fallback; }
  return raw;
}
