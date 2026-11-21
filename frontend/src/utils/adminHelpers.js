
export const API = 'http://localhost:3000/api';

export const categorias = [
  { id: 1, nombre: 'Celulares' },
  { id: 2, nombre: 'Notebooks' },
  { id: 3, nombre: 'Accesorios' }
];

export const formularioInicial = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagen: '',
  id_categoria: '',
  activo: '1',
  es_oferta: '0',
  condicion: 'Nuevo',
  precio_anterior: ''
};

export function formatoPrecio(valor) {
  return Number(valor || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2
  });
}

export function formatoFecha(fecha) {
  if (!fecha) return 'Sin fecha';

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return 'Sin fecha';
  }

  return fechaValida.toLocaleString('es-AR');
}

export function obtenerUrlImagen(imagen) {
  if (!imagen) return '';

  if (
    imagen.startsWith('http://') ||
    imagen.startsWith('https://') ||
    imagen.startsWith('data:')
  ) {
    return imagen;
  }

  if (imagen.startsWith('/uploads/')) {
    return `http://localhost:3000${imagen}`;
  }

  return imagen;
}
