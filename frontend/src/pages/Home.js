
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

import Benefits from '../components/Benefits.js';
import CategoryCard from '../components/CategoryCard.js';

const h = React.createElement;

function Home() {
  const categories = [
    {
      title: 'CELULARES',
      description: 'Nuevos y usados',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
      path: '/productos'
    },
    {
      title: 'SERVICIO TÉCNICO',
      description: 'Reparaciones y soluciones',
      image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800',
      path: '/servicio-tecnico'
    },
    {
      title: 'ACCESORIOS',
      description: 'Todo para tus dispositivos',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      path: '/productos'
    }
  ];

  return h(React.Fragment, null,

    h('section', { className: 'hero-section' },
      h('div', { className: 'hero-glow' }),

      h('div', { className: 'container-main hero-content' },

        h('div', { className: 'hero-text' },
          h('div', { className: 'hero-label' },
            h(Zap, { size: 16 }),
            ' TU TIENDA DE TECNOLOGÍA'
          ),

          h('h1', null,
            'ELECTRO',
            h('br'),
            h('span', null, 'TECNO')
          ),

          h('h2', null, 'TECNOLOGÍA A TU ALCANCE'),

          h('p', null,
            'Celulares nuevos y usados, reparación y accesorios. Encontrá todo lo que necesitás en un solo lugar.'
          ),

          h(Link, { to: '/productos', className: 'neon-button hero-button' },
            'VER PRODUCTOS',
            h(ArrowRight, { size: 19 })
          ),

          h('div', { className: 'hero-trust' },
            h(ShieldCheck, { size: 17 }),
            'Tecnología, calidad y confianza'
          )
        ),

        h('div', { className: 'hero-image-container' },
          h('div', { className: 'hero-circle' }),
          h('div', { className: 'hero-image-glow' }),
          h('img', {
            src: '/electro-tecno-tienda.jpg',
            alt: 'Tienda Electro Tecno',
            className: 'hero-image'
          }),
          h('div', { className: 'hero-floating-card' },
            h('span', null, 'ELECTRO TECNO'),
            h('strong', null, 'INNOVACIÓN')
          )
        )
      )
    ),

    h(Benefits),

    h('section', { className: 'categories-section' },
      h('div', { className: 'container-main' },

        h('div', { className: 'section-heading' },
          h('span', null, 'DESCUBRÍ NUESTRA TIENDA'),
          h('h2', null, 'NUESTRAS ', h('span', null, 'CATEGORÍAS')),
          h('p', null, 'Encontrá todo lo que necesitás en tecnología.')
        ),

        h('div', { className: 'categories-grid' },
          ...categories.map((category, index) =>
            h(CategoryCard, {
              key: index,
              ...category
            })
          )
        )
      )
    )
  );
}

export default Home;
