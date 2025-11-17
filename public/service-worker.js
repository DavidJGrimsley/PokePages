/* Basic Service Worker for caching core files and PWA icons. */
const CACHE_NAME = 'poke-pages-cache-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icons/pwa-192x192.png',
  '/images/icons/pwa-512x512.png',
  '/images/icons/favicon.ico',
  '/images/icons/apple-touch-icon.png',
  '/images/icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
        return null;
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return caches.open(CACHE_NAME).then((cache) =>
        fetch(event.request).then((response) => {
          // optionally cache dynamic requests.
          if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
      );
    })
  );
});
