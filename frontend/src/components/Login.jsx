import React, { useState } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const Login = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    dni: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.dni || !credentials.password) {
      toast.warning('Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(credentials.dni, credentials.password);
      
      toast.success(`Bienvenido, ${response.user.nombre}!`);
      onLoginSuccess(response.user);
      
    } catch (error) {
      console.error('Error en login:', error);
      toast.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (userIndex) => {
    const testUsers = [
      { dni: '12345678', password: '123' }, // Juan Pérez
      { dni: '87654321', password: '456' }, // María García
      { dni: '11223344', password: '789' }  // Carlos López
    ];
    
    const user = testUsers[userIndex];
    if (user) {
      setCredentials(user);
      toast.info('Credenciales de prueba cargadas');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '400px',
        padding: '30px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          color: '#333'
        }}>
          🏗️ Fichero de Obra
        </h2>
        
        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          color: '#666',
          fontWeight: 'normal'
        }}>
          Iniciar Sesión
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="dni" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              DNI:
            </label>
            <input
              id="dni"
              type="text"
              name="dni"
              value={credentials.dni}
              onChange={handleInputChange}
              placeholder="Ingresa tu DNI"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'bold' 
            }}>
              Contraseña:
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder="Ingresa tu contraseña"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Usuarios de prueba */}
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#495057' }}>
            👥 Usuarios de Prueba:
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fillTestCredentials(0)}
              disabled={loading}
              style={{
                padding: '8px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Juan Pérez (DNI: 12345678)
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials(1)}
              disabled={loading}
              style={{
                padding: '8px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              María García (DNI: 87654321)
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials(2)}
              disabled={loading}
              style={{
                padding: '8px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '3px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Carlos López (DNI: 11223344)
            </button>
          </div>
          <p style={{ 
            fontSize: '11px', 
            color: '#6c757d', 
            margin: '10px 0 0 0',
            fontStyle: 'italic'
          }}>
            * Las contraseñas son 123, 456 y 789 respectivamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
