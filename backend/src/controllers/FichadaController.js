const QRCode = require('qrcode');
const { body, validationResult, param, query } = require('express-validator');
const { User, Obra, Fichada } = require('../models');

class FichadaController {
  
  /**
   * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
   * @param {number} lat1 - Latitud del punto 1
   * @param {number} lon1 - Longitud del punto 1
   * @param {number} lat2 - Latitud del punto 2
   * @param {number} lon2 - Longitud del punto 2
   * @returns {number} Distancia en metros
   */
  static calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Validaciones para generar QR
   */
  static generarQRValidations = [
    body('obraId')
      .isInt({ min: 1 })
      .withMessage('obraId debe ser un número entero positivo')
  ];

  /**
   * POST /fichada/generar
   * Genera un QR code para una obra específica
   */
  static async generarQR(req, res) {
    try {
      // Verificar validaciones
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { obraId } = req.body;

      // Verificar que la obra existe y está activa
      const obra = await Obra.findByPk(obraId);
      if (!obra) {
        return res.status(404).json({
          error: 'Obra no encontrada',
          obraId: obraId
        });
      }

      if (!obra.activa) {
        return res.status(400).json({
          error: 'La obra está inactiva',
          obra: obra.nombre
        });
      }

      // Crear el timestamp actual
      const timestamp = new Date();

      // Crear el payload que se codificará en el QR
      const qrPayload = {
        obraId: parseInt(obraId),
        timestamp: timestamp.toISOString(),
        // Token simple para validar integridad
        hash: Buffer.from(`${obraId}-${timestamp.getTime()}`).toString('base64').substring(0, 16)
      };

      // Generar el QR code en base64
      const qrString = JSON.stringify(qrPayload);
      const qrBase64 = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log(`📱 QR generado para obra: ${obra.nombre} por usuario: ${req.user.nombre}`);

      res.json({
        success: true,
        message: 'QR generado correctamente',
        data: {
          qrBase64,
          obra: {
            id: obra.id,
            nombre: obra.nombre,
            direccion: obra.direccion,
            lat: parseFloat(obra.lat),
            long: parseFloat(obra.long),
            radioPermitido: obra.radioPermitido
          },
          timestamp,
          validoHasta: new Date(timestamp.getTime() + (parseInt(process.env.QR_EXPIRY_MINUTES) || 5) * 60 * 1000),
          generadoPor: req.user.nombre
        }
      });

    } catch (error) {
      console.error('❌ Error al generar QR:', error);
      res.status(500).json({
        error: 'Error interno del servidor al generar el QR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Validaciones para escanear QR
   */
  static escanearQRValidations = [
    body('obraId')
      .isInt({ min: 1 })
      .withMessage('obraId debe ser un número entero positivo'),
    body('timestamp')
      .isISO8601()
      .withMessage('timestamp debe ser una fecha válida en formato ISO'),
    body('userId')
      .isInt({ min: 1 })
      .withMessage('userId debe ser un número entero positivo'),
    body('telefono')
      .notEmpty()
      .withMessage('telefono es requerido')
      .matches(/^[\+]?[0-9\s\-\(\)]+$/)
      .withMessage('Formato de teléfono inválido'),
    body('lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('lat debe ser un número entre -90 y 90'),
    body('long')
      .isFloat({ min: -180, max: 180 })
      .withMessage('long debe ser un número entre -180 y 180'),
    body('tipo')
      .isIn(['entrada', 'salida'])
      .withMessage('tipo debe ser "entrada" o "salida"')
  ];

  /**
   * POST /fichada/scan
   * Procesa el escaneo del QR y registra la fichada con geolocalización
   */
  static async escanearQR(req, res) {
    try {
      // Verificar validaciones
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { obraId, timestamp, userId, telefono, lat, long, tipo } = req.body;

      // Verificar que el usuario autenticado coincida con el userId (o sea supervisor/admin)
      if (req.user.id !== parseInt(userId) && !['supervisor', 'admin'].includes(req.user.rol)) {
        return res.status(403).json({
          error: 'No autorizado',
          message: 'Solo puedes registrar fichadas para tu propio usuario'
        });
      }

      // Verificar que el usuario existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
          userId: userId
        });
      }

      if (!user.activo) {
        return res.status(400).json({
          error: 'El usuario está inactivo',
          user: user.nombre
        });
      }

      // Verificar que la obra existe
      const obra = await Obra.findByPk(obraId);
      if (!obra) {
        return res.status(404).json({
          error: 'Obra no encontrada',
          obraId: obraId
        });
      }

      if (!obra.activa) {
        return res.status(400).json({
          error: 'La obra está inactiva',
          obra: obra.nombre
        });
      }

      // Verificar que el QR no ha expirado (más de 5 minutos)
      const qrTimestamp = new Date(timestamp);
      const now = new Date();
      const diffMinutes = (now - qrTimestamp) / (1000 * 60);
      const expiryMinutes = parseInt(process.env.QR_EXPIRY_MINUTES) || 5;

      if (diffMinutes > expiryMinutes) {
        return res.status(400).json({
          error: `QR expirado. Válido por ${expiryMinutes} minutos`,
          generated: qrTimestamp.toLocaleString(),
          scanned: now.toLocaleString(),
          minutesElapsed: Math.round(diffMinutes * 100) / 100
        });
      }

      // Calcular distancia desde la obra
      const distancia = this.calcularDistancia(
        parseFloat(lat), 
        parseFloat(long), 
        parseFloat(obra.lat), 
        parseFloat(obra.long)
      );

      // Verificar que el usuario esté dentro del radio permitido
      if (distancia > obra.radioPermitido) {
        return res.status(400).json({
          error: 'Fuera del radio permitido para la obra',
          distancia: Math.round(distancia),
          radioPermitido: obra.radioPermitido,
          obra: obra.nombre,
          mensaje: `Debes estar a menos de ${obra.radioPermitido}m de la obra para fichar`
        });
      }

      // Crear la fichada
      const fichada = await Fichada.create({
        obraId: parseInt(obraId),
        userId: parseInt(userId),
        timestamp: now, // Usar timestamp actual, no el del QR
        tipo,
        lat: parseFloat(lat),
        long: parseFloat(long),
        telefono,
        aprobado: false,
        distanciaObra: Math.round(distancia)
      });

      // Obtener la fichada con relaciones para la respuesta
      const fichadaCompleta = await Fichada.findByPk(fichada.id, {
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'dni']
          },
          {
            model: Obra,
            as: 'obra',
            attributes: ['id', 'nombre', 'direccion']
          }
        ]
      });

      console.log(`✅ Fichada registrada: ${user.nombre} - ${tipo} en ${obra.nombre} (${Math.round(distancia)}m)`);

      res.json({
        success: true,
        message: 'Fichada registrada correctamente',
        data: {
          fichada: {
            id: fichadaCompleta.id,
            usuario: fichadaCompleta.usuario.nombre,
            obra: fichadaCompleta.obra.nombre,
            tipo: fichadaCompleta.tipo,
            timestamp: fichadaCompleta.timestamp,
            distanciaObra: fichadaCompleta.distanciaObra,
            aprobado: fichadaCompleta.aprobado,
            coordenadas: {
              lat: parseFloat(fichadaCompleta.lat),
              long: parseFloat(fichadaCompleta.long)
            }
          }
        }
      });

    } catch (error) {
      console.error('❌ Error al procesar fichada:', error);
      res.status(500).json({
        error: 'Error interno del servidor al procesar la fichada',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * POST /fichada/aprobar
   * Aprueba una fichada por ID (para supervisores)
   */
  static async aprobarFichada(req, res) {
    try {
      const { fichadaId } = req.body;

      if (!fichadaId) {
        return res.status(400).json({
          error: 'El campo fichadaId es requerido'
        });
      }

      // Buscar la fichada
      const fichada = await Fichada.findByPk(fichadaId, {
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['nombre', 'dni']
          },
          {
            model: Obra,
            as: 'obra',
            attributes: ['nombre', 'direccion']
          }
        ]
      });

      if (!fichada) {
        return res.status(404).json({
          error: 'Fichada no encontrada',
          fichadaId
        });
      }

      if (fichada.aprobado) {
        return res.status(400).json({
          error: 'La fichada ya está aprobada',
          fichada: {
            id: fichada.id,
            usuario: fichada.usuario.nombre,
            obra: fichada.obra.nombre,
            timestamp: fichada.timestamp
          }
        });
      }

      // Aprobar la fichada
      fichada.aprobado = true;
      await fichada.save();

      console.log(`✅ Fichada aprobada por supervisor: ${fichada.usuario.nombre} - ${fichada.tipo} en ${fichada.obra.nombre}`);

      res.json({
        success: true,
        message: 'Fichada aprobada correctamente',
        data: {
          fichada: {
            id: fichada.id,
            usuario: fichada.usuario.nombre,
            obra: fichada.obra.nombre,
            tipo: fichada.tipo,
            timestamp: fichada.timestamp,
            distanciaObra: fichada.distanciaObra,
            aprobado: fichada.aprobado,
            updatedAt: fichada.updatedAt
          }
        }
      });

    } catch (error) {
      console.error('❌ Error al aprobar fichada:', error);
      res.status(500).json({
        error: 'Error interno del servidor al aprobar la fichada',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * GET /fichada/lista/:userId?
   * Obtiene las fichadas de un usuario específico o todas
   */
  static async listarFichadas(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0, obraId } = req.query;

      const whereClause = {};
      if (userId) whereClause.userId = userId;
      if (obraId) whereClause.obraId = obraId;

      const fichadas = await Fichada.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['nombre', 'dni']
          },
          {
            model: Obra,
            as: 'obra',
            attributes: ['nombre', 'direccion']
          }
        ],
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          total: fichadas.count,
          fichadas: fichadas.rows.map(f => ({
            id: f.id,
            usuario: f.usuario.nombre,
            obra: f.obra.nombre,
            tipo: f.tipo,
            timestamp: f.timestamp,
            distanciaObra: f.distanciaObra,
            telefono: f.telefono,
            aprobado: f.aprobado
          }))
        }
      });

    } catch (error) {
      console.error('❌ Error al listar fichadas:', error);
      res.status(500).json({
        error: 'Error interno del servidor al listar fichadas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * GET /fichada/obras
   * Lista todas las obras activas
   */
  static async listarObras(req, res) {
    try {
      const obras = await Obra.findAll({
        where: { activa: true },
        attributes: ['id', 'nombre', 'direccion', 'lat', 'long', 'radioPermitido'],
        order: [['nombre', 'ASC']]
      });

      res.json({
        success: true,
        data: obras
      });

    } catch (error) {
      console.error('❌ Error al listar obras:', error);
      res.status(500).json({
        error: 'Error interno del servidor al listar obras',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * GET /fichada/usuarios
   * Lista todos los usuarios activos
   */
  static async listarUsuarios(req, res) {
    try {
      const usuarios = await User.findAll({
        where: { activo: true },
        attributes: ['id', 'nombre', 'dni'],
        order: [['nombre', 'ASC']]
      });

      res.json({
        success: true,
        data: usuarios
      });

    } catch (error) {
      console.error('❌ Error al listar usuarios:', error);
      res.status(500).json({
        error: 'Error interno del servidor al listar usuarios',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = FichadaController;
