'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const obras = [
      {
        nombre: 'Edificio Residencial Centro',
        descripcion: 'Construcción de edificio de 10 pisos en pleno centro de Mendoza. Incluye subsuelo para cocheras y local comercial en planta baja.',
        direccion: 'Av. San Martín 1234, Mendoza Capital',
        lat: -32.89080000,
        long: -68.82720000,
        radioPermitido: 150,
        activa: true,
        fechaInicio: new Date('2024-01-15'),
        fechaFinEstimada: new Date('2025-06-30'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Casa Quinta Maipú',
        descripcion: 'Refacción integral de casa quinta estilo colonial. Incluye piscina, quincho y ampliación de living.',
        direccion: 'Calle Los Álamos 567, Maipú, Mendoza',
        lat: -32.98330000,
        long: -68.78330000,
        radioPermitido: 100,
        activa: true,
        fechaInicio: new Date('2024-03-01'),
        fechaFinEstimada: new Date('2024-12-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Oficinas Godoy Cruz',
        descripcion: 'Remodelación completa de oficinas comerciales. Modernización de instalaciones eléctricas y aire acondicionado.',
        direccion: 'Av. Hipólito Yrigoyen 890, Godoy Cruz, Mendoza',
        lat: -32.92670000,
        long: -68.84170000,
        radioPermitido: 80,
        activa: true,
        fechaInicio: new Date('2024-02-10'),
        fechaFinEstimada: new Date('2024-08-30'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Complejo Industrial Las Heras',
        descripcion: 'Construcción de nave industrial para empresa alimentaria. Incluye cámaras frigoríficas y línea de producción.',
        direccion: 'Ruta Provincial 82 km 15, Las Heras, Mendoza',
        lat: -32.85000000,
        long: -68.65000000,
        radioPermitido: 200,
        activa: true,
        fechaInicio: new Date('2024-04-01'),
        fechaFinEstimada: new Date('2025-10-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Shopping Mall Luján',
        descripcion: 'Construcción de centro comercial de gran escala. 3 niveles con más de 100 locales comerciales.',
        direccion: 'Av. Acceso Este 2500, Luján de Cuyo, Mendoza',
        lat: -33.03330000,
        long: -68.83330000,
        radioPermitido: 300,
        activa: true,
        fechaInicio: new Date('2024-01-01'),
        fechaFinEstimada: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Viviendas Sociales Tunuyán',
        descripcion: 'Plan de construcción de 50 viviendas sociales en el departamento de Tunuyán.',
        direccion: 'Barrio Nuevo Tunuyán, Mendoza',
        lat: -33.57500000,
        long: -69.02000000,
        radioPermitido: 250,
        activa: false,
        fechaInicio: new Date('2023-08-01'),
        fechaFinEstimada: new Date('2024-05-31'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('obras', obras, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('obras', null, {});
  }
};
