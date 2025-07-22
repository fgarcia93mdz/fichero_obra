import axios from 'axios';

// Configuración base de Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Función para limpiar datos de autenticación
const clearAuthData = () => {
  const keysToRemove = ['authToken', 'userInfo', 'tokenExpiry', 'lastActivity'];
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🧹 Eliminado: ${key}`);
    }
  });
  console.log('✅ Datos de autenticación eliminados del localStorage');
};

// Interceptor para agregar token JWT (si se implementa autenticación)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    // Validar que el token no esté vacío y tenga formato válido (3 partes separadas por .)
    if (token && token.trim() !== '' && token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && token.trim() !== '') {
      // Token existe pero está mal formado, eliminarlo
      console.warn('⚠️ Token malformado detectado, limpiando localStorage...');
      clearAuthData();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.warn('🔐 Error de autenticación (401), limpiando datos...');
      clearAuthData();
      
      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== '/' && !window.location.pathname.includes('login')) {
        console.log('🔄 Redirigiendo al login...');
        window.location.href = '/';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Servicios de la API
export const fichadaService = {
  // Generar QR para una obra
  generarQR: async (obraId) => {
    try {
      const response = await api.post('/fichada/generar', { obraId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Escanear QR y registrar fichada
  escanearQR: async (payload) => {
    try {
      const response = await api.post('/fichada/scan', payload);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Aprobar fichada (supervisor)
  aprobarFichada: async (fichadaId) => {
    try {
      const response = await api.post('/fichada/aprobar', { fichadaId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Listar fichadas
  listarFichadas: async (userId = null, limit = 50, offset = 0) => {
    try {
      const url = userId ? `/fichada/lista/${userId}` : '/fichada/lista';
      const response = await api.get(url, {
        params: { limit, offset }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Listar obras activas
  listarObras: async () => {
    try {
      const response = await api.get('/obras');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Listar usuarios activos
  listarUsuarios: async () => {
    try {
      const response = await api.get('/usuarios');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Servicio de geolocalización
export const geolocationService = {
  // Obtener posición actual del usuario
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada por este navegador'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // Cache por 1 minuto
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            long: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          });
        },
        (error) => {
          let errorMessage = 'Error desconocido al obtener ubicación';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de geolocalización denegado por el usuario';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener ubicación';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  },

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  calcularDistancia: (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

// Servicio de autenticación real
export const authService = {
  // Login real con backend
  login: async (dni, password) => {
    try {
      const response = await api.post('/auth/login', { dni, password });
      
      if (response.success && response.data) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error(response.message || 'Error de login');
      }
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    clearAuthData();
  },

  // Obtener información del usuario actual
  getCurrentUser: () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing user info:', error);
      clearAuthData(); // Limpiar datos corruptos
      return null;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return token && token.trim() !== '' && token.split('.').length === 3;
  },

  // Limpiar tokens corruptos del localStorage  
  clearAuthData: clearAuthData,

  // Verificar si el token es válido
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    if (!token || token.trim() === '' || token.split('.').length !== 3) {
      if (token) {
        console.warn('🔧 Token inválido detectado, limpiando...');
        clearAuthData();
      }
      return false;
    }
    return true;
  }
};

export default api;
