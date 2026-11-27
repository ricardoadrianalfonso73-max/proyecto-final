
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

// =====================================
// INICIAR SESIÓN COMO ADMINISTRADOR
// =====================================

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
      [correo.trim().toLowerCase()]
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


// =====================================
// REGISTRO DE CLIENTES
// =====================================

router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        mensaje: 'Completá todos los campos.'
      });
    }

    if (nombre.trim().length < 2) {
      return res.status(400).json({
        mensaje: 'Ingresá un nombre válido.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        mensaje: 'La contraseña debe tener al menos 8 caracteres.'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Falta configurar JWT_SECRET en el archivo .env');
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const [existentes] = await db.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correoNormalizado]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        mensaje: 'Ya existe una cuenta con ese correo electrónico.'
      });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const [resultado] = await db.query(
      `INSERT INTO usuarios (nombre, correo, password, rol)
       VALUES (?, ?, ?, 'cliente')`,
      [
        nombre.trim(),
        correoNormalizado,
        passwordEncriptada
      ]
    );

    const usuario = {
      id: resultado.insertId,
      nombre: nombre.trim(),
      correo: correoNormalizado,
      rol: 'cliente'
    };

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

    res.status(201).json({
      estado: 'OK',
      mensaje: 'Tu cuenta fue creada correctamente.',
      token,
      usuario
    });

  } catch (error) {
    console.error('Error al registrar cliente:', error.message);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensaje: 'Ya existe una cuenta con ese correo electrónico.'
      });
    }

    res.status(500).json({
      mensaje: 'No se pudo crear la cuenta.'
    });
  }
});


// =====================================
// INICIAR SESIÓN COMO CLIENTE
// =====================================

router.post('/cliente/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: 'Ingresá tu correo y contraseña.'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('Falta configurar JWT_SECRET en el archivo .env');
    }

    const [usuarios] = await db.query(
      `SELECT id, nombre, correo, password, rol
       FROM usuarios
       WHERE correo = ?`,
      [correo.trim().toLowerCase()]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
    }

    const usuario = usuarios[0];

    if (usuario.rol !== 'cliente') {
      return res.status(403).json({
        mensaje: 'Esta cuenta no corresponde a un cliente.'
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: 'Correo o contraseña incorrectos.'
      });
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
      mensaje: 'Bienvenido a Electro Tecno.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login de cliente:', error.message);

    res.status(500).json({
      mensaje: 'No se pudo iniciar sesión.'
    });
  }
});

module.exports = router;
