const CACHE_NAME = 'fichero-obra-v1.0.0';
const STATIC_CACHE = 'fichero-obra-static-v1.0.0';
const API_CACHE = 'fichero-obra-api-v1.0.0';

// URLs a cachear durante la instalación
const STATIC_URLS = [
  '/',
  '/static/js/main.bef71621.js',
  '/static/css/main.8e0a9b07.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Cacheando archivos estáticos...');
        return cache.addAll(STATIC_URLS).catch((error) => {
          console.warn('⚠️ Error cacheando algunos archivos estáticos:', error);
          // Cachear individualmente los que se puedan
          return Promise.allSettled(
            STATIC_URLS.map(url => cache.add(url))
          );
        });
      }),
      
      // Cache de la API (vacío inicialmente)
      caches.open(API_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker instalado correctamente');
      // Forzar activación inmediata
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ Error durante la instalación del SW:', error);
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName.startsWith('fichero-obra-') && 
              ![STATIC_CACHE, API_CACHE, CACHE_NAME].includes(cacheName)
            )
            .map((cacheName) => {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Tomar control de todos los clientes
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activado y en control');
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip para requests no HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Skip para requests de extensiones del navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Estrategia para archivos estáticos
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      url.pathname.includes('/static/') ||
      url.pathname.includes('/icons/') ||
      url.pathname === '/' ||
      url.pathname === '/manifest.json') {
    
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Servir desde cache
          return cachedResponse;
        }
        
        // Fetch y cachear
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch((error) => {
          console.warn('⚠️ Error fetching:', request.url, error);
          
          // Fallback para navegación
          if (request.mode === 'navigate') {
            return caches.match('/').then((cachedIndex) => {
              return cachedIndex || new Response('Offline', { status: 503 });
            });
          }
          
          throw error;
        });
      })
    );
    return;
  }

  // Estrategia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then((response) => {
        // Solo cachear GET requests exitosos
        if (request.method === 'GET' && response.ok) {
          const responseClone = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch((error) => {
        console.warn('⚠️ API Error:', request.url, error);
        
        // Intentar servir desde cache para GET
        if (request.method === 'GET') {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📱 Sirviendo API desde cache offline:', request.url);
              return cachedResponse;
            }
            throw error;
          });
        }
        
        throw error;
      })
    );
    return;
  }

  // Para todo lo demás, pasar directamente a la red
});

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});

// Sync en segundo plano (para futuras mejoras)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync ejecutado');
    // Aquí se pueden implementar tareas en segundo plano
  }
});

console.log('📱 Service Worker cargado - Fichero de Obra PWA v1.0.0');
