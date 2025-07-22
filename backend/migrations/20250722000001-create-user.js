'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre completo del empleado'
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Número de teléfono del empleado'
      },
      dni: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'DNI o documento de identidad'
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: true,
        unique: true,
        comment: 'Email del empleado'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Contraseña hasheada'
      },
      rol: {
        type: Sequelize.ENUM('empleado', 'supervisor', 'admin'),
        allowNull: false,
        defaultValue: 'empleado',
        comment: 'Rol del usuario en el sistema'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si el empleado está activo en el sistema'
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
      comment: 'Tabla de empleados/usuarios del sistema con roles'
    });

    // Crear índices
    await queryInterface.addIndex('users', ['dni'], {
      unique: true,
      name: 'users_dni_unique'
    });

    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique'
    });

    await queryInterface.addIndex('users', ['rol'], {
      name: 'users_rol_index'
    });

    await queryInterface.addIndex('users', ['activo'], {
      name: 'users_activo_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
