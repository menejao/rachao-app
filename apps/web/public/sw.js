const CACHE_NAME = "rachao-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass through all requests — no aggressive caching yet
  // API calls (/api/*) and navigation work normally
  event.respondWith(fetch(event.request));
});
