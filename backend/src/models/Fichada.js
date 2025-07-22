const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const User = require('./User');
const Obra = require('./Obra');

// Modelo de Fichada - Registro de entrada y salida con geolocalización
const Fichada = sequelize.define('Fichada', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  obraId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Obra,
      key: 'id'
    },
    comment: 'ID de la obra donde se realiza la fichada'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    comment: 'ID del usuario que realiza la fichada'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de la fichada'
  },
  tipo: {
    type: DataTypes.ENUM('entrada', 'salida'),
    allowNull: false,
    comment: 'Tipo de fichada: entrada o salida'
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    comment: 'Latitud desde donde se realizó la fichada',
    validate: {
      min: -90,
      max: 90
    }
  },
  long: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    comment: 'Longitud desde donde se realizó la fichada',
    validate: {
      min: -180,
      max: 180
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Teléfono del usuario que realizó la fichada'
  },
  aprobado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Si la fichada fue aprobada/confirmada por un supervisor'
  },
  distanciaObra: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Distancia en metros desde la ubicación de la obra'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observaciones adicionales sobre la fichada'
  },
  aprobadoPor: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    comment: 'ID del usuario que aprobó la fichada'
  },
  fechaAprobacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de aprobación'
  }
}, {
  tableName: 'fichadas',
  timestamps: true,
  comment: 'Tabla de registro de fichadas con geolocalización y aprobación'
});

// Establecer relaciones
Fichada.belongsTo(User, { foreignKey: 'userId', as: 'usuario' });
Fichada.belongsTo(Obra, { foreignKey: 'obraId', as: 'obra' });
Fichada.belongsTo(User, { foreignKey: 'aprobadoPor', as: 'supervisor' });

User.hasMany(Fichada, { foreignKey: 'userId', as: 'fichadas' });
User.hasMany(Fichada, { foreignKey: 'aprobadoPor', as: 'fichadasAprobadas' });
Obra.hasMany(Fichada, { foreignKey: 'obraId', as: 'fichadas' });

// Métodos estáticos
Fichada.findPendientes = function(limit = 50, offset = 0) {
  return this.findAndCountAll({
    where: { aprobado: false },
    include: [
      { model: User, as: 'usuario', attributes: ['id', 'nombre', 'dni'] },
      { model: Obra, as: 'obra', attributes: ['id', 'nombre'] }
    ],
    order: [['timestamp', 'DESC']],
    limit,
    offset
  });
};

Fichada.findByDateRange = function(fechaInicio, fechaFin, options = {}) {
  const where = {
    timestamp: {
      [require('sequelize').Op.between]: [fechaInicio, fechaFin]
    }
  };

  if (options.userId) where.userId = options.userId;
  if (options.obraId) where.obraId = options.obraId;
  if (options.aprobado !== undefined) where.aprobado = options.aprobado;

  return this.findAndCountAll({
    where,
    include: [
      { model: User, as: 'usuario', attributes: ['id', 'nombre', 'dni'] },
      { model: Obra, as: 'obra', attributes: ['id', 'nombre'] },
      { model: User, as: 'supervisor', attributes: ['id', 'nombre'], required: false }
    ],
    order: [['timestamp', 'DESC']],
    limit: options.limit || 50,
    offset: options.offset || 0
  });
};

// Métodos de instancia
Fichada.prototype.aprobar = async function(supervisorId) {
  this.aprobado = true;
  this.aprobadoPor = supervisorId;
  this.fechaAprobacion = new Date();
  return await this.save();
};

module.exports = Fichada;
