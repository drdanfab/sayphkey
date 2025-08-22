// sw.js
const CACHE_NAME = "seed-syfr-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-16x16.png",
  "./icon-32x32.png",
  "./icon-180x180.png",
  "./icon-192x192.png",
  "./icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Cache-only (no network fallback)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((res) => {
      return res || new Response("", { status: 503, statusText: "Offline" });
    })
  );
});

