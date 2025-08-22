// sw.js — Seed Syfr PWA (root-only app, hybrid: network-first for index.html)
const CACHE_NAME = 'seed-syfr-v8'; // bump this when you want to force updates

const ROOT  = new URL('./', self.location).pathname;   // e.g. "/seed-syfr/"
const ABS   = (p) => new URL(p, self.location).toString();
const START = ROOT + 'index.html';

const ASSETS = [
  ROOT,                  // "/seed-syfr/" directory index
  START,                 // app entry (root index)
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
      // Try network first (only if we have network)
      try {
        const netRes = await fetch(req, { cache: 'no-store' });
        // Stash a fresh copy for offline use next time
        const cache = await caches.open(CACHE_NAME);
        cache.put(ABS(START), netRes.clone());
        return netRes;
      } catch (err) {
        // Offline (or fetch failed): serve cached app shell
        const cached = await caches.match(ABS(START));
        if (cached) return cached;
        // As a last resort, try default fetch (may fail offline)
        return fetch(req);
      }
    })());
    return;
  }

  // Non-navigation requests → cache-first
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(res => res || fetch(req))
  );
});

