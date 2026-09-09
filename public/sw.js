// Memoriz Progressive Web App - Service Worker Resiliente e de Baixo Consumo de Bateria
const CACHE_NAME = 'memoriz-pwa-v1.7.33';

// Recursos estruturais do app shell cacheados imediatamente na instalação
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png'
];

// 1. Instalação: baixa e armazena os recursos essenciais do App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Promise.allSettled garante que uma falha em recurso secundário não impeça o precache
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response && (response.ok || response.status === 200)) {
              await cache.put(url, response);
            }
          } catch (err) {
            // Ignora falhas pontuais no precache inicial
          }
        })
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 2. Ativação: assume o controle de todas as abas e limpa versões antigas do Memoriz
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('memoriz-') && name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Suporte a comando de SKIP_WAITING vindo da aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. Interceptação Inteligente de Requisições de Rede (Fetch)
self.addEventListener('fetch', (event) => {
  // Ignora métodos não-GET ou esquemas não-HTTP
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // A) Requisições de Navegação SPA (abertura do app ou recarregamento)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);

        // Se o dispositivo estiver offline no momento, serve IMEDIATAMENTE do cache local
        // Isso evita qualquer delay de timeout ou erro net::ERR_FAILED
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

        if (!isOffline) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const networkResponse = await fetch(event.request, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              cache.put(event.request, responseClone).catch(() => {});
              return networkResponse;
            }
          } catch (err) {
            // Rede indisponível ou lenta -> continua para o cache
          }
        }

        // Recupera a página do cache
        const cachedIndex =
          (await cache.match(event.request, { ignoreSearch: true })) ||
          (await cache.match('/index.html', { ignoreSearch: true })) ||
          (await cache.match('/', { ignoreSearch: true }));

        if (cachedIndex) {
          return cachedIndex;
        }

        // Fallback seguro contra tela em branco
        return new Response(
          '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Memoriz Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;padding:2rem;text-align:center;background:#0f172a;color:#f8fafc;"><h2>Modo Offline Ativo</h2><p>O Memoriz está pronto para uso local. Recarregue a página para acessar seus dados salvos.</p><button style="padding:10px 20px;border-radius:8px;background:#4f46e5;color:white;border:none;cursor:pointer;" onclick="window.location.reload()">Abrir Memoriz</button></body></html>',
          {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          }
        );
      })()
    );
    return;
  }

  // B) Recursos Estáticos (Scripts JS, CSS, Fontes, Imagens, Módulos)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // 1. Tenta encontrar no cache (com e sem query params)
      const cachedResponse = 
        (await cache.match(event.request, { ignoreSearch: true })) ||
        (await cache.match(requestUrl.pathname, { ignoreSearch: true }));

      // Se temos o recurso em cache:
      if (cachedResponse) {
        // Se estiver online, atualiza em segundo plano de forma silenciosa e leve (Stale-While-Revalidate)
        if (typeof navigator !== 'undefined' && navigator.onLine) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                cache.put(event.request, networkResponse.clone()).catch(() => {});
              }
            })
            .catch(() => {});
        }
        return cachedResponse;
      }

      // 2. Se não está em cache, tenta buscar da rede
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          cache.put(event.request, networkResponse.clone()).catch(() => {});
        }
        return networkResponse;
      } catch (err) {
        // 3. Fallbacks resilientes por tipo de conteúdo para NUNCA disparar net::ERR_FAILED ou erros de MIME
        const destination = event.request.destination;
        const pathname = requestUrl.pathname;

        if (destination === 'image' || pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i)) {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="transparent"/></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }

        if (destination === 'script' || pathname.endsWith('.js') || pathname.endsWith('.tsx') || pathname.endsWith('.ts')) {
          return new Response('/* Memoriz offline script fallback */', {
            headers: { 'Content-Type': 'application/javascript; charset=utf-8' }
          });
        }

        if (destination === 'style' || pathname.endsWith('.css')) {
          return new Response('/* Memoriz offline style fallback */', {
            headers: { 'Content-Type': 'text/css; charset=utf-8' }
          });
        }

        if (pathname.endsWith('.json')) {
          return new Response('{}', {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response('Recurso offline indisponível', {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })()
  );
});
