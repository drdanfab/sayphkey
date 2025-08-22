// sw.js — Seed Syfr PWA (root-only app)
const CACHE_NAME = 'seed-syfr-v7';

const ROOT = new URL('./', self.location).pathname;  // e.g. "/seed-syfr/"
const ABS  = (p) => new URL(p, self.location).toString();
const START = ROOT + 'index.html';

const ASSETS = [
  ROOT,                 // "/seed-syfr/" directory index
  START,                // app entry (root index)
  ROOT + 'manifest.json',
  ROOT + 'icon-16x16.png',
  ROOT + 'icon-32x32.png',
  ROOT + 'icon-180x180.png',
  ROOT + 'icon-192x192.png',
  ROOT + 'icon-512x512.png'
].map(ABS);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Navigations → serve cached root app; others cache-first
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match(ABS(START)).then(res => res || fetch(req)));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(res => res || fetch(req))
  );
});

