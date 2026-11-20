
const express = require('express');
const db = require('../db');
const nodemailer = require('nodemailer');

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

// Escapar caracteres especiales para el correo HTML
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
// REGISTRAR UNA COMPRA
// =====================================

router.post('/pedidos', async (req, res) => {
  let connection;

  try {
    const {
      nombre_cliente,
      correo,
      telefono,
      direccion,
      productos
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

    const [pedido] = await connection.query(
      `INSERT INTO pedidos
       (usuario_id, nombre_cliente, correo, telefono, direccion, total, estado)
       VALUES (NULL, ?, ?, ?, ?, ?, 'Pendiente')`,
      [
        nombre_cliente.trim(),
        correo.trim(),
        telefono || null,
        direccion || null,
        total
      ]
    );

    const pedidoId = pedido.insertId;

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

    await connection.commit();

    res.status(201).json({
      estado: 'OK',
      mensaje: '¡Tu pedido fue registrado correctamente!',
      pedido_id: pedidoId,
      total
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
});


// =====================================
// CONSULTAR PEDIDOS - SOLO ADMIN
// =====================================

router.get(
  '/pedidos',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const [pedidos] = await db.query(
        `SELECT id, nombre_cliente, correo, telefono,
                direccion, total, estado, creado_en
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
        `SELECT pedido_id, producto_id, nombre_producto,
                cantidad, precio
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

      // Buscar los datos actuales del pedido
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

      // Actualizar el estado en MySQL
      await db.query(
        `UPDATE pedidos SET estado = ? WHERE id = ?`,
        [estado, id]
      );

      // Enviar correo solamente si el estado cambió
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
