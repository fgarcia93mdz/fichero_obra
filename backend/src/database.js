const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la conexión a MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'fichero_obra',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desactivar logs SQL en consola
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
};

module.exports = { sequelize, testConnection };
