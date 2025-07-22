const { sequelize } = require('../database');
const User = require('./User');
const Obra = require('./Obra');
const Fichada = require('./Fichada');

// Función para sincronizar todas las tablas
const syncDatabase = async (force = false) => {
  try {
    // Sincronizar en orden: User, Obra, luego Fichada (por las relaciones)
    await sequelize.sync({ force });
    console.log('✅ Base de datos sincronizada correctamente');
    
    // Si es la primera vez (force = true), crear datos de ejemplo
    if (force) {
      await createSampleData();
    }
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

// Función para crear datos de ejemplo
const createSampleData = async () => {
  try {
    // Crear usuarios de ejemplo
    const sampleUsers = [
      {
        nombre: 'Juan Pérez',
        dni: '12345678',
        activo: true
      },
      {
        nombre: 'María García',
        dni: '87654321',
        activo: true
      },
      {
        nombre: 'Carlos López',
        dni: '11223344',
        activo: true
      }
    ];

    for (const userData of sampleUsers) {
      await User.findOrCreate({
        where: { dni: userData.dni },
        defaults: userData
      });
    }

    // Crear obras de ejemplo
    const sampleObras = [
      {
        nombre: 'Edificio Residencial Centro',
        direccion: 'Av. San Martín 1234, Mendoza',
        lat: -32.8908,
        long: -68.8272,
        radioPermitido: 150,
        descripcion: 'Construcción de edificio de 10 pisos'
      },
      {
        nombre: 'Casa Quinta Maipú',
        direccion: 'Calle Los Álamos 567, Maipú',
        lat: -32.9833,
        long: -68.7833,
        radioPermitido: 100,
        descripcion: 'Refacción integral de casa quinta'
      },
      {
        nombre: 'Oficinas Godoy Cruz',
        direccion: 'Av. Hipólito Yrigoyen 890, Godoy Cruz',
        lat: -32.9267,
        long: -68.8417,
        radioPermitido: 80,
        descripcion: 'Remodelación de oficinas comerciales'
      }
    ];

    for (const obraData of sampleObras) {
      await Obra.findOrCreate({
        where: { nombre: obraData.nombre },
        defaults: obraData
      });
    }

    console.log('✅ Datos de ejemplo creados (usuarios y obras)');
  } catch (error) {
    console.error('❌ Error al crear datos de ejemplo:', error);
  }
};

module.exports = {
  User,
  Obra,
  Fichada,
  syncDatabase
};
