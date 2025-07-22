const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const bcrypt = require('bcrypt');

// Modelo de Usuario con roles y autenticación
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre completo del empleado'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Número de teléfono del empleado'
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'DNI o documento de identidad'
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
    comment: 'Email del empleado'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Contraseña hasheada'
  },
  rol: {
    type: DataTypes.ENUM('empleado', 'supervisor', 'admin'),
    allowNull: false,
    defaultValue: 'empleado',
    comment: 'Rol del usuario en el sistema'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el empleado está activo en el sistema'
  }
}, {
  tableName: 'users',
  timestamps: true,
  comment: 'Tabla de empleados/usuarios del sistema con roles',
  hooks: {
    // Hash password antes de crear
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    // Hash password antes de actualizar
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

// Métodos de instancia
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password; // No exponer la contraseña
  return values;
};

// Métodos estáticos
User.findByDni = function(dni) {
  return this.findOne({ where: { dni, activo: true } });
};

User.findByEmail = function(email) {
  return this.findOne({ where: { email, activo: true } });
};

User.findByRole = function(rol) {
  return this.findAll({ where: { rol, activo: true } });
};

module.exports = User;
