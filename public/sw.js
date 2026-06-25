const CACHE = "talent-passport-v1";

const FILES = [
  "/",
  "/offline.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/offline.html"))
  );
});