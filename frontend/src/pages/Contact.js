
import React, { useState } from 'react';

import './Contact.css';

import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Instagram,
  Facebook,
  Clock
} from 'lucide-react';

const h = React.createElement;

const API = 'http://localhost:3000/api';

export default function Contact() {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    mensaje: ''
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'No se pudo enviar la consulta.');
      }

      setSent(true);

    } catch (err) {
      console.error('Error al enviar consulta:', err);
      setError(err.message || 'No se pudo conectar con el servidor.');

    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ nombre: '', correo: '', mensaje: '' });
    setSent(false);
    setError('');
  }

  return h('main', { className: 'contact-page' },

    h('section', { className: 'contact-hero' },
      h('span', { className: 'contact-eyebrow' }, 'ELECTRO TECNO'),
      h('h1', null, 'ESTAMOS PARA ', h('span', null, 'AYUDARTE')),
      h('p', null,
        '¿Tenés alguna consulta sobre nuestros productos, reparaciones o servicios? Escribinos y nos pondremos en contacto.'
      )
    ),

    h('section', { className: 'contact-content' },

      h('div', { className: 'contact-information' },
        h('span', { className: 'contact-label' }, 'HABLEMOS'),
        h('h2', null, 'CONTACTATE CON ', h('span', null, 'NOSOTROS')),
        h('p', { className: 'contact-information-text' },
          'En Electro Tecno queremos brindarte una buena atención. Podés comunicarte con nosotros por nuestros canales de contacto.'
        ),

        h('div', { className: 'contact-detail' },
          h('div', { className: 'contact-detail-icon' }, h(Mail, { size: 22 })),
          h('div', null,
            h('strong', null, 'Correo electrónico'),
            h('span', null, 'Agregá aquí tu correo de contacto')
          )
        ),

        h('div', { className: 'contact-detail' },
          h('div', { className: 'contact-detail-icon' }, h(Phone, { size: 22 })),
          h('div', null,
            h('strong', null, 'Teléfono'),
            h('span', null, 'Agregá aquí tu número de contacto')
          )
        ),

        h('div', { className: 'contact-detail' },
          h('div', { className: 'contact-detail-icon' }, h(MapPin, { size: 22 })),
          h('div', null,
            h('strong', null, 'Ubicación'),
            h('span', null, 'Agregá aquí la dirección del negocio')
          )
        ),

        h('div', { className: 'contact-detail' },
          h('div', { className: 'contact-detail-icon' }, h(Clock, { size: 22 })),
          h('div', null,
            h('strong', null, 'Atención'),
            h('span', null, 'Consultanos por nuestros horarios')
          )
        ),

        h('div', { className: 'contact-socials' },
          h('span', null, 'SEGUINOS'),
          h('div', { className: 'contact-social-icons' },
            h('a', {
              href: 'https://www.instagram.com/',
              target: '_blank',
              rel: 'noreferrer',
              'aria-label': 'Instagram'
            }, h(Instagram, { size: 21 })),
            h('a', {
              href: 'https://www.facebook.com/',
              target: '_blank',
              rel: 'noreferrer',
              'aria-label': 'Facebook'
            }, h(Facebook, { size: 21 }))
          )
        )
      ),

      h('div', { className: 'contact-form-card' },
        sent
          ? h('div', { className: 'contact-success' },
              h('div', { className: 'contact-success-icon' }, h(MessageCircle, { size: 36 })),
              h('h2', null, '¡MENSAJE ENVIADO!'),
              h('p', null,
                'Tu consulta fue recibida correctamente. Gracias por comunicarte con Electro Tecno.'
              ),
              h('button', {
                className: 'contact-submit',
                onClick: resetForm
              }, 'ENVIAR OTRO MENSAJE')
            )
          : h(React.Fragment, null,
              h('div', { className: 'contact-form-heading' },
                h('span', null, 'ENVIANOS TU CONSULTA'),
                h('h2', null, 'ESCRIBINOS')
              ),

              h('form', { className: 'contact-form', onSubmit: handleSubmit },
                h('label', null, 'Nombre completo',
                  h('input', {
                    type: 'text',
                    name: 'nombre',
                    value: form.nombre,
                    onChange: handleChange,
                    placeholder: 'Ingresá tu nombre',
                    required: true
                  })
                ),

                h('label', null, 'Correo electrónico',
                  h('input', {
                    type: 'email',
                    name: 'correo',
                    value: form.correo,
                    onChange: handleChange,
                    placeholder: 'ejemplo@correo.com',
                    required: true
                  })
                ),

                h('label', null, 'Mensaje',
                  h('textarea', {
                    name: 'mensaje',
                    value: form.mensaje,
                    onChange: handleChange,
                    placeholder: 'Escribí tu consulta...',
                    rows: 6,
                    required: true
                  })
                ),

                error && h('p', {
                  className: 'contact-error'
                }, error),

                h('button', {
                  type: 'submit',
                  className: 'contact-submit',
                  disabled: loading
                },
                  h(Send, { size: 18 }),
                  loading ? ' ENVIANDO...' : ' ENVIAR MENSAJE'
                )
              )
            )
      )
    ),

    h('section', { className: 'contact-bottom' },
      h('div', { className: 'contact-bottom-icon' }, h(MessageCircle, { size: 30 })),
      h('div', null,
        h('h2', null, 'ELECTRO TECNO'),
        h('p', null, 'Tecnología a tu alcance. Gracias por confiar en nosotros.')
      )
    )
  );
}
