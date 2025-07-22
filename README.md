# 🏗️ Sistema de Fichadas por QR con Geolocalización

Mini-sistema completo para registro de fichadas (entrada/salida) usando códigos QR y geolocalización, desarrollado con Node.js (Express + Sequelize + MySQL) en el backend y React en el frontend.

## 🚀 Características

- **Generación de QR por obra**: Cada obra tiene su propio QR con tiempo de expiración
- **Geolocalización obligatoria**: Los usuarios deben estar dentro del radio permitido de la obra
- **Autenticación simulada**: Login con usuarios de prueba y JWT mock
- **Validaciones de seguridad**: QR con expiración, verificación de distancia, usuario activo
- **Interfaz responsive**: Funciona en desktop y móvil
- **Scanner QR integrado**: Usando la cámara del dispositivo

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js**
- **Sequelize** ORM + **MySQL**
- **QRCode** para generación de códigos QR
- **CORS** para comunicación con frontend

### Frontend
- **React 18** con hooks
- **react-qr-reader** para escaneo de QR
- **axios** para llamadas a API
- **react-toastify** para notificaciones
- **react-router-dom** para navegación

## 📋 Instalación y Configuración

### Prerrequisitos
- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

### 1. Configurar la Base de Datos

```sql
-- Crear la base de datos
CREATE DATABASE fichero_obra;

-- Crear un usuario (opcional)
CREATE USER 'fichero_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON fichero_obra.* TO 'fichero_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Instalar Backend

```bash
cd backend
npm install
```

Configurar variables de entorno (`.env`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fichero_obra
DB_USER=root
DB_PASS=

PORT=3001
NODE_ENV=development
QR_EXPIRY_MINUTES=5
```

Inicializar base de datos con datos de ejemplo:
```bash
# Cambiar syncDatabase(false) por syncDatabase(true) en src/server.js solo la primera vez
npm run dev
```

### 3. Instalar Frontend

```bash
cd frontend
npm install
npm start
```

## 🎯 Uso del Sistema

### Paso 1: Autenticación
- Accede a `http://localhost:3000`
- Usa uno de los usuarios de prueba:
  - **Juan Pérez**: DNI `12345678`, contraseña `123`
  - **María García**: DNI `87654321`, contraseña `456`
  - **Carlos López**: DNI `11223344`, contraseña `789`

### Paso 2: Generar QR para Obra
1. Ve a la pestaña "🏗️ Generar QR"
2. Selecciona una obra de la lista
3. Haz clic en "Generar QR"
4. El QR será válido por 5 minutos

### Paso 3: Escanear y Fichar
1. Ve a la pestaña "📱 Escanear QR"
2. Haz clic en "Obtener Ubicación" (requerido)
3. Haz clic en "Iniciar Escaneo"
4. Escanea el QR generado
5. Selecciona "ENTRADA" o "SALIDA"
6. ✅ ¡Fichada registrada!

## 🗂️ Estructura del Proyecto

```
fichero_obra/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── FichadaController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Obra.js
│   │   │   ├── Fichada.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── database.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── QRButtonObra.jsx
│   │   │   └── QRScannerFichada.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   └── package.json
└── # 📱 Sistema de Fichadas QR - Fichero Obra

Sistema integral de control de fichadas mediante códigos QR para gestión de asistencia en obras de construcción, desarrollado con **Node.js + Express** (backend) y **React** (frontend).

## 🚀 Características Principales

### 🔐 **Autenticación y Autorización**
- **JWT (JSON Web Tokens)** para autenticación segura
- **Roles de usuario**: Empleado, Supervisor, Admin
- **Bcrypt** para hash seguro de contraseñas
- **Middleware de autorización** por rutas

### 📍 **Geolocalización Inteligente**
- **Validación de ubicación** mediante GPS
- **Cálculo de distancia** con fórmula de Haversine
- **Radio permitido** configurable por obra
- **Control de perímetro** para fichadas válidas

### 📱 **Escáner QR Avanzado**
- **Biblioteca QrScanner** (reemplazó react-qr-reader)
- **Generación de QR** con expiración configurable
- **Validación temporal** de códigos QR
- **Interfaz responsive** para móviles

### 📊 **Panel de Control Completo**
- **Dashboard administrativo** con estadísticas
- **Listado de fichadas** con filtros avanzados
- **Sistema de aprobación** para supervisores
- **Reportes** por obra y empleado

## 🛠️ Stack Tecnológico

### Backend
```
Node.js 18+
Express.js 4.18.2
Sequelize ORM 6.37.7
MySQL 8.0+
JWT + Bcrypt
Helmet + Rate Limiting
Express Validator
```

### Frontend
```
React 18
React Router DOM 6.28.0
Axios para HTTP
QrScanner para QR
React Toastify
CSS Responsive
```

## 📁 Estructura del Proyecto

```
fichero_obra/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middlewares/     # Autenticación y validación
│   │   ├── models/         # Modelos de Sequelize
│   │   ├── routes/         # Rutas de la API
│   │   └── app.js          # Configuración del servidor
│   ├── config/
│   │   ├── config.js       # Configuración de DB
│   │   └── database.js     # Conexión Sequelize
│   ├── migrations/         # Migraciones de BD
│   ├── seeders/           # Datos de ejemplo
│   ├── .env               # Variables de entorno
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # API calls
│   │   └── App.js         # Componente principal
│   └── package.json
└── README.md
```

## ⚙️ Instalación y Configuración

### 1. **Requisitos Previos**
```bash
Node.js 18+
MySQL 8.0+
Git
```

### 2. **Clonar e Instalar**
```bash
# Clonar repositorio
git clone <repository-url>
cd fichero_obra

