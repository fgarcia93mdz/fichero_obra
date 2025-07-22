const express = require('express');
const FichadaController = require('../controllers/FichadaController');

const router = express.Router();

// Rutas principales de fichadas
router.post('/fichada/generar', FichadaController.generarQR);
router.post('/fichada/scan', FichadaController.escanearQR);
router.post('/fichada/aprobar', FichadaController.aprobarFichada);
router.get('/fichada/lista/:userId?', FichadaController.listarFichadas);

// Rutas auxiliares
router.get('/obras', FichadaController.listarObras);
router.get('/usuarios', FichadaController.listarUsuarios);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'API de Fichadas con Geolocalización funcionando correctamente',
    version: '2.0.0'
  });
});

// Middleware para rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'POST /api/fichada/generar - Generar QR para obra',
      'POST /api/fichada/scan - Escanear QR y registrar fichada',
      'POST /api/fichada/aprobar - Aprobar fichada por ID',
      'GET /api/fichada/lista/:userId? - Listar fichadas',
      'GET /api/obras - Listar obras activas',
      'GET /api/usuarios - Listar usuarios activos',
      'GET /api/health - Estado del servidor'
    ]
  });
});

module.exports = router;
