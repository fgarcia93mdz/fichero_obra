import React, { useState, useEffect } from 'react';
import { fichadaService } from '../services/api';
import { toast } from 'react-toastify';

const QRButtonObra = () => {
  const [obras, setObras] = useState([]);
  const [selectedObra, setSelectedObra] = useState('');
  const [qrBase64, setQrBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingObras, setLoadingObras] = useState(true);

  // Cargar obras al montar el componente
  useEffect(() => {
    cargarObras();
  }, []);

  const cargarObras = async () => {
    try {
      setLoadingObras(true);
      const response = await fichadaService.listarObras();
      setObras(response.data || []);
      
      if (response.data?.length > 0) {
        setSelectedObra(response.data[0].id); // Seleccionar primera obra por defecto
      }
    } catch (error) {
      console.error('Error al cargar obras:', error);
      toast.error('Error al cargar las obras: ' + (error.error || error.message));
    } finally {
      setLoadingObras(false);
    }
  };

  const generarQR = async () => {
    if (!selectedObra) {
      toast.warning('Por favor selecciona una obra');
      return;
    }

    try {
      setLoading(true);
      setQrBase64(''); // Limpiar QR anterior
      
      const response = await fichadaService.generarQR(parseInt(selectedObra));
      
      if (response.success && response.data.qrBase64) {
        setQrBase64(response.data.qrBase64);
        toast.success(`QR generado para: ${response.data.obra.nombre}`);
      } else {
        toast.error('Error: No se recibió el QR del servidor');
      }
    } catch (error) {
      console.error('Error al generar QR:', error);
      toast.error('Error al generar QR: ' + (error.error || error.message));
      setQrBase64('');
    } finally {
      setLoading(false);
    }
  };

  const limpiarQR = () => {
    setQrBase64('');
    toast.info('QR limpiado');
  };

  const obraSeleccionada = obras.find(obra => obra.id == selectedObra);

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
        🏗️ Generar QR para Obra
      </h3>

      {/* Selector de obra */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="obra-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Seleccionar Obra:
        </label>
        {loadingObras ? (
          <p>Cargando obras...</p>
        ) : (
          <select
            id="obra-select"
            value={selectedObra}
            onChange={(e) => setSelectedObra(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            disabled={loading}
          >
            <option value="">-- Selecciona una obra --</option>
            {obras.map((obra) => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre} - {obra.direccion}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Información de la obra seleccionada */}
      {obraSeleccionada && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: '#e8f4f8', 
          borderRadius: '4px',
          border: '1px solid #b3e0f2'
        }}>
          <p><strong>Obra:</strong> {obraSeleccionada.nombre}</p>
          <p><strong>Dirección:</strong> {obraSeleccionada.direccion}</p>
          <p><strong>Radio permitido:</strong> {obraSeleccionada.radioPermitido}m</p>
          <p><strong>Coordenadas:</strong> {obraSeleccionada.lat}, {obraSeleccionada.long}</p>
        </div>
      )}

      {/* Botones */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <button
          onClick={generarQR}
          disabled={loading || !selectedObra || loadingObras}
          style={{
            padding: '12px 24px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px',
            minWidth: '120px'
          }}
        >
          {loading ? 'Generando...' : 'Generar QR'}
        </button>

        {qrBase64 && (
          <button
            onClick={limpiarQR}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Mostrar QR generado */}
      {qrBase64 && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h4 style={{ marginBottom: '15px', color: '#28a745' }}>
            ✅ QR Generado - Válido por 5 minutos
          </h4>
          <div style={{ 
            padding: '15px', 
            backgroundColor: 'white', 
            borderRadius: '8px',
            border: '2px solid #28a745',
            display: 'inline-block'
          }}>
            <img 
              src={qrBase64} 
              alt="QR Code" 
              style={{ 
                maxWidth: '250px', 
                height: 'auto',
                display: 'block'
              }} 
            />
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Escanea este código con la aplicación móvil para registrar tu fichada
          </p>
        </div>
      )}

      {/* Instrucciones */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '4px'
      }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#856404' }}>📋 Instrucciones:</h5>
        <ol style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
          <li>Selecciona la obra donde trabajarás</li>
          <li>Haz clic en "Generar QR" para crear el código</li>
          <li>Muestra el QR al empleado que va a fichar</li>
          <li>El QR es válido por 5 minutos solamente</li>
          <li>El empleado debe escanear y seleccionar entrada/salida</li>
        </ol>
      </div>
    </div>
  );
};

export default QRButtonObra;
