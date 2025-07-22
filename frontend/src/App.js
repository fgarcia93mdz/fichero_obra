import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import QRButtonObra from './components/QRButtonObra';
import QRScannerFichada from './components/QRScannerFichada';
import { authService, fichadaService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('scanner');

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Manejar login exitoso
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  // Manejar logout
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    toast.info('Sesión cerrada correctamente');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!user) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </>
    );
  }

  // Interfaz principal autenticada
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#343a40',
        color: 'white',
        padding: '15px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>
            🏗️ Fichero de Obra
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '14px' }}>
              👤 {user.nombre}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        padding: '10px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '20px'
        }}>
          <button
            onClick={() => setCurrentView('scanner')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'scanner' ? '#007bff' : '#f8f9fa',
              color: currentView === 'scanner' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📱 Escanear QR
          </button>
          
          <button
            onClick={() => setCurrentView('generator')}
            style={{
              padding: '10px 20px',
              backgroundColor: currentView === 'generator' ? '#007bff' : '#f8f9fa',
              color: currentView === 'generator' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🏗️ Generar QR
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {currentView === 'scanner' && <QRScannerFichada />}
        {currentView === 'generator' && <QRButtonObra />}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #ddd',
        marginTop: '40px'
      }}>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
          Sistema de Fichadas por QR con Geolocalización v2.0
        </p>
        <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '12px' }}>
          Desarrollado con React + Node.js + MySQL
        </p>
      </footer>

      {/* Toast container para notificaciones */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
