
import React from 'react';
import { formatoPrecio, formatoFecha } from '../../utils/adminHelpers';

import './AdminPedidos.css';

const h = React.createElement;

function AdminPedidos({
  pedidos,
  cargando,
  error,
  actualizando,
  cargarPedidos,
  cambiarEstado,
  volverInicio
}) {
  return h('div', { className: 'admin-pedidos' },

    // ENCABEZADO
    h('div', { className: 'admin-pedidos-header' },

      h('div', null,
        h('h2', null, 'Gestión de pedidos'),
        h('p', null, 'Compras registradas por los clientes.')
      ),

      h('div', { className: 'admin-pedidos-acciones' },

        h('button', {
          type: 'button',
          onClick: cargarPedidos,
          className: 'admin-pedidos-actualizar',
          disabled: cargando
        }, cargando ? 'Cargando...' : 'Actualizar'),

        h('button', {
          type: 'button',
          onClick: volverInicio,
          className: 'admin-pedidos-volver'
        }, 'Volver')
      )
    ),

    // ERROR
    error && h('p', {
      className: 'admin-pedidos-error'
    }, error),

    // CARGANDO
    cargando && h('p', {
      className: 'admin-pedidos-cargando'
    }, 'Cargando pedidos...'),

    // SIN PEDIDOS
    !cargando && !error && pedidos.length === 0 &&
    h('div', {
      className: 'admin-pedidos-vacio'
    }, 'Todavía no hay pedidos registrados.'),

    // LISTADO
    !cargando && pedidos.map(pedido =>
      h('div', {
        key: pedido.id,
        className: 'admin-pedido-card'
      },

        // CABECERA DEL PEDIDO
        h('div', { className: 'admin-pedido-header' },

          h('h3', null, `Pedido #${pedido.id}`),

          h('span', null, formatoFecha(pedido.creado_en))
        ),

        // DATOS DEL CLIENTE
        h('div', { className: 'admin-pedido-datos' },

          ...[
            ['Cliente', pedido.nombre_cliente],
            ['Correo', pedido.correo],
            ['Teléfono', pedido.telefono || 'No informado'],
            ['Total', formatoPrecio(pedido.total)]
          ].map((dato, index) =>
            h('div', {
              key: index,
              className: 'admin-pedido-dato'
            },

              h('p', null, dato[0]),

              h('p', {
                className: index === 3 ? 'total' : ''
              }, dato[1])
            )
          )
        ),

        // PRODUCTOS COMPRADOS
        h('h4', {
          className: 'admin-pedido-productos-titulo'
        }, 'Productos comprados'),

        h('div', { className: 'admin-pedido-productos' },

          ...(pedido.items || []).map((item, index) =>
            h('div', {
              key: index,
              className: 'admin-pedido-item'
            },

              h('span', null,
                `${item.nombre_producto} x ${item.cantidad}`
              ),

              h('span', null, formatoPrecio(item.precio))
            )
          )
        ),

        // CAMBIAR ESTADO
        h('div', { className: 'admin-pedido-estado' },

          h('label', null, 'Estado del pedido:'),

          h('select', {
            value: pedido.estado,
            disabled: actualizando === pedido.id,
            onChange: e => cambiarEstado(pedido.id, e.target.value)
          },

            ...[
              'Pendiente',
              'Confirmado',
              'Enviado',
              'Entregado',
              'Cancelado'
            ].map(estado =>
              h('option', {
                key: estado,
                value: estado
              }, estado)
            )
          ),

          actualizando === pedido.id &&
          h('span', {
            className: 'admin-pedido-actualizando'
          }, 'Actualizando...')
        )
      )
    )
  );
}

export default AdminPedidos;
