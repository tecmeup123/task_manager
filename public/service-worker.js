// Nome do cache
const CACHE_NAME = 'training-session-manager-v1';
const DYNAMIC_CACHE = 'training-session-manager-dynamic-v1';

// Recursos para cache prévio
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs de API que não devem ser cacheadas
const API_URLS = ['/api/'];

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de Cache: Cache First, then Network com fallback para recursos estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições de API para URLs específicas que não devem ser cacheadas
  const isApiRequest = API_URLS.some(apiUrl => event.request.url.includes(apiUrl));
  if (isApiRequest) {
    // Para requisições de API, sempre tentar rede primeiro, com fallback para cache caso esteja offline
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se uma requisição GET for bem-sucedida, cache o resultado para uso offline futuro
          if (event.request.method === 'GET' && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Retornar uma resposta vazia ou personalizada para erros de API
              return new Response(JSON.stringify({ error: 'Você está offline. Dados não disponíveis.' }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // Para recursos estáticos, use Cache First com fallback para rede
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Não cache responses com status diferente de 200
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar a resposta e armazenar em cache
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            // Para recursos como HTML, CSS ou JS, que são cruciais para a aplicação,
            // retornar uma página offline caso esteja sem conexão
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            throw error;
          });
      })
  );
});

// Processa mensagens do cliente (para sincronizar dados quando online)
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Funcionalidade de sincronização em segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncPendingTasks());
  }
});

// Função para sincronizar tarefas pendentes quando a conexão for restaurada
async function syncPendingTasks() {
  try {
    const pendingTasksRequest = await fetch('/api/tasks/pending');
    const pendingTasks = await pendingTasksRequest.json();
    
    const syncPromises = pendingTasks.map(task => {
      return fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
      });
    });
    
    await Promise.all(syncPromises);
    
    // Notifique o cliente que a sincronização foi concluída
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Todas as tarefas foram sincronizadas com sucesso!'
      });
    });
    
  } catch (error) {
    console.error('Falha na sincronização de tarefas:', error);
  }
}