
-- ============================================================
-- Electro Tecno - Base de Datos
-- Práctica Profesional II - Proyecto Final 2026
-- ============================================================

CREATE DATABASE IF NOT EXISTS electro_tecno
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE electro_tecno;

-- ============================================================
-- TABLA: usuarios (LOGIN)
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'cliente') NOT NULL DEFAULT 'cliente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: categorias
-- ============================================================

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: productos
-- ============================================================

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    imagen VARCHAR(255) DEFAULT NULL,
    id_categoria INT DEFAULT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    es_oferta TINYINT(1) NOT NULL DEFAULT 0,
    condicion VARCHAR(30) DEFAULT 'Nuevo',
    precio_anterior DECIMAL(12,2) DEFAULT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria) REFERENCES categorias(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: pedidos
-- ============================================================

CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT DEFAULT NULL,
    nombre_cliente VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(40) DEFAULT NULL,
    direccion VARCHAR(255) DEFAULT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado VARCHAR(40) NOT NULL DEFAULT 'Pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pedido_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: pedido_items
-- ============================================================

CREATE TABLE IF NOT EXISTS pedido_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT DEFAULT NULL,
    nombre_producto VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_item_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_item_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: consultas_contacto
-- ============================================================

CREATE TABLE IF NOT EXISTS consultas_contacto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLA: servicio_tecnico
-- ============================================================

CREATE TABLE IF NOT EXISTS servicio_tecnico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(40) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    problema TEXT NOT NULL,
    estado VARCHAR(40) NOT NULL DEFAULT 'Pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- DATOS DE PRUEBA
-- ============================================================

-- Categorías: respetar estos IDs
INSERT INTO categorias (id, nombre) VALUES
(1, 'Celulares'),
(2, 'Notebooks'),
(3, 'Accesorios');

-- Productos de ejemplo
INSERT INTO productos
(nombre, descripcion, precio, stock, imagen, id_categoria,
 activo, es_oferta, condicion, precio_anterior)
VALUES
(
    'iPhone 13 128GB',
    'Celular Apple en excelente estado. Batería al 92%. Incluye caja y cable.',
    650000.00,
    5,
    'https://images.unsplash.com/photo-1632661674596-df8bef8a6f8a?w=600',
    1, 1, 1, 'Usado', 720000.00
),
(
    'Samsung Galaxy A54',
    'Smartphone Samsung nuevo, 128GB, color negro. Garantía oficial.',
    420000.00,
    8,
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600',
    1, 1, 0, 'Nuevo', NULL
),
(
    'Auriculares Bluetooth Pro',
    'Auriculares inalámbricos con cancelación de ruido y 30hs de batería.',
    45000.00,
    20,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    3, 1, 1, 'Nuevo', 55000.00
),
(
    'Cargador USB-C 25W',
    'Cargador rápido original compatible con Samsung y otros Android.',
    18000.00,
    30,
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600',
    3, 1, 0, 'Nuevo', NULL
),
(
    'Notebook Lenovo IdeaPad 15',
    'Intel i5, 8GB RAM, 512GB SSD. Ideal para estudio y trabajo.',
    890000.00,
    3,
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    2, 1, 0, 'Nuevo', NULL
),
(
    'Mouse Gamer RGB',
    'Mouse óptico con iluminación RGB y 6 botones programables.',
    22000.00,
    15,
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
    3, 1, 1, 'Nuevo', 28000.00
);

-- Consulta de contacto de ejemplo
INSERT INTO consultas_contacto
(nombre, correo, mensaje, estado)
VALUES
('Juan Pérez', 'juan@mail.com',
 'Hola, ¿tienen stock de iPhone 13?', 'Pendiente');

-- Solicitud de servicio técnico de ejemplo
INSERT INTO servicio_tecnico
(nombre, telefono, modelo, problema, estado)
VALUES
('María Gómez', '11-5555-1234', 'Samsung A54',
 'La pantalla no responde al tacto', 'Pendiente');

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
