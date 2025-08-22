// sw.js — Seed Syfr PWA (cache-first for GitHub Pages subpath)
const CACHE_NAME = 'seed-syfr-v3';

// Build absolute URLs for assets relative to this sw.js location
const ROOT = new URL('./', self.location).pathname; // e.g. "/seed-syfr/"
const ABS = (p) => new URL(p, self.location).toString();

const ASSETS = [
  ROOT,                // "/seed-syfr/" (directory index)
  ROOT + 'index.html',
  ROOT + 'manifest.json',
  ROOT + 'icon-16x16.png',
  ROOT + 'icon-32x32.png',
  ROOT + 'icon-180x180.png',
  ROOT + 'icon-192x192.png',
  ROOT + 'icon-512x512.png'
].map(ABS);

// Install: pre-cache everything
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first; for navigation requests fall back to cached index.html
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // If it's a navigation (e.g., app start), prefer cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(ABS(ROOT + 'index.html')).then((res) => res || fetch(req))
    );
    return;
  }

  // Otherwise: cache-first with ignoreSearch to tolerate "?v=" etc.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((res) => res || fetch(req))
  );
});

