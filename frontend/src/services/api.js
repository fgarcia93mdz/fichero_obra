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

// Interceptor para agregar token JWT (si se implementa autenticación)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
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

// Servicio de autenticación mock (simulado para el ejemplo)
export const authService = {
  // Simular login - en producción sería con JWT real
  login: (dni, password) => {
    return new Promise((resolve, reject) => {
      // Simulamos usuarios para testing
      const mockUsers = [
        { id: 1, dni: '12345678', nombre: 'Juan Pérez', telefono: '+54261123456', password: '123' },
        { id: 2, dni: '87654321', nombre: 'María García', telefono: '+54261654321', password: '456' },
        { id: 3, dni: '11223344', nombre: 'Carlos López', telefono: '+54261789012', password: '789' }
      ];

      setTimeout(() => {
        const user = mockUsers.find(u => u.dni === dni && u.password === password);
        if (user) {
          const token = `mock_token_${user.id}_${Date.now()}`;
          const userInfo = {
            userId: user.id,
            nombre: user.nombre,
            dni: user.dni,
            telefono: user.telefono
          };
          
          localStorage.setItem('authToken', token);
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          
          resolve({ token, user: userInfo });
        } else {
          reject(new Error('Credenciales inválidas'));
        }
      }, 1000); // Simular latencia de red
    });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  },

  // Obtener información del usuario actual
  getCurrentUser: () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      return null;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return localStorage.getItem('authToken') !== null;
  }
};

export default api;
