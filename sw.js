// sw.js
const CACHE_NAME = 'seed-syfr-v1';
const ASSETS = [
  './',            // start_url
  './index.html',  // your file name (rename if different)
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches (optional, good hygiene)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Fetch: cache‑only (no network)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((res) => {
      return res || new Response('', { status: 503, statusText: 'Offline' });
    })
  );
});
