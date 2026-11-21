
import React from 'react';
import { formatoFecha } from '../../utils/adminHelpers';

import './AdminServicioTecnico.css';

const h = React.createElement;

function AdminServicioTecnico({
  servicios,
  cargando,
  error,
  mensaje,
  actualizando,
  cargarServicios,
  cambiarEstadoServicio,
  volverInicio
}) {
  return h('div', { className: 'admin-service-container' },

    h('div', { className: 'admin-service-header' },

      h('div', null,

        h('h2', null, 'Solicitudes de servicio técnico'),

        h('p', null,
          'Administrá las reparaciones solicitadas por tus clientes.'
        )
      ),

      h('div', { className: 'admin-service-actions' },

        h('button', {
          onClick: cargarServicios,
          disabled: cargando,
          className: 'admin-service-refresh'
        }, cargando ? 'Cargando...' : 'Actualizar'),

        h('button', {
          onClick: volverInicio,
          className: 'admin-service-back'
        }, 'Volver')
      )
    ),

    error && h('p', {
      className: 'admin-service-message error'
    }, error),

    mensaje && h('p', {
      className: 'admin-service-message success'
    }, mensaje),

    cargando && h('p', {
      className: 'admin-service-loading'
    }, 'Cargando solicitudes...'),

    !cargando && !error && servicios.length === 0 &&
    h('div', {
      className: 'admin-service-empty'
    }, 'Todavía no hay solicitudes de servicio técnico.'),

    ...servicios.map(servicio =>

      h('div', {
        key: servicio.id,
        className: 'admin-service-card'
      },

        h('div', {
          className: 'admin-service-card-header'
        },

          h('h3', null, `Solicitud #${servicio.id}`),

          h('span', {
            className: `admin-service-status ${
              servicio.estado === 'Entregado'
                ? 'delivered'
                : 'pending'
            }`
          }, servicio.estado || 'Pendiente')
        ),

        h('div', {
          className: 'admin-service-details'
        },

          ...[
            ['Cliente', servicio.nombre],
            ['Teléfono', servicio.telefono],
            ['Modelo del equipo', servicio.modelo],
            ['Fecha de solicitud', formatoFecha(servicio.creado_en)]
          ].map((dato, index) =>

            h('div', {
              key: index,
              className: 'admin-service-detail'
            },

              h('p', null, dato[0]),

              h('span', null, dato[1] || 'No informado')
            )
          )
        ),

        h('p', {
          className: 'admin-service-problem-title'
        }, 'Descripción del problema'),

        h('div', {
          className: 'admin-service-problem'
        }, servicio.problema),

        h('div', {
          className: 'admin-service-status-control'
        },

          h('label', null, 'Estado de la reparación:'),

          h('select', {
            value: servicio.estado || 'Pendiente',
            disabled: actualizando === servicio.id,
            onChange: e =>
              cambiarEstadoServicio(servicio.id, e.target.value)
          },

            ...[
              'Pendiente',
              'En revisión',
              'Reparado',
              'Entregado'
            ].map(estado =>
              h('option', {
                key: estado,
                value: estado
              }, estado)
            )
          ),

          actualizando === servicio.id &&
          h('span', {
            className: 'admin-service-updating'
          }, 'Actualizando...')
        )
      )
    )
  );
}

export default AdminServicioTecnico;
