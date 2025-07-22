// Service Worker para PWA - Fichero de Obra
const CACHE_NAME = 'fichero-obra-v1';
const API_CACHE_NAME = 'fichero-obra-api-v1';

// Recursos estáticos para cachear
const STATIC_RESOURCES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Agregar otros recursos estáticos según sea necesario
];

// URLs de API que se pueden cachear temporalmente
const API_URLS = [
  '/api/obras',
  '/api/info',
  '/api/health'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cache abierto');
        return cache.addAll(STATIC_RESOURCES.map(url => {
          return new Request(url, { mode: 'no-cors' });
        })).catch((error) => {
          console.warn('⚠️ Service Worker: Error al cachear recursos estáticos:', error);
          // Intentar cachear individualmente
          return Promise.allSettled(
            STATIC_RESOURCES.map(url => cache.add(url).catch(err => console.warn(`No se pudo cachear ${url}:`, err)))
          );
        });
      })
      .then(() => {
        console.log('✅ Service Worker: Instalación completada');
        return self.skipWaiting();
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Service Worker: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activación completada');
      return self.clients.claim();
    })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);
  
  // Solo manejar requests de nuestro dominio
  if (requestURL.origin !== location.origin) {
    return;
  }

  // Estrategia para recursos estáticos: Cache First
  if (event.request.destination === 'document' ||
      event.request.destination === 'script' ||
      event.request.destination === 'style' ||
      event.request.destination === 'image') {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('📦 Service Worker: Sirviendo desde cache:', event.request.url);
            return response;
          }
          
          return fetch(event.request)
            .then((response) => {
              // Solo cachear respuestas válidas
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
    );
    return;
  }

  // Estrategia para APIs: Network First con fallback a cache
  if (requestURL.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si la respuesta es exitosa, cachear algunos endpoints
          if (response.status === 200 && API_URLS.some(url => requestURL.pathname.includes(url))) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar servir desde cache
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                console.log('📦 Service Worker: API desde cache (modo offline):', event.request.url);
                return response;
              }
              
              // Si no hay cache, devolver respuesta offline personalizada
              if (requestURL.pathname.includes('/api/')) {
                return new Response(
                  JSON.stringify({
                    success: false,
                    message: 'Sin conexión. Funcionalidad limitada.',
                    offline: true
                  }),
                  {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              }
            });
        })
    );
    return;
  }
});

// Manejar notificaciones push (para futuras mejoras)
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Fichero de Obra',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Fichero de Obra', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Service Worker: Click en notificación:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Manejar sincronización en background (para futuras mejoras)
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Sync en background:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí se pueden sincronizar datos pendientes cuando vuelva la conexión
      console.log('🔄 Sincronizando datos pendientes...')
    );
  }
});

// Manejar actualizaciones del Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker cargado correctamente');
