/**
 * Rutas para gestión de obras
 */

const express = require('express');
const { body } = require('express-validator');
const ObraController = require('../controllers/ObraController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Validaciones para creación/actualización de obras
 */
const crearObraValidations = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la obra es requerido')
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  
  body('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número válido entre -90 y 90'),
  
  body('long')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número válido entre -180 y 180'),
  
  body('radioPermitido')
    .optional()
    .isInt({ min: 10, max: 5000 })
    .withMessage('El radio permitido debe ser entre 10 y 5000 metros'),
  
  body('direccion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  
  body('fechaFinEstimada')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin estimada debe ser una fecha válida')
];

const actualizarObraValidations = [
  body('nombre')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  
  body('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe ser un número válido entre -90 y 90'),
  
  body('long')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe ser un número válido entre -180 y 180'),
  
  body('radioPermitido')
    .optional()
    .isInt({ min: 10, max: 5000 })
    .withMessage('El radio permitido debe ser entre 10 y 5000 metros'),
  
  body('direccion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  
  body('fechaFinEstimada')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin estimada debe ser una fecha válida'),
  
  body('activa')
    .optional()
    .isBoolean()
    .withMessage('El estado activo debe ser verdadero o falso')
];

/**
 * RUTAS PÚBLICAS (requieren autenticación básica)
 */

// Listar todas las obras activas
router.get('/', 
  authMiddleware.verifyToken, 
  ObraController.listarObras
);

// Obtener obra específica por ID
router.get('/:id', 
  authMiddleware.verifyToken,
  ObraController.obtenerObra
);

/**
 * RUTAS ADMINISTRATIVAS (solo admin)
 */

// Crear nueva obra
router.post('/', 
  authMiddleware.verifyToken,
  authMiddleware.requireRole(['admin']),
  crearObraValidations,
  ObraController.crearObra
);

// Actualizar obra existente
router.put('/:id', 
  authMiddleware.verifyToken,
  authMiddleware.requireRole(['admin']),
  actualizarObraValidations,
  ObraController.actualizarObra
);

// Desactivar obra (soft delete)
router.delete('/:id', 
  authMiddleware.verifyToken,
  authMiddleware.requireRole(['admin']),
  ObraController.desactivarObra
);

module.exports = router;
