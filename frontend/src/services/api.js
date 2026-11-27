
const API_URL = 'http://localhost:3000/api';

// Obtener token según el tipo de usuario
function getToken() {
  return (
    sessionStorage.getItem('adminToken') ||
    sessionStorage.getItem('clienteToken')
  );
}

// Función general para comunicarse con el backend
async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.mensaje || 'Error en la solicitud');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Funciones generales del sistema
export const api = {
  get: (path) => request(path),

  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  delete: (path) =>
    request(path, {
      method: 'DELETE'
    })
};

// =====================================
// AUTENTICACIÓN DE CLIENTES
// =====================================

export async function registrarCliente(datos) {
  return request('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

export async function iniciarSesionCliente(datos) {
  return request('/auth/cliente/login', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

// =====================================
// AUTENTICACIÓN DE ADMINISTRADOR
// =====================================

export async function iniciarSesionAdmin(datos) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

export default api;
