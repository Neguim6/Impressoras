const CACHE = 'impressoras-hgp-v2'; // <--- SEMPRE mude essa versão (v1, v2, v3...) quando alterar o HTML
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação: Salva os arquivos no cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting(); // Força o novo SW a ativar imediatamente
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ESTRATÉGIA MELHORADA: Network First (Tenta rede, se falhar usa cache)
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Se a rede responder, atualiza o cache com a cópia nova
        const resClone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, resClone));
        return response;
      })
      .catch(() => caches.match(e.request)) // Se estiver offline, usa o cache
  );
});
