
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

// Importar rutas
const productosModulo = require('./routes/productos');
const pedidosRouter = require('./routes/pedidos');
const authRouter = require('./routes/auth');
const contactoRouter = require('./routes/contacto');
const servicioTecnicoRouter = require('./routes/servicioTecnico');

// Importar middleware de seguridad
const {
  verificarToken,
  verificarAdmin
} = require('./middleware/verificarToken');

// Compatibilidad con la exportación de productos
const productosRouter = productosModulo.default || productosModulo;

const app = express();

// Configuración
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());


// Conectar rutas de la API
app.use('/api', productosRouter);
app.use('/api', pedidosRouter);
app.use('/api', authRouter);
app.use('/api', contactoRouter);
app.use('/api/servicio-tecnico', servicioTecnicoRouter);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Electro Tecno funciona correctamente'
  });
});

// Estado de la API
app.get('/api/estado', (req, res) => {
  res.json({
    estado: 'OK',
    mensaje: 'API funcionando correctamente'
  });
});

// Comprobar conexión con MySQL
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DATABASE() AS base_datos'
    );

    res.json({
      estado: 'OK',
      mensaje: 'Conexión con MySQL exitosa',
      base_datos: rows[0].base_datos
    });

  } catch (error) {
    console.error('Error de conexión con MySQL:', error.message);

    res.status(500).json({
      estado: 'ERROR',
      mensaje: 'No se pudo conectar con la base de datos'
    });
  }
});

// Ruta protegida para administradores
app.get(
  '/api/admin/verificar',
  verificarToken,
  verificarAdmin,
  (req, res) => {
    res.json({
      estado: 'OK',
      mensaje: 'Acceso autorizado al panel de administración.',
      usuario: req.usuario
    });
  }
);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    mensaje: 'La ruta solicitada no existe.',
    ruta: req.originalUrl
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
  console.log('Rutas conectadas: productos, pedidos, autenticación, contacto y servicio técnico');
  console.log('Seguridad de administradores activada');
});
