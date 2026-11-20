
const express = require('express');
const db = require('../db');

const {
  verificarToken,
  verificarAdmin
} = require('../middleware/verificarToken');

const router = express.Router();

// =====================================
// REGISTRAR SOLICITUD DE SERVICIO TÉCNICO
// =====================================

router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      telefono,
      modelo,
      problema
    } = req.body;

    if (
      !nombre?.trim() ||
      !telefono?.trim() ||
      !modelo?.trim() ||
      !problema?.trim()
    ) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios.'
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO servicio_tecnico
      (nombre, telefono, modelo, problema)
      VALUES (?, ?, ?, ?)`,
      [
        nombre.trim(),
        telefono.trim(),
        modelo.trim(),
        problema.trim()
      ]
    );

    res.status(201).json({
      mensaje: 'Tu solicitud de servicio técnico fue registrada correctamente.',
      id: resultado.insertId
    });

  } catch (error) {
    console.error('Error al registrar servicio técnico:', error);

    res.status(500).json({
      mensaje: 'No se pudo registrar la solicitud.'
    });
  }
});

// =====================================
// CONSULTAR SOLICITUDES (ADMINISTRADOR)
// =====================================

router.get('/admin', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [solicitudes] = await db.query(
      `SELECT *
       FROM servicio_tecnico
       ORDER BY creado_en DESC`
    );

    res.json(solicitudes);

  } catch (error) {
    console.error('Error al consultar servicios técnicos:', error);

    res.status(500).json({
      mensaje: 'No se pudieron obtener las solicitudes.'
    });
  }
});

// =====================================
// ACTUALIZAR ESTADO (ADMINISTRADOR)
// =====================================

router.put('/admin/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      'Pendiente',
      'En revisión',
      'Reparado',
      'Entregado'
    ];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        mensaje: 'El estado seleccionado no es válido.'
      });
    }

    const [resultado] = await db.query(
      `UPDATE servicio_tecnico
       SET estado = ?
       WHERE id = ?`,
      [estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'No se encontró la solicitud.'
      });
    }

    res.json({
      mensaje: 'El estado de la solicitud se actualizó correctamente.'
    });

  } catch (error) {
    console.error('Error al actualizar servicio técnico:', error);

    res.status(500).json({
      mensaje: 'No se pudo actualizar el estado.'
    });
  }
});

module.exports = router;
