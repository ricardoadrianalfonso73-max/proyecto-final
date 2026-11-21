
import React, { useState } from 'react';

import {
  Wrench,
  Smartphone,
  BatteryCharging,
  Monitor,
  CheckCircle,
  ShieldCheck,
  Clock
} from 'lucide-react';

import TechnicalServiceModal from '../components/TechnicalServiceModal.js';
import './TechnicalService.css';

const h = React.createElement;

const services = [
  {
    icon: Smartphone,
    title: 'PANTALLAS',
    description: 'Reparación y reemplazo de pantallas dañadas.'
  },
  {
    icon: BatteryCharging,
    title: 'BATERÍAS',
    description: 'Revisión y cambio de baterías.'
  },
  {
    icon: Monitor,
    title: 'SOFTWARE',
    description: 'Solución de problemas del sistema y configuración.'
  },
  {
    icon: Wrench,
    title: 'REPARACIONES',
    description: 'Diagnóstico y reparación de fallas generales.'
  }
];

export default function TechnicalService() {
  const [modalOpen, setModalOpen] = useState(false);

  return h(React.Fragment, null,

    h('main', { className: 'technical-page' },

      h('section', { className: 'technical-hero' },

        h('div', { className: 'technical-hero-content' },

          h('span', { className: 'technical-label' },
            h(Wrench, { size: 16 }),
            ' SERVICIO TÉCNICO ELECTRO TECNO'
          ),

          h('h1', null,
            'LE DAMOS UNA ',
            h('span', null, 'SEGUNDA VIDA'),
            ' A TU CELULAR'
          ),

          h('p', null,
            'Reparamos tus dispositivos para que vuelvas a disfrutar de la tecnología. Contamos con atención personalizada y soluciones para distintos problemas.'
          ),

          h('button', {
            className: 'technical-main-button',
            onClick: () => setModalOpen(true)
          }, 'CONSULTAR SERVICIO TÉCNICO')
        ),

        h('div', { className: 'technical-hero-image' },

          h('img', {
            src: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1000',
            alt: 'Técnico trabajando en la reparación de un dispositivo'
          }),

          h('div', { className: 'technical-image-tag' },
            h(Wrench, { size: 18 }),
            h('span', null, 'SOLUCIONES TECNOLÓGICAS')
          )
        )
      ),

      h('section', { className: 'technical-services-section' },

        h('div', { className: 'technical-section-heading' },
          h('span', { className: 'technical-label' }, 'QUÉ PODEMOS HACER'),
          h('h2', null, 'NUESTROS ', h('span', null, 'SERVICIOS')),
          h('p', null, 'Trabajamos para ayudarte a recuperar el funcionamiento de tus dispositivos.')
        ),

        h('div', { className: 'technical-services-grid' },

          services.map((service) =>
            h('article', {
              className: 'technical-service-card',
              key: service.title
            },

              h('div', { className: 'technical-service-icon' },
                h(service.icon, { size: 30 })
              ),

              h('h3', null, service.title),
              h('p', null, service.description)
            )
          )
        )
      ),

      h('section', { className: 'technical-benefits' },

        h('div', null,
          h(CheckCircle, { size: 23 }),
          h('span', null, 'Atención personalizada')
        ),

        h('div', null,
          h(ShieldCheck, { size: 23 }),
          h('span', null, 'Cuidado de tus dispositivos')
        ),

        h('div', null,
          h(Clock, { size: 23 }),
          h('span', null, 'Diagnóstico del problema')
        )
      ),

      h('section', { className: 'technical-cta' },

        h('h2', null, '¿TU CELULAR NECESITA REPARACIÓN?'),

        h('p', null, 'Contanos qué le sucede y te ayudaremos a encontrar una solución.'),

        h('button', {
          className: 'technical-main-button',
          onClick: () => setModalOpen(true)
        }, 'HACER UNA CONSULTA')
      )
    ),

    modalOpen
      ? h(TechnicalServiceModal, {
          onClose: () => setModalOpen(false)
        })
      : null
  );
}
