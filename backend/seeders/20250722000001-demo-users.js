'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 12;
    const users = [
      {
        nombre: 'Juan Pérez',
        telefono: '+54261123456',
        dni: '12345678',
        email: 'juan.perez@ejemplo.com',
        password: await bcrypt.hash('123', saltRounds),
        rol: 'empleado',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'María García',
        telefono: '+54261654321',
        dni: '87654321',
        email: 'maria.garcia@ejemplo.com',
        password: await bcrypt.hash('456', saltRounds),
        rol: 'empleado',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Carlos López',
        telefono: '+54261789012',
        dni: '11223344',
        email: 'carlos.lopez@ejemplo.com',
        password: await bcrypt.hash('789', saltRounds),
        rol: 'supervisor',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Ana Rodriguez',
        telefono: '+54261555777',
        dni: '55667788',
        email: 'ana.rodriguez@ejemplo.com',
        password: await bcrypt.hash('abc', saltRounds),
        rol: 'empleado',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Diego Martinez',
        telefono: '+54261999888',
        dni: '99887766',
        email: 'diego.martinez@ejemplo.com',
        password: await bcrypt.hash('admin123', saltRounds),
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
