
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import {
  UserRound,
  UserPlus,
  Menu,
  X,
  Zap,
  ChevronDown,
  LogOut
} from 'lucide-react';

import './Header.css';

const h = React.createElement;

function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [cuentaOpen, setCuentaOpen] = React.useState(false);

  const navigate = useNavigate();

  const adminToken = sessionStorage.getItem('adminToken');
  const clienteToken = sessionStorage.getItem('clienteToken');

  const tipoUsuario = adminToken
    ? 'admin'
    : clienteToken
      ? 'cliente'
      : null;

  let usuario = null;

  try {
    const datos = tipoUsuario === 'admin'
      ? sessionStorage.getItem('adminUsuario')
      : sessionStorage.getItem('clienteUsuario');

    usuario = datos ? JSON.parse(datos) : null;
  } catch (error) {
    usuario = null;
  }

  const links = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    { name: 'Servicio Técnico', path: '/servicio-tecnico' },
    { name: 'Contacto', path: '/contacto' }
  ];

  function cerrarSesion() {
    sessionStorage.removeItem('clienteToken');
    sessionStorage.removeItem('clienteUsuario');

    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsuario');

    setCuentaOpen(false);
    setMenuOpen(false);

    navigate('/');
  }

  function cerrarMenuCuenta() {
    setCuentaOpen(false);
    setMenuOpen(false);
  }

  return h('header', { className: 'header' },

    h('div', { className: 'header-container' },

      // LOGOTIPO
      h(Link, { to: '/', className: 'brand' },
        h('div', { className: 'brand-icon' },
          h(Zap, { size: 25 })
        ),
        h('div', null,
          h('h2', null, 'ELECTRO ', h('span', null, 'TECNO')),
          h('small', null, 'TECNOLOGÍA A TU ALCANCE')
        )
      ),

      // NAVEGACIÓN
      h('nav', {
        className: menuOpen ? 'nav-menu active' : 'nav-menu'
      },
        ...links.map(link =>
          h(NavLink, {
            key: link.path,
            to: link.path,
            end: link.path === '/',
            className: ({ isActive }) =>
              isActive ? 'nav-link selected' : 'nav-link',
            onClick: () => setMenuOpen(false)
          }, link.name)
        )
      ),

      // ACCIONES DEL HEADER
      h('div', { className: 'header-actions' },

        tipoUsuario && usuario

          // USUARIO CON SESIÓN INICIADA
          ? h('div', { className: 'account-container' },

              h('button', {
                type: 'button',
                className: 'account-button',
                onClick: () => setCuentaOpen(!cuentaOpen),
                'aria-expanded': cuentaOpen
              },

                h('div', { className: 'account-avatar' },
                  h(UserRound, { size: 21 })
                ),

                h('span', { className: 'account-name' },
                  usuario.nombre || 'Mi cuenta'
                ),

                h(ChevronDown, {
                  size: 18,
                  className: cuentaOpen ? 'account-chevron open' : 'account-chevron'
                })
              ),

              cuentaOpen && h('div', { className: 'account-dropdown' },

                h('div', { className: 'account-info' },
                  h('strong', null, usuario.nombre || 'Usuario'),
                  h('span', null, usuario.correo || ''),
                  h('small', null,
                    tipoUsuario === 'admin'
                      ? 'Administrador'
                      : 'Cliente de Electro Tecno'
                  )
                ),

                // OPCIÓN EXCLUSIVA PARA CLIENTES
                tipoUsuario === 'cliente' && h(Link, {
                  to: '/mi-cuenta',
                  className: 'account-profile',
                  onClick: cerrarMenuCuenta
                },
                  h(UserRound, { size: 17 }),
                  'Mi cuenta'
                ),

                // CERRAR SESIÓN
                h('button', {
                  type: 'button',
                  className: 'account-logout',
                  onClick: cerrarSesion
                },
                  h(LogOut, { size: 17 }),
                  'Cerrar sesión'
                )
              )
            )

          // USUARIO SIN SESIÓN
          : h(React.Fragment, null,

              h(Link, {
                to: '/login',
                className: 'login-button'
              },
                h(UserRound, { size: 17 }),
                'Ingresar'
              ),

              h(Link, {
                to: '/registro',
                className: 'register-button'
              },
                h(UserPlus, { size: 17 }),
                'Registrarse'
              )
            ),

        // MENÚ PARA CELULARES
        h('button', {
          className: 'mobile-menu',
          onClick: () => setMenuOpen(!menuOpen),
          'aria-label': 'Abrir menú'
        },
          h(menuOpen ? X : Menu, { size: 25 })
        )
      )
    )
  );
}

export default Header;
