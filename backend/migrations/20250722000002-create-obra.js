'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('obras', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Nombre identificador de la obra'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada de la obra'
      },
      direccion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Dirección física de la obra'
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
        comment: 'Latitud de la ubicación de la obra',
        validate: {
          min: -90,
          max: 90
        }
      },
      long: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        comment: 'Longitud de la ubicación de la obra',
        validate: {
          min: -180,
          max: 180
        }
      },
      radioPermitido: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
        comment: 'Radio en metros permitido para fichar desde la obra'
      },
      activa: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si la obra está activa para fichadas'
      },
      fechaInicio: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de inicio de la obra'
      },
      fechaFinEstimada: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha estimada de finalización'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    }, {
      comment: 'Tabla de obras/proyectos donde se pueden realizar fichadas'
    });

    // Crear índices
    await queryInterface.addIndex('obras', ['nombre'], {
      name: 'obras_nombre_index'
    });

    await queryInterface.addIndex('obras', ['activa'], {
      name: 'obras_activa_index'
    });

    await queryInterface.addIndex('obras', ['lat', 'long'], {
      name: 'obras_location_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('obras');
  }
};
