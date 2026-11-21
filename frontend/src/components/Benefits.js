
import React from 'react';
import {
  Truck,
  ShieldCheck,
  Headphones
} from 'lucide-react';

import './Benefits.css';

const h = React.createElement;

const benefits = [
  {
    icon: Truck,
    title: 'Envíos a todo el país',
    description: 'Recibí tus productos donde estés.'
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    description: 'Comprá con tranquilidad y confianza.'
  },
  {
    icon: Headphones,
    title: 'Soporte técnico',
    description: 'Te acompañamos cuando lo necesites.'
  }
];

function Benefits() {
  return h('section', { className: 'benefits-section' },
    h('div', { className: 'container-main benefits-grid' },
      ...benefits.map((item, index) =>
        h('article', { className: 'benefit-card', key: index },
          h('div', { className: 'benefit-icon' },
            h(item.icon, { size: 29 })
          ),
          h('div', null,
            h('h3', null, item.title),
            h('p', null, item.description)
          )
        )
      )
    )
  );
}

export default Benefits;
