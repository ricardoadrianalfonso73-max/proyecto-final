
const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const {
  verificarToken,
  verificarAdmin
} = require('../middleware/verificarToken');

// =====================================
// CONFIGURACIÓN DE CLOUDINARY
// =====================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const almacenamiento = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'electro-tecno/productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    public_id: `producto-${Date.now()}-${Math.round(Math.random() * 1000000)}`
  })
});

console.log('CLOUDINARY STORAGE ACTIVADO');

// =====================================
// CONFIGURACIÓN DE MULTER
// =====================================

const subirImagen = multer({
  storage: almacenamiento,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solamente se permiten imágenes'));
    }
  }
});

// =====================================
// FUNCIÓN PARA MOSTRAR ERRORES
// =====================================

function mostrarError(operacion, error) {
  console.error(`\nERROR EN ${operacion}:`);
  console.error('Mensaje:', error.message);
  console.error('Código:', error.code);
  console.error('SQL:', error.sqlMessage);
  console.error('Consulta:', error.sql);
  console.error('Detalle completo:', error);
}

// =====================================
// VALIDAR QUE EXISTA LA CATEGORÍA
// =====================================

async function categoriaExiste(idCategoria) {
  const [categorias] = await db.query(
    'SELECT id FROM categorias WHERE id = ?',
    [idCategoria]
  );

  return categorias.length > 0;
}

// =====================================
// OBTENER PRODUCTOS PARA LA TIENDA
// =====================================

router.get('/productos', async (req, res) => {
  try {
    const [productos] = await db.query(`
      SELECT
        p.*,
        c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id
      WHERE p.activo = 1
      ORDER BY p.id DESC
    `);

    res.json(productos);

  } catch (error) {
    mostrarError('OBTENER PRODUCTOS', error);

    res.status(500).json({
      mensaje: 'Error al obtener los productos',
      detalle: error.sqlMessage || error.message
    });
  }
});

// =====================================
// OBTENER OFERTAS
// =====================================

router.get('/ofertas', async (req, res) => {
  try {
    const [ofertas] = await db.query(`
      SELECT *
      FROM productos
      WHERE activo = 1 AND es_oferta = 1
      ORDER BY id DESC
    `);

    res.json(ofertas);

  } catch (error) {
    mostrarError('OBTENER OFERTAS', error);

    res.status(500).json({
      mensaje: 'Error al obtener las ofertas',
      detalle: error.sqlMessage || error.message
    });
  }
});

// =====================================
// OBTENER PRODUCTOS PARA ADMINISTRACIÓN
// =====================================

router.get(
  '/admin/productos',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const [productos] = await db.query(`
        SELECT
          p.*,
          c.nombre AS categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id
        ORDER BY p.id DESC
      `);

      res.json({
        estado: 'OK',
        productos
      });

    } catch (error) {
      mostrarError('OBTENER PRODUCTOS ADMIN', error);

      res.status(500).json({
        mensaje: 'Error al consultar los productos',
        detalle: error.sqlMessage || error.message
      });
    }
  }
);

// =====================================
// AGREGAR PRODUCTO
// =====================================

router.post(
  '/productos',
  verificarToken,
  verificarAdmin,
  subirImagen.single('imagen'),
  async (req, res) => {
    try {
      const {
        nombre,
        descripcion,
        id_categoria,
        precio,
        precio_anterior,
        condicion,
        stock,
        imagen,
        es_oferta
      } = req.body;

      if (
        !nombre ||
        !Number.isInteger(Number(id_categoria)) ||
        Number(id_categoria) <= 0 ||
        precio === undefined ||
        !Number.isFinite(Number(precio)) ||
        Number(precio) < 0
      ) {
        return res.status(400).json({
          mensaje: 'Completá el nombre, la categoría y un precio válido'
        });
      }

      const existeCategoria = await categoriaExiste(Number(id_categoria));

      if (!existeCategoria) {
        return res.status(400).json({
          mensaje: 'La categoría seleccionada no existe. Actualizá las categorías del formulario.'
        });
      }

      if (
        precio_anterior !== undefined &&
        precio_anterior !== '' &&
        (!Number.isFinite(Number(precio_anterior)) || Number(precio_anterior) < 0)
      ) {
        return res.status(400).json({
          mensaje: 'El precio anterior no es válido'
        });
      }

      // Cloudinary devuelve la URL segura de la imagen.
      const imagenFinal = req.file
        ? req.file.path
        : (imagen || '');

      const [resultado] = await db.query(`
        INSERT INTO productos
        (
          nombre,
          descripcion,
          precio,
          stock,
          imagen,
          id_categoria,
          activo,
          es_oferta,
          condicion,
          precio_anterior
        )
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `, [
        nombre.trim(),
        descripcion || '',
        Number(precio),
        Math.max(0, Number(stock) || 0),
        imagenFinal,
        Number(id_categoria),
        es_oferta === '1' || es_oferta === 1 || es_oferta === true ? 1 : 0,
        condicion || 'Nuevo',
        precio_anterior !== undefined && precio_anterior !== ''
          ? Number(precio_anterior)
          : null
      ]);

      res.status(201).json({
        mensaje: 'Producto agregado correctamente',
        id: resultado.insertId,
        imagen: imagenFinal
      });

    } catch (error) {
      mostrarError('AGREGAR PRODUCTO', error);

      res.status(500).json({
        mensaje: 'Error al agregar el producto',
        detalle: error.sqlMessage || error.message
      });
    }
  }
);

