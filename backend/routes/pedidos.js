
const express = require('express');
const db = require('../db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const {
  verificarToken,
  verificarAdmin
} = require('../middleware/verificarToken');

const router = express.Router();

// =====================================
// CONFIGURACIÓN DEL CORREO
// =====================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// =====================================
// VERIFICAR TOKEN OPCIONAL
// =====================================

function verificarTokenOpcional(req, res, next) {
  try {
    const encabezado = req.headers.authorization;

    if (!encabezado) {
      req.usuario = null;
      return next();
    }

    if (!encabezado.startsWith('Bearer ')) {
      return res.status(401).json({
        mensaje: 'El token de sesión no es válido.'
      });
    }

    const token = encabezado.split(' ')[1];

    const datos = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = datos;
    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: 'La sesión es inválida o ha vencido. Iniciá sesión nuevamente.'
    });
  }
}

// =====================================
// ESCAPAR CARACTERES HTML
// =====================================

function escaparHTML(texto) {
  return String(texto || '').replace(/[&<>"']/g, caracter => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caracter]);
}

// =====================================
// ACTUALIZAR ESTADOS AUTOMÁTICAMENTE
// =====================================

async function actualizarEstadosAutomaticamente() {
  try {
    const [resultado] = await db.query(
      `UPDATE pedidos
       SET estado = CASE
         WHEN NOW() >= fecha_estimada_entrega
           THEN 'Entregado'

         WHEN NOW() >= DATE_ADD(creado_en, INTERVAL 1 DAY)
           THEN 'Enviado'

         WHEN NOW() >= DATE_ADD(creado_en, INTERVAL 2 HOUR)
           THEN 'Confirmado'

         ELSE estado
       END
       WHERE fecha_estimada_entrega IS NOT NULL
       AND estado NOT IN ('Cancelado', 'Entregado')
       AND (
         (
           NOW() >= DATE_ADD(creado_en, INTERVAL 2 HOUR)
           AND estado = 'Pendiente'
         )
         OR
         (
           NOW() >= DATE_ADD(creado_en, INTERVAL 1 DAY)
           AND estado IN ('Pendiente', 'Confirmado')
         )
         OR
         (
           NOW() >= fecha_estimada_entrega
           AND estado IN ('Pendiente', 'Confirmado', 'Enviado')
         )
       )`
    );

    if (resultado.affectedRows > 0) {
      console.log(
        `Seguimiento automático: ${resultado.affectedRows} pedido(s) actualizado(s).`
      );
    }

  } catch (error) {
    console.error(
      'Error al actualizar estados automáticamente:',
      error.message
    );
  }
}

// Ejecutar al iniciar el servidor
actualizarEstadosAutomaticamente();

// Revisar los pedidos cada minuto
setInterval(
  actualizarEstadosAutomaticamente,
  60 * 1000
);

// =====================================
// REGISTRAR UNA COMPRA
// =====================================

router.post(
  '/pedidos',
  verificarTokenOpcional,
  async (req, res) => {
    let connection;

    try {
      const {
        nombre_cliente,
        correo,
        telefono,
        direccion,
        productos,
        medio_pago
      } = req.body;

      if (
        !nombre_cliente ||
        !correo ||
        !Array.isArray(productos) ||
        productos.length === 0
      ) {
        return res.status(400).json({
          mensaje: 'Completá tu nombre, correo y agregá productos al carrito.'
        });
      }

      const mediosPagoPermitidos = [
        'Mercado Pago',
        'Tarjeta de crédito',
        'Tarjeta de débito',
        'Transferencia bancaria',
        'Efectivo'
      ];

      if (!mediosPagoPermitidos.includes(medio_pago)) {
        return res.status(400).json({
          mensaje: 'Seleccioná un medio de pago válido.'
        });
      }

      const cantidades = new Map();

      for (const item of productos) {
        const id = Number(item.id);
        const cantidad = Number(item.quantity);

        if (
          !Number.isInteger(id) || id <= 0 ||
          !Number.isInteger(cantidad) || cantidad <= 0
        ) {
          return res.status(400).json({
            mensaje: 'Hay productos o cantidades inválidas.'
          });
        }

        cantidades.set(
          id,
          (cantidades.get(id) || 0) + cantidad
        );
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      const ids = [...cantidades.keys()];
      const placeholders = ids.map(() => '?').join(',');

      const [productosDB] = await connection.query(
        `SELECT id, nombre, precio, stock, activo
         FROM productos
         WHERE id IN (${placeholders})
         FOR UPDATE`,
        ids
      );

      if (productosDB.length !== ids.length) {
        throw new Error('Uno o más productos no están disponibles.');
      }

      let total = 0;
      const detalles = [];

      for (const producto of productosDB) {
        const cantidad = cantidades.get(Number(producto.id));

        if (!producto.activo || producto.stock < cantidad) {
          throw new Error(
            `No hay stock suficiente de ${producto.nombre}.`
          );
        }

        const precio = Number(producto.precio);
        total += precio * cantidad;

        detalles.push({
          id: producto.id,
          nombre: producto.nombre,
          cantidad,
          precio
        });
      }

      total = Number(total.toFixed(2));

      const usuarioId =
        req.usuario && req.usuario.rol === 'cliente'
          ? req.usuario.id
          : null;

      // Registrar pedido con entrega estimada a 3 días
      const [pedido] = await connection.query(
        `INSERT INTO pedidos
         (
           usuario_id,
           nombre_cliente,
           correo,
           telefono,
           direccion,
           total,
           estado,
           medio_pago,
           fecha_estimada_entrega
         )
         VALUES (
           ?, ?, ?, ?, ?, ?, 'Pendiente', ?,
           DATE_ADD(NOW(), INTERVAL 3 DAY)
         )`,
        [
          usuarioId,
          nombre_cliente.trim(),
          correo.trim(),
          telefono || null,
          direccion || null,
          total,
          medio_pago
        ]
      );

      const pedidoId = pedido.insertId;

      // Registrar productos y descontar stock
      for (const item of detalles) {
        await connection.query(
          `INSERT INTO pedido_items
           (pedido_id, producto_id, nombre_producto, cantidad, precio)
           VALUES (?, ?, ?, ?, ?)`,
          [
            pedidoId,
            item.id,
            item.nombre,
            item.cantidad,
            item.precio
          ]
        );

        await connection.query(
          `UPDATE productos
           SET stock = stock - ?
           WHERE id = ?`,
          [item.cantidad, item.id]
        );
      }

      // Obtener fecha estimada guardada
      const [fechaPedido] = await connection.query(
        `SELECT fecha_estimada_entrega
         FROM pedidos
         WHERE id = ?`,
        [pedidoId]
      );

      await connection.commit();

      res.status(201).json({
        estado: 'OK',
        mensaje: '¡Tu compra fue registrada correctamente!',
        pedido_id: pedidoId,
        total,
        medio_pago,
        estado_pedido: 'Pendiente',
        fecha_estimada_entrega: fechaPedido[0].fecha_estimada_entrega
      });

    } catch (error) {
      if (connection) {
        await connection.rollback();
      }

      console.error('Error al registrar pedido:', error.message);

      res.status(400).json({
        mensaje: error.message || 'No se pudo registrar el pedido.'
      });

    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);

// =====================================
// CONSULTAR MIS PEDIDOS - SOLO CLIENTE
// =====================================

router.get(
  '/pedidos/mis-pedidos',
  verificarToken,
  async (req, res) => {
    try {
      if (req.usuario.rol !== 'cliente') {
        return res.status(403).json({
          mensaje: 'Esta sección es solamente para clientes.'
        });
      }

      await actualizarEstadosAutomaticamente();

      const [pedidos] = await db.query(
        `SELECT
           id,
           nombre_cliente,
           correo,
           telefono,
           direccion,
           total,
           estado,
           medio_pago,
           creado_en,
           fecha_estimada_entrega
         FROM pedidos
         WHERE usuario_id = ?
         ORDER BY creado_en DESC`,
        [req.usuario.id]
      );

      if (pedidos.length === 0) {
        return res.json({
          estado: 'OK',
          pedidos: []
        });
      }

      const ids = pedidos.map(p => p.id);
      const placeholders = ids.map(() => '?').join(',');

      const [items] = await db.query(
        `SELECT
           pedido_id,
           producto_id,
           nombre_producto,
           cantidad,
           precio
         FROM pedido_items
         WHERE pedido_id IN (${placeholders})`,
        ids
      );

      const pedidosCompletos = pedidos.map(pedido => ({
        ...pedido,
        items: items.filter(
          item => Number(item.pedido_id) === Number(pedido.id)
        )
      }));

      res.json({
        estado: 'OK',
        pedidos: pedidosCompletos
      });

    } catch (error) {
      console.error('Error al consultar mis pedidos:', error.message);

      res.status(500).json({
        mensaje: 'No se pudieron consultar tus pedidos.'
      });
    }
  }
);

// =====================================
// CONSULTAR PEDIDOS - SOLO ADMIN
// =====================================

router.get(
  '/pedidos',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      await actualizarEstadosAutomaticamente();

      const [pedidos] = await db.query(
        `SELECT
           id,
           nombre_cliente,
           correo,
           telefono,
           direccion,
           total,
           estado,
           medio_pago,
           creado_en,
           fecha_estimada_entrega
         FROM pedidos
         ORDER BY creado_en DESC`
      );

      if (pedidos.length === 0) {
        return res.json({
          estado: 'OK',
          pedidos: []
        });
      }

      const ids = pedidos.map(p => p.id);
      const placeholders = ids.map(() => '?').join(',');

      const [items] = await db.query(
        `SELECT
           pedido_id,
           producto_id,
           nombre_producto,
           cantidad,
           precio
         FROM pedido_items
         WHERE pedido_id IN (${placeholders})`,
        ids
      );

      const pedidosCompletos = pedidos.map(pedido => ({
        ...pedido,
        items: items.filter(
          item => Number(item.pedido_id) === Number(pedido.id)
        )
      }));

      res.json({
        estado: 'OK',
        pedidos: pedidosCompletos
      });

    } catch (error) {
      console.error('Error al consultar pedidos:', error.message);

      res.status(500).json({
        mensaje: 'No se pudieron consultar los pedidos.'
      });
    }
  }
);

// =====================================
// ACTUALIZAR ESTADO Y ENVIAR NOTIFICACIÓN
// =====================================

router.put(
  '/pedidos/:id/estado',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;

      const estadosPermitidos = [
        'Pendiente',
        'Confirmado',
        'Enviado',
        'Entregado',
        'Cancelado'
      ];

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          mensaje: 'Número de pedido inválido.'
        });
      }

      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          mensaje: 'El estado indicado no es válido.'
        });
      }

      const [pedidos] = await db.query(
        `SELECT nombre_cliente, correo, estado
         FROM pedidos
         WHERE id = ?`,
        [id]
      );

      if (pedidos.length === 0) {
        return res.status(404).json({
          mensaje: 'No se encontró el pedido.'
        });
      }

      const pedidoActual = pedidos[0];
      const estadoAnterior = pedidoActual.estado;

      await db.query(
        `UPDATE pedidos SET estado = ? WHERE id = ?`,
        [estado, id]
      );

      if (estadoAnterior !== estado) {
        const mensajes = {
          Pendiente: 'Tu pedido se encuentra pendiente de confirmación.',
          Confirmado: '¡Tu compra fue confirmada! Estamos preparando tu pedido.',
          Enviado: '¡Tu pedido fue enviado! Pronto estará llegando a destino.',
          Entregado: '¡Tu pedido figura como entregado! Gracias por comprar en Electro Tecno.',
          Cancelado: 'Tu pedido fue cancelado. Si tenés alguna duda, contactanos.'
        };

        try {
          await transporter.sendMail({
            from: `"Electro Tecno" <${process.env.EMAIL_USER}>`,
            to: pedidoActual.correo,
            subject: `Actualización de tu pedido #${id} - Electro Tecno`,
            text: `
Hola ${pedidoActual.nombre_cliente}.

El estado de tu pedido #${id} cambió.

Estado anterior: ${estadoAnterior}
Nuevo estado: ${estado}

${mensajes[estado]}

Gracias por elegir Electro Tecno.
            `,
            html: `
              <div style="font-family: Arial, sans-serif; color: #222;">
                <h2>Electro Tecno</h2>
                <h3>Actualización de tu pedido #${id}</h3>

                <p>Hola ${escaparHTML(pedidoActual.nombre_cliente)}.</p>

                <p>El estado de tu compra fue actualizado.</p>

                <p>
                  <strong>Estado anterior:</strong>
                  ${escaparHTML(estadoAnterior)}
                </p>

                <p>
                  <strong>Nuevo estado:</strong>
                  ${escaparHTML(estado)}
                </p>

                <p>${escaparHTML(mensajes[estado])}</p>

                <p>¡Gracias por elegir Electro Tecno!</p>
              </div>
            `
          });

          console.log(`Notificación del pedido #${id} enviada correctamente.`);

        } catch (errorCorreo) {
          console.error(
            `Error al enviar el correo del pedido #${id}:`,
            errorCorreo
          );
        }
      }

      res.json({
        estado: 'OK',
        mensaje: 'Estado del pedido actualizado correctamente.'
      });

    } catch (error) {
      console.error('Error al actualizar pedido:', error.message);

      res.status(500).json({
        mensaje: 'No se pudo actualizar el pedido.'
      });
    }
  }
);

module.exports = router;
