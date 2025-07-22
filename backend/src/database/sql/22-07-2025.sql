-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-07-2025 a las 21:54:32
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "-03:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `fichero_obra`
--
CREATE DATABASE IF NOT EXISTS `fichero_obra` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fichero_obra`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fichadas`
--

CREATE TABLE `fichadas` (
  `id` int(11) NOT NULL,
  `obraId` int(11) NOT NULL COMMENT 'ID de la obra donde se realiza la fichada',
  `userId` int(11) NOT NULL COMMENT 'ID del usuario que realiza la fichada',
  `timestamp` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Fecha y hora de la fichada',
  `tipo` enum('entrada','salida') NOT NULL COMMENT 'Tipo de fichada: entrada o salida',
  `lat` decimal(10,8) NOT NULL COMMENT 'Latitud desde donde se realizó la fichada',
  `long` decimal(11,8) NOT NULL COMMENT 'Longitud desde donde se realizó la fichada',
  `telefono` varchar(20) NOT NULL COMMENT 'Teléfono del usuario que realizó la fichada',
  `aprobado` tinyint(1) DEFAULT 0 COMMENT 'Si la fichada fue aprobada/confirmada por un supervisor',
  `distanciaObra` decimal(8,2) DEFAULT NULL COMMENT 'Distancia en metros desde la ubicación de la obra',
  `observaciones` text DEFAULT NULL COMMENT 'Observaciones adicionales sobre la fichada',
  `aprobadoPor` int(11) DEFAULT NULL COMMENT 'ID del usuario que aprobó la fichada',
  `fechaAprobacion` datetime DEFAULT NULL COMMENT 'Fecha y hora de aprobación',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de registro de fichadas con geolocalización y aprobación';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `obras`
--

CREATE TABLE `obras` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL COMMENT 'Nombre identificador de la obra',
  `descripcion` text DEFAULT NULL COMMENT 'Descripción detallada de la obra',
  `direccion` text DEFAULT NULL COMMENT 'Dirección física de la obra',
  `lat` decimal(10,8) NOT NULL COMMENT 'Latitud de la ubicación de la obra',
  `long` decimal(11,8) NOT NULL COMMENT 'Longitud de la ubicación de la obra',
  `radioPermitido` int(11) DEFAULT 100 COMMENT 'Radio en metros permitido para fichar desde la obra',
  `activa` tinyint(1) DEFAULT 1 COMMENT 'Si la obra está activa para fichadas',
  `fechaInicio` datetime DEFAULT NULL COMMENT 'Fecha de inicio de la obra',
  `fechaFinEstimada` datetime DEFAULT NULL COMMENT 'Fecha estimada de finalización',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de obras/proyectos donde se pueden realizar fichadas';

--
-- Volcado de datos para la tabla `obras`
--

INSERT INTO `obras` (`id`, `nombre`, `descripcion`, `direccion`, `lat`, `long`, `radioPermitido`, `activa`, `fechaInicio`, `fechaFinEstimada`, `createdAt`, `updatedAt`) VALUES
(1, 'Edificio Residencial Centro', 'Construcción de edificio de 10 pisos en pleno centro de Mendoza. Incluye subsuelo para cocheras y local comercial en planta baja.', 'Av. San Martín 1234, Mendoza Capital', -32.89080000, -68.82720000, 150, 1, '2024-01-14 21:00:00', '2025-06-29 21:00:00', '2025-07-22 12:30:16', '2025-07-22 12:30:16'),
(2, 'Casa Quinta Maipú', 'Refacción integral de casa quinta estilo colonial. Incluye piscina, quincho y ampliación de living.', 'Calle Los Álamos 567, Maipú, Mendoza', -32.98330000, -68.78330000, 100, 1, '2024-02-29 21:00:00', '2024-12-14 21:00:00', '2025-07-22 12:30:16', '2025-07-22 12:30:16'),
(3, 'Oficinas Godoy Cruz', 'Remodelación completa de oficinas comerciales. Modernización de instalaciones eléctricas y aire acondicionado.', 'Av. Hipólito Yrigoyen 890, Godoy Cruz, Mendoza', -32.92670000, -68.84170000, 80, 1, '2024-02-09 21:00:00', '2024-08-29 21:00:00', '2025-07-22 12:30:16', '2025-07-22 12:30:16'),
(4, 'Complejo Industrial Las Heras', 'Construcción de nave industrial para empresa alimentaria. Incluye cámaras frigoríficas y línea de producción.', 'Ruta Provincial 82 km 15, Las Heras, Mendoza', -32.85000000, -68.65000000, 200, 1, '2024-03-31 21:00:00', '2025-10-14 21:00:00', '2025-07-22 12:30:16', '2025-07-22 12:30:16'),
(5, 'Shopping Mall Luján', 'Construcción de centro comercial de gran escala. 3 niveles con más de 100 locales comerciales.', 'Av. Acceso Este 2500, Luján de Cuyo, Mendoza', -33.03330000, -68.83330000, 300, 1, '2023-12-31 21:00:00', '2026-12-30 21:00:00', '2025-07-22 12:30:16', '2025-07-22 12:30:16'),
(6, 'Viviendas Sociales Tunuyán', 'Plan de construcción de 50 viviendas sociales en el departamento de Tunuyán.', 'Barrio Nuevo Tunuyán, Mendoza', -33.57500000, -69.02000000, 250, 0, '2023-07-31 21:00:00', '2024-05-30 21:00:00', '2025-07-22 12:30:16', '2025-07-22 12:30:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sequelizemeta`
--

CREATE TABLE `sequelizemeta` (
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Volcado de datos para la tabla `sequelizemeta`
--

INSERT INTO `sequelizemeta` (`name`) VALUES
('20250722000001-create-user.js'),
('20250722000002-create-obra.js'),
('20250722000003-create-fichada.js');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL COMMENT 'Nombre completo del empleado',
  `telefono` varchar(20) NOT NULL COMMENT 'Número de teléfono del empleado',
  `dni` varchar(20) NOT NULL COMMENT 'DNI o documento de identidad',
  `email` varchar(150) DEFAULT NULL COMMENT 'Email del empleado',
  `password` varchar(255) NOT NULL COMMENT 'Contraseña hasheada',
  `rol` enum('empleado','supervisor','admin') NOT NULL DEFAULT 'empleado' COMMENT 'Rol del usuario en el sistema',
  `activo` tinyint(1) DEFAULT 1 COMMENT 'Si el empleado está activo en el sistema',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de empleados/usuarios del sistema con roles';

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `telefono`, `dni`, `email`, `password`, `rol`, `activo`, `createdAt`, `updatedAt`) VALUES
(1, 'Juan Pérez', '+54261123456', '12345678', 'juan.perez@ejemplo.com', '$2b$12$jGM4KTTTqkLR3zIJdJVCE.QWOx8riQfJ0Liz8lerhfz2qpngwUDeS', 'empleado', 1, '2025-07-22 12:30:15', '2025-07-22 12:30:15'),
(2, 'María García', '+54261654321', '87654321', 'maria.garcia@ejemplo.com', '$2b$12$gAoo6OBWczIZjZGt745X8.vt/bOrkS5yl56YPMy9zPA9L5gX9vSLi', 'empleado', 1, '2025-07-22 12:30:15', '2025-07-22 12:30:15'),
(3, 'Carlos López', '+54261789012', '11223344', 'carlos.lopez@ejemplo.com', '$2b$12$HIokccQlnMvV6jWzA/mcu.CuI/VkcxAWzZ/0U9Jy7K9PSHBNhHQie', 'supervisor', 1, '2025-07-22 12:30:15', '2025-07-22 12:30:15'),
(4, 'Ana Rodriguez', '+54261555777', '55667788', 'ana.rodriguez@ejemplo.com', '$2b$12$Tf/8Y4f3nXaVm.URM2qGsO/tj2nEh1/FScEChTLFI1KuzPTI8bJ9C', 'empleado', 1, '2025-07-22 12:30:15', '2025-07-22 12:30:15'),
(5, 'Diego Martinez', '+54261999888', '99887766', 'diego.martinez@ejemplo.com', '$2b$12$BC5WrzEWtUXcrPYbmHPGd.Uut8Qoa9YsHYJ8C4lOBwfApA5mvtJ86', 'admin', 1, '2025-07-22 12:30:16', '2025-07-22 12:30:16');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `fichadas`
--
ALTER TABLE `fichadas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fichadas_obra_id_index` (`obraId`),
  ADD KEY `fichadas_user_id_index` (`userId`),
  ADD KEY `fichadas_timestamp_index` (`timestamp`),
  ADD KEY `fichadas_tipo_index` (`tipo`),
  ADD KEY `fichadas_aprobado_index` (`aprobado`),
  ADD KEY `fichadas_user_obra_time_index` (`userId`,`obraId`,`timestamp`),
  ADD KEY `fichadas_aprobado_por_index` (`aprobadoPor`);

--
-- Indices de la tabla `obras`
--
ALTER TABLE `obras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `obras_nombre_index` (`nombre`),
  ADD KEY `obras_activa_index` (`activa`),
  ADD KEY `obras_location_index` (`lat`,`long`);

--
-- Indices de la tabla `sequelizemeta`
--
ALTER TABLE `sequelizemeta`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD UNIQUE KEY `users_dni_unique` (`dni`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_rol_index` (`rol`),
  ADD KEY `users_activo_index` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `fichadas`
--
ALTER TABLE `fichadas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `obras`
--
ALTER TABLE `obras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `fichadas`
--
ALTER TABLE `fichadas`
  ADD CONSTRAINT `fichadas_ibfk_1` FOREIGN KEY (`obraId`) REFERENCES `obras` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fichadas_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fichadas_ibfk_3` FOREIGN KEY (`aprobadoPor`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
