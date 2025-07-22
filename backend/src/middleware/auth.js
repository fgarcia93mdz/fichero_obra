const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware para verificar JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debe incluir el token en el header Authorization: Bearer <token>'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.activo) {
      return res.status(401).json({
        error: 'Token inválido o usuario inactivo',
        message: 'El usuario asociado al token no existe o está inactivo'
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      nombre: user.nombre,
      telefono: user.telefono,
      dni: user.dni,
      email: user.email,
      rol: user.rol
    };

    next();
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token JWT no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token JWT ha expirado. Inicie sesión nuevamente'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {string|string[]} allowedRoles - Rol o array de roles permitidos
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Este recurso requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
        userRole: req.user.rol,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
};

/**
 * Middleware que permite el acceso si el usuario es el mismo que se está consultando
 * o si tiene rol de supervisor/admin
 */
const authorizeOwnerOrSupervisor = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Usuario no autenticado'
      });
    }

    const targetUserId = parseInt(req.params[userIdParam] || req.body[userIdParam]);
    const currentUserId = req.user.id;
    const userRole = req.user.rol;

    // Permitir si es el mismo usuario o si es supervisor/admin
    if (currentUserId === targetUserId || ['supervisor', 'admin'].includes(userRole)) {
      return next();
    }

    res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo puedes acceder a tu propia información o ser supervisor/admin'
    });
  };
};

/**
 * Middleware opcional para autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.activo) {
        req.user = {
          id: user.id,
          nombre: user.nombre,
          telefono: user.telefono,
          dni: user.dni,
          email: user.email,
          rol: user.rol
        };
      }
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin usuario autenticado
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeOwnerOrSupervisor,
  optionalAuth
};
