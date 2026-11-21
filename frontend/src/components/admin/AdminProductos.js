
import React from 'react';
import { formatoPrecio, obtenerUrlImagen } from '../../utils/adminHelpers';
import FormularioProducto from './FormularioProducto';

import './AdminProductos.css';

const h = React.createElement;

export default function AdminProductos({
  productos,
  cargando,
  error,
  mensaje,
  actualizando,
  cargarProductos,
  abrirNuevoProducto,
  editarProducto,
  desactivarProducto,
  mostrarFormulario,
  formulario,
  cambiarCampo,
  imagenPreview,
  onImagenSeleccionada,
  guardarProducto,
  editandoId,
  cancelarFormulario,
  volverInicio
}) {
  const productosActivos = productos.filter(
    producto => Number(producto.activo) === 1
  );

  return h('div', { className: 'admin-productos' },

    // ENCABEZADO
    h('div', { className: 'admin-productos-header' },

      h('div', null,
        h('h2', null, 'Gestión de productos'),
        h('p', null, 'Administrá el catálogo de Electro Tecno.')
      ),

      h('div', { className: 'admin-productos-acciones' },

        h('button', {
          type: 'button',
          className: 'admin-productos-agregar',
          onClick: abrirNuevoProducto
        }, '+ Agregar producto'),

        h('button', {
          type: 'button',
          className: 'admin-productos-actualizar',
          onClick: cargarProductos,
          disabled: cargando
        }, cargando ? 'Cargando...' : 'Actualizar'),

        h('button', {
          type: 'button',
          className: 'admin-productos-volver',
          onClick: volverInicio
        }, 'Volver')
      )
    ),

    // MENSAJES
    error && h('p', {
      className: 'admin-productos-mensaje error'
    }, error),

    mensaje && h('p', {
      className: 'admin-productos-mensaje success'
    }, mensaje),

    // FORMULARIO
    mostrarFormulario && h(FormularioProducto, {
      formulario,
      cambiarCampo,
      imagenPreview,
      onImagenSeleccionada,
      guardarProducto,
      editandoId,
      actualizando: actualizando === 'formulario',
      onCancelar: cancelarFormulario
    }),

    // CARGANDO
    cargando && h('p', {
      className: 'admin-productos-cargando'
    }, 'Cargando productos...'),

    // SIN PRODUCTOS
    !cargando && productosActivos.length === 0 &&
    h('div', {
      className: 'admin-productos-vacio'
    }, 'Todavía no hay productos activos.'),

    // LISTADO
    h('div', { className: 'admin-productos-grilla' },

      ...productosActivos.map(producto =>
        h('div', {
          key: producto.id,
          className: 'admin-producto-card'
        },

          // IMAGEN
          producto.imagen
            ? h('img', {
                className: 'admin-producto-imagen',
                src: obtenerUrlImagen(producto.imagen),
                alt: producto.nombre,
                onError: e => {
                  e.currentTarget.style.display = 'none';
                }
              })
            : h('div', {
                className: 'admin-producto-sin-imagen'
              }, 'Sin imagen'),

          // INFORMACIÓN
          h('h3', null, producto.nombre),

          h('p', { className: 'admin-producto-categoria' },
            producto.categoria_nombre ||
            producto.nombre_categoria ||
            producto.categoria ||
            'Sin categoría'
          ),

          h('p', { className: 'admin-producto-descripcion' },
            producto.descripcion || 'Sin descripción'
          ),

          h('p', { className: 'admin-producto-precio' },
            formatoPrecio(producto.precio)
          ),

          h('p', { className: 'admin-producto-dato' },
            `Stock: ${producto.stock}`
          ),

          h('p', { className: 'admin-producto-dato' },
            `Condición: ${producto.condicion || 'Nuevo'}`
          ),

          Number(producto.es_oferta) === 1 &&
          h('p', { className: 'admin-producto-oferta' },
            'Producto en oferta'
          ),

          h('p', { className: 'admin-producto-activo' }, 'Activo'),

          // BOTONES
          h('div', { className: 'admin-producto-botones' },

            h('button', {
              type: 'button',
              className: 'admin-producto-editar',
              onClick: () => editarProducto(producto),
              disabled: actualizando !== null
            }, 'Editar'),

            h('button', {
              type: 'button',
              className: 'admin-producto-desactivar',
              onClick: () => desactivarProducto(producto.id),
              disabled: actualizando === producto.id
            },
              actualizando === producto.id
                ? 'Desactivando...'
                : 'Desactivar'
            )
          )
        )
      )
    )
  );
}
