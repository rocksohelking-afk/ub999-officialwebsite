// UB999 Official Service Worker
const CACHE_NAME = 'ub999-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch to enable PWA installability criteria
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
