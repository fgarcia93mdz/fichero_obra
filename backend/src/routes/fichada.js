const express = require('express');
const FichadaController = require('../controllers/FichadaController');
const { authenticateToken, authorizeRoles, authorizeOwnerOrSupervisor } = require('../middleware/auth');

const router = express.Router();

/**
 * Rutas protegidas - requieren autenticación JWT
 */

// POST /fichada/generar - Generar QR (todos los roles autenticados)
router.post('/generar',
  authenticateToken,
  FichadaController.generarQRValidations,
  FichadaController.generarQR
);

// POST /fichada/scan - Escanear QR y registrar fichada (todos los roles)
router.post('/scan',
  authenticateToken,
  FichadaController.escanearQRValidations,
  FichadaController.escanearQR
);

// GET /fichada/listar - Listar fichadas (supervisores/admin ven todas, empleados solo las suyas)
router.get('/listar',
  authenticateToken,
  FichadaController.listarFichadasValidations,
  FichadaController.listarFichadas
);

// PUT /fichada/:id/aprobar - Aprobar fichada (solo supervisores/admin)
router.put('/:id/aprobar',
  authenticateToken,
  authorizeRoles(['supervisor', 'admin']),
  FichadaController.aprobarFichadaValidations,
  FichadaController.aprobarFichada
);

// GET /fichada/estadisticas - Estadísticas (supervisores/admin ven todo, empleados solo las suyas)
router.get('/estadisticas',
  authenticateToken,
  FichadaController.obtenerEstadisticas
);

// GET /fichada/obras - Listar obras activas (para generar QR)
router.get('/obras',
  authenticateToken,
  FichadaController.listarObras
);

// GET /fichada/usuarios - Listar usuarios activos (solo supervisores/admin)
router.get('/usuarios',
  authenticateToken,
  authorizeRoles(['supervisor', 'admin']),
  FichadaController.listarUsuarios
);

// GET /fichada/mis-fichadas - Fichadas del usuario autenticado (todos los roles)
router.get('/mis-fichadas',
  authenticateToken,
  FichadaController.listarFichadasValidations,
  (req, res, next) => {
    // Forzar que solo vea sus propias fichadas
    req.query.userId = req.user.id;
    next();
  },
  FichadaController.listarFichadas
);

module.exports = router;
