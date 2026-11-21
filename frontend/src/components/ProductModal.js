
import React from 'react';

import {
  X,
  ShoppingCart,
  ShieldCheck
} from 'lucide-react';

import './ProductModal.css';

const h = React.createElement;

function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null;

  return h('div', {
    className: 'modal-overlay',
    onClick: onClose
  },

    h('div', {
      className: 'product-modal',
      onClick: event => event.stopPropagation()
    },

      h('button', {
        className: 'modal-close',
        onClick: onClose,
        'aria-label': 'Cerrar'
      }, h(X, { size: 23 })),

      h('div', { className: 'modal-product-image' },

        h('img', {
          src: product.image,
          alt: product.name
        })
      ),

      h('div', { className: 'modal-product-info' },

        h('span', {
          className: 'product-category'
        }, product.category),

        h('h2', null, product.name),

        h('p', {
          className: 'modal-description'
        }, product.description),

        h('div', {
          className: 'modal-price'
        }, `$${product.price.toLocaleString('es-AR')}`),

        h('h3', null, 'ESPECIFICACIONES'),

        h('ul', {
          className: 'specification-list'
        },

          ...(product.specifications || []).map((spec, index) =>
            h('li', { key: index }, spec)
          )
        ),

        h('div', { className: 'warranty-info' },

          h(ShieldCheck, { size: 20 }),

          h('span', null,
            `Garantía: ${product.warranty || 'Consultar'}`
          )
        ),

        h('button', {
          className: 'neon-button modal-add-button',
          onClick: () => {
            onAdd(product);
            onClose();
          }
        },

          h(ShoppingCart, { size: 19 }),
          ' AGREGAR AL CARRITO'
        )
      )
    )
  );
}

export default ProductModal;
