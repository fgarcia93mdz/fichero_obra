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

      // Crear el payload que se codificará en el QR (ESTÁTICO POR OBRA)
      const qrPayload = {
        obraId: parseInt(obraId),
        obraNombre: obra.nombre,
        // Hash estático basado solo en el ID de la obra
        hash: Buffer.from(`obra-${obraId}-${obra.nombre}`).toString('base64').substring(0, 16)
      };

      // Generar el QR code en base64 (SIEMPRE EL MISMO PARA LA MISMA OBRA)
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

      console.log(`📱 QR estático generado para obra: ${obra.nombre} por usuario: ${req.user.nombre}`);

      res.json({
        success: true,
        message: 'QR estático generado correctamente',
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
          esEstatico: true,
          generadoPor: req.user.nombre,
          nota: 'Este QR es permanente para esta obra y no cambia'
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
      .optional()
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
   * Validaciones para listar fichadas
   */
  static listarFichadasValidations = [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page debe ser un número entero positivo'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit debe ser un número entero entre 1 y 100'),
    query('obraId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('obraId debe ser un número entero positivo'),
    query('userId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('userId debe ser un número entero positivo'),
    query('desde')
      .optional()
      .isISO8601()
      .withMessage('desde debe ser una fecha válida en formato ISO'),
    query('hasta')
      .optional()
      .isISO8601()
      .withMessage('hasta debe ser una fecha válida en formato ISO')
  ];

  /**
   * Validaciones para aprobar fichada
   */
  static aprobarFichadaValidations = [
    param('id')
      .isInt({ min: 1 })
      .withMessage('id debe ser un número entero positivo')
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

      // Los QRs son ahora estáticos (no expiran) - eliminada validación de timestamp

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

      // Timestamp actual para la fichada
      const now = new Date();

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

  /**
   * GET /fichada/estadisticas
   * Obtiene estadísticas de fichadas (requiere rol supervisor/admin)
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const { desde, hasta } = req.query;
      
      // Filtros de fecha
      const whereConditions = {};
      if (desde || hasta) {
        whereConditions.timestamp = {};
        if (desde) {
          whereConditions.timestamp[require('sequelize').Op.gte] = new Date(desde);
        }
        if (hasta) {
          whereConditions.timestamp[require('sequelize').Op.lte] = new Date(hasta);
        }
      }

      // Si es empleado, solo sus propias estadísticas
      if (req.user.rol === 'empleado') {
        whereConditions.userId = req.user.id;
      }

      // Contar fichadas por tipo
      const fichadasPorTipo = await Fichada.findAll({
        where: whereConditions,
        attributes: [
          'tipo',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'cantidad']
        ],
        group: ['tipo']
      });

      // Contar fichadas por estado de aprobación
      const fichadasPorEstado = await Fichada.findAll({
        where: whereConditions,
        attributes: [
          'aprobado',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'cantidad']
        ],
        group: ['aprobado']
      });

      // Fichadas por obra (solo para supervisores/admin)
      let fichadasPorObra = [];
      if (['supervisor', 'admin'].includes(req.user.rol)) {
        fichadasPorObra = await Fichada.findAll({
          where: whereConditions,
          attributes: [
            'obraId',
            [require('sequelize').fn('COUNT', require('sequelize').col('Fichada.id')), 'cantidad']
          ],
          include: [{
            model: Obra,
            as: 'obra',
            attributes: ['nombre']
          }],
          group: ['obraId', 'obra.id', 'obra.nombre']
        });
      }

      // Total de fichadas
      const totalFichadas = await Fichada.count({
        where: whereConditions
      });

      console.log(`📊 Consultando estadísticas de fichadas: ${totalFichadas} total`);

      res.json({
        success: true,
        message: 'Estadísticas obtenidas correctamente',
        data: {
          resumen: {
            totalFichadas,
            periodo: {
              desde: desde || 'Sin límite',
              hasta: hasta || 'Sin límite'
            }
          },
          porTipo: fichadasPorTipo.reduce((acc, item) => {
            acc[item.tipo] = parseInt(item.get('cantidad'));
            return acc;
          }, { entrada: 0, salida: 0 }),
          porEstado: fichadasPorEstado.reduce((acc, item) => {
            const estado = item.aprobado ? 'aprobadas' : 'pendientes';
            acc[estado] = parseInt(item.get('cantidad'));
            return acc;
          }, { aprobadas: 0, pendientes: 0 }),
          porObra: fichadasPorObra.map(item => ({
            obraId: item.obraId,
            obra: item.obra.nombre,
            cantidad: parseInt(item.get('cantidad'))
          }))
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      res.status(500).json({
        error: 'Error interno del servidor al obtener estadísticas',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = FichadaController;
