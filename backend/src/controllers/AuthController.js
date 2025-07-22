const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

class AuthController {
  
  /**
   * Validaciones para login
   */
  static loginValidations = [
    body('dni')
      .notEmpty()
      .withMessage('DNI es requerido')
      .isLength({ min: 7, max: 20 })
      .withMessage('DNI debe tener entre 7 y 20 caracteres'),
    body('password')
      .notEmpty()
      .withMessage('Contraseña es requerida')
      .isLength({ min: 3 })
      .withMessage('Contraseña debe tener al menos 3 caracteres')
  ];

  /**
   * POST /auth/login
   * Autenticar usuario y devolver JWT
   */
  static async login(req, res) {
    try {
      // Verificar validaciones
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { dni, password } = req.body;

      // Buscar usuario por DNI
      const user = await User.findOne({
        where: { dni }
      });

      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'DNI o contraseña incorrectos'
        });
      }

      if (!user.activo) {
        return res.status(401).json({
          error: 'Usuario inactivo',
          message: 'El usuario está desactivado. Contacte al administrador.'
        });
      }

      // Verificar contraseña
      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Credenciales inválidas',
          message: 'DNI o contraseña incorrectos'
        });
      }

      // Generar JWT
      const tokenPayload = {
        userId: user.id,
        dni: user.dni,
        rol: user.rol
      };

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          issuer: 'fichero-obra-api'
        }
      );

      console.log(`✅ Login exitoso: ${user.nombre} (${user.rol})`);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: {
            id: user.id,
            nombre: user.nombre,
            telefono: user.telefono,
            dni: user.dni,
            email: user.email,
            rol: user.rol
          }
        }
      });

    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * POST /auth/register (opcional - para crear nuevos usuarios)
   */
  static registerValidations = [
    body('nombre')
      .notEmpty()
      .withMessage('Nombre es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    body('telefono')
      .notEmpty()
      .withMessage('Teléfono es requerido')
      .matches(/^[\+]?[0-9\s\-\(\)]+$/)
      .withMessage('Formato de teléfono inválido'),
    body('dni')
      .notEmpty()
      .withMessage('DNI es requerido')
      .isLength({ min: 7, max: 20 })
      .withMessage('DNI debe tener entre 7 y 20 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Email debe tener formato válido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Contraseña debe tener al menos 6 caracteres'),
    body('rol')
      .optional()
      .isIn(['empleado', 'supervisor', 'admin'])
      .withMessage('Rol debe ser empleado, supervisor o admin')
  ];

  static async register(req, res) {
    try {
      // Verificar validaciones
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { nombre, telefono, dni, email, password, rol = 'empleado' } = req.body;

      // Verificar que no exista usuario con mismo DNI
      const existingUser = await User.findOne({ where: { dni } });
      if (existingUser) {
        return res.status(409).json({
          error: 'Usuario ya existe',
          message: `Ya existe un usuario registrado con el DNI ${dni}`
        });
      }

      // Verificar email si se proporciona
      if (email) {
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
          return res.status(409).json({
            error: 'Email ya registrado',
            message: `Ya existe un usuario registrado con el email ${email}`
          });
        }
      }

      // Crear usuario
      const newUser = await User.create({
        nombre,
        telefono,
        dni,
        email,
        password, // Se hashea automáticamente en el hook beforeCreate
        rol,
        activo: true
      });

      console.log(`✅ Usuario registrado: ${newUser.nombre} (${newUser.rol})`);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: newUser.id,
            nombre: newUser.nombre,
            telefono: newUser.telefono,
            dni: newUser.dni,
            email: newUser.email,
            rol: newUser.rol
          }
        }
      });

    } catch (error) {
      console.error('❌ Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor al registrar usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * GET /auth/me
   * Obtener información del usuario autenticado
   */
  static async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        });
      }

      // Obtener información completa del usuario desde la BD
      const user = await User.findByPk(req.user.id);
      
      if (!user || !user.activo) {
        return res.status(404).json({
          error: 'Usuario no encontrado o inactivo'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nombre: user.nombre,
            telefono: user.telefono,
            dni: user.dni,
            email: user.email,
            rol: user.rol,
            activo: user.activo,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * POST /auth/refresh
   * Refrescar token JWT (opcional)
   */
  static async refresh(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Usuario no autenticado'
        });
      }

      // Generar nuevo token
      const tokenPayload = {
        userId: req.user.id,
        dni: req.user.dni,
        rol: req.user.rol
      };

      const newToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          issuer: 'fichero-obra-api'
        }
      );

      res.json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: {
          token: newToken
        }
      });

    } catch (error) {
      console.error('❌ Error refrescando token:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;
