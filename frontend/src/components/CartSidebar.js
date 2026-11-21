
import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';

import './CartSidebar.css';

const h = React.createElement;

function CartSidebar({
  open,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemove,
  onCheckout
}) {
  if (!open) return null;

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * (item.quantity || 1),
    0
  );

  return h(React.Fragment, null,

    h('div', {
      className: 'cart-overlay',
      onClick: onClose
    }),

    h('aside', { className: 'cart-sidebar' },

      h('div', { className: 'cart-header' },
        h('h2', null, 'MI CARRITO'),

        h('button', {
          type: 'button',
          onClick: onClose,
          'aria-label': 'Cerrar carrito'
        }, h(X, { size: 22 }))
      ),

      h('div', { className: 'cart-items' },

        cart.length === 0
          ? h('p', { className: 'empty-cart' },
              'Tu carrito está vacío.'
            )

          : cart.map((item) =>
              h('div', {
                key: item.id,
                className: 'cart-item'
              },

                item.image &&
                  h('img', {
                    src: item.image,
                    alt: item.name,
                    className: 'cart-item-image'
                  }),

                h('div', { className: 'cart-item-info' },

                  h('strong', null, item.name),

                  h('span', null,
                    `$ ${Number(item.price).toLocaleString('es-AR')}`
                  ),

                  h('div', { className: 'quantity-controls' },

                    h('button', {
                      type: 'button',
                      'aria-label': 'Disminuir cantidad',
                      onClick: () =>
                        onUpdateQuantity &&
                        onUpdateQuantity(
                          item.id,
                          (item.quantity || 1) - 1
                        )
                    }, h(Minus, { size: 14 })),

                    h('span', null, item.quantity || 1),

                    h('button', {
                      type: 'button',
                      'aria-label': 'Aumentar cantidad',
                      onClick: () =>
                        onUpdateQuantity &&
                        onUpdateQuantity(
                          item.id,
                          (item.quantity || 1) + 1
                        )
                    }, h(Plus, { size: 14 })),

                    h('button', {
                      type: 'button',
                      className: 'remove-cart-item',
                      'aria-label': 'Eliminar producto',
                      onClick: () =>
                        onRemove && onRemove(item.id)
                    }, h(Trash2, { size: 14 }))

                  )
                )
              )
            )
      ),

      cart.length > 0 &&
        h('div', { className: 'cart-footer' },

          h('div', { className: 'cart-subtotal' },
            h('span', null, 'Total:'),

            h('strong', null,
              `$ ${total.toLocaleString('es-AR')}`
            )
          ),

          h('button', {
            type: 'button',
            className: 'neon-button checkout-button',
            onClick: onCheckout
          }, 'Finalizar compra')

        )
    )
  );
}

export default CartSidebar;