# Backend
cd backend
npm install

# Frontend
cd ../frontend  
npm install
```

### 3. **Configuración de Base de Datos**

#### **Crear archivo `.env` en `/backend/`**:
```properties
# =============================================================================
# CONFIGURACIÓN DE BASE DE DATOS
# =============================================================================

# MySQL Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=fichero_obra
DB_DIALECT=mysql

# Configuración del Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=supersecretjwtkey2024
JWT_EXPIRES_IN=24h

# Configuración de QR
QR_EXPIRY_MINUTES=5

# Bcrypt salt rounds
BCRYPT_SALT_ROUNDS=12
```

### 4. **Inicializar Base de Datos**
```bash
cd backend

# Crear base de datos
npx sequelize-cli db:create

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Cargar datos de ejemplo
npx sequelize-cli db:seed:all
```

## 🚀 Ejecución del Sistema

### **Backend** (Puerto 3001)
```bash
cd backend
npm run dev
```

### **Frontend** (Puerto 3000)  
```bash
cd frontend
npm start
```

### **URLs de Acceso**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 👤 Usuarios de Prueba

| Email | Contraseña | Rol | DNI |
|-------|-----------|-----|-----|
| `juan.perez@ejemplo.com` | `123456` | Empleado | 12345678 |
| `maria.garcia@ejemplo.com` | `123456` | Empleado | 87654321 |
| `carlos.lopez@ejemplo.com` | `123456` | Supervisor | 11223344 |
| `ana.rodriguez@ejemplo.com` | `123456` | Empleado | 55667788 |
| `diego.martinez@ejemplo.com` | `123456` | Admin | 99887766 |

## 📊 Base de Datos

### **Tablas Principales**

#### **`users`** - Empleados del sistema
```sql
- id, nombre, telefono, dni, email
- password (hasheado), rol, activo
- timestamps automáticos
```

#### **`obras`** - Proyectos de construcción  
```sql
- id, nombre, descripcion, direccion
- lat, long, radioPermitido, activa
- fechaInicio, fechaFinEstimada
```

#### **`fichadas`** - Registro de asistencia
```sql  
- id, obraId, userId, timestamp, tipo
- lat, long, telefono, aprobado
- distanciaObra, observaciones
- aprobadoPor, fechaAprobacion
```

## 🔐 API Endpoints

### **Autenticación**
```http
POST /api/auth/login          # Iniciar sesión
POST /api/auth/register       # Registro (solo admin)
GET  /api/auth/me            # Datos del usuario
POST /api/auth/refresh       # Renovar token
```

### **Fichadas**
```http  
POST /api/fichada/generar-qr    # Generar código QR
POST /api/fichada/escanear      # Procesar fichada
GET  /api/fichada/mis-fichadas  # Listar fichadas del usuario
GET  /api/fichada/todas         # Listar todas (supervisor+)
POST /api/fichada/aprobar/:id   # Aprobar fichada
GET  /api/fichada/estadisticas  # Dashboard de estadísticas
```

## 🔧 Configuración Avanzada

### **Variables de Entorno**
- `QR_EXPIRY_MINUTES`: Tiempo de expiración de QR (default: 5)
- `BCRYPT_SALT_ROUNDS`: Rounds de bcrypt (default: 12)  
- `JWT_EXPIRES_IN`: Expiración de tokens (default: 24h)

### **Configuración de CORS**
El backend permite conexiones desde `http://localhost:3000` por defecto.

### **Rate Limiting**
- 100 requests por 15 minutos por IP
- Configurable en `src/app.js`

## 🛡️ Seguridad Implementada

- ✅ **JWT Authentication** con expiración
- ✅ **Password Hashing** con bcrypt (12 rounds)
- ✅ **Input Validation** con express-validator
- ✅ **SQL Injection Protection** via Sequelize ORM
- ✅ **CORS Protection** configurado
- ✅ **Rate Limiting** anti-spam
- ✅ **Helmet.js** headers de seguridad
- ✅ **Role-Based Access Control** (RBAC)

