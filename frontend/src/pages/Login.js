
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { iniciarSesionAdmin, iniciarSesionCliente } from '../services/api.js';

import './Login.css';

const h = React.createElement;

function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [tipoUsuario, setTipoUsuario] = React.useState('cliente');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const datos = {
        correo: correo.trim(),
        password
      };

      let respuesta;

      if (tipoUsuario === 'admin') {
        respuesta = await iniciarSesionAdmin(datos);

        sessionStorage.setItem('adminToken', respuesta.token);
        sessionStorage.setItem(
          'adminUsuario',
          JSON.stringify(respuesta.usuario)
        );

        sessionStorage.removeItem('clienteToken');
        sessionStorage.removeItem('clienteUsuario');

        navigate('/admin');

      } else {
        respuesta = await iniciarSesionCliente(datos);

        sessionStorage.setItem('clienteToken', respuesta.token);
        sessionStorage.setItem(
          'clienteUsuario',
          JSON.stringify(respuesta.usuario)
        );

        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUsuario');

        navigate('/productos');
      }

    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return h('main', { className: 'login-page' },

    h('form', {
      onSubmit: handleLogin,
      className: 'login-form'
    },

      h('h1', { className: 'login-title' },
        'ELECTRO TECNO'
      ),

      h('p', { className: 'login-subtitle' },
        'Ingresá a tu cuenta'
      ),

      h('label', { className: 'login-label' },
        'Tipo de usuario'
      ),

      h('select', {
        className: 'login-input',
        value: tipoUsuario,
        onChange: (e) => setTipoUsuario(e.target.value)
      },
        h('option', { value: 'cliente' }, 'Cliente'),
        h('option', { value: 'admin' }, 'Administrador')
      ),

      h('label', { className: 'login-label' },
        'Correo electrónico'
      ),

      h('input', {
        type: 'email',
        value: correo,
        onChange: (e) => setCorreo(e.target.value),
        placeholder: 'Ingresá tu correo',
        required: true,
        autoComplete: 'username',
        className: 'login-input'
      }),

      h('label', { className: 'login-label' },
        'Contraseña'
      ),

      h('input', {
        type: 'password',
        value: password,
        onChange: (e) => setPassword(e.target.value),
        placeholder: 'Ingresá tu contraseña',
        required: true,
        autoComplete: 'current-password',
        className: 'login-input'
      }),

      error && h('p', { className: 'login-error' }, error),

      h('button', {
        type: 'submit',
        disabled: loading,
        className: 'login-button'
      }, loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'),

      tipoUsuario === 'cliente' && h('p', {
        className: 'login-register'
      },
        '¿Todavía no tenés cuenta? ',
        h(Link, { to: '/registro' }, 'Registrate aquí')
      )
    )
  );
}

export default Login;
