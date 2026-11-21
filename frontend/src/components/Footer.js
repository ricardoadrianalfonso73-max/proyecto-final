
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';

import './Footer.css';

const h = React.createElement;

function Footer() {
  return h('footer', { className: 'footer' },
    h('div', { className: 'container-main footer-grid' },

      h('div', { className: 'footer-brand' },
        h('h2', null,
          h(Zap, { size: 24 }),
          ' ELECTRO ',
          h('span', null, 'TECNO')
        ),
        h('p', null,
          'Tecnología a tu alcance. Celulares, accesorios y servicio técnico.'
        )
      ),

      h('div', null,
        h('h3', null, 'NAVEGACIÓN'),
        h(Link, { to: '/' }, 'Inicio'),
        h(Link, { to: '/productos' }, 'Productos'),
        h(Link, { to: '/servicio-tecnico' }, 'Servicio Técnico'),
        h(Link, { to: '/contacto' }, 'Contacto')
      ),

      h('div', null,
        h('h3', null, 'CATEGORÍAS'),
        h(Link, { to: '/productos' }, 'Celulares'),
        h(Link, { to: '/productos' }, 'Computación'),
        h(Link, { to: '/productos' }, 'Accesorios'),
        h(Link, { to: '/productos' }, 'Ofertas')
      ),

      h('div', null,
        h('h3', null, 'SEGUINOS'),
        h('div', { className: 'social-links' },
          h('a', {
            href: 'https://instagram.com',
            target: '_blank',
            rel: 'noreferrer',
            'aria-label': 'Instagram'
          }, h(Instagram)),

          h('a', {
            href: 'https://facebook.com',
            target: '_blank',
            rel: 'noreferrer',
            'aria-label': 'Facebook'
          }, h(Facebook)),

          h('a', {
            href: 'https://wa.me/',
            target: '_blank',
            rel: 'noreferrer',
            'aria-label': 'WhatsApp'
          }, h(MessageCircle))
        )
      )
    ),

    h('div', { className: 'footer-bottom' },
      '© 2026 Electro Tecno. Todos los derechos reservados.'
    )
  );
}

export default Footer;
