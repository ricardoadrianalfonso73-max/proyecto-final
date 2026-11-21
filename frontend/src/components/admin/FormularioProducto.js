
import React from 'react';
import { categorias } from '../../utils/adminHelpers';

import './FormularioProducto.css';

const h = React.createElement;

export default function FormularioProducto({
  formulario,
  cambiarCampo,
  imagenPreview,
  onImagenSeleccionada,
  guardarProducto,
  editandoId,
  actualizando,
  onCancelar
}) {
  return h('form', {
    className: 'formulario-producto',
    onSubmit: guardarProducto
  },

    h('h2', {
      className: 'formulario-producto-titulo'
    }, editandoId ? 'Editar producto' : 'Nuevo producto'),

    // NOMBRE
    h('div', { className: 'formulario-campo' },
      h('label', null, 'Nombre del producto'),
      h('input', {
        type: 'text',
        value: formulario.nombre,
        onChange: e => cambiarCampo('nombre', e.target.value),
        required: true
      })
    ),

    // DESCRIPCIÓN
    h('div', { className: 'formulario-campo' },
      h('label', null, 'Descripción'),
      h('textarea', {
        value: formulario.descripcion,
        onChange: e => cambiarCampo('descripcion', e.target.value),
        rows: 3
      })
    ),

    // PRECIO Y STOCK
    h('div', { className: 'formulario-grilla dos-columnas' },

      h('div', { className: 'formulario-campo' },
        h('label', null, 'Precio'),
        h('input', {
          type: 'number',
          min: '0',
          step: '0.01',
          value: formulario.precio,
          onChange: e => cambiarCampo('precio', e.target.value),
          required: true
        })
      ),

      h('div', { className: 'formulario-campo' },
        h('label', null, 'Stock'),
        h('input', {
          type: 'number',
          min: '0',
          value: formulario.stock,
          onChange: e => cambiarCampo('stock', e.target.value),
          required: true
        })
      )
    ),

    // CATEGORÍA Y CONDICIÓN
    h('div', { className: 'formulario-grilla dos-columnas' },

      h('div', { className: 'formulario-campo' },
        h('label', null, 'Categoría'),
        h('select', {
          value: formulario.id_categoria,
          onChange: e => cambiarCampo('id_categoria', e.target.value),
          required: true
        },
          h('option', { value: '' }, 'Seleccionar categoría'),

          ...categorias.map(cat =>
            h('option', {
              key: cat.id,
              value: cat.id
            }, cat.nombre)
          )
        )
      ),

      h('div', { className: 'formulario-campo' },
        h('label', null, 'Condición'),
        h('select', {
          value: formulario.condicion,
          onChange: e => cambiarCampo('condicion', e.target.value)
        },
          h('option', { value: 'Nuevo' }, 'Nuevo'),
          h('option', { value: 'Usado' }, 'Usado')
        )
      )
    ),

    // IMAGEN
    h('div', { className: 'formulario-campo' },
      h('label', null, 'Imagen del producto'),
      h('input', {
        className: 'formulario-archivo',
        type: 'file',
        accept: 'image/*',
        onChange: onImagenSeleccionada
      })
    ),

    // VISTA PREVIA
    imagenPreview && h('div', {
      className: 'formulario-preview'
    },

      h('p', null, 'Vista previa:'),

      h('img', {
        src: imagenPreview,
        alt: 'Vista previa del producto'
      })
    ),

    // PRECIO ANTERIOR, OFERTA Y ESTADO
    h('div', { className: 'formulario-grilla tres-columnas' },

      h('div', { className: 'formulario-campo' },
        h('label', null, 'Precio anterior (opcional)'),
        h('input', {
          type: 'number',
          min: '0',
          step: '0.01',
          value: formulario.precio_anterior,
          onChange: e => cambiarCampo('precio_anterior', e.target.value)
        })
      ),

      h('div', { className: 'formulario-campo' },
        h('label', null, '¿Está en oferta?'),
        h('select', {
          value: formulario.es_oferta,
          onChange: e => cambiarCampo('es_oferta', e.target.value)
        },
          h('option', { value: '0' }, 'No'),
          h('option', { value: '1' }, 'Sí')
        )
      ),

      h('div', { className: 'formulario-campo' },
        h('label', null, 'Estado'),
        h('select', {
          value: formulario.activo,
          onChange: e => cambiarCampo('activo', e.target.value)
        },
          h('option', { value: '1' }, 'Activo'),
          h('option', { value: '0' }, 'Inactivo')
        )
      )
    ),

    // BOTONES
    h('div', { className: 'formulario-botones' },

      h('button', {
        type: 'submit',
        className: 'formulario-guardar',
        disabled: actualizando
      }, actualizando ? 'Guardando...' : 'Guardar producto'),

      h('button', {
        type: 'button',
        className: 'formulario-cancelar',
        onClick: onCancelar,
        disabled: actualizando
      }, 'Cancelar')
    )
  );
}
