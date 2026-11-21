
import React from 'react';
import { useNavigate } from 'react-router-dom';

import './/Login.css';

const h = React.createElement;

function Login() {
  const navigate = useNavigate();

  const [correo, setCorreo] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const respuesta = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo,
          password
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo iniciar sesión.');
      }

      sessionStorage.setItem('adminToken', datos.token);
      sessionStorage.setItem('adminUsuario', JSON.stringify(datos.usuario));

      navigate('/admin');

    } catch (err) {
      setError(err.message);
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
        'Acceso de administrador'
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
      }, loading ? 'Ingresando...' : 'INICIAR SESIÓN')
    )
  );
}

export default Login;
