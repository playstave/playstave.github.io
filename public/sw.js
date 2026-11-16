/*
 * Stave service worker — deliberately small and conservative.
 *
 * Rules (so lesson updates and progress syncing are never held back):
 *  - Only same-origin GET requests are handled. Supabase (accounts, progress
 *    sync) lives on another origin and is never touched or cached.
 *  - Pages (navigations): NETWORK FIRST. A new version of Stave is always used
 *    when online; the saved copy is only a fallback when offline.
 *  - assets/* files have content hashes in their names (a new release gets new
 *    names), so they are safe to keep and serve from the cache.
 *  - Other small files (icons, manifest): use the cache, refresh in the background.
 */
const VERSION = 'stave-v2';
// The folder Stave is served from: '/' locally, '/stave/' on GitHub Pages.
const BASE = new URL(self.registration.scope).pathname;
const SHELL = BASE;
const MAX_ASSETS = 80;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll([SHELL, BASE + 'manifest.webmanifest', BASE + 'favicon.svg', BASE + 'icons/icon-192.png'])).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function trimAssets(cache) {
  const keys = (await cache.keys()).filter((r) => new URL(r.url).pathname.startsWith(BASE + 'assets/'));
  for (let i = 0; i < keys.length - MAX_ASSETS; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch other sites (e.g. Supabase)

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok && (res.headers.get('content-type') || '').includes('text/html')) {
          const cache = await caches.open(VERSION);
          cache.put(SHELL, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(SHELL);
        return cached || new Response('<h1>You’re offline</h1><p>Connect to the internet and reopen Stave.</p>', { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith(BASE + 'assets/')) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok) { cache.put(req, res.clone()); trimAssets(cache); }
      return res;
    })());
    return;
  }

  const rel = url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : '';
  if (/^(icons\/|favicon\.svg$|manifest\.webmanifest$)/.test(rel)) {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      const hit = await cache.match(req);
      const refresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || refresh;
    })());
  }
  // Everything else: the browser handles it normally.
});
