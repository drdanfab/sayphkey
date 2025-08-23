// sw.js — SayphKey PWA (root-only app, hybrid: network-first for index.html)
const CACHE_NAME = 'sayphkey-v1'; // bump to force updates

const ROOT  = new URL('./', self.location).pathname;   // now "/sayphkey/"
const ABS   = (p) => new URL(p, self.location).toString();
const START = ROOT + 'index.html';

const ASSETS = [
  ROOT,                  // "/sayphkey/" directory index
  START,                 // app entry
  ROOT + 'manifest.json',
  ROOT + 'icon-16x16.png',
  ROOT + 'icon-32x32.png',
  ROOT + 'icon-180x180.png',
  ROOT + 'icon-192x192.png',
  ROOT + 'icon-512x512.png'
].map(ABS);

// Precache on install
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate + cleanup old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Hybrid strategy:
// - Navigations (index.html): network-first with cache fallback
// - Everything else: cache-first
self.addEventListener('fetch', (e) => {
  const req = e.request;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const netRes = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(CACHE_NAME);
        cache.put(ABS(START), netRes.clone());
        return netRes;
      } catch (err) {
        const cached = await caches.match(ABS(START));
        if (cached) return cached;
        return fetch(req);
      }
    })());
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(res => res || fetch(req))
  );
});
