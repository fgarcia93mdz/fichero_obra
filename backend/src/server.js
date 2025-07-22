const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, sequelize } = require('./database');
const { syncDatabase } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🏗️ Sistema de Fichadas por QR - Backend',
    version: '1.0.0',
    docs: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error no controlado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal',
    timestamp: new Date().toISOString()
  });
});

// Función para inicializar el servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos (crear tablas si no existen)
    // Cambiar a true solo la primera vez para crear datos de ejemplo
    await syncDatabase(false);
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n✅ Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📖 Documentación de API: http://localhost:${PORT}/api/health`);
      console.log(`🎯 Frontend esperado en: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales para cerrar correctamente
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error);
    process.exit(1);
  }
});

// Inicializar servidor
startServer();
