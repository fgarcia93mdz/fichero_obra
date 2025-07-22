import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determinar qué SW usar basado en el entorno
    const isLocalHTTPS = window.location.protocol === 'https:' && 
                        window.location.hostname === 'localhost';
    const swPath = isLocalHTTPS ? '/sw-simple.js' : '/sw.js';
    
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('✅ SW registrado con éxito: ', registration);
        console.log('📱 Usando:', swPath);
        
        // Verificar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nueva versión del SW disponible');
                // En desarrollo, actualizar automáticamente
                if (isLocalHTTPS) {
                  console.log('� Modo desarrollo - actualizando SW automáticamente');
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                } else if (window.confirm('Nueva versión disponible. ¿Deseas actualizar?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
        
        // Escuchar cuando el SW toma control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Nuevo Service Worker tomó control');
        });
        
      })
      .catch((registrationError) => {
        console.log('⚠️ SW registration failed: ', registrationError.message);
        // En desarrollo con HTTPS local, mostrar ayuda
        if (isLocalHTTPS) {
          console.log('💡 Tip: Acepta el certificado SSL en todas las pestañas del navegador');
        }
      });
  });
} else {
  console.log('❌ Service Workers no soportados en este navegador');
}