## 📱 Funcionalidades por Rol

### **👷 Empleado**
- ✅ Generar código QR para fichar
- ✅ Escanear QR y registrar fichada  
- ✅ Ver historial personal de fichadas
- ✅ Validación de geolocalización

### **👨‍💼 Supervisor**
- ✅ Todo lo del empleado +
- ✅ Ver fichadas de todos los empleados
- ✅ Aprobar/rechazar fichadas pendientes
- ✅ Filtros avanzados de búsqueda

### **⚡ Administrador**  
- ✅ Todo lo del supervisor +
- ✅ Dashboard con estadísticas generales
- ✅ Gestión completa del sistema
- ✅ Registro de nuevos usuarios

## 🔍 Desarrollo y Debug

### **Logs del Sistema**
```bash
# Backend logs
npm run dev     # Muestra conexión DB + rutas + errores

# Base de datos  
# Sequelize logging habilitado en development
```

### **Testing de API**
```bash
# Health check
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan.perez@ejemplo.com","password":"123456"}'
```

## 🚨 Solución de Problemas

### **Error: "Unknown database 'fichero_obra'"**
```bash
cd backend
npx sequelize-cli db:create
```

### **Error: "Cannot find module './config/database'"**
- Verificar estructura de archivos en `/config/`
- Comprobar imports en `app.js`

### **Frontend no conecta con Backend**  
- Verificar CORS en `backend/src/app.js`
- Confirmar URLs en `frontend/src/services/api.js`

### **QR no escanea en móvil**
- Verificar permisos de cámara
- Usar HTTPS en producción
- Comprobar compatibilidad del navegador

## 🎯 Próximas Mejoras

- [ ] **Notificaciones Push** para supervisores
- [ ] **Reportes PDF/Excel** exportables  
- [ ] **Modo Offline** con sincronización
- [ ] **Integración con API de mapas** (Google Maps)
- [ ] **Dashboard tiempo real** con WebSockets
- [ ] **App móvil nativa** (React Native)

---

## 📞 Soporte

Para consultas técnicas o reportes de bugs, contactar al equipo de desarrollo.

**Versión**: 2.0.0  
**Última actualización**: Julio 2024
```

## 🔌 API Endpoints

### Fichadas
- `POST /api/fichada/generar` - Generar QR para obra
- `POST /api/fichada/scan` - Escanear QR y registrar fichada
- `POST /api/fichada/aprobar` - Aprobar fichada (supervisor)
- `GET /api/fichada/lista/:userId?` - Listar fichadas

### Auxiliares
- `GET /api/obras` - Listar obras activas
- `GET /api/usuarios` - Listar usuarios activos
- `GET /api/health` - Estado del servidor

## 🧪 Datos de Prueba

### Usuarios
- **Juan Pérez** (ID: 1, DNI: 12345678, Tel: +54261123456)
- **María García** (ID: 2, DNI: 87654321, Tel: +54261654321)
- **Carlos López** (ID: 3, DNI: 11223344, Tel: +54261789012)

### Obras
- **Edificio Residencial Centro** (Radio: 150m)
  - Lat: -32.8908, Long: -68.8272
- **Casa Quinta Maipú** (Radio: 100m)
  - Lat: -32.9833, Long: -68.7833
- **Oficinas Godoy Cruz** (Radio: 80m)
  - Lat: -32.9267, Long: -68.8417

## 🔧 Comandos de Desarrollo

### Backend
```bash
npm start     # Servidor en producción
npm run dev   # Servidor con nodemon (desarrollo)
```

### Frontend
```bash
npm start     # Servidor de desarrollo (puerto 3000)
npm run build # Build para producción
```

## ✅ Validaciones Implementadas

1. **Usuario válido y activo**
2. **Obra válida y activa**
3. **QR no expirado** (5 minutos máximo)
4. **Geolocalización dentro del radio permitido**
5. **Campos requeridos completos**
6. **Tipo de fichada válido** (entrada/salida)

## 🔍 Características de Seguridad

- **Hash en QR**: Previene QR maliciosos
- **Tiempo de expiración**: QR válidos por tiempo limitado
- **Verificación de distancia**: Obligatorio estar cerca de la obra
- **Autenticación**: JWT mock (fácil de reemplazar por real)
- **Validación de entrada**: Sanitización de datos

## 🚀 Próximas Mejoras

- [ ] Autenticación JWT real con registro
- [ ] Panel de administrador web
- [ ] Reportes y estadísticas
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Reconocimiento facial adicional

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autor

Desarrollado por un desarrollador senior como sistema de demostración para fichadas con QR y geolocalización.
