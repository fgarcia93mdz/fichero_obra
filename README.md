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
└── README.md
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
