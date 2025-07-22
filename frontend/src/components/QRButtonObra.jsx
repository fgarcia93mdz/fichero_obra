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

  // Función para descargar el QR como imagen
  const descargarQR = () => {
    if (!qrBase64) {
      toast.error('No hay QR para descargar');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = qrBase64;
      
      const obraSeleccionada = obras.find(obra => obra.id == selectedObra);
      const nombreObra = obraSeleccionada ? obraSeleccionada.nombre.replace(/[^a-zA-Z0-9]/g, '_') : 'Obra';
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      link.download = `QR_${nombreObra}_${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('QR descargado correctamente');
    } catch (error) {
      console.error('Error al descargar QR:', error);
      toast.error('Error al descargar el QR');
    }
  };

  // Función para imprimir el QR
  const imprimirQR = () => {
    if (!qrBase64) {
      toast.error('No hay QR para imprimir');
      return;
    }

    try {
      const obraSeleccionada = obras.find(obra => obra.id == selectedObra);
      const nombreObra = obraSeleccionada ? obraSeleccionada.nombre : 'Obra';
      const direccion = obraSeleccionada ? obraSeleccionada.direccion : '';
      const timestamp = new Date().toLocaleString('es-AR');

      const ventanaImpresion = window.open('', '_blank');
      ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>QR Code - ${nombreObra}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin: 20px;
                    background: white;
                }
                .header {
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                }
                .qr-container {
                    margin: 30px auto;
                    padding: 20px;
                    border: 2px solid #333;
                    display: inline-block;
                    background: white;
                }
                .qr-image {
                    max-width: 300px;
                    height: auto;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏗️ CÓDIGO QR - FICHADA DE OBRA</h1>
                <h2>${nombreObra}</h2>
                ${direccion ? `<p><strong>Dirección:</strong> ${direccion}</p>` : ''}
                <p><strong>Generado:</strong> ${timestamp}</p>
            </div>
            
            <div class="qr-container">
                <img src="${qrBase64}" alt="QR Code" class="qr-image" />
            </div>
            
            <div class="footer">
                <p><strong>INSTRUCCIONES:</strong></p>
                <p>1. Escanear este código QR con la aplicación móvil</p>
                <p>2. Verificar que estés en la ubicación correcta</p>
                <p>3. Seleccionar ENTRADA o SALIDA</p>
                <p>4. Confirmar el registro de fichada</p>
                <br>
                <p><em>⚠️ Este código QR es válido por 5 minutos desde su generación</em></p>
                <p><em>Sistema de Fichadas - Fichero de Obra</em></p>
            </div>
            
            <div class="no-print" style="margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🖨️ Imprimir
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                    ❌ Cerrar
                </button>
            </div>
        </body>
        </html>
      `);
      
      ventanaImpresion.document.close();
      
      // Esperar a que la imagen cargue antes de mostrar el diálogo de impresión
      ventanaImpresion.onload = () => {
        setTimeout(() => {
          ventanaImpresion.print();
        }, 500);
      };
      
      toast.success('Ventana de impresión abierta');
    } catch (error) {
      console.error('Error al imprimir QR:', error);
      toast.error('Error al preparar la impresión');
    }
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
            ✅ QR Generado - Permanente para esta obra
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
          
          {/* Botones de descarga e impresión */}
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={descargarQR}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px',
                fontSize: '14px'
              }}
              title="Descargar QR como imagen PNG"
            >
              📥 Descargar
            </button>
            <button
              onClick={imprimirQR}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              title="Abrir ventana de impresión"
            >
              🖨️ Imprimir
            </button>
          </div>
          
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Este QR es permanente para la obra - no expira. Ideal para imprimir y colocar en el lugar de trabajo.
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
          <li>El QR generado es permanente para esta obra (no expira)</li>
          <li>Puedes imprimirlo y colocarlo en el lugar de trabajo</li>
          <li>Los empleados escanean el QR y seleccionan entrada/salida</li>
        </ol>
      </div>
    </div>
  );
};

export default QRButtonObra;
