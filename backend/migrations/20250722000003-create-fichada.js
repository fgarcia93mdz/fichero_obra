'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fichadas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      obraId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID de la obra donde se realiza la fichada',
        references: {
          model: 'obras',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario que realiza la fichada',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha y hora de la fichada'
      },
      tipo: {
        type: Sequelize.ENUM('entrada', 'salida'),
        allowNull: false,
        comment: 'Tipo de fichada: entrada o salida'
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
        comment: 'Latitud desde donde se realizó la fichada',
        validate: {
          min: -90,
          max: 90
        }
      },
      long: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false,
        comment: 'Longitud desde donde se realizó la fichada',
        validate: {
          min: -180,
          max: 180
        }
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Teléfono del usuario que realizó la fichada'
      },
      aprobado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si la fichada fue aprobada/confirmada por un supervisor'
      },
      distanciaObra: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Distancia en metros desde la ubicación de la obra'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones adicionales sobre la fichada'
      },
      aprobadoPor: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que aprobó la fichada',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fechaAprobacion: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de aprobación'
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
      comment: 'Tabla de registro de fichadas con geolocalización y aprobación'
    });

    // Crear índices
    await queryInterface.addIndex('fichadas', ['obraId'], {
      name: 'fichadas_obra_id_index'
    });

    await queryInterface.addIndex('fichadas', ['userId'], {
      name: 'fichadas_user_id_index'
    });

    await queryInterface.addIndex('fichadas', ['timestamp'], {
      name: 'fichadas_timestamp_index'
    });

    await queryInterface.addIndex('fichadas', ['tipo'], {
      name: 'fichadas_tipo_index'
    });

    await queryInterface.addIndex('fichadas', ['aprobado'], {
      name: 'fichadas_aprobado_index'
    });

    await queryInterface.addIndex('fichadas', ['userId', 'obraId', 'timestamp'], {
      name: 'fichadas_user_obra_time_index'
    });

    await queryInterface.addIndex('fichadas', ['aprobadoPor'], {
      name: 'fichadas_aprobado_por_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fichadas');
  }
};
