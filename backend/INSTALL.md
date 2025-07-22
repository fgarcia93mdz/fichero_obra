# 📖 Guía de Instalación y Configuración Detallada

## 🔧 Requisitos del Sistema

- **Node.js**: v16.0.0 o superior
- **MySQL**: v8.0 o superior  
- **npm**: v8.0.0 o superior (incluido con Node.js)
- **Navegador**: Chrome, Firefox, Safari (con soporte para WebRTC)

## 📱 Dependencias del Proyecto

### Backend Dependencies
```bash
npm install express sequelize mysql2 cors qrcode dotenv nodemon
```

### Frontend Dependencies  
```bash
npm install react react-dom react-qr-reader react-router-dom react-toastify axios
```

## 🚀 Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto
```bash
git clone <repositorio>
cd fichero_obra
```

### 2. Configurar MySQL

#### Opción A: Línea de comandos
```bash
mysql -u root -p
```
```sql
CREATE DATABASE fichero_obra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fichero_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON fichero_obra.* TO 'fichero_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Opción B: phpMyAdmin / MySQL Workbench
1. Crear nueva base de datos llamada `fichero_obra`
2. Configurar charset: `utf8mb4` y collation: `utf8mb4_unicode_ci`

### 3. Configurar Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:
```env
# Configuración de la Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fichero_obra
DB_USER=root
DB_PASS=

# Configuración del Servidor
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Configuración de QR
QR_EXPIRY_MINUTES=5
```

**⚠️ IMPORTANTE**: Para crear las tablas y datos de ejemplo la primera vez:

1. Editar `backend/src/models/index.js`:
   ```javascript
   // Cambiar esta línea:
   await syncDatabase(false);
   // Por esta línea SOLO LA PRIMERA VEZ:
   await syncDatabase(true);
   ```

2. Ejecutar el servidor:
   ```bash
   npm run dev
   ```

3. **Después de la primera ejecución**, cambiar de vuelta a `false`:
   ```javascript
   await syncDatabase(false);
   ```

### 4. Configurar Frontend

```bash
cd ../frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend` (opcional):
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### 5. Ejecutar el Proyecto

#### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Servidor corriendo en: `http://localhost:3001`

#### Terminal 2 - Frontend:
```bash
cd frontend  
npm start
```
Aplicación disponible en: `http://localhost:3000`

## 🎯 Verificar Instalación

### 1. Comprobar Backend
```bash
curl http://localhost:3001/api/health
```
Respuesta esperada:
```json
{
  "status": "OK",
  "message": "API de Fichadas con Geolocalización funcionando correctamente"
}
```

### 2. Comprobar Frontend
- Abrir `http://localhost:3000`
- Debería aparecer la pantalla de login
- Usar credenciales de prueba: `12345678` / `123`

### 3. Comprobar Base de Datos
```sql
USE fichero_obra;
SHOW TABLES;
-- Deberías ver: users, obras, fichadas

SELECT COUNT(*) FROM users;   -- Debería devolver 3
SELECT COUNT(*) FROM obras;   -- Debería devolver 3
```

## 🐛 Solución de Problemas Comunes

### Error: "Access denied for user"
```env
# Verificar credenciales en .env
DB_USER=root
DB_PASS=tu_password_mysql
```

### Error: "Database does not exist"
```bash
# Crear manualmente la base de datos
mysql -u root -p -e "CREATE DATABASE fichero_obra;"
```

### Error: "Port 3001 already in use"
```env
# Cambiar puerto en backend/.env
PORT=3002
```
Y actualizar frontend para apuntar al nuevo puerto.

### Error: "Cannot access camera"
- **Chrome**: Ir a `chrome://settings/content/camera` y permitir acceso
- **Firefox**: Permitir cuando aparezca el popup
- **HTTPS requerido**: En producción usar HTTPS

### Error: "Geolocation denied"
- Permitir ubicación en el navegador
- En Chrome: icono de candado → Configuración del sitio → Ubicación → Permitir

### Error: "QR Scanner no funciona"
```bash
# Verificar dependencia
npm list react-qr-reader

# Reinstalar si es necesario
npm uninstall react-qr-reader
npm install react-qr-reader@3.0.0-beta-1
```

## 📊 Datos de Prueba Incluidos

### Usuarios Creados Automáticamente
| Nombre | DNI | Contraseña | Teléfono |
|---------|-----|------------|----------|
| Juan Pérez | 12345678 | 123 | +54261123456 |
| María García | 87654321 | 456 | +54261654321 |
| Carlos López | 11223344 | 789 | +54261789012 |

### Obras Creadas Automáticamente  
| Nombre | Ubicación | Radio | Coordenadas |
|---------|-----------|-------|-------------|
| Edificio Residencial Centro | Av. San Martín 1234, Mendoza | 150m | -32.8908, -68.8272 |
| Casa Quinta Maipú | Calle Los Álamos 567, Maipú | 100m | -32.9833, -68.7833 |
| Oficinas Godoy Cruz | Av. Hipólito Yrigoyen 890, Godoy Cruz | 80m | -32.9267, -68.8417 |

## 🔄 Flujo de Pruebas Recomendado

### Prueba 1: Generar QR
1. Login con Juan Pérez (`12345678` / `123`)
2. Ir a "🏗️ Generar QR"
3. Seleccionar "Edificio Residencial Centro"
4. Generar QR
5. ✅ Debería aparecer el código QR

### Prueba 2: Escanear QR (mismo dispositivo)
1. Ir a "📱 Escanear QR" 
2. Clic en "Obtener Ubicación"
3. Permitir acceso a ubicación
4. Clic en "Iniciar Escaneo"
5. Permitir acceso a cámara
6. Escanear el QR generado
7. Seleccionar "ENTRADA"
8. ✅ Debería registrar la fichada

### Prueba 3: Verificar en Base de Datos
```sql
SELECT f.*, u.nombre, o.nombre as obra 
FROM fichadas f 
JOIN users u ON f.userId = u.id 
JOIN obras o ON f.obraId = o.id 
ORDER BY f.timestamp DESC 
LIMIT 5;
```

## 🌐 Configuración para Producción

### Backend
1. Cambiar `NODE_ENV=production` en `.env`
2. Configurar base de datos de producción
3. Usar PM2 o similar para proceso persistente
4. Configurar HTTPS y certificados SSL

### Frontend
1. Ejecutar `npm run build`
2. Servir desde nginx o servidor web
3. Configurar variables de entorno de producción
4. Habilitar HTTPS (requerido para geolocalización)

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. **Verificar versiones**:
   ```bash
   node --version  # >= v16.0.0
   npm --version   # >= v8.0.0
   mysql --version # >= v8.0.0
   ```

2. **Limpiar caché**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Logs detallados**:
   ```bash
   # Backend con logs
   DEBUG=* npm run dev
   
   # Frontend con logs
   GENERATE_SOURCEMAP=true npm start
   ```

¡El sistema debería funcionar correctamente siguiendo estos pasos! 🎉
