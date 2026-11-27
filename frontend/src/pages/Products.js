
import React from 'react';
import './Products.css';

import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  ArrowRight,
  Tag,
  CheckCircle2,
  CreditCard,
  Wallet,
  Landmark,
  Banknote,
  Truck,
  CalendarDays
} from 'lucide-react';

import ProductCard from '../components/ProductCard.js';
import ProductModal from '../components/ProductModal.js';

const h = React.createElement;
const API = 'http://localhost:3000';

// Calcular una fecha estimada de entrega a partir de hoy
function calcularFechaEstimada() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 3);
  return fecha;
}

// Formatear la fecha recibida desde el backend
function formatearFechaEntrega(valor) {
  if (!valor) {
    return calcularFechaEstimada().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  const coincidencia = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (coincidencia) {
    const fecha = new Date(
      Number(coincidencia[1]),
      Number(coincidencia[2]) - 1,
      Number(coincidencia[3])
    );

    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return 'Dentro de 3 días';
  }

  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function obtenerImagen(imagen) {
  if (!imagen) return '';

  const ruta = String(imagen).trim();

  if (ruta.startsWith('http://') || ruta.startsWith('https://')) {
    return ruta;
  }

  if (ruta.startsWith('/uploads/')) {
    return `${API}${ruta}`;
  }

  return ruta;
}

function formatearProductos(data) {
  return data
    .filter(product =>
      (product.categoria_nombre || '').trim().toLowerCase() !== 'servicio técnico'
    )
    .map(product => ({
      id: product.id,
      name: product.nombre,
      category: product.categoria_nombre || 'Otros',
      condition: product.condicion,
      price: Number(product.precio),
      oldPrice: product.precio_anterior
        ? Number(product.precio_anterior)
        : null,
      description: product.descripcion,
      image: obtenerImagen(product.imagen),
      warranty: 'Consultar garantía',
      isOffer: Boolean(Number(product.es_oferta)),
      specifications: []
    }));
}

function Products() {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('Todas');
  const [onlyOffers, setOnlyOffers] = React.useState(false);

  const [selectedProduct, setSelectedProduct] = React.useState(null);

  const [cartOpen, setCartOpen] = React.useState(false);
  const [cart, setCart] = React.useState([]);

  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [sendingOrder, setSendingOrder] = React.useState(false);
  const [checkoutError, setCheckoutError] = React.useState('');

  const [medioPago, setMedioPago] = React.useState('Mercado Pago');

  const [purchaseSuccess, setPurchaseSuccess] = React.useState(null);

  const [customer, setCustomer] = React.useState({
    nombre_cliente: '',
    correo: '',
    telefono: '',
    direccion: ''
  });

  const categories = [
    'Todas',
    'Celulares',
    'Accesorios',
    'Notebook'
  ];

  // Cargar productos
  React.useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API}/api/productos`);

        if (!response.ok) {
          throw new Error('No se pudieron cargar los productos.');
        }

        const data = await response.json();
        setProducts(formatearProductos(data));

      } catch (error) {
        console.error('Error al cargar productos:', error);

        setError(
          'No pudimos conectar con el catálogo. Intentá nuevamente.'
        );

      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Agregar al carrito
  function addToCart(product) {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);

      if (existing) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setCartOpen(true);
  }

  // Modificar cantidad
  function changeQuantity(id, amount) {
    setCart(current =>
      current
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  // Eliminar producto
  function removeItem(id) {
    setCart(current =>
      current.filter(item => item.id !== id)
    );
  }

  // Actualizar datos del cliente
  function handleCustomerChange(event) {
    const { name, value } = event.target;

    setCustomer(current => ({
      ...current,
      [name]: value
    }));
  }

  // Registrar pedido
  async function finishPurchase(event) {
    event.preventDefault();

    if (cart.length === 0) {
      setCheckoutError('Tu carrito está vacío.');
      return;
    }

    try {
      setSendingOrder(true);
      setCheckoutError('');

      const clienteToken = sessionStorage.getItem('clienteToken');

      const response = await fetch(`${API}/api/pedidos`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          ...(clienteToken
            ? {
                Authorization: `Bearer ${clienteToken}`
              }
            : {})
        },

        body: JSON.stringify({
          ...customer,
          medio_pago: medioPago,

          productos: cart.map(item => ({
            id: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensaje || 'No se pudo registrar el pedido.'
        );
      }

      // Mostrar confirmación con fecha estimada del backend
      setPurchaseSuccess({
        pedidoId: data.pedido_id,
        total: Number(data.total),
        medioPago: medioPago,
        fechaEntrega: data.fecha_estimada_entrega
      });

      // Limpiar carrito y cerrar ventanas
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);

      setCustomer({
        nombre_cliente: '',
        correo: '',
        telefono: '',
        direccion: ''
      });

      setMedioPago('Mercado Pago');

      // Actualizar catálogo y stock
      setLoading(true);

      try {
        const productsResponse = await fetch(`${API}/api/productos`);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(formatearProductos(productsData));
        }

      } catch (refreshError) {
        console.error(
          'Error actualizando catálogo:',
          refreshError
        );

      } finally {
        setLoading(false);
      }

    } catch (error) {
      console.error('Error al registrar pedido:', error);
      setCheckoutError(error.message);

    } finally {
      setSendingOrder(false);
    }
  }

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase());

    const categoriaProducto = String(product.category || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const matchesCategory =
      category === 'Todas' ||
      (
        category === 'Notebook'
          ? ['notebook', 'notebooks', 'computacion'].includes(categoriaProducto)
          : categoriaProducto === category
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
      );

    const matchesOffer = !onlyOffers || product.isOffer;

    return matchesSearch && matchesCategory && matchesOffer;
  });

  const offers = filteredProducts.filter(product => product.isOffer);
  const regularProducts = filteredProducts.filter(product => !product.isOffer);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function renderProduct(product) {
    return h(ProductCard, {
      key: product.id,
      product,
      onView: setSelectedProduct,
      onAdd: addToCart
    });
  }

  // Opciones de pago
  const paymentMethods = [
    {
      nombre: 'Mercado Pago',
      descripcion: 'Pago simulado con Mercado Pago',
      icono: Wallet
    },
    {
      nombre: 'Tarjeta de crédito',
      descripcion: 'Pago simulado con tarjeta de crédito',
      icono: CreditCard
    },
    {
      nombre: 'Tarjeta de débito',
      descripcion: 'Pago simulado con tarjeta de débito',
      icono: CreditCard
    },
    {
      nombre: 'Transferencia bancaria',
      descripcion: 'Coordinaremos los datos de transferencia',
      icono: Landmark
    },
    {
      nombre: 'Efectivo',
      descripcion: 'Pago en efectivo',
      icono: Banknote
    }
  ];

  return h('main', { className: 'products-page' },

    // Encabezado
    h('section', { className: 'products-heading' },
      h('div', { className: 'container-main' },
        h('span', { className: 'products-eyebrow' }, 'ELECTRO TECNO'),

        h('h1', null,
          'NUESTROS ',
          h('span', null, 'PRODUCTOS')
        ),

        h('p', null,
          'Descubrí nuestra selección de tecnología y accesorios.'
        )
      )
    ),

    // Catálogo
    h('section', {
      className: 'container-main catalog-section'
    },

      loading && h('p', {
        className: 'empty-products'
      }, 'Cargando productos...'),

      error && h('p', {
        className: 'empty-products'
      }, error),

      h('div', { className: 'catalog-toolbar' },

        h('div', { className: 'search-box' },
          h(Search, { size: 20 }),

          h('input', {
            type: 'search',
            placeholder: 'Buscar productos...',
            value: search,
            onChange: event => setSearch(event.target.value)
          })
        ),

        h('button', {
          className: onlyOffers
            ? 'offer-filter active'
            : 'offer-filter',

          onClick: () => setOnlyOffers(!onlyOffers)
        },
          h(Tag, { size: 17 }),
          ' Solo ofertas'
        )
      ),

      h('div', { className: 'category-filters' },
        ...categories.map(item =>
          h('button', {
            key: item,

            className: category === item
              ? 'filter-chip active'
              : 'filter-chip',

            onClick: () => setCategory(item)
          }, item)
        )
      ),

      !loading &&
      !error &&
      !onlyOffers &&
      offers.length > 0 &&
      h('section', { className: 'catalog-subsection' },

        h('div', { className: 'catalog-title' },
          h('div', null,
            h('span', null, 'PRECIOS ESPECIALES'),

            h('h2', null,
              'OFERTAS ',
              h('span', null, 'DESTACADAS')
            )
          ),

          h(Tag, { size: 27 })
        ),

        h('div', { className: 'products-grid' },
          ...offers.map(renderProduct)
        )
      ),

      !loading &&
      !error &&
      !onlyOffers &&
      regularProducts.length > 0 &&
      h('section', { className: 'catalog-subsection' },

        h('div', { className: 'catalog-title' },
          h('div', null,
            h('span', null, 'EXPLORÁ LA TIENDA'),

            h('h2', null,
              'CATÁLOGO ',
              h('span', null, 'GENERAL')
            )
          )
        ),

        h('div', { className: 'products-grid' },
          ...regularProducts.map(renderProduct)
        )
      ),

      !loading &&
      !error &&
      onlyOffers &&
      offers.length > 0 &&
      h('section', { className: 'catalog-subsection' },

        h('div', { className: 'catalog-title' },
          h('div', null,
            h('span', null, 'OPORTUNIDADES'),

            h('h2', null,
              'TODAS LAS ',
              h('span', null, 'OFERTAS')
            )
          )
        ),

        h('div', { className: 'products-grid' },
          ...offers.map(renderProduct)
        )
      ),

      !loading &&
      !error &&
      filteredProducts.length === 0 &&
      h('div', { className: 'empty-products' },
        h('h3', null, 'No encontramos productos'),

        h('p', null,
          'Probá con otra búsqueda o categoría.'
        )
      )
    ),

    // Botón flotante del carrito
    h('button', {
      className: 'floating-cart',
      onClick: () => setCartOpen(true)
    },
      h(ShoppingCart, { size: 22 }),
      h('span', null, totalItems)
    ),

    // Modal de producto
    h(ProductModal, {
      product: selectedProduct,
      onClose: () => setSelectedProduct(null),
      onAdd: addToCart
    }),

    // Carrito lateral
    cartOpen && h('div', {
      className: 'cart-overlay',
      onClick: () => setCartOpen(false)
    },

      h('aside', {
        className: 'cart-sidebar',
        onClick: event => event.stopPropagation()
      },

        h('div', { className: 'cart-header' },

          h('div', null,
            h('h2', null, 'MI CARRITO'),

            h('span', null, `${totalItems} productos`)
          ),

          h('button', {
            onClick: () => setCartOpen(false),
            'aria-label': 'Cerrar carrito'
          },
            h(X, { size: 23 })
          )
        ),

        h('div', { className: 'cart-items' },

          cart.length === 0

            ? h('p', { className: 'empty-cart' },
                'Tu carrito está vacío.'
              )

            : cart.map(item =>
                h('div', {
                  className: 'cart-item',
                  key: item.id
                },

                  h('img', {
                    src: item.image,
                    alt: item.name
                  }),

                  h('div', {
                    className: 'cart-item-info'
                  },

                    h('h3', null, item.name),

                    h('strong', null,
                      `$${item.price.toLocaleString('es-AR')}`
                    ),

                    h('div', {
                      className: 'quantity-controls'
                    },

                      h('button', {
                        onClick: () => changeQuantity(item.id, -1)
                      },
                        h(Minus, { size: 14 })
                      ),

                      h('span', null, item.quantity),

                      h('button', {
                        onClick: () => changeQuantity(item.id, 1)
                      },
                        h(Plus, { size: 14 })
                      )
                    )
                  ),

                  h('button', {
                    className: 'remove-cart-item',
                    onClick: () => removeItem(item.id),
                    title: 'Eliminar producto'
                  },
                    h(Trash2, { size: 18 })
                  )
                )
              )
        ),

        h('div', { className: 'cart-footer' },

          h('div', { className: 'cart-subtotal' },

            h('span', null, 'Subtotal'),

            h('strong', null,
              `$${subtotal.toLocaleString('es-AR')}`
            )
          ),

          h('p', null,
            'El costo de envío se calculará al confirmar el pedido.'
          ),

          h('button', {
            className: 'neon-button checkout-button',
            disabled: cart.length === 0,

            onClick: () => {
              setCheckoutError('');
              setCartOpen(false);
              setCheckoutOpen(true);
            }
          },

            'CONTINUAR COMPRA',

            h(ArrowRight, { size: 18 })
          )
        )
      )
    ),

    // Formulario de compra
    checkoutOpen && h('div', {
      className: 'checkout-overlay',

      onClick: () => {
        if (!sendingOrder) {
          setCheckoutOpen(false);
        }
      }
    },

      h('section', {
        className: 'checkout-modal',
        onClick: event => event.stopPropagation()
      },

        h('div', { className: 'checkout-header' },

          h('div', null,
            h('span', null, 'ELECTRO TECNO'),

            h('h2', null, 'FINALIZAR COMPRA'),

            h('p', null,
              'Completá tus datos para registrar tu pedido.'
            )
          ),

          h('button', {
            type: 'button',
            disabled: sendingOrder,
            onClick: () => setCheckoutOpen(false)
          },
            h(X, { size: 23 })
          )
        ),

        h('form', {
          className: 'checkout-form',
          onSubmit: finishPurchase
        },

          // Aviso de envío estimado
          h('div', {
            className: 'shipping-estimate',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px',
              marginBottom: '22px',
              background: '#101a12',
              border: '1px solid rgba(0, 255, 85, 0.35)',
              borderRadius: '12px',
              color: '#ffffff'
            }
          },

            h(Truck, {
              size: 30,
              color: '#00ff55'
            }),

            h('div', null,
              h('strong', {
                style: {
                  display: 'block',
                  color: '#00ff55',
                  marginBottom: '5px'
                }
              }, 'ENVÍO ESTIMADO: 3 DÍAS'),

              h('span', {
                style: {
                  display: 'block',
                  fontSize: '13px',
                  color: '#cccccc'
                }
              },
                `Fecha aproximada de entrega: ${formatearFechaEntrega(calcularFechaEstimada())}`
              )
            )
          ),

          h('label', null, 'Nombre completo'),

          h('input', {
            type: 'text',
            name: 'nombre_cliente',
            placeholder: 'Ingresá tu nombre completo',
            value: customer.nombre_cliente,
            onChange: handleCustomerChange,
            required: true,
            maxLength: 100
          }),

          h('label', null, 'Correo electrónico'),

          h('input', {
            type: 'email',
            name: 'correo',
            placeholder: 'ejemplo@correo.com',
            value: customer.correo,
            onChange: handleCustomerChange,
            required: true,
            maxLength: 150
          }),

          h('label', null, 'Teléfono'),

          h('input', {
            type: 'tel',
            name: 'telefono',
            placeholder: 'Tu número de teléfono',
            value: customer.telefono,
            onChange: handleCustomerChange,
            maxLength: 30
          }),

          h('label', null, 'Dirección de entrega'),

          h('textarea', {
            name: 'direccion',
            placeholder: 'Ingresá tu dirección',
            value: customer.direccion,
            onChange: handleCustomerChange,
            rows: 3
          }),

          // Medios de pago
          h('div', { className: 'payment-section' },

            h('h3', null, 'MEDIO DE PAGO'),

            h('p', null,
              'Seleccioná cómo preferís realizar el pago.'
            ),

            h('div', { className: 'payment-methods' },

              ...paymentMethods.map(method => {
                const PaymentIcon = method.icono;
                const selected = medioPago === method.nombre;

                return h('button', {
                  key: method.nombre,
                  type: 'button',

                  className: selected
                    ? 'payment-option selected'
                    : 'payment-option',

                  onClick: () => setMedioPago(method.nombre)
                },

                  h(PaymentIcon, { size: 23 }),

                  h('span', { className: 'payment-option-info' },
                    h('strong', null, method.nombre),
                    h('small', null, method.descripcion)
                  ),

                  h('span', { className: 'payment-radio' },
                    selected ? h(CheckCircle2, { size: 20 }) : null
                  )
                );
              })
            ),

            h('p', { className: 'payment-notice' },
              'Importante: esta compra es una simulación. No se realizará ningún cobro ni se solicitarán datos bancarios.'
            )
          ),

          h('div', { className: 'checkout-summary' },

            h('span', null, 'Total del pedido'),

            h('strong', null,
              `$${subtotal.toLocaleString('es-AR')}`
            )
          ),

          checkoutError && h('p', {
            className: 'checkout-error'
          }, checkoutError),

          h('button', {
            type: 'submit',
            className: 'neon-button checkout-submit',
            disabled: sendingOrder || cart.length === 0
          },

            sendingOrder
              ? 'REGISTRANDO PEDIDO...'
              : 'CONFIRMAR PEDIDO',

            !sendingOrder && h(ArrowRight, { size: 18 })
          )
        )
      )
    ),

    // Confirmación de compra realizada
    purchaseSuccess && h('div', {
      className: 'purchase-success-overlay'
    },

      h('section', {
        className: 'purchase-success-modal'
      },

        h('div', { className: 'purchase-success-icon' },
          h(CheckCircle2, { size: 58 })
        ),

        h('span', { className: 'purchase-success-eyebrow' },
          'ELECTRO TECNO'
        ),

        h('h2', null, '¡COMPRA REALIZADA!'),

        h('p', { className: 'purchase-success-description' },
          'Tu pedido fue registrado correctamente. ¡Muchas gracias por elegirnos!'
        ),

        h('div', { className: 'purchase-success-details' },

          h('div', null,
            h('span', null, 'Número de pedido'),
            h('strong', null, `#${purchaseSuccess.pedidoId}`)
          ),

          h('div', null,
            h('span', null, 'Medio de pago'),
            h('strong', null, purchaseSuccess.medioPago)
          ),

          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }
          },
            h(CalendarDays, {
              size: 25,
              color: '#00ff55'
            }),

            h('div', null,
              h('span', null, 'Fecha estimada de entrega'),

              h('strong', {
                style: {
                  display: 'block',
                  color: '#00ff55',
                  marginTop: '4px'
                }
              },
                formatearFechaEntrega(purchaseSuccess.fechaEntrega)
              )
            )
          ),

          h('div', { className: 'success-total' },
            h('span', null, 'Total de la compra'),
            h('strong', null,
              `$${purchaseSuccess.total.toLocaleString('es-AR')}`
            )
          )
        ),

        h('p', { className: 'purchase-success-note' },
          'Tu pedido quedó registrado y pendiente de confirmación. Esta operación no realizó ningún cobro.'
        ),

        h('button', {
          className: 'neon-button purchase-success-button',
          onClick: () => setPurchaseSuccess(null)
        },
          'CONTINUAR COMPRANDO',
          h(ArrowRight, { size: 18 })
        )
      )
    )
  );
}

export default Products;
