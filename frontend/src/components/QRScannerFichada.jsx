import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { fichadaService, geolocationService, authService } from '../services/api';
import { toast } from 'react-toastify';

const QRScannerFichada = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

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

  // Inicializar y destruir el scanner
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  // Iniciar scanning
  const iniciarEscaneo = async () => {
    try {
      setScanning(true);
      
      // Pequeño delay para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Validar que el elemento video esté disponible
      if (!videoRef.current) {
        console.error('Elemento video no disponible después del delay');
        toast.error('Error: No se puede acceder al elemento de video de la cámara. Por favor, recarga la página.');
        setScanning(false);
        return;
      }
      
      // Verificar disponibilidad de cámaras antes de intentar
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(device => device.kind === 'videoinput');
          
          if (cameras.length === 0) {
            toast.error('No se detectaron cámaras en este dispositivo.');
            setScanning(false);
            return;
          }
          
          console.log(`📷 ${cameras.length} cámara(s) detectada(s)`);
          
          // Probar acceso a la cámara primero con configuración más simple
          let stream;
          try {
            // Intentar primero con configuración básica
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: true
            });
            console.log('✅ Acceso a cámara confirmado (configuración básica)');
            stream.getTracks().forEach(track => track.stop());
            
            // Si funciona, intentar con configuración preferida
            try {
              stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                  facingMode: 'environment',
                  width: { ideal: 640 },
                  height: { ideal: 480 }
                } 
              });
              console.log('✅ Cámara con configuración preferida');
              stream.getTracks().forEach(track => track.stop());
            } catch (envError) {
              console.warn('⚠️ Configuración preferida falló, usando básica');
            }
            
          } catch (mediaError) {
            console.error('❌ Error al acceder a cámara:', mediaError);
            let errorMsg = 'Error al acceder a la cámara';
            
            if (mediaError.name === 'NotAllowedError') {
              errorMsg = 'Permiso de cámara denegado. Permite el acceso en configuración del navegador.';
            } else if (mediaError.name === 'NotFoundError') {
              errorMsg = 'No se encontró cámara disponible en este dispositivo.';
            } else if (mediaError.name === 'NotReadableError') {
              errorMsg = 'Cámara en uso por otra aplicación. Cierra otras apps que usen la cámara.';
            } else if (mediaError.name === 'AbortError') {
              errorMsg = 'Timeout al acceder a la cámara. Intenta de nuevo o reinicia el navegador.';
            }
            
            toast.error(errorMsg);
            setScanning(false);
            return;
          }
          
        } catch (enumError) {
          console.warn('⚠️ Error al enumerar dispositivos:', enumError);
          // Continuar de todas formas, podría funcionar
        }
      }
      
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }

      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result),
        {
          onDecodeError: (error) => {
            // Silenciar errores de decodificación normales
            if (!error.toString().includes('No QR code found')) {
              console.warn('QR decode error:', error);
            }
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Usar cámara trasera si está disponible
          maxScansPerSecond: 5, // Limitar procesamiento para mejor rendimiento
          returnDetailedScanResult: true, // Información detallada del escaneo
          calculateScanRegion: (video) => {
            // Región de escaneo más pequeña para mejor detección
            const smallerSize = Math.min(video.videoWidth, video.videoHeight) * 0.6;
            return {
              x: Math.round((video.videoWidth - smallerSize) / 2),
              y: Math.round((video.videoHeight - smallerSize) / 2),
              width: Math.round(smallerSize),
              height: Math.round(smallerSize),
            };
          },
        }
      );

      qrScannerRef.current = qrScanner;
      
      console.log('🔄 Iniciando QrScanner...');
      
      // Usar timeout más largo para ambiente local
      const startTimeout = setTimeout(() => {
        console.error('⏰ Timeout al iniciar QrScanner');
        toast.error('Timeout al iniciar cámara. Para testing local, considera usar hosting HTTPS.');
        setScanning(false);
      }, 15000); // 15 segundos timeout para local
      
      try {
        await qrScanner.start();
        clearTimeout(startTimeout);
        console.log('✅ QrScanner iniciado correctamente');
        toast.success('Cámara iniciada correctamente. Apunta al código QR.');
      } catch (startError) {
        clearTimeout(startTimeout);
        throw startError; // Re-lanzar para manejo en catch principal
      }
      
    } catch (error) {
      console.error('Error al iniciar scanner:', error);
      
      let errorMsg = 'Error al acceder a la cámara';
      const errorMessage = error?.message || error?.toString() || '';
      
      if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
        errorMsg = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.';
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('Camera not found')) {
        errorMsg = 'No se encontró cámara en este dispositivo.';
      } else if (errorMessage.includes('NotSupportedError')) {
        errorMsg = 'Tu navegador no soporta acceso a cámara. Usa Chrome, Firefox o Safari.';
      } else if (errorMessage.includes('NotReadableError')) {
        errorMsg = 'Cámara en uso por otra aplicación. Cierra otras apps que usen la cámara.';
      } else if (errorMessage.includes('AbortError') || errorMessage.includes('Timeout')) {
        errorMsg = 'Timeout al iniciar cámara. Intenta cerrar otras aplicaciones que usen la cámara o reinicia el navegador.';
      } else if (errorMessage.includes('OverconstrainedError')) {
        errorMsg = 'La cámara no soporta la configuración solicitada. Intenta con otra cámara.';
      }
      
      toast.error(errorMsg);
      setScanning(false);
    }
  };

  // Manejar el resultado del escaneo de QR
  const handleScan = async (result) => {
    if (result && !loading) {
      try {
        setLoading(true);
        
        // Parsear los datos del QR
        const qrData = JSON.parse(result.data);
        
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
        
        // Detener el scanner
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
        }
        setScanning(false);
        
        const mensaje = qrData.timestamp 
          ? 'QR válido escaneado. Ahora selecciona entrada o salida.'
          : 'QR permanente de obra escaneado. Selecciona entrada o salida.';
        
        toast.info(mensaje);

      } catch (error) {
        console.error('Error al procesar QR:', error);
        toast.error('QR inválido o corrupto');
      } finally {
        setLoading(false);
      }
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
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
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
            backgroundColor: 'black',
            position: 'relative'
          }}>
            <video
              ref={videoRef}
              style={{ 
                width: '100%', 
                height: 'auto',
                display: 'block'
              }}
              playsInline
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
            onClick={iniciarEscaneo}
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
