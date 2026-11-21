
import React, { useState } from 'react';

import {
  X,
  Wrench,
  Send
} from 'lucide-react';

import './TechnicalServiceModal.css';

const h = React.createElement;

const API = 'http://localhost:3000/api';

export default function TechnicalServiceModal({ onClose }) {
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    modelo: '',
    problema: ''
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/servicio-tecnico`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensaje || 'No se pudo enviar la solicitud.'
        );
      }

      setSent(true);

    } catch (err) {
      console.error('Error al enviar solicitud:', err);

      setError(
        err.message || 'No se pudo conectar con el servidor.'
      );

    } finally {
      setLoading(false);
    }
  }

  return h('div', {
    className: 'tech-modal-overlay',
    onClick: onClose
  },

    h('div', {
      className: sent
        ? 'tech-modal tech-success'
        : 'tech-modal',
      onClick: (event) => event.stopPropagation()
    },

      h('button', {
        type: 'button',
        className: 'tech-modal-close',
        onClick: onClose,
        'aria-label': 'Cerrar'
      }, h(X, { size: 22 })),

      sent

        ? h(React.Fragment, null,

            h('div', {
              className: 'tech-success-icon'
            }, h(Wrench, { size: 34 })),

            h('h2', null, '¡SOLICITUD ENVIADA!'),

            h('p', null,
              'Tu solicitud de servicio técnico fue registrada correctamente. Nos pondremos en contacto con vos.'
            ),

            h('button', {
              type: 'button',
              className: 'tech-submit-button',
              onClick: onClose
            }, 'ENTENDIDO')
          )

        : h(React.Fragment, null,

            h('div', {
              className: 'tech-modal-heading'
            },

              h('span', {
                className: 'tech-modal-icon'
              }, h(Wrench, { size: 25 })),

              h('div', null,

                h('span', {
                  className: 'tech-eyebrow'
                }, 'ELECTRO TECNO'),

                h('h2', null, 'SOLICITÁ UNA REPARACIÓN')
              )
            ),

            h('p', {
              className: 'tech-modal-description'
            },
              'Contanos qué problema tiene tu equipo y nos pondremos en contacto.'
            ),

            h('form', {
              onSubmit: handleSubmit,
              className: 'tech-form'
            },

              h('label', null, 'Nombre completo',
                h('input', {
                  type: 'text',
                  name: 'nombre',
                  value: form.nombre,
                  onChange: handleChange,
                  placeholder: 'Tu nombre',
                  required: true
                })
              ),

              h('label', null, 'Teléfono',
                h('input', {
                  type: 'tel',
                  name: 'telefono',
                  value: form.telefono,
                  onChange: handleChange,
                  placeholder: 'Tu número de teléfono',
                  required: true
                })
              ),

              h('label', null, 'Modelo del equipo',
                h('input', {
                  type: 'text',
                  name: 'modelo',
                  value: form.modelo,
                  onChange: handleChange,
                  placeholder: 'Ej.: Samsung A54, iPhone 13...',
                  required: true
                })
              ),

              h('label', null, '¿Qué problema presenta?',
                h('textarea', {
                  name: 'problema',
                  value: form.problema,
                  onChange: handleChange,
                  placeholder: 'Describí brevemente el problema...',
                  rows: 4,
                  required: true
                })
              ),

              error
                ? h('p', {
                    className: 'tech-error',
                    role: 'alert'
                  }, error)
                : null,

              h('button', {
                type: 'submit',
                className: 'tech-submit-button',
                disabled: loading
              },

                h(Send, { size: 18 }),

                loading
                  ? ' ENVIANDO...'
                  : ' ENVIAR CONSULTA'
              )
            )
          )
    )
  );
}
