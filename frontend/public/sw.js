/* AEGIS ClaimOS: conservative shell cache. Claim API responses are intentionally never cached. */
const CACHE_NAME = "aegis-shell-v1";
const APP_SHELL = ["/", "/favicon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.pathname === "/health" || request.method !== "GET") return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => response).catch(() => caches.match("/")));
    return;
  }
  if (url.origin === self.location.origin && (url.pathname.startsWith("/_next/static/") || /\.(?:png|svg|ico|jpg|jpeg|webp|css|js|woff2?)$/i.test(url.pathname))) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    })));
  }
});
