const CACHE = 'impressoras-hgp-v11'; 
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e Limpeza
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network First
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const resClone = response.clone();
        caches.open(CACHE).then(cache => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
