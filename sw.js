// Opal Companion offline cache. Bump VERSION whenever the app files change.
const VERSION = "opal-2026-11-08y";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "maskable-512.png",
  "barlow-condensed-latin-500-normal.woff2", "barlow-condensed-latin-600-normal.woff2", "barlow-condensed-latin-700-normal.woff2",
  "nunito-sans-latin-400-normal.woff2", "nunito-sans-latin-600-normal.woff2", "nunito-sans-latin-700-normal.woff2", "nunito-sans-latin-800-normal.woff2",
  "jetbrains-mono-latin-500-normal.woff2", "jetbrains-mono-latin-700-normal.woff2"];
// Cache each file on its own so one missing file never blocks the install.
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => Promise.allSettled(FILES.map((f) => c.add(new Request(f, { cache: "reload" }))))).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// Serve from the cache right away; refresh the cache in the background when online.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  // music streams straight from the network (the browser keeps its own copy)
  if (new URL(e.request.url).pathname.includes("/music/")) return;
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then((r) => { if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
