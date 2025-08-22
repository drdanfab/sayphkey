// sw.js — Seed Syfr PWA (cache‑first for GitHub Pages subpath + /app/)
const CACHE_NAME = 'seed-syfr-v5';

// Resolve absolute URLs under this repo (e.g. "/seed-syfr/")
const ROOT = new URL('./', self.location).pathname;         // "/seed-syfr/"
const START = ROOT + 'app/index.html';                      // the cipher app entry
const ABS   = (p) => new URL(p, self.location).toString();

const ASSETS = [
  ROOT,                          // "/seed-syfr/" directory index
  ROOT + 'index.html',           // landing page
  START,                         // cipher app page
  ROOT + 'manifest.json',
  ROOT + 'icon-16x16.png',
  ROOT + 'icon-32x32.png',
  ROOT + 'icon-180x180.png',
  ROOT + 'icon-192x192.png',
  ROOT + 'icon-512x512.png'
].map(ABS);

// Install: pre-cache everything
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch: cache‑first; for navigations serve the app entry from cache
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // App starts / navigations → serve cached app entry
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(ABS(START)).then(res => res || fetch(req))
    );
    return;
  }

  // All other requests: cache-first (ignoreSearch to tolerate "?v=...")
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(res => res || fetch(req))
  );
});
