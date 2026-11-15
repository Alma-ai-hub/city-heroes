// Lets the game open without internet (on a tablet added to the home screen).
// Always asks the website for the newest files first ("no-cache" = check with the website
// every time, so updates show right away); the saved copy is only used with no connection.
const CACHE = "city-heroes-v2";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const sameSite = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    fetch(e.request, sameSite ? { cache: "no-cache" } : undefined)
      .then((res) => {
        if (res.ok && sameSite) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
