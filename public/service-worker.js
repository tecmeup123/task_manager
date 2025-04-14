// Cache name
const CACHE_NAME = 'training-session-manager-v1';
const DYNAMIC_CACHE = 'training-session-manager-dynamic-v1';

// Resources for precaching
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API URLs that should not be cached
const API_URLS = ['/api/'];

// Service worker installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Service worker activation
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

// Cache Strategy: Cache First, then Network with fallback for static resources
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip API requests for URLs that shouldn't be cached
  const isApiRequest = API_URLS.some(apiUrl => event.request.url.includes(apiUrl));
  if (isApiRequest) {
    // For API requests, always try network first, with fallback to cache if offline
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If a GET request is successful, cache the result for future offline use
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
              // Return an empty or custom response for API errors
              return new Response(JSON.stringify({ error: 'You are offline. Data not available.' }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // For static resources, use Cache First with fallback to network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache responses with status different from 200
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response and store in cache
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            // For resources like HTML, CSS or JS that are crucial for the application,
            // return an offline page when connection is lost
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            throw error;
          });
      })
  );
});

// Process client messages (to synchronize data when online)
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Background synchronization functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncPendingTasks());
  }
});

// Function to synchronize pending tasks when connection is restored
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
    
    // Notify client that synchronization is complete
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'All tasks have been successfully synchronized!'
      });
    });
    
  } catch (error) {
    console.error('Failed to synchronize tasks:', error);
  }
}