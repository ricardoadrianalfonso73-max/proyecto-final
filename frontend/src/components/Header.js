
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  UserRound,
  Menu,
  X,
  Zap
} from 'lucide-react';

import './Header.css';

const h = React.createElement;

function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const links = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    { name: 'Servicio Técnico', path: '/servicio-tecnico' },
    { name: 'Contacto', path: '/contacto' }
  ];

  return h('header', { className: 'header' },
    h('div', { className: 'header-container' },

      h(Link, { to: '/', className: 'brand' },
        h('div', { className: 'brand-icon' },
          h(Zap, { size: 25 })
        ),
        h('div', null,
          h('h2', null, 'ELECTRO ', h('span', null, 'TECNO')),
          h('small', null, 'TECNOLOGÍA A TU ALCANCE')
        )
      ),

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

      h('div', { className: 'header-actions' },

        h(Link, { to: '/login', className: 'login-button' },
          h(UserRound, { size: 17 }),
          'Ingresar'
        ),

        h('button', {
          className: 'mobile-menu',
          onClick: () => setMenuOpen(!menuOpen),
          'aria-label': 'Abrir menú'
        }, h(menuOpen ? X : Menu, { size: 25 }))
      )
    )
  );
}

export default Header;