// =====================================
// MODIFICAR PRODUCTO
// =====================================

router.put(
  '/productos/:id',
  verificarToken,
  verificarAdmin,
  subirImagen.single('imagen'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        nombre,
        descripcion,
        id_categoria,
        precio,
        precio_anterior,
        condicion,
        stock,
        imagen,
        es_oferta
      } = req.body;

      if (
        !nombre ||
        !Number.isInteger(Number(id_categoria)) ||
        Number(id_categoria) <= 0 ||
        precio === undefined ||
        !Number.isFinite(Number(precio)) ||
        Number(precio) < 0
      ) {
        return res.status(400).json({
          mensaje: 'Completá el nombre, la categoría y un precio válido'
        });
      }

      const existeCategoria = await categoriaExiste(Number(id_categoria));

      if (!existeCategoria) {
        return res.status(400).json({
          mensaje: 'La categoría seleccionada no existe'
        });
      }

      if (
        precio_anterior !== undefined &&
        precio_anterior !== '' &&
        (!Number.isFinite(Number(precio_anterior)) || Number(precio_anterior) < 0)
      ) {
        return res.status(400).json({
          mensaje: 'El precio anterior no es válido'
        });
      }

      const imagenFinal = req.file
        ? req.file.path
        : (imagen || '');

      const [resultado] = await db.query(`
        UPDATE productos SET
          nombre = ?,
          descripcion = ?,
          precio = ?,
          stock = ?,
          imagen = COALESCE(NULLIF(?, ''), imagen),
          id_categoria = ?,
          es_oferta = ?,
          condicion = ?,
          precio_anterior = ?
        WHERE id = ? AND activo = 1
      `, [
        nombre.trim(),
        descripcion || '',
        Number(precio),
        Math.max(0, Number(stock) || 0),
        imagenFinal,
        Number(id_categoria),
        es_oferta === '1' || es_oferta === 1 || es_oferta === true ? 1 : 0,
        condicion || 'Nuevo',
        precio_anterior !== undefined && precio_anterior !== ''
          ? Number(precio_anterior)
          : null,
        id
      ]);

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          mensaje: 'Producto no encontrado o sin cambios'
        });
      }

      res.json({
        mensaje: 'Producto actualizado correctamente',
        imagen: imagenFinal
      });

    } catch (error) {
      mostrarError('MODIFICAR PRODUCTO', error);

      res.status(500).json({
        mensaje: 'Error al modificar el producto',
        detalle: error.sqlMessage || error.message
      });
    }
  }
);

// =====================================
// DESACTIVAR PRODUCTO
// =====================================

router.delete(
  '/productos/:id',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [resultado] = await db.query(
        'UPDATE productos SET activo = 0 WHERE id = ? AND activo = 1',
        [id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          mensaje: 'Producto no encontrado'
        });
      }

      res.json({
        mensaje: 'Producto desactivado correctamente'
      });

    } catch (error) {
      mostrarError('DESACTIVAR PRODUCTO', error);

      res.status(500).json({
        mensaje: 'Error al desactivar el producto',
        detalle: error.sqlMessage || error.message
      });
    }
  }
);

// =====================================
// MANEJO DE ERRORES DE IMÁGENES
// =====================================

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      mensaje: error.code === 'LIMIT_FILE_SIZE'
        ? 'La imagen no puede superar los 5 MB'
        : 'Error al subir la imagen'
    });
  }

  if (error.message === 'Solamente se permiten imágenes') {
    return res.status(400).json({
      mensaje: error.message
    });
  }

  console.error('Error en ruta de productos:', error);

  res.status(500).json({
    mensaje: 'Ocurrió un error en el servidor',
    detalle: error.message
  });
});

module.exports = router;
