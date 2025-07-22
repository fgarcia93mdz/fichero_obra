const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

// Modelo de Obra - Lugares de trabajo donde se puede fichar
const Obra = sequelize.define('Obra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nombre identificador de la obra'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada de la obra'
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección física de la obra'
  },
  lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    comment: 'Latitud de la ubicación de la obra',
    validate: {
      min: -90,
      max: 90
    }
  },
  long: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    comment: 'Longitud de la ubicación de la obra',
    validate: {
      min: -180,
      max: 180
    }
  },
  radioPermitido: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    comment: 'Radio en metros permitido para fichar desde la obra'
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si la obra está activa para fichadas'
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de inicio de la obra'
  },
  fechaFinEstimada: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha estimada de finalización'
  }
}, {
  tableName: 'obras',
  timestamps: true,
  comment: 'Tabla de obras/proyectos donde se pueden realizar fichadas'
});

// Métodos estáticos
Obra.findActivas = function() {
  return this.findAll({ 
    where: { activa: true },
    order: [['nombre', 'ASC']]
  });
};

Obra.findByLocation = function(lat, long, radiusKm = 10) {
  // Búsqueda por proximidad geográfica
  const sequelize = require('sequelize');
  return this.findAll({
    where: sequelize.literal(
      `(6371 * acos(cos(radians(${lat})) * cos(radians(lat)) * cos(radians(long) - radians(${long})) + sin(radians(${lat})) * sin(radians(lat)))) < ${radiusKm}`
    ),
    order: sequelize.literal(
      `(6371 * acos(cos(radians(${lat})) * cos(radians(lat)) * cos(radians(long) - radians(${long})) + sin(radians(${lat})) * sin(radians(lat))))`
    )
  });
};

module.exports = Obra;
