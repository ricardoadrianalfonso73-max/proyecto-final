
# Electro Tecno - Proyecto Final

**Práctica Profesional II**  
**Tecnicatura Superior en Desarrollo de Software - 2026**

## Descripción del proyecto

Electro Tecno es un sitio web de una tienda de tecnología que permite
consultar productos, buscar por categorías, realizar pedidos,
enviar consultas y solicitar servicio técnico.

El proyecto está desarrollado con una arquitectura Frontend,
Backend y Base de Datos.

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos | CSS |
| Navegación | React Router |
| Iconos | Lucide React |
| Backend | Node.js + Express |
| Base de datos | MySQL |
| Autenticación | JWT + bcrypt |
| Imágenes | Multer |

## Estructura del repositorio

```text
proyecto-final/
│
├── frontend/
│   └── Aplicación React
│
├── backend/
│   └── Servidor Node.js y Express
│
├── database/
│   └── electro_tecno.sql
│
└── README.md
```

## Requisitos previos

- Node.js 18 o superior.
- MySQL 8 o MariaDB.
- npm.

## Instalación y ejecución

### 1. Base de datos

Abrir MySQL, phpMyAdmin o MySQL Workbench.

Ejecutar el archivo:

`database/electro_tecno.sql`

Este script crea la base de datos, las siete tablas
y los datos de ejemplo.

### 2. Backend

Ingresar a la carpeta:

```bash
cd backend
```

Instalar las dependencias:

```bash
npm install
```

Crear el archivo `.env` tomando como referencia `.env.example`
y completar los datos de conexión a MySQL.

Iniciar el servidor:

```bash
npm run dev
```

Servidor local:

`http://localhost:3000`

### 3. Frontend

Ingresar a la carpeta:

```bash
cd frontend
```

Instalar las dependencias:

```bash
npm install
```

Iniciar la aplicación:

```bash
npm run dev
```

Tienda local:

`http://localhost:5173`

## Funcionalidades principales

### Sección pública

- Catálogo de productos.
- Filtro por categorías.
- Búsqueda de productos.
- Visualización de ofertas.
- Carrito de compras.
- Registro de pedidos.
- Formulario de contacto.
- Solicitud de servicio técnico.

### Panel de administración

- Inicio de sesión.
- Gestión de productos.
- Alta, edición y baja lógica de productos.
- Carga de imágenes.
- Gestión de pedidos.
- Cambio de estado de pedidos.
- Administración de consultas de contacto.
- Administración de solicitudes de servicio técnico.

## Base de datos

La base de datos se llama `electro_tecno` y contiene siete tablas:

1. usuarios
2. categorias
3. productos
4. pedidos
5. pedido_items
6. consultas_contacto
7. servicio_tecnico

## Variables de entorno

El archivo `backend/.env` contiene los datos privados de conexión
y configuración.

Ejemplo de configuración:

## Variables de entorno

Para ejecutar el backend, crear un archivo `.env` dentro de la carpeta `backend`, tomando como referencia `.env.example`.

Configurar las siguientes variables:

- PORT
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- DB_PORT
- JWT_SECRET
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- EMAIL_USER
- EMAIL_PASS
- EMAIL_DESTINO


## Alumno

ricardo adrian alfonso

## Tema

Tienda de tecnología - Electro Tecno

## Año

2026
