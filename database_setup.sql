-- =====================================================
-- Script de creación de Base de Datos para Fichero de Obra
-- Sistema de Fichadas por QR con Geolocalización
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS `fichero_obra` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `fichero_obra`;

-- =====================================================
-- TABLA: users
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre completo del empleado',
  `dni` varchar(20) NOT NULL COMMENT 'DNI o documento de identidad',
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Si el empleado está activo en el sistema',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabla de empleados/usuarios del sistema';

-- =====================================================
-- TABLA: obras  
-- =====================================================
CREATE TABLE IF NOT EXISTS `obras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) NOT NULL COMMENT 'Nombre identificador de la obra',
  `direccion` text COMMENT 'Dirección física de la obra',
  `lat` decimal(10,8) NOT NULL COMMENT 'Latitud de la ubicación de la obra',
  `long` decimal(11,8) NOT NULL COMMENT 'Longitud de la ubicación de la obra',
  `radioPermitido` int DEFAULT '100' COMMENT 'Radio en metros permitido para fichar desde la obra',
  `activa` tinyint(1) DEFAULT '1' COMMENT 'Si la obra está activa para fichadas',
  `descripcion` text COMMENT 'Descripción adicional de la obra',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabla de obras/proyectos donde se pueden realizar fichadas';

-- =====================================================
-- TABLA: fichadas
-- =====================================================
CREATE TABLE IF NOT EXISTS `fichadas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `obraId` int NOT NULL COMMENT 'ID de la obra donde se realiza la fichada',
  `userId` int NOT NULL COMMENT 'ID del usuario que fichas',
  `timestamp` datetime NOT NULL COMMENT 'Fecha y hora de la fichada',
  `tipo` enum('entrada','salida') NOT NULL COMMENT 'Tipo de fichada: entrada o salida',
  `lat` decimal(10,8) NOT NULL COMMENT 'Latitud desde donde se realizó la fichada',
  `long` decimal(11,8) NOT NULL COMMENT 'Longitud desde donde se realizó la fichada',
  `telefono` varchar(20) NOT NULL COMMENT 'Teléfono del usuario que realizó la fichada',
  `aprobado` tinyint(1) DEFAULT '0' COMMENT 'Si la fichada fue aprobada/confirmada',
  `distanciaObra` decimal(8,2) DEFAULT NULL COMMENT 'Distancia en metros desde la ubicación de la obra',
  `observaciones` text COMMENT 'Observaciones adicionales sobre la fichada',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `obraId` (`obraId`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_aprobado` (`aprobado`),
  CONSTRAINT `fichadas_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fichadas_ibfk_2` FOREIGN KEY (`obraId`) REFERENCES `obras` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Tabla de registro de fichadas con geolocalización';

-- =====================================================
-- DATOS DE EJEMPLO - USUARIOS
-- =====================================================
INSERT INTO `users` (`nombre`, `dni`, `activo`, `createdAt`, `updatedAt`) VALUES
('Juan Pérez', '12345678', 1, NOW(), NOW()),
('María García', '87654321', 1, NOW(), NOW()),
('Carlos López', '11223344', 1, NOW(), NOW()),
('Ana Rodriguez', '55667788', 1, NOW(), NOW()),
('Luis Martinez', '99887766', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  `nombre` = VALUES(`nombre`),
  `activo` = VALUES(`activo`),
  `updatedAt` = NOW();

-- =====================================================
-- DATOS DE EJEMPLO - OBRAS
-- =====================================================
INSERT INTO `obras` (`nombre`, `direccion`, `lat`, `long`, `radioPermitido`, `activa`, `descripcion`, `createdAt`, `updatedAt`) VALUES
(
  'Edificio Residencial Centro',
  'Av. San Martín 1234, Mendoza Capital',
  -32.89080000,
  -68.82720000,
  150,
  1,
  'Construcción de edificio de 10 pisos en pleno centro de Mendoza. Incluye subsuelo para cocheras y local comercial en planta baja.',
  NOW(),
  NOW()
),
(
  'Casa Quinta Maipú',
  'Calle Los Álamos 567, Maipú, Mendoza',
  -32.98330000,
  -68.78330000,
  100,
  1,
  'Refacción integral de casa quinta estilo colonial. Incluye piscina, quincho y ampliación de living.',
  NOW(),
  NOW()
),
(
  'Oficinas Godoy Cruz',
  'Av. Hipólito Yrigoyen 890, Godoy Cruz, Mendoza',
  -32.92670000,
  -68.84170000,
  80,
  1,
  'Remodelación completa de oficinas comerciales. Modernización de instalaciones eléctricas y aire acondicionado.',
  NOW(),
  NOW()
),
(
  'Complejo Industrial Las Heras',
  'Ruta Provincial 82 km 15, Las Heras, Mendoza',
  -32.85000000,
  -68.65000000,
  200,
  1,
  'Construcción de nave industrial para empresa alimentaria. Incluye cámaras frigoríficas y línea de producción.',
  NOW(),
  NOW()
),
(
  'Shopping Mall Luján',
  'Av. Acceso Este 2500, Luján de Cuyo, Mendoza',
  -33.03330000,
  -68.83330000,
  300,
  1,
  'Construcción de centro comercial de gran escala. 3 niveles con más de 100 locales comerciales.',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE 
  `direccion` = VALUES(`direccion`),
  `lat` = VALUES(`lat`),
  `long` = VALUES(`long`),
  `radioPermitido` = VALUES(`radioPermitido`),
  `activa` = VALUES(`activa`),
  `descripcion` = VALUES(`descripcion`),
  `updatedAt` = NOW();

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para búsquedas por ubicación geográfica
CREATE INDEX `idx_obras_location` ON `obras` (`lat`, `long`);

-- Índice compuesto para consultas de fichadas por usuario y obra
CREATE INDEX `idx_fichadas_user_obra` ON `fichadas` (`userId`, `obraId`, `timestamp`);

-- Índice para fichadas pendientes de aprobación
CREATE INDEX `idx_fichadas_pending` ON `fichadas` (`aprobado`, `timestamp`) WHERE `aprobado` = 0;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de fichadas con información completa
CREATE OR REPLACE VIEW `vista_fichadas_completa` AS
SELECT 
  f.id,
  f.timestamp,
  f.tipo,
  f.aprobado,
  f.distanciaObra,
  f.telefono,
  f.lat as fichada_lat,
  f.long as fichada_long,
  u.nombre as usuario_nombre,
  u.dni as usuario_dni,
  o.nombre as obra_nombre,
  o.direccion as obra_direccion,
  o.lat as obra_lat,
  o.long as obra_long,
  o.radioPermitido as obra_radio,
  f.createdAt,
  f.updatedAt
FROM fichadas f
JOIN users u ON f.userId = u.id
JOIN obras o ON f.obraId = o.id
ORDER BY f.timestamp DESC;

-- Vista de resumen por obra
CREATE OR REPLACE VIEW `vista_resumen_obras` AS
SELECT 
  o.id,
  o.nombre,
  o.direccion,
  o.radioPermitido,
  COUNT(f.id) as total_fichadas,
  COUNT(CASE WHEN f.tipo = 'entrada' THEN 1 END) as total_entradas,
  COUNT(CASE WHEN f.tipo = 'salida' THEN 1 END) as total_salidas,
  COUNT(CASE WHEN f.aprobado = 1 THEN 1 END) as fichadas_aprobadas,
  COUNT(CASE WHEN f.aprobado = 0 THEN 1 END) as fichadas_pendientes,
  MAX(f.timestamp) as ultima_fichada
FROM obras o
LEFT JOIN fichadas f ON o.id = f.obraId
WHERE o.activa = 1
GROUP BY o.id, o.nombre, o.direccion, o.radioPermitido
ORDER BY total_fichadas DESC;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

DELIMITER //

-- Procedimiento para obtener distancia entre dos puntos
CREATE OR REPLACE PROCEDURE `calcular_distancia`(
  IN lat1 DECIMAL(10,8),
  IN lon1 DECIMAL(11,8), 
  IN lat2 DECIMAL(10,8),
  IN lon2 DECIMAL(11,8),
  OUT distancia_metros DECIMAL(10,2)
)
BEGIN
  DECLARE R DECIMAL(10,2) DEFAULT 6371000; -- Radio de la Tierra en metros
  DECLARE dLat DECIMAL(15,10);
  DECLARE dLon DECIMAL(15,10);
  DECLARE a DECIMAL(15,10);
  DECLARE c DECIMAL(15,10);
  
  SET dLat = RADIANS(lat2 - lat1);
  SET dLon = RADIANS(lon2 - lon1);
  
  SET a = SIN(dLat/2) * SIN(dLat/2) + 
          COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
          SIN(dLon/2) * SIN(dLon/2);
          
  SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
  SET distancia_metros = R * c;
END //

-- Procedimiento para aprobar fichadas en lote
CREATE OR REPLACE PROCEDURE `aprobar_fichadas_obra`(
  IN obra_id INT,
  IN fecha_desde DATE,
  IN fecha_hasta DATE,
  OUT fichadas_aprobadas INT
)
BEGIN
  UPDATE fichadas 
  SET aprobado = 1, updatedAt = NOW()
  WHERE obraId = obra_id 
    AND DATE(timestamp) BETWEEN fecha_desde AND fecha_hasta
    AND aprobado = 0;
    
  SET fichadas_aprobadas = ROW_COUNT();
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS PARA AUDITORÍA
-- =====================================================

-- Trigger para calcular distancia automáticamente
DELIMITER //
CREATE OR REPLACE TRIGGER `calcular_distancia_fichada`
BEFORE INSERT ON `fichadas`
FOR EACH ROW
BEGIN
  DECLARE obra_lat DECIMAL(10,8);
  DECLARE obra_lon DECIMAL(11,8);
  DECLARE distancia DECIMAL(10,2);
  
  -- Obtener coordenadas de la obra
  SELECT lat, `long` INTO obra_lat, obra_lon 
  FROM obras 
  WHERE id = NEW.obraId;
  
  -- Calcular distancia usando la fórmula de Haversine
  CALL calcular_distancia(NEW.lat, NEW.`long`, obra_lat, obra_lon, distancia);
  
  -- Asignar la distancia calculada
  SET NEW.distanciaObra = distancia;
END //
DELIMITER ;

-- =====================================================
-- INFORMACIÓN FINAL
-- =====================================================

-- Mostrar resumen de tablas creadas
SELECT 
  'Base de datos creada exitosamente' as status,
  (SELECT COUNT(*) FROM users) as usuarios_creados,
  (SELECT COUNT(*) FROM obras) as obras_creadas,
  (SELECT COUNT(*) FROM fichadas) as fichadas_existentes;

-- Mostrar obras disponibles
SELECT 
  id, 
  nombre, 
  CONCAT(lat, ', ', `long`) as coordenadas,
  CONCAT(radioPermitido, 'm') as radio
FROM obras 
WHERE activa = 1;

COMMIT;
