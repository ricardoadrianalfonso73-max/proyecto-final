
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock } from 'lucide-react';

import { registrarCliente } from '../services/api.js';
import './Registro.css';

const h = React.createElement;

function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = React.useState('');
  const [correo, setCorreo] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmarPassword, setConfirmarPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [mensaje, setMensaje] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleRegistro(event) {
    event.preventDefault();

    setError('');
    setMensaje('');

    if (password !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const datos = await registrarCliente({
        nombre,
        correo,
        password
      });

      sessionStorage.setItem('clienteToken', datos.token);
      sessionStorage.setItem(
        'clienteUsuario',
        JSON.stringify(datos.usuario)
      );

      setMensaje('¡Tu cuenta fue creada correctamente!');

      navigate('/productos');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return h('main', { className: 'registro-page' },

    h('form', {
      className: 'registro-form',
      onSubmit: handleRegistro
    },

      h('div', { className: 'registro-icon' },
        h(UserPlus, { size: 30 })
      ),

      h('h1', { className: 'registro-title' },
        'CREAR CUENTA'
      ),

      h('p', { className: 'registro-subtitle' },
        'Unite a ELECTRO TECNO'
      ),

      h('label', { className: 'registro-label' },
        'Nombre completo'
      ),

      h('div', { className: 'registro-input-group' },
        h(User, { size: 18 }),
        h('input', {
          type: 'text',
          placeholder: 'Ingresá tu nombre',
          value: nombre,
          onChange: e => setNombre(e.target.value),
          required: true,
          minLength: 2,
          autoComplete: 'name'
        })
      ),

      h('label', { className: 'registro-label' },
        'Correo electrónico'
      ),

      h('div', { className: 'registro-input-group' },
        h(Mail, { size: 18 }),
        h('input', {
          type: 'email',
          placeholder: 'ejemplo@gmail.com',
          value: correo,
          onChange: e => setCorreo(e.target.value),
          required: true,
          autoComplete: 'email'
        })
      ),

      h('label', { className: 'registro-label' },
        'Contraseña'
      ),

      h('div', { className: 'registro-input-group' },
        h(Lock, { size: 18 }),
        h('input', {
          type: 'password',
          placeholder: 'Mínimo 8 caracteres',
          value: password,
          onChange: e => setPassword(e.target.value),
          required: true,
          minLength: 8,
          autoComplete: 'new-password'
        })
      ),

      h('label', { className: 'registro-label' },
        'Confirmar contraseña'
      ),

      h('div', { className: 'registro-input-group' },
        h(Lock, { size: 18 }),
        h('input', {
          type: 'password',
          placeholder: 'Repetí tu contraseña',
          value: confirmarPassword,
          onChange: e => setConfirmarPassword(e.target.value),
          required: true,
          autoComplete: 'new-password'
        })
      ),

      error && h('p', { className: 'registro-error' }, error),

      mensaje && h('p', { className: 'registro-success' }, mensaje),

      h('button', {
        type: 'submit',
        className: 'registro-button',
        disabled: loading
      }, loading ? 'CREANDO CUENTA...' : 'REGISTRARME'),

      h('p', { className: 'registro-login' },
        '¿Ya tenés una cuenta? ',
        h(Link, { to: '/login' }, 'Ingresá aquí')
      )
    )
  );
}

export default Registro;
