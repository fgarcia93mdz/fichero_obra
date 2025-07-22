/**
 * Controlador para gestión de obras
 * Maneja las operaciones CRUD de obras/proyectos
 */

const { Obra } = require('../models');
const { validationResult } = require('express-validator');

class ObraController {
  /**
   * Listar todas las obras activas
   * GET /api/obras
   */
  static async listarObras(req, res) {
    try {
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
  }

  /**
   * Obtener una obra específica por ID
   * GET /api/obras/:id
   */
  static async obtenerObra(req, res) {
    try {
      const { id } = req.params;

      const obra = await Obra.findOne({
        where: { 
          id: id,
          activa: true 
        },
        attributes: [
          'id', 'nombre', 'descripcion', 'direccion', 
          'lat', 'long', 'radioPermitido', 'activa',
          'fechaInicio', 'fechaFinEstimada', 'createdAt'
        ]
      });

      if (!obra) {
        return res.status(404).json({
          success: false,
          message: 'Obra no encontrada o inactiva'
        });
      }

      res.json({
        success: true,
        message: 'Obra obtenida correctamente',
        data: obra
      });

    } catch (error) {
      console.error('Error al obtener obra:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear nueva obra (solo admin)
   * POST /api/obras
   */
  static async crearObra(req, res) {
    try {
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const {
        nombre,
        descripcion,
        direccion,
        lat,
        long,
        radioPermitido,
        fechaInicio,
        fechaFinEstimada
      } = req.body;

      const nuevaObra = await Obra.create({
        nombre,
        descripcion,
        direccion,
        lat,
        long,
        radioPermitido: radioPermitido || 100,
        activa: true,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFinEstimada: fechaFinEstimada ? new Date(fechaFinEstimada) : null
      });

      res.status(201).json({
        success: true,
        message: 'Obra creada correctamente',
        data: nuevaObra
      });

    } catch (error) {
      console.error('Error al crear obra:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar obra existente (solo admin)
   * PUT /api/obras/:id
   */
  static async actualizarObra(req, res) {
    try {
      const { id } = req.params;
      
      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const obra = await Obra.findByPk(id);
      if (!obra) {
        return res.status(404).json({
          success: false,
          message: 'Obra no encontrada'
        });
      }

      const {
        nombre,
        descripcion,
        direccion,
        lat,
        long,
        radioPermitido,
        activa,
        fechaInicio,
        fechaFinEstimada
      } = req.body;

      await obra.update({
        nombre: nombre || obra.nombre,
        descripcion: descripcion !== undefined ? descripcion : obra.descripcion,
        direccion: direccion !== undefined ? direccion : obra.direccion,
        lat: lat !== undefined ? lat : obra.lat,
        long: long !== undefined ? long : obra.long,
        radioPermitido: radioPermitido !== undefined ? radioPermitido : obra.radioPermitido,
        activa: activa !== undefined ? activa : obra.activa,
        fechaInicio: fechaInicio !== undefined ? (fechaInicio ? new Date(fechaInicio) : null) : obra.fechaInicio,
        fechaFinEstimada: fechaFinEstimada !== undefined ? (fechaFinEstimada ? new Date(fechaFinEstimada) : null) : obra.fechaFinEstimada
      });

      res.json({
        success: true,
        message: 'Obra actualizada correctamente',
        data: obra
      });

    } catch (error) {
      console.error('Error al actualizar obra:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: error.errors.map(e => ({
            field: e.path,
            message: e.message
          }))
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Desactivar obra (soft delete)
   * DELETE /api/obras/:id
   */
  static async desactivarObra(req, res) {
    try {
      const { id } = req.params;

      const obra = await Obra.findByPk(id);
      if (!obra) {
        return res.status(404).json({
          success: false,
          message: 'Obra no encontrada'
        });
      }

      await obra.update({ activa: false });

      res.json({
        success: true,
        message: 'Obra desactivada correctamente',
        data: { id: obra.id, activa: false }
      });

    } catch (error) {
      console.error('Error al desactivar obra:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = ObraController;
