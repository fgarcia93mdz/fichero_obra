import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isStandalone);

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar si se instaló
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA');
    } else {
      console.log('Usuario canceló la instalación');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Recordar que el usuario no quiere instalar por ahora
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // No mostrar si ya está instalada
  if (isInstalled) return null;

  // No mostrar si se dismissó recientemente (menos de 7 días)
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  // Instrucciones específicas para iOS
  if (isIOS && !isInstalled) {
    return (
      <div className="pwa-install-prompt pwa-install-ios">
        <div className="pwa-install-content">
          <div className="pwa-install-icon">📱</div>
          <h3>Instala Fichero Obra</h3>
          <p>Para acceder a la cámara y usar sin conexión:</p>
          <ol>
            <li>Toca el botón de compartir <span className="ios-share-icon">⬆️</span></li>
            <li>Selecciona "Añadir a pantalla de inicio"</li>
            <li>Toca "Añadir"</li>
          </ol>
          <button onClick={handleDismiss} className="pwa-dismiss-btn">
            Entendido
          </button>
        </div>
      </div>
    );
  }

  // Prompt estándar para otros navegadores
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="pwa-install-prompt">
        <div className="pwa-install-content">
          <div className="pwa-install-icon">📱</div>
          <div className="pwa-install-text">
            <h3>Instala Fichero Obra</h3>
            <p>Accede rápidamente y usa la cámara sin problemas</p>
          </div>
          <div className="pwa-install-actions">
            <button onClick={handleInstallClick} className="pwa-install-btn">
              Instalar
            </button>
            <button onClick={handleDismiss} className="pwa-dismiss-btn">
              Ahora no
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;
