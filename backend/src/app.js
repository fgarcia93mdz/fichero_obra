const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const fichadaRoutes = require('./routes/fichada');
const authRoutes = require('./routes/auth');
// const obraRoutes = require('./routes/obra');

// Importar base de datos
const { sequelize } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Configuración de proxy
 * Necesario para rate limiting cuando se ejecuta detrás de proxies
 */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Confiar en el primer proxy
} else {
  app.set('trust proxy', false); // En desarrollo, no confiar en proxies
}

/**
 * Middleware de seguridad
 */
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // límite de requests por ventana de tiempo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Devolver rate limit info en los headers `RateLimit-*` 
  legacyHeaders: false, // Deshabilitar los headers `X-RateLimit-*`
  // Configuración para manejar proxies correctamente
  keyGenerator: (req) => {
    return req.ip; // Usar la IP real detectada por Express
  },
  // Skip rate limiting para health checks
  skip: (req) => {
    return req.path === '/api/health' || req.path === '/api/info';
  }
});
app.use(limiter);

/**
 * Middleware de parseo
 */
app.use(express.json({ limit: '10mb' })); // Para manejar QR base64
app.use(express.urlencoded({ extended: true }));

/**
 * CORS configuración
 */
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : [
        'http://localhost:3000', 
        'https://localhost:3000',
        'http://localhost:3001', 
        'https://localhost:3443',
        'https://localhost:3444',
        'https://localhost:3445',
        'http://localhost:5173',
        'https://localhost:5173'
      ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

/**
 * Middleware de logging
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`, 
      req.method !== 'GET' ? JSON.stringify(req.body) : '');
    next();
  });
}

/**
 * Rutas de la API
 */
app.use('/api/auth', authRoutes);
app.use('/api/fichada', fichadaRoutes);

/**
 * Endpoint temporal para obtener obras (PÚBLICO - sin autenticación)
 */
app.get('/api/obras', async (req, res) => {
  try {
    const { Obra } = require('./models');
    
    const obras = await Obra.findAll({
      where: {
        activa: true
      },
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'nombre', 'descripcion', 'direccion', 
        'lat', 'long', 'radioPermitido', 'activa',
        'fechaInicio', 'fechaFinEstimada', 'createdAt'
      ]
    });

    res.json({
      success: true,
      message: 'Obras obtenidas correctamente',
      data: obras,
      count: obras.length
    });

  } catch (error) {
    console.error('Error al obtener obras:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * Endpoint de debug para verificar tokens
 */
app.get('/api/debug/token', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    res.json({
      authHeader: authHeader,
      token: token,
      tokenLength: token ? token.length : 0,
      tokenParts: token ? token.split('.').length : 0,
      jwtSecret: process.env.JWT_SECRET ? 'CONFIGURADO' : 'NO_CONFIGURADO'
    });
  } catch (error) {
    res.json({
      error: error.message,
      authHeader: req.headers['authorization']
    });
  }
});

// app.use('/api/obras', obraRoutes);

/**
 * Ruta de health check
 */
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    
    res.json({
      status: 'OK',
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'Conectada',
      version: require('../package.json').version || '1.0.0'
    });
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Problemas de conectividad con la base de datos',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Ruta de información del servidor
 */
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Sistema de Fichadas QR',
    description: 'API REST para sistema de fichadas con QR y geolocalización',
    version: require('../package.json').version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout'
      },
      fichadas: {
        generar: 'POST /api/fichada/generar',
        scan: 'POST /api/fichada/scan',
        listar: 'GET /api/fichada/listar',
        misFichadas: 'GET /api/fichada/mis-fichadas',
        aprobar: 'PUT /api/fichada/:id/aprobar',
        estadisticas: 'GET /api/fichada/estadisticas',
        obras: 'GET /api/fichada/obras',
        usuarios: 'GET /api/fichada/usuarios'
      },
      obras: {
        listar: 'GET /api/obras',
        obtener: 'GET /api/obras/:id',
        crear: 'POST /api/obras',
        actualizar: 'PUT /api/obras/:id',
        desactivar: 'DELETE /api/obras/:id'
      }
    },
    documentation: 'Ver README.md para documentación completa'
  });
});

/**
 * Ruta catch-all para rutas no encontradas
 */
app.get('/', (req, res) => {
  res.redirect('/api/info');
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe en esta API`,
    availableEndpoints: {
      info: 'GET /api/info',
      health: 'GET /api/health',
      auth: 'POST /api/auth/login',
      fichadas: 'POST /api/fichada/generar'
    }
  });
});

/**
 * Middleware global de manejo de errores
 */
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

/**
 * Inicialización del servidor
 */
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: true });
      console.log('🔄 Usando migraciones - no se sincroniza automáticamente');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
      console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recibido. Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recibido. Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;
