const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Rutas públicas de autenticación
 */

// POST /auth/login - Iniciar sesión
router.post('/login',
  AuthController.loginValidations,
  AuthController.login
);

// POST /auth/register - Registrar nuevo usuario (solo para desarrollo o admin)
router.post('/register',
  AuthController.registerValidations,
  AuthController.register
);

/**
 * Rutas protegidas - requieren autenticación JWT
 */

// GET /auth/me - Obtener perfil del usuario autenticado
router.get('/me',
  authenticateToken,
  AuthController.me
);

// POST /auth/refresh - Refrescar token JWT
router.post('/refresh',
  authenticateToken,
  AuthController.refresh
);

// POST /auth/logout - Cerrar sesión (opcional, para limpiar en cliente)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente',
    tip: 'Elimina el token JWT del cliente para completar el logout'
  });
});

module.exports = router;
