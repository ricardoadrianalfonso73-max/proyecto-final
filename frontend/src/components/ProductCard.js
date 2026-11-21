
import React from 'react';

import {
  ShoppingCart,
  Eye
} from 'lucide-react';

import './ProductCard.css';

const h = React.createElement;

function ProductCard({ product, onView, onAdd }) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return h('article', { className: 'product-card' },

    h('div', { className: 'product-image-container' },

      product.oldPrice && h('span', {
        className: 'discount-badge'
      }, `-${discount}%`),

      h('span', {
        className: product.condition === 'Usado'
          ? 'condition-badge used'
          : 'condition-badge'
      }, product.condition),

      h('img', {
        src: product.image,
        alt: product.name,
        loading: 'lazy'
      }),

      h('button', {
        className: 'quick-view',
        onClick: () => onView(product),
        title: 'Ver detalles'
      }, h(Eye, { size: 19 }))
    ),

    h('div', { className: 'product-information' },

      h('span', {
        className: 'product-category'
      }, product.category),

      h('h3', null, product.name),

      h('p', {
        className: 'product-description'
      }, product.description),

      h('div', { className: 'product-prices' },

        product.oldPrice && h('del', null,
          `$${product.oldPrice.toLocaleString('es-AR')}`
        ),

        h('strong', null,
          `$${product.price.toLocaleString('es-AR')}`
        )
      ),

      h('div', { className: 'product-buttons' },

        h('button', {
          className: 'product-view-button',
          onClick: () => onView(product)
        }, 'Ver producto'),

        h('button', {
          className: 'product-add-button',
          onClick: () => onAdd(product),
          title: 'Agregar al carrito'
        }, h(ShoppingCart, { size: 19 }))
      )
    )
  );
}

export default ProductCard;
