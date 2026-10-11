// Service worker: deja el juego funcionando sin internet.
// Con internet SIEMPRE pide la version mas reciente de cada archivo (asi las actualizaciones llegan
// al abrir la app); sin internet usa la copia guardada.
// Si agregas archivos nuevos al juego, ponlos en CORE y sube el numero de CACHE.
const CACHE = 'gatochef-v5';
const CORE = [
  './',
  './index.html',
  './style.css',
  './embedded-sounds.js',
  './game.js',
  './recipes.js',
  './manifest.json',
  './sounds/list.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // 'reload' = ignorar la cache del navegador/hosting; allSettled = un archivo que falte no bloquea la actualizacion
      .then((c) => Promise.allSettled(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const nav = req.mode === 'navigate';
  const key = nav ? './index.html' : req;
  e.respondWith(
    fetch(nav ? new Request('./index.html', { cache: 'no-cache' }) : new Request(req, { cache: 'no-cache' }))
      .then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); }
        return res;
      })
      .catch(() => caches.match(key).then((hit) => hit || caches.match('./index.html')))
  );
});
