
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminPedidos from '../components/admin/AdminPedidos';
import AdminProductos from '../components/admin/AdminProductos';
import AdminConsultas from '../components/admin/AdminConsultas';
import AdminServicioTecnico from '../components/admin/AdminServicioTecnico';

import {
  API,
  formularioInicial,
  obtenerUrlImagen
} from '../utils/adminHelpers';

import './Admin.css';

const h = React.createElement;

function Admin() {
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState('inicio');

  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [actualizando, setActualizando] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');

  const usuario = JSON.parse(
    sessionStorage.getItem('adminUsuario') || '{}'
  );

  function token() {
    return sessionStorage.getItem('adminToken');
  }

  // SESIÓN

  useEffect(() => {
    if (!token()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  function manejarSesion(respuesta) {
    if (respuesta.status === 401 || respuesta.status === 403) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUsuario');
      navigate('/login', { replace: true });
      return true;
    }

    return false;
  }

  function cerrarSesion() {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsuario');
    navigate('/login', { replace: true });
  }

  // CARGAR PEDIDOS

  async function cargarPedidos() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(`${API}/pedidos`, {
        headers: {
          Authorization: `Bearer ${token()}`
        }
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudieron cargar los pedidos.');
      }

      setPedidos(datos.pedidos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // CARGAR PRODUCTOS

  async function cargarProductos() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(`${API}/admin/productos`, {
        headers: {
          Authorization: `Bearer ${token()}`
        }
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudieron cargar los productos.');
      }

      setProductos(datos.productos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // CARGAR CONSULTAS

  async function cargarConsultas() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(`${API}/admin/consultas`, {
        headers: {
          Authorization: `Bearer ${token()}`
        }
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudieron cargar las consultas.');
      }

      setConsultas(datos.consultas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // CARGAR SERVICIO TÉCNICO

  async function cargarServicios() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await fetch(`${API}/servicio-tecnico/admin`, {
        headers: {
          Authorization: `Bearer ${token()}`
        }
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || 'No se pudieron cargar las solicitudes.'
        );
      }

      setServicios(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // CARGAR SEGÚN LA SECCIÓN

  useEffect(() => {
    if (seccion === 'pedidos') cargarPedidos();
    if (seccion === 'productos') cargarProductos();
    if (seccion === 'consultas') cargarConsultas();
    if (seccion === 'servicio') cargarServicios();
  }, [seccion]);

  // CAMBIAR ESTADO DEL PEDIDO

  async function cambiarEstado(id, estado) {
    setActualizando(id);
    setError('');

    try {
      const respuesta = await fetch(`${API}/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ estado })
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo actualizar el pedido.');
      }

      await cargarPedidos();
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizando(null);
    }
  }

  // CAMBIAR ESTADO DE CONSULTA

  async function cambiarEstadoConsulta(id, estado) {
    setActualizando(id);
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch(`${API}/admin/consultas/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ estado })
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo actualizar la consulta.');
      }

      setMensaje('Estado de la consulta actualizado correctamente.');
      await cargarConsultas();
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizando(null);
    }
  }

  // CAMBIAR ESTADO DEL SERVICIO

  async function cambiarEstadoServicio(id, estado) {
    setActualizando(id);
    setError('');
    setMensaje('');

    try {
      const respuesta = await fetch(
        `${API}/servicio-tecnico/admin/${id}/estado`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token()}`
          },
          body: JSON.stringify({ estado })
        }
      );

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(
          datos.mensaje || 'No se pudo actualizar la solicitud.'
        );
      }

      setMensaje('Estado de la reparación actualizado correctamente.');
      await cargarServicios();
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizando(null);
    }
  }

  // FORMULARIO DE PRODUCTOS

  function cambiarCampo(nombre, valor) {
    setFormulario(anterior => ({
      ...anterior,
      [nombre]: valor
    }));
  }

  function limpiarImagenPreview() {
    if (imagenPreview && imagenPreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagenPreview);
    }
  }

  function abrirNuevoProducto() {
    limpiarImagenPreview();

    setFormulario({ ...formularioInicial });
    setEditandoId(null);
    setImagenArchivo(null);
    setImagenPreview('');
    setMostrarFormulario(true);
    setError('');
    setMensaje('');
  }

  function editarProducto(producto) {
    limpiarImagenPreview();

    setFormulario({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio ?? '',
      stock: producto.stock ?? '',
      imagen: producto.imagen || '',
      id_categoria: String(producto.id_categoria || ''),
      activo: String(producto.activo ?? 1),
      es_oferta: String(producto.es_oferta ?? 0),
      condicion: producto.condicion || 'Nuevo',
      precio_anterior: producto.precio_anterior ?? ''
    });

    setImagenArchivo(null);
    setImagenPreview(
      producto.imagen ? obtenerUrlImagen(producto.imagen) : ''
    );

    setEditandoId(producto.id);
    setMostrarFormulario(true);
    setError('');
    setMensaje('');
  }

  function seleccionarImagen(e) {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setError('Seleccioná un archivo de imagen válido.');
      e.target.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5 MB.');
      e.target.value = '';
      return;
    }

    limpiarImagenPreview();

    setImagenArchivo(archivo);
    setImagenPreview(URL.createObjectURL(archivo));
    setError('');
  }

  function cancelarFormulario() {
    limpiarImagenPreview();

    setMostrarFormulario(false);
    setFormulario({ ...formularioInicial });
    setEditandoId(null);
    setImagenArchivo(null);
    setImagenPreview('');
    setError('');
  }

  // GUARDAR PRODUCTO

  async function guardarProducto(e) {
    e.preventDefault();

    setError('');
    setMensaje('');

    if (!formulario.nombre.trim()) {
      setError('Ingresá el nombre del producto.');
      return;
    }

    if (!formulario.id_categoria) {
      setError('Seleccioná una categoría.');
      return;
    }

    if (
      formulario.precio === '' ||
      !Number.isFinite(Number(formulario.precio)) ||
      Number(formulario.precio) < 0
    ) {
      setError('Ingresá un precio válido.');
      return;
    }

    if (
      formulario.stock === '' ||
      !Number.isInteger(Number(formulario.stock)) ||
      Number(formulario.stock) < 0
    ) {
      setError('Ingresá un stock válido.');
      return;
    }

    const precioAnterior =
      formulario.precio_anterior === ''
        ? null
        : Number(formulario.precio_anterior);

    if (
      precioAnterior !== null &&
      (!Number.isFinite(precioAnterior) || precioAnterior < 0)
    ) {
      setError('Ingresá un precio anterior válido.');
      return;
    }

    const producto = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion,
      precio: Number(formulario.precio),
      stock: Number(formulario.stock),
      imagen: formulario.imagen,
      id_categoria: Number(formulario.id_categoria),
      activo: Number(formulario.activo),
      es_oferta: Number(formulario.es_oferta),
      condicion: formulario.condicion,
      precio_anterior: precioAnterior
    };

    const datosFormulario = new FormData();

    Object.entries(producto).forEach(([clave, valor]) => {
      if (valor !== null && valor !== undefined) {
        datosFormulario.append(clave, String(valor));
      }
    });

    if (imagenArchivo) {
      datosFormulario.append('imagen', imagenArchivo);
    }

    try {
      setActualizando('formulario');

      const url = editandoId
        ? `${API}/productos/${editandoId}`
        : `${API}/productos`;

      const respuesta = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token()}`
        },
        body: datosFormulario
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo guardar el producto.');
      }

      setMensaje(
        editandoId
          ? 'Producto actualizado correctamente.'
          : 'Producto agregado correctamente.'
      );

      limpiarImagenPreview();

      setMostrarFormulario(false);
      setFormulario({ ...formularioInicial });
      setEditandoId(null);
      setImagenArchivo(null);
      setImagenPreview('');

      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizando(null);
    }
  }

  // DESACTIVAR PRODUCTO

  async function desactivarProducto(id) {
    const confirmar = window.confirm(
      '¿Estás seguro de que querés desactivar este producto?'
    );

    if (!confirmar) return;

    setError('');
    setMensaje('');

    try {
      setActualizando(id);

      const respuesta = await fetch(`${API}/productos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token()}`
        }
      });

      const datos = await respuesta.json();

      if (manejarSesion(respuesta)) return;

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo desactivar el producto.');
      }

      setMensaje('Producto desactivado correctamente.');
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizando(null);
    }
  }

  // VOLVER AL INICIO

  function volverInicio() {
    cancelarFormulario();
    setSeccion('inicio');
    setError('');
    setMensaje('');
  }

  // TARJETAS PRINCIPALES

  const cards = [
    {
      icon: '📦',
      title: 'Pedidos',
      description: 'Consultar las compras realizadas por los clientes.',
      action: 'pedidos'
    },
    {
      icon: '📱',
      title: 'Productos',
      description: 'Administrar productos, precios y stock.',
      action: 'productos'
    },
    {
      icon: '💬',
      title: 'Consultas',
      description: 'Revisar los mensajes enviados desde la página.',
      action: 'consultas'
    },
    {
      icon: '🔧',
      title: 'Servicio técnico',
      description: 'Consultar las solicitudes de reparación.',
      action: 'servicio'
    }
  ];

  // PANTALLA PRINCIPAL

  return h('main', { className: 'admin-page' },

    h('div', { className: 'admin-container' },

      h('div', { className: 'admin-header' },

        h('div', { className: 'admin-heading' },

          h('h1', { className: 'admin-title' },
            'Panel de administración'
          ),

          h('p', { className: 'admin-welcome' },
            'Bienvenido ',
            usuario.nombre || 'Administrador',
            ' al sistema de Electro Tecno.'
          )
        ),

        h('button', {
          onClick: cerrarSesion,
          className: 'admin-logout-button'
        }, 'Cerrar sesión')
      ),

      // INICIO

      seccion === 'inicio' && h('div', { className: 'admin-home' },

        h('div', { className: 'admin-cards-grid' },

          ...cards.map(card =>
            h('button', {
              key: card.action,
              onClick: () => {
                setSeccion(card.action);
                setError('');
                setMensaje('');
              },
              className: 'admin-card'
            },

              h('div', { className: 'admin-card-icon' },
                card.icon
              ),

              h('h2', { className: 'admin-card-title' },
                card.title
              ),

              h('p', { className: 'admin-card-description' },
                card.description
              ),

              h('p', { className: 'admin-card-link' },
                'INGRESAR →'
              )
            )
          )
        ),

        h('p', { className: 'admin-footer-text' },
          'Sistema de administración de Electro Tecno.'
        )
      ),

      // PEDIDOS

      seccion === 'pedidos' && h(AdminPedidos, {
        pedidos,
        cargando,
        error,
        actualizando,
        cargarPedidos,
        cambiarEstado,
        volverInicio
      }),

      // PRODUCTOS

      seccion === 'productos' && h(AdminProductos, {
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
        onImagenSeleccionada: seleccionarImagen,
        guardarProducto,
        editandoId,
        cancelarFormulario,
        volverInicio
      }),

      // CONSULTAS

      seccion === 'consultas' && h(AdminConsultas, {
        consultas,
        cargando,
        error,
        mensaje,
        actualizando,
        cargarConsultas,
        cambiarEstadoConsulta,
        volverInicio
      }),

      // SERVICIO TÉCNICO

      seccion === 'servicio' && h(AdminServicioTecnico, {
        servicios,
        cargando,
        error,
        mensaje,
        actualizando,
        cargarServicios,
        cambiarEstadoServicio,
        volverInicio
      })
    )
  );
}

export default Admin;
