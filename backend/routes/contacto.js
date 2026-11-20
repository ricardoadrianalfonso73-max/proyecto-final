
const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

const {
  verificarToken,
  verificarAdmin
} = require('../middleware/verificarToken');

// Configuración del correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Comprobar si las variables están disponibles
console.log('Configuración de correo:', {
  usuario: Boolean(process.env.EMAIL_USER),
  contraseña: Boolean(process.env.EMAIL_PASS),
  destino: Boolean(process.env.EMAIL_DESTINO)
});

// Recibir una consulta desde el formulario de contacto
router.post('/contacto', async (req, res) => {
  try {
    const { nombre, correo, mensaje } = req.body;

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({
        estado: 'ERROR',
        mensaje: 'Todos los campos son obligatorios.'
      });
    }

    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim();
    const mensajeLimpio = mensaje.trim();

    // Guardar la consulta en MySQL
    await db.query(
      `INSERT INTO consultas_contacto (nombre, correo, mensaje)
       VALUES (?, ?, ?)`,
      [nombreLimpio, correoLimpio, mensajeLimpio]
    );

    // Enviar notificación por correo
    try {
      await transporter.sendMail({
        from: `"Electro Tecno" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_DESTINO,
        subject: 'Nueva consulta - Electro Tecno',
        text: `
Recibiste una nueva consulta desde Electro Tecno.

Nombre: ${nombreLimpio}
Correo: ${correoLimpio}

Mensaje:
${mensajeLimpio}
        `,
        html: `
          <h2>Nueva consulta - Electro Tecno</h2>
          <p><strong>Nombre:</strong> ${nombreLimpio}</p>
          <p><strong>Correo:</strong> ${correoLimpio}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensajeLimpio.replace(/\n/g, '<br>')}</p>
        `
      });

      console.log('Notificación enviada correctamente.');

    } catch (errorCorreo) {
      console.error('Error al enviar el correo:', errorCorreo);
    }

    // La consulta queda guardada aunque falle el correo
    res.status(201).json({
      estado: 'OK',
      mensaje: 'Tu consulta fue enviada correctamente.'
    });

  } catch (error) {
    console.error('Error al guardar consulta:', error);

    res.status(500).json({
      estado: 'ERROR',
      mensaje: 'No se pudo enviar la consulta.'
    });
  }
});

// Obtener consultas desde el panel de administración
router.get(
  '/admin/consultas',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const [consultas] = await db.query(
        `SELECT * FROM consultas_contacto
         ORDER BY creado_en DESC`
      );

      res.json({
        estado: 'OK',
        consultas
      });

    } catch (error) {
      console.error('Error al obtener consultas:', error);

      res.status(500).json({
        estado: 'ERROR',
        mensaje: 'No se pudieron obtener las consultas.'
      });
    }
  }
);

// Cambiar el estado de una consulta
router.put(
  '/admin/consultas/:id/estado',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['Pendiente', 'Respondida'].includes(estado)) {
        return res.status(400).json({
          estado: 'ERROR',
          mensaje: 'Estado no válido.'
        });
      }

      const [resultado] = await db.query(
        `UPDATE consultas_contacto
         SET estado = ?
         WHERE id = ?`,
        [estado, id]
      );

      if (resultado.affectedRows === 0) {
        return res.status(404).json({
          estado: 'ERROR',
          mensaje: 'Consulta no encontrada.'
        });
      }

      res.json({
        estado: 'OK',
        mensaje: 'Estado actualizado correctamente.'
      });

    } catch (error) {
      console.error('Error al actualizar consulta:', error);

      res.status(500).json({
        estado: 'ERROR',
        mensaje: 'No se pudo actualizar la consulta.'
      });
    }
  }
);

module.exports = router;
