import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { fichadaService, geolocationService, authService } from '../services/api';
import { toast } from 'react-toastify';

const QRScannerFichada = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Cargar información del usuario al montar el componente
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Obtener ubicación del usuario
  const obtenerUbicacion = async () => {
    setGettingLocation(true);
    try {
      const location = await geolocationService.getCurrentPosition();
      setUserLocation(location);
      toast.success(`Ubicación obtenida (±${Math.round(location.accuracy)}m precisión)`);
      return location;
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      toast.error(error.message);
      throw error;
    } finally {
      setGettingLocation(false);
    }
  };

  // Manejar el resultado del escaneo de QR
  const handleScan = async (result) => {
    if (result?.text && !loading) {
      try {
        setLoading(true);
        
        // Parsear los datos del QR
        const qrData = JSON.parse(result.text);
        
        // Validar que el QR tenga la estructura esperada
        if (!qrData.obraId || !qrData.timestamp) {
          toast.error('QR inválido: falta información de obra o timestamp');
          return;
        }

        console.log('QR escaneado:', qrData);
        
        // Verificar que no haya pasado más de 5 minutos
        const qrTime = new Date(qrData.timestamp);
        const now = new Date();
        const diffMinutes = (now - qrTime) / (1000 * 60);
        
        if (diffMinutes > 5) {
          toast.error(`QR expirado (${Math.round(diffMinutes)} minutos). Genera uno nuevo.`);
          return;
        }

        setScannedData(qrData);
        setScanning(false);
        toast.info('QR válido escaneado. Ahora selecciona entrada o salida.');

      } catch (error) {
        console.error('Error al procesar QR:', error);
        toast.error('QR inválido o corrupto');
      } finally {
        setLoading(false);
      }
    }
  };

  // Manejar errores del scanner
  const handleError = (error) => {
    console.error('Error del scanner:', error);
    if (error?.name !== 'NotAllowedError') {
      toast.error('Error al acceder a la cámara: ' + error.message);
    }
  };

  // Registrar fichada (entrada o salida)
  const registrarFichada = async (tipo) => {
    if (!currentUser) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!scannedData) {
      toast.error('No hay datos de QR para procesar');
      return;
    }

    try {
      setLoading(true);

      // Obtener ubicación antes de enviar
      let location = userLocation;
      if (!location) {
        location = await obtenerUbicacion();
      }

      // Construir el payload completo
      const payload = {
        obraId: scannedData.obraId,
        timestamp: scannedData.timestamp,
        userId: currentUser.userId,
        telefono: currentUser.telefono,
        lat: location.lat,
        long: location.long,
        tipo
      };

      console.log('Enviando fichada:', payload);

      // Enviar al backend
      const response = await fichadaService.escanearQR(payload);

      if (response.success) {
        toast.success(`${tipo.toUpperCase()} registrada correctamente para ${response.data.fichada.obra}`);
        
        // Limpiar datos para nuevo escaneo
        setScannedData(null);
        setUserLocation(null);
        
        console.log('Fichada registrada:', response.data);
      } else {
        toast.error('Error al registrar fichada: ' + (response.error || 'Respuesta inesperada'));
      }

    } catch (error) {
      console.error('Error al registrar fichada:', error);
      toast.error('Error al registrar fichada: ' + (error.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Cancelar escaneo actual
  const cancelarEscaneo = () => {
    setScanning(false);
    setScannedData(null);
    setUserLocation(null);
    toast.info('Escaneo cancelado');
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>⚠️ Usuario no autenticado</h3>
        <p>Por favor, inicia sesión para usar el scanner de fichadas.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      backgroundColor: '#f9f9f9',
      maxWidth: '500px',
      margin: '20px auto'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        📱 Escanear QR de Fichada
      </h3>

      {/* Información del usuario */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#e8f5e8', 
        borderRadius: '4px',
        border: '1px solid #c3e6c3'
      }}>
        <p><strong>Usuario:</strong> {currentUser.nombre}</p>
        <p><strong>Teléfono:</strong> {currentUser.telefono}</p>
        <p><strong>DNI:</strong> {currentUser.dni}</p>
      </div>

      {/* Estado de ubicación */}
      {gettingLocation && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <p>📍 Obteniendo ubicación...</p>
        </div>
      )}

      {userLocation && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: '#d1ecf1', 
          borderRadius: '4px'
        }}>
          <p><strong>📍 Ubicación obtenida:</strong></p>
          <p>Lat: {userLocation.lat.toFixed(6)}, Long: {userLocation.long.toFixed(6)}</p>
          <p>Precisión: ±{Math.round(userLocation.accuracy)}m</p>
        </div>
      )}

      {/* Scanner de QR */}
      {scanning && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            border: '2px solid #007bff', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundColor: 'black'
          }}>
            <QrReader
              delay={300}
              onError={handleError}
              onResult={handleScan}
              style={{ width: '100%' }}
              constraints={{
                audio: false,
                video: { 
                  facingMode: 'environment' // Usar cámara trasera si está disponible
                }
              }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={cancelarEscaneo}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar Escaneo
            </button>
          </div>
        </div>
      )}

      {/* Datos del QR escaneado */}
      {scannedData && !scanning && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ QR Válido Escaneado</h4>
          <p><strong>Obra ID:</strong> {scannedData.obraId}</p>
          <p><strong>Generado:</strong> {new Date(scannedData.timestamp).toLocaleString()}</p>
          
          {/* Botones para seleccionar tipo de fichada */}
          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <h5 style={{ marginBottom: '10px' }}>Selecciona el tipo de fichada:</h5>
            <button
              onClick={() => registrarFichada('entrada')}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: loading ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '10px',
                minWidth: '100px'
              }}
            >
              🟢 ENTRADA
            </button>
            <button
              onClick={() => registrarFichada('salida')}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: loading ? '#ccc' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                minWidth: '100px'
              }}
            >
              🔴 SALIDA
            </button>
          </div>
        </div>
      )}

      {/* Controles principales */}
      {!scanning && !scannedData && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setScanning(true)}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            📷 Iniciar Escaneo
          </button>
          
          <button
            onClick={obtenerUbicacion}
            disabled={gettingLocation}
            style={{
              padding: '12px 24px',
              backgroundColor: gettingLocation ? '#ccc' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: gettingLocation ? 'not-allowed' : 'pointer'
            }}
          >
            {gettingLocation ? 'Obteniendo...' : '📍 Obtener Ubicación'}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <p>⏳ Procesando...</p>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e2e3e5', 
        border: '1px solid #d6d8db',
        borderRadius: '4px'
      }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#383d41' }}>📋 Instrucciones:</h5>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#383d41' }}>
          <li>Obtén tu ubicación actual (requerido)</li>
          <li>Inicia el escaneo de QR</li>
          <li>Apunta la cámara al código QR generado</li>
          <li>Selecciona si es entrada o salida</li>
          <li>La fichada se registrará automáticamente</li>
        </ol>
        
        <p style={{ 
          marginTop: '10px', 
          fontSize: '12px', 
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          * Debes estar dentro del radio permitido de la obra para fichar correctamente
        </p>
      </div>
    </div>
  );
};

export default QRScannerFichada;
