const CACHE = 'impressoras-hgp-v8'; // <--- Toda vez que editar o HTML, mude para v3, v4, etc.
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Instalação: Salva os arquivos essenciais no cache inicial
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      console.log('SW: Instalando novo cache');
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Força o novo Service Worker a assumir o controle imediatamente
});

// 2. Ativação: Remove versões antigas do cache para não ocupar espaço
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('SW: Removendo cache antigo:', k);
          return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim(); // Faz o SW controlar a página atual imediatamente
});

// 3. Estratégia Network First: Tenta a rede, se falhar (offline), usa o cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Se a busca na rede deu certo, atualiza o cache com a nova cópia
        const resClone = response.clone();
        caches.open(CACHE).then(cache => {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Se a rede falhar (ex: sem sinal), busca no cache
        return caches.match(e.request);
      })
  );
});
