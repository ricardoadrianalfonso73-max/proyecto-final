
import React from 'react';
import { formatoFecha } from '../../utils/adminHelpers';

import './AdminConsultas.css';

const h = React.createElement;

function AdminConsultas({
  consultas,
  cargando,
  error,
  mensaje,
  actualizando,
  cargarConsultas,
  cambiarEstadoConsulta,
  volverInicio
}) {
  return h('div', { className: 'admin-consultas' },

    // ENCABEZADO
    h('div', { className: 'admin-consultas-header' },

      h('div', null,
        h('h2', null, 'Consultas de clientes'),

        h('p', null,
          'Mensajes recibidos desde el formulario de contacto.'
        )
      ),

      h('div', { className: 'admin-consultas-acciones' },

        h('button', {
          type: 'button',
          onClick: cargarConsultas,
          disabled: cargando,
          className: 'admin-consultas-actualizar'
        }, cargando ? 'Cargando...' : 'Actualizar'),

        h('button', {
          type: 'button',
          onClick: volverInicio,
          className: 'admin-consultas-volver'
        }, 'Volver')
      )
    ),

    // MENSAJES
    error && h('p', {
      className: 'admin-consultas-mensaje error'
    }, error),

    mensaje && h('p', {
      className: 'admin-consultas-mensaje success'
    }, mensaje),

    // CARGANDO
    cargando && h('p', {
      className: 'admin-consultas-cargando'
    }, 'Cargando consultas...'),

    // SIN CONSULTAS
    !cargando && !error && consultas.length === 0 &&
    h('div', {
      className: 'admin-consultas-vacio'
    }, 'Todavía no hay consultas registradas.'),

    // LISTADO
    ...consultas.map(consulta =>
      h('div', {
        key: consulta.id,
        className: 'admin-consulta-card'
      },

        // CABECERA
        h('div', { className: 'admin-consulta-header' },

          h('h3', null, `Consulta #${consulta.id}`),

          h('span', {
            className: consulta.estado === 'Respondida'
              ? 'admin-consulta-estado respondida'
              : 'admin-consulta-estado pendiente'
          }, consulta.estado || 'Pendiente')
        ),

        // NOMBRE
        h('p', { className: 'admin-consulta-etiqueta' },
          'Nombre del cliente'
        ),

        h('p', { className: 'admin-consulta-nombre' },
          consulta.nombre
        ),

        // CORREO
        h('p', { className: 'admin-consulta-etiqueta' },
          'Correo electrónico'
        ),

        h('p', { className: 'admin-consulta-correo' },
          consulta.correo
        ),

        // MENSAJE
        h('p', { className: 'admin-consulta-etiqueta' },
          'Mensaje'
        ),

        h('div', { className: 'admin-consulta-mensaje-texto' },
          consulta.mensaje
        ),

        // FECHA
        h('p', { className: 'admin-consulta-fecha' },
          `Recibida: ${formatoFecha(consulta.creado_en)}`
        ),

        // CAMBIAR ESTADO
        h('button', {
          type: 'button',
          onClick: () => cambiarEstadoConsulta(
            consulta.id,
            consulta.estado === 'Respondida'
              ? 'Pendiente'
              : 'Respondida'
          ),
          disabled: actualizando === consulta.id,
          className: consulta.estado === 'Respondida'
            ? 'admin-consulta-boton pendiente'
            : 'admin-consulta-boton respondida'
        },

          actualizando === consulta.id
            ? 'Actualizando...'
            : consulta.estado === 'Respondida'
              ? 'Marcar como pendiente'
              : 'Marcar como respondida'
        )
      )
    )
  );
}

export default AdminConsultas;
