// Service Worker simplificado para desarrollo local con HTTPS autofirmado
const CACHE_NAME = 'fichero-obra-dev-v1';

// Instalación minimalista
self.addEventListener('install', (event) => {
  console.log('🔧 SW Dev: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('✅ Cache creado para desarrollo');
      return self.skipWaiting();
    }).catch((error) => {
      console.warn('⚠️ Error en instalación SW:', error);
      return self.skipWaiting(); // Continuar aunque falle
    })
  );
});

// Activación simple
self.addEventListener('activate', (event) => {
  console.log('🚀 SW Dev: Activando...');
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('✅ SW Dev activado');
    })
  );
});

// Estrategia de red primero (sin cache para desarrollo)
self.addEventListener('fetch', (event) => {
  // Solo interceptar requests HTTP/HTTPS normales
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Para desarrollo, siempre ir a la red
  event.respondWith(
    fetch(event.request).catch((error) => {
      console.warn('🌐 Fetch falló:', event.request.url);
      // Fallback básico para navegación
      if (event.request.mode === 'navigate') {
        return new Response('Offline - Recarga la página', { 
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      throw error;
    })
  );
});

console.log('📱 SW Dev cargado - Modo desarrollo HTTPS');
