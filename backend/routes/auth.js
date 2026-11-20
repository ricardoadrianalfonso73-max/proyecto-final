
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// Iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Ingresá tu correo y contraseña.'
      });
    }

    const [usuarios] = await db.query(
      'SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = ?',
      [correo.trim()]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
    }

    const usuario = usuarios[0];

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
    }

    if (usuario.rol !== 'admin') {
      return res.status(403).json({
        mensaje: 'No tenés permisos de administrador.'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Falta configurar JWT_SECRET en el archivo .env');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    res.json({
      estado: 'OK',
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error.message);

    res.status(500).json({
      mensaje: 'Error al iniciar sesión.'
    });
  }
});

module.exports = router;
