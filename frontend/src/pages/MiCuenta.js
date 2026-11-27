
import React from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import {
  UserRound,
  Package,
  ShoppingBag,
  CalendarDays,
  MapPin,
  Mail,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Circle
} from 'lucide-react';

import './MiCuenta.css';

const h = React.createElement;

const estadosSeguimiento = [
  'Pendiente',
  'Confirmado',
  'Enviado',
  'Entregado'
];

function formatearPrecio(valor) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2
  }).format(Number(valor) || 0);
}

function formatearFecha(fecha) {
  if (!fecha) return 'Fecha no disponible';

  const resultado = new Date(fecha);

  if (isNaN(resultado.getTime())) {
    return 'Fecha no disponible';
  }

  return resultado.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function obtenerEstado(pedido) {
  return String(pedido.estado || 'Pendiente')
    .trim()
    .toLowerCase();
}

function SeguimientoPedido({ pedido }) {
  const estado = obtenerEstado(pedido);
  const cancelado = estado === 'cancelado';

  const indiceActual = estadosSeguimiento.findIndex(
    paso => paso.toLowerCase() === estado
  );

  const indiceSeguro = indiceActual >= 0 ? indiceActual : 0;
  const progreso = cancelado ? 0 : (indiceSeguro / 3) * 100;

  return h('div', { className: 'pedido-seguimiento' },

    h('div', { className: 'seguimiento-titulo' },
      h('Package', { size: 19 }),
      h('strong', null, 'Seguimiento de tu compra')
    ),

    cancelado

      ? h('div', { className: 'seguimiento-cancelado' },
          h('span', null, 'Pedido cancelado'),
          h('p', null, 'Este pedido fue cancelado y no continuará con el proceso de entrega.')
        )

      : h(React.Fragment, null,

          h('div', { className: 'seguimiento-barra' },
            h('div', {
              className: 'seguimiento-progreso',
              style: { width: `${progreso}%` }
            })
          ),

          h('div', { className: 'seguimiento-pasos' },

            ...estadosSeguimiento.map((paso, indice) => {
              const completado = indice <= indiceSeguro;
              const actual = indice === indiceSeguro;

              return h('div', {
                className: `seguimiento-paso ${completado ? 'completado' : ''} ${actual ? 'paso-actual' : ''}`,
                key: paso
              },

                h('div', { className: 'seguimiento-icono' },
                  completado
                    ? h(CheckCircle2, { size: 22 })
                    : h(Circle, { size: 22 })
                ),

                h('span', null, paso)
              );
            })
          ),

          h('p', { className: 'seguimiento-mensaje' },
            estado === 'entregado'
              ? '¡Tu compra fue entregada! Gracias por elegir Electro Tecno.'
              : estado === 'enviado'
                ? '¡Tu pedido está en camino!'
                : estado === 'confirmado'
                  ? 'Tu compra fue confirmada y está preparando su próximo paso.'
                  : 'Recibimos tu pedido. Estamos esperando su confirmación.'
          )
        )
  );
}

function MiCuenta() {
  const [usuario, setUsuario] = React.useState(null);
  const [pedidos, setPedidos] = React.useState([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState('');

  async function cargarPedidos() {
    setCargando(true);
    setError('');

    try {
      const datosUsuario = sessionStorage.getItem('clienteUsuario');
      const token = sessionStorage.getItem('clienteToken');

      if (!token || !datosUsuario) {
        setUsuario(null);
        setPedidos([]);
        setError('Necesitás iniciar sesión como cliente para consultar tu cuenta.');
        return;
      }

      setUsuario(JSON.parse(datosUsuario));

      const respuesta = await api.get('/pedidos/mis-pedidos');

      setPedidos(
        Array.isArray(respuesta.pedidos)
          ? respuesta.pedidos
          : []
      );

    } catch (err) {
      console.error('Error al cargar la cuenta:', err);
      setError(
        err.message || 'No se pudieron cargar tus pedidos.'
      );
    } finally {
      setCargando(false);
    }
  }

  React.useEffect(() => {
    cargarPedidos();
  }, []);

  if (!sessionStorage.getItem('clienteToken')) {
    return h('main', { className: 'mi-cuenta-page' },
      h('section', { className: 'cuenta-mensaje' },
        h(UserRound, { size: 45 }),
        h('h2', null, 'Iniciá sesión para continuar'),
        h('p', null, 'Ingresá con tu cuenta de cliente para consultar tus compras.'),
        h(Link, {
          to: '/login',
          className: 'cuenta-boton'
        }, 'Iniciar sesión')
      )
    );
  }

  return h('main', { className: 'mi-cuenta-page' },

    h('div', { className: 'cuenta-header' },
      h('div', null,
        h('span', { className: 'cuenta-etiqueta' }, 'ELECTRO TECNO'),
        h('h1', null, 'Mi cuenta'),
        h('p', null, 'Administrá tus datos y consultá tus compras.')
      ),

      h('div', { className: 'cuenta-icono-principal' },
        h(UserRound, { size: 35 })
      )
    ),

    h('section', { className: 'cuenta-panel' },
      h('div', { className: 'cuenta-panel-titulo' },
        h(UserRound, { size: 22 }),
        h('h2', null, 'Mis datos personales')
      ),

      h('div', { className: 'cuenta-datos' },

        h('div', { className: 'cuenta-dato' },
          h('span', null, 'Nombre completo'),
          h('strong', null, usuario?.nombre || 'No disponible')
        ),

        h('div', { className: 'cuenta-dato' },
          h('span', null, 'Correo electrónico'),
          h('strong', null,
            h(Mail, { size: 16 }),
            usuario?.correo || 'No disponible'
          )
        )
      )
    ),

    h('section', { className: 'cuenta-panel' },

      h('div', { className: 'cuenta-panel-titulo cuenta-pedidos-titulo' },
        h('div', { className: 'cuenta-titulo-grupo' },
          h(ShoppingBag, { size: 22 }),
          h('h2', null, 'Mis compras')
        ),

        h('button', {
          type: 'button',
          className: 'cuenta-actualizar',
          onClick: cargarPedidos,
          disabled: cargando
        },
          h(RefreshCw, { size: 16 }),
          'Actualizar'
        )
      ),

      cargando

        ? h('div', { className: 'cuenta-cargando' },
            h(RefreshCw, { size: 25 }),
            h('p', null, 'Cargando tus compras...')
          )

        : error

          ? h('div', { className: 'cuenta-error' },
              h('p', null, error),
              h('button', {
                type: 'button',
                onClick: cargarPedidos
              }, 'Intentar nuevamente')
            )

          : pedidos.length === 0

            ? h('div', { className: 'cuenta-vacia' },
                h(Package, { size: 45 }),
                h('h3', null, 'Todavía no tenés compras'),
                h('p', null, 'Cuando realices una compra, aparecerá en esta sección.'),
                h(Link, {
                  to: '/productos',
                  className: 'cuenta-boton'
                }, 'Ver productos')
              )

            : h('div', { className: 'cuenta-lista-pedidos' },

                ...pedidos.map(pedido =>

                  h('article', {
                    className: 'cuenta-pedido',
                    key: pedido.id
                  },

                    h('div', { className: 'pedido-encabezado' },

                      h('div', null,
                        h('span', { className: 'pedido-numero' },
                          `Pedido #${pedido.id}`
                        ),

                        h('span', { className: 'pedido-fecha' },
                          h(CalendarDays, { size: 15 }),
                          formatearFecha(pedido.creado_en)
                        )
                      ),

                      h('span', {
                        className: `pedido-estado estado-${obtenerEstado(pedido).replace(/\s+/g, '-')}`
                      }, pedido.estado || 'Sin estado')
                    ),

                    h(SeguimientoPedido, { pedido }),

                    h('div', { className: 'pedido-productos' },

                      ...(Array.isArray(pedido.items) ? pedido.items : []).map((item, indice) =>

                        h('div', {
                          className: 'pedido-producto',
                          key: `${pedido.id}-${item.producto_id || indice}`
                        },

                          h('div', { className: 'producto-info-pedido' },
                            h(Package, { size: 19 }),
                            h('div', null,
                              h('strong', null,
                                item.nombre_producto || 'Producto'
                              ),
                              h('span', null,
                                `Cantidad: ${item.cantidad || 0}`
                              )
                            )
                          ),

                          h('strong', { className: 'producto-precio-pedido' },
                            formatearPrecio(
                              Number(item.precio || 0) * Number(item.cantidad || 0)
                            )
                          )
                        )
                      )
                    ),

                    h('div', { className: 'pedido-total' },
                      h('span', null, 'Total de la compra'),
                      h('strong', null, formatearPrecio(pedido.total))
                    ),

                    h('div', { className: 'pedido-medio-pago' },
                      h(CreditCard, { size: 16 }),
                      h('span', null, 'Medio de pago:'),
                      h('strong', null, pedido.medio_pago || 'No especificado')
                    ),

                    pedido.direccion && h('div', { className: 'pedido-direccion' },
                      h(MapPin, { size: 16 }),
                      pedido.direccion
                    )
                  )
                )
              )
    ),

    h('div', { className: 'cuenta-volver' },
      h(Link, { to: '/productos' }, '← Seguir comprando')
    )
  );
}

export default MiCuenta;
